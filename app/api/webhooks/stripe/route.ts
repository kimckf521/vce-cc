import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { ensureMathMethodsSubject, ACCESS_GRANTING_STATUSES } from "@/lib/subscription";
import { rewardForAffiliate, COMMISSION_HOLD_DAYS } from "@/lib/affiliate";
import { sendPaymentFailedEmail, sendRefundEmail } from "@/lib/billing-emails";

// Stripe webhooks need the raw request body for signature verification.
// Next.js App Router gives us that via request.text().
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * Receives subscription lifecycle events from Stripe and syncs them to
 * the SubjectEnrolment table. This is the source of truth for access control.
 *
 * Setup:
 * 1. In Stripe dashboard, add a webhook endpoint pointing to this URL.
 * 2. Subscribe to events: customer.subscription.created, updated, deleted,
 *    checkout.session.completed, invoice.payment_failed, invoice.payment_succeeded.
 * 3. Copy the webhook signing secret into STRIPE_WEBHOOK_SECRET env var.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // First successful checkout — the subscription event that follows
        // will do the real sync, but we also handle this defensively in case
        // the subscription event races.
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        // Subscription status change events handle the access logic — just log.
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe-webhook] ${event.type} for invoice ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        // Subscription status sync happens via customer.subscription.updated
        // (which Stripe fires alongside this event). Here we just notify the
        // user so they have a chance to update their card before retries
        // are exhausted and access is revoked.
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe-webhook] ${event.type} for invoice ${invoice.id}`);
        await notifyPaymentFailed(invoice);
        break;
      }

      case "charge.refunded": {
        // A refund happened (likely from the Stripe dashboard). Refunds
        // don't auto-cancel subscriptions — if we don't act, the user will
        // be billed again at the next renewal. On full refund, schedule
        // cancel_at_period_end so they keep what they paid for but no
        // future billing happens. Email the user either way.
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    // Log but return 200 to Stripe to prevent retry storms for bugs in our code.
    // Real infrastructure failures should still return 500 so Stripe retries.
    console.error(`[stripe-webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Sync a Stripe subscription to the SubjectEnrolment table.
 * Called for create/update/delete events.
 */
async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const subjectSlug = subscription.metadata.subjectSlug ?? "mathematical-methods";

  if (!userId) {
    console.warn(
      `[stripe-webhook] Subscription ${subscription.id} has no userId metadata — cannot sync`
    );
    return;
  }

  // Find the user (by ID or by stripeCustomerId as fallback)
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user =
    (await prisma.user.findUnique({ where: { id: userId } })) ??
    (await prisma.user.findUnique({ where: { stripeCustomerId: customerId } }));

  if (!user) {
    console.warn(
      `[stripe-webhook] No user found for subscription ${subscription.id} (userId=${userId}, customerId=${customerId})`
    );
    return;
  }

  // Make sure the subject exists
  let subjectId: string;
  if (subjectSlug === "mathematical-methods") {
    subjectId = await ensureMathMethodsSubject();
  } else {
    const subject = await prisma.subject.findUnique({
      where: { slug: subjectSlug },
      select: { id: true },
    });
    if (!subject) {
      console.warn(
        `[stripe-webhook] No subject found for slug ${subjectSlug}, skipping sync`
      );
      return;
    }
    subjectId = subject.id;
  }

  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price.id ?? null;
  // In API version 2024-11-20.acacia, current_period_end moved to subscription items.
  const periodEndSeconds = firstItem?.current_period_end ?? 0;
  const currentPeriodEnd = periodEndSeconds
    ? new Date(periodEndSeconds * 1000)
    : new Date();

  // Status determines whether the user keeps access. ACCESS_GRANTING_STATUSES
  // includes `past_due` so users have a grace period to update their card
  // before losing access (see lib/subscription.ts for full rationale).
  const hasAccess = (ACCESS_GRANTING_STATUSES as readonly string[]).includes(
    subscription.status
  );
  const tier = hasAccess ? "PAID" : "FREE";
  // For affiliate conversion: only count true paid customers, not those in
  // dunning. Affiliates shouldn't be credited for a payment that may bounce.
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  // Affiliate conversion: if this user has a PENDING referral and the subscription
  // just became active, move it into the 30-day commission hold.
  if (isActive) {
    try {
      await convertReferralIfPending(user.id);
    } catch (err) {
      console.error(`[stripe-webhook] Failed to convert referral for user ${user.id}:`, err);
      // Don't throw — the subscription sync should still succeed.
    }
  } else {
    // Cancellation / past-due / unpaid: if the referee was still in the hold
    // window, drop their referral to CHURNED_NO_COMMISSION so the cron skips it.
    // Already-finalized (CONVERTED) referrals are unaffected.
    try {
      await churnReferralIfInHold(user.id);
    } catch (err) {
      console.error(`[stripe-webhook] Failed to churn referral for user ${user.id}:`, err);
    }
  }

  const data = {
    tier,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    subscriptionStatus: subscription.status,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  } as const;

  // Race-safe upsert. Two unique keys (userId_subjectId, stripeSubscriptionId)
  // mean a naive upsert can race with a parallel request and throw P2002.
  // We handle that by retrying via updateMany keyed on stripeSubscriptionId,
  // which is guaranteed to match exactly the row the parallel request created.
  try {
    await prisma.subjectEnrolment.upsert({
      where: {
        userId_subjectId: { userId: user.id, subjectId },
      },
      create: { userId: user.id, subjectId, ...data },
      update: data,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      // A parallel request already created/updated this row. Fall through
      // to an idempotent update so our data wins (in case this event is
      // newer than the one the parallel request processed).
      const result = await prisma.subjectEnrolment.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          tier,
          stripePriceId: priceId,
          subscriptionStatus: subscription.status,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
      console.log(
        `[stripe-webhook] Race resolved for subscription ${subscription.id} (updateMany count=${result.count})`
      );
    } else {
      throw err;
    }
  }

  console.log(
    `[stripe-webhook] Synced subscription ${subscription.id} for user ${user.id} (status=${subscription.status}, tier=${tier})`
  );
}

/**
 * If the given user was referred by an affiliate and their referral is still
 * PENDING, move it into a 30-day commission hold. Commissions are only paid
 * out (via the daily cron job) if the referee remains subscribed past the
 * hold; cancellations within the hold zero the commission.
 *
 * Idempotent — only converts each referral once.
 */
async function convertReferralIfPending(userId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: userId },
    select: {
      id: true,
      status: true,
      affiliateId: true,
      affiliate: { select: { type: true, commissionOverrideCents: true } },
    },
  });

  if (!referral || referral.status !== "PENDING") return;

  const reward = rewardForAffiliate(referral.affiliate);
  const now = new Date();
  const locksAt = new Date(now.getTime() + COMMISSION_HOLD_DAYS * 24 * 60 * 60 * 1000);

  await prisma.referral.update({
    where: { id: referral.id, status: "PENDING" }, // safety: only update if still PENDING
    data: {
      status: "PENDING_HOLD",
      rewardAmount: reward,
      convertedAt: now,
      commissionLocksAt: locksAt,
    },
  });

  console.log(
    `[stripe-webhook] Referral ${referral.id} entered ${COMMISSION_HOLD_DAYS}-day hold (locks ${locksAt.toISOString()}, reward ${reward}c)`
  );
}

/**
 * If the given user has a referral in PENDING_HOLD and their subscription was
 * just cancelled, set it to CHURNED_NO_COMMISSION so the cron will skip them.
 * No commission is issued for users who churn within the hold period.
 *
 * Once a referral has reached CONVERTED (hold expired), this is a no-op — the
 * commission has already been earned.
 */
async function churnReferralIfInHold(userId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: userId },
    select: { id: true, status: true },
  });
  if (!referral || referral.status !== "PENDING_HOLD") return;

  await prisma.referral.update({
    where: { id: referral.id, status: "PENDING_HOLD" },
    data: { status: "CHURNED_NO_COMMISSION" },
  });

  console.log(
    `[stripe-webhook] Referral ${referral.id} churned within hold — no commission`
  );
}

/**
 * Claw back affiliate commission when a referee gets a full refund.
 *
 * State transitions:
 *   - PENDING_HOLD → CHURNED_NO_COMMISSION (cron will skip them; no payout owed)
 *   - CONVERTED   → REFUNDED (commission was already issued; reverse the credit)
 *   - PENDING / CHURNED_NO_COMMISSION / REFUNDED / EXPIRED → no-op
 *
 * For CONVERTED refunds:
 *   - STUDENT/INFLUENCER: decrement Affiliate.creditBalance by rewardAmount,
 *     and (best-effort) push a positive Stripe customer balance transaction
 *     to reverse the credit they may have already received.
 *   - TUTOR: status flip alone is enough — their "Available for payout" is
 *     calculated as sum(CONVERTED) - sum(paid-out), so REFUNDED falls out.
 *
 * If a TUTOR/INFLUENCER has already been paid out for this commission, the
 * clawback can't fully recover the cash — admin needs to dispute or recover
 * out-of-band. We log a warning in that case for manual reconciliation.
 */
async function clawbackCommissionOnRefund(
  userId: string,
  chargeId: string
): Promise<void> {
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: userId },
    select: {
      id: true,
      status: true,
      rewardAmount: true,
      affiliateId: true,
      affiliate: {
        select: {
          type: true,
          user: { select: { stripeCustomerId: true } },
        },
      },
    },
  });
  if (!referral) return;

  if (referral.status === "PENDING_HOLD") {
    await prisma.referral.update({
      where: { id: referral.id, status: "PENDING_HOLD" },
      data: { status: "CHURNED_NO_COMMISSION" },
    });
    console.log(
      `[stripe-webhook] Referral ${referral.id} marked CHURNED on refund (was PENDING_HOLD, charge ${chargeId})`
    );
    return;
  }

  if (referral.status !== "CONVERTED") return;

  const isStudent = referral.affiliate.type === "STUDENT_REFERRAL";
  const isInfluencer = referral.affiliate.type === "INFLUENCER_AFFILIATE";

  // Check whether this commission has already been paid out (cash). If so,
  // we can only flip status and warn — the cash is gone.
  const paidOut = await prisma.payout.aggregate({
    where: {
      affiliateId: referral.affiliateId,
      type: "COMMISSION",
      status: "COMPLETED",
    },
    _sum: { amount: true },
  });
  const paidCashCents = paidOut._sum.amount ?? 0;

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id: referral.id, status: "CONVERTED" },
      data: { status: "REFUNDED" },
    });

    // Reverse the creditBalance bump for student/influencer.
    // (Tutor's "Available" derives from CONVERTED count, so status flip is enough.)
    if (isStudent || isInfluencer) {
      await tx.affiliate.update({
        where: { id: referral.affiliateId },
        data: { creditBalance: { decrement: referral.rewardAmount } },
      });
    }
  });

  // Reverse the Stripe customer balance push (students only — they got
  // platform credit applied to their next invoice).
  if (isStudent && referral.affiliate.user.stripeCustomerId) {
    try {
      const stripe = getStripe();
      await stripe.customers.createBalanceTransaction(
        referral.affiliate.user.stripeCustomerId,
        {
          // POSITIVE = customer-owes (reverses the earlier negative-balance credit)
          amount: referral.rewardAmount,
          currency: "aud",
          description: `Referral commission clawback — referee refunded (referral ${referral.id})`,
          metadata: {
            referralId: referral.id,
            chargeId,
            type: "STUDENT_REFERRAL_CLAWBACK",
          },
        }
      );
    } catch (err) {
      console.error(
        `[stripe-webhook] Failed to push clawback to Stripe for referral ${referral.id}:`,
        err
      );
    }
  }

  if (isInfluencer && paidCashCents >= referral.rewardAmount) {
    console.warn(
      `[stripe-webhook] Influencer commission ${referral.rewardAmount}c was already paid out for referral ${referral.id}. ` +
        `creditBalance has been decremented but cash has been disbursed — admin must reconcile.`
    );
  }

  console.log(
    `[stripe-webhook] Clawed back ${referral.rewardAmount}c for referral ${referral.id} (refunded charge ${chargeId})`
  );
}

/**
 * Notify the user that a renewal payment failed. Looks up their email by the
 * Stripe customer ID, then sends a templated email via Resend explaining that
 * Stripe will retry and they should update their card.
 *
 * Failures here are logged but never thrown — email is best-effort and must
 * not cause the webhook to retry (Stripe would replay the same event).
 */
async function notifyPaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { email: true },
  });
  if (!user?.email) {
    console.warn(
      `[stripe-webhook] No user email found for failed invoice ${invoice.id} (customer ${customerId})`
    );
    return;
  }

  try {
    await sendPaymentFailedEmail({
      to: user.email,
      amountCents: invoice.amount_due ?? invoice.total ?? 0,
      currency: invoice.currency ?? "aud",
      nextAttemptAt: invoice.next_payment_attempt,
    });
    console.log(
      `[stripe-webhook] Sent payment-failed email to ${user.email} for invoice ${invoice.id}`
    );
  } catch (err) {
    console.error(
      `[stripe-webhook] Failed to send payment-failed email to ${user.email}:`,
      err
    );
  }
}

/**
 * Handle a charge.refunded event. If the refund covers the full charge,
 * schedule cancel_at_period_end on the customer's active subscription so
 * they keep access through the period they already paid for, but never
 * get charged again. Either way, email the user.
 *
 * Failures are logged but never thrown — we don't want Stripe to retry the
 * webhook for email/cancel issues.
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const customerId =
    typeof charge.customer === "string"
      ? charge.customer
      : charge.customer?.id;
  if (!customerId) {
    console.warn(
      `[stripe-webhook] Refunded charge ${charge.id} has no customer; skipping`
    );
    return;
  }

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true },
  });
  if (!user) {
    console.warn(
      `[stripe-webhook] No user found for refunded charge ${charge.id} (customer ${customerId})`
    );
    return;
  }

  const isFullRefund =
    charge.refunded === true && charge.amount_refunded >= charge.amount;
  const refundAmount = charge.amount_refunded;

  let cancelledSubscriptionId: string | null = null;
  let accessUntil: number | null = null;

  if (isFullRefund) {
    // Find the customer's active subscription. Most reliable path is via
    // the invoice the charge paid (so we cancel the right one even if the
    // user has multiple subs). Fall back to listing their active subs.
    const stripe = getStripe();
    let subscriptionId: string | null = null;

    // `charge.invoice` is no longer in the typed Charge in API version
    // 2024-11-20.acacia, but the underlying API still returns it. Cast through.
    const chargeInvoice = (charge as unknown as { invoice?: string | { id: string } | null }).invoice;
    if (chargeInvoice) {
      const invoiceId =
        typeof chargeInvoice === "string" ? chargeInvoice : chargeInvoice.id;
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        // Stripe API 2024-11-20.acacia moved subscription off the top-level
        // invoice. Read whichever shape is present.
        subscriptionId =
          (invoice as unknown as { subscription?: string }).subscription ??
          (invoice as unknown as {
            parent?: { subscription_details?: { subscription?: string } };
          }).parent?.subscription_details?.subscription ??
          null;
      } catch (err) {
        console.warn(
          `[stripe-webhook] Could not retrieve invoice ${invoiceId} for refund:`,
          err
        );
      }
    }

    if (!subscriptionId) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        subscriptionId = subs.data[0]?.id ?? null;
      } catch (err) {
        console.warn(
          `[stripe-webhook] Could not list subscriptions for customer ${customerId}:`,
          err
        );
      }
    }

    if (subscriptionId) {
      try {
        const updated = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        cancelledSubscriptionId = subscriptionId;
        const firstItem = updated.items.data[0];
        accessUntil = firstItem?.current_period_end ?? null;
        // Also flag locally so the UI updates immediately. The subsequent
        // customer.subscription.updated webhook will sync the rest.
        await prisma.subjectEnrolment.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { cancelAtPeriodEnd: true },
        });
        console.log(
          `[stripe-webhook] Scheduled cancel for subscription ${subscriptionId} after full refund of charge ${charge.id}`
        );
      } catch (err) {
        console.error(
          `[stripe-webhook] Failed to schedule cancel for subscription ${subscriptionId}:`,
          err
        );
      }
    } else {
      console.warn(
        `[stripe-webhook] Full refund on charge ${charge.id} but no active subscription found for customer ${customerId}`
      );
    }

    // Affiliate commission clawback — if this refunded user was attributed
    // to an affiliate and their commission has already been finalized
    // (CONVERTED), reverse the credit. If still in PENDING_HOLD, mark as
    // CHURNED_NO_COMMISSION so the cron skips them.
    try {
      await clawbackCommissionOnRefund(user.id, charge.id);
    } catch (err) {
      console.error(
        `[stripe-webhook] Failed to claw back commission on refund ${charge.id}:`,
        err
      );
    }
  } else {
    console.log(
      `[stripe-webhook] Partial refund of ${refundAmount}/${charge.amount} on charge ${charge.id} — subscription left active`
    );
  }

  if (user.email) {
    try {
      await sendRefundEmail({
        to: user.email,
        amountCents: refundAmount,
        currency: charge.currency ?? "aud",
        subscriptionCancelled: cancelledSubscriptionId !== null,
        accessUntil,
      });
      console.log(
        `[stripe-webhook] Sent refund email to ${user.email} for charge ${charge.id}`
      );
    } catch (err) {
      console.error(
        `[stripe-webhook] Failed to send refund email to ${user.email}:`,
        err
      );
    }
  }
}
