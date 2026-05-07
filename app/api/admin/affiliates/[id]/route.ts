import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { updateAffiliateSchema } from "@/lib/validations";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";

/** PATCH /api/admin/affiliates/[id] — update affiliate status, credit, notes */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-aff-patch:${ip}`, { maxRequests: 60 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateAffiliateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.approved !== undefined) data.approved = parsed.data.approved;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
  if (parsed.data.creditAdjustment !== undefined) {
    data.creditBalance = { increment: parsed.data.creditAdjustment };
  }

  // Per-affiliate commission rate override — only allowed for influencers.
  // null = clear override; integer = override in cents per converted referral.
  if (parsed.data.commissionOverrideCents !== undefined) {
    const existing = await prisma.affiliate.findUnique({
      where: { id },
      select: { type: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }
    if (existing.type !== "INFLUENCER_AFFILIATE") {
      return NextResponse.json(
        { error: "Custom commission rates are only allowed for influencer accounts" },
        { status: 400 }
      );
    }
    data.commissionOverrideCents = parsed.data.commissionOverrideCents;
  }

  // If credit is being adjusted, push a matching Stripe customer balance
  // transaction so the credit actually applies to the user's next invoice.
  // The DB `Affiliate.creditBalance` field alone is admin-display only — the
  // user-facing referrals view and Stripe's billing engine both read from
  // the Stripe customer balance, so without this push the credit is invisible
  // to the influencer/student. Mirrors the webhook's student-referral flow.
  if (parsed.data.creditAdjustment !== undefined && parsed.data.creditAdjustment !== 0) {
    const aff = await prisma.affiliate.findUnique({
      where: { id },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            stripeCustomerId: true,
          },
        },
      },
    });
    if (!aff) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    try {
      const customerId = await getOrCreateStripeCustomer(aff.user);
      const stripe = getStripe();
      const amountCents = parsed.data.creditAdjustment;
      const isCredit = amountCents > 0;
      await stripe.customers.createBalanceTransaction(customerId, {
        // Stripe convention: customer.balance is NEGATIVE when the customer
        // has credit, so we flip the sign of the admin-input cents.
        amount: -amountCents,
        currency: "aud",
        description: `Admin affiliate ${isCredit ? "credit" : "deduction"} (${id})`,
        metadata: {
          affiliateId: id,
          userId: aff.user.id,
          issuedBy: auth.dbUser.id,
          type: "ADMIN_AFFILIATE_CREDIT",
        },
      });
    } catch (err) {
      // Log but don't fail the PATCH — the admin display will still show the
      // updated DB balance. The admin can retry, or fall back to the
      // /api/admin/users/[id]/credit endpoint to reconcile.
      console.error(
        `[admin-affiliate-patch] Failed to push Stripe credit for affiliate ${id}:`,
        err
      );
    }
  }

  // Custom referral code — only allowed for influencer accounts.
  // Students/tutors keep their auto-generated code (no incentive to rebrand).
  if (parsed.data.referralCode !== undefined) {
    const existing = await prisma.affiliate.findUnique({
      where: { id },
      select: { type: true, referralCode: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }
    if (existing.type !== "INFLUENCER_AFFILIATE") {
      return NextResponse.json(
        { error: "Custom codes are only allowed for influencer accounts" },
        { status: 400 }
      );
    }
    // Allow no-op (same value) without hitting uniqueness check
    if (parsed.data.referralCode !== existing.referralCode) {
      data.referralCode = parsed.data.referralCode;
    }
  }

  try {
    const updated = await prisma.affiliate.update({
      where: { id },
      data,
    });
    return NextResponse.json({ affiliate: updated });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That referral code is already taken. Try another." },
        { status: 409 }
      );
    }
    throw err;
  }
}
