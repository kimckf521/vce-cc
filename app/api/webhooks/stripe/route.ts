import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { ensureMathMethodsSubject } from "@/lib/subscription";
import { rewardForType } from "@/lib/affiliate";

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

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        // These are handled via the subscription status change event that
        // Stripe fires alongside payment events. Log for visibility.
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe-webhook] ${event.type} for invoice ${invoice.id}`);
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

  // Active or trialing → PAID tier. Everything else → FREE.
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  const tier = isActive ? "PAID" : "FREE";

  // Affiliate conversion: if this user has a PENDING referral and the subscription
  // just became active, mark it CONVERTED and credit/owe the affiliate.
  if (isActive) {
    try {
      await convertReferralIfPending(user.id);
    } catch (err) {
      console.error(`[stripe-webhook] Failed to convert referral for user ${user.id}:`, err);
      // Don't throw — the subscription sync should still succeed.
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
 * PENDING, mark it CONVERTED and accrue the affiliate's reward.
 *
 * - Track A (STUDENT_REFERRAL): credits the referrer's platform credit balance.
 * - Track B/C (TUTOR/INFLUENCER_AFFILIATE): records owed commission for payout.
 *
 * Idempotent — only converts a referral once (uses status as guard).
 */
async function convertReferralIfPending(userId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: userId },
    include: { affiliate: true },
  });

  if (!referral || referral.status !== "PENDING") return;

  const reward = rewardForType(referral.affiliate.type);

  await prisma.$transaction(async (tx) => {
    // Re-check inside the transaction to prevent double-credit races
    const fresh = await tx.referral.findUnique({
      where: { id: referral.id },
      select: { status: true },
    });
    if (!fresh || fresh.status !== "PENDING") return;

    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: "CONVERTED",
        rewardAmount: reward,
        convertedAt: new Date(),
      },
    });

    // Track A: add to the referrer's credit balance immediately.
    // Track B/C: leave rewardPaid=false until an admin processes a payout.
    if (referral.affiliate.type === "STUDENT_REFERRAL") {
      await tx.affiliate.update({
        where: { id: referral.affiliateId },
        data: { creditBalance: { increment: reward } },
      });
    }
  });

  console.log(
    `[stripe-webhook] Converted referral ${referral.id} for user ${userId} (reward=${reward}c)`
  );
}
