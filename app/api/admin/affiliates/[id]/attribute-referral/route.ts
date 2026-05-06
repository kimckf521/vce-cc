import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { attributeReferralSchema } from "@/lib/validations";
import { rewardForType } from "@/lib/affiliate";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/admin/affiliates/[id]/attribute-referral
 * Retroactively attribute a user to an affiliate. Used when the referral
 * link wasn't captured at signup (e.g. user signed up directly, or email
 * confirmation broke the cookie flow).
 *
 * Behaviour:
 * - Creates a Referral record linking the user to the affiliate
 * - If the user already has an active paid subscription, immediately marks
 *   the referral CONVERTED, credits the affiliate, and pushes the Stripe
 *   credit (mirrors the webhook conversion logic)
 * - Errors if the user already has any Referral record (no double-attribution)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-attribute:${ip}`, { maxRequests: 30 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: affiliateId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = attributeReferralSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  // Resolve the affiliate
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: { user: { select: { id: true, stripeCustomerId: true } } },
  });
  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  }

  // Resolve the user to attribute (by ID or email)
  const targetUser = parsed.data.userId
    ? await prisma.user.findUnique({
        where: { id: parsed.data.userId },
        select: { id: true, email: true },
      })
    : await prisma.user.findFirst({
        where: { email: parsed.data.email! },
        select: { id: true, email: true },
      });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Don't allow self-referral
  if (targetUser.id === affiliate.user.id) {
    return NextResponse.json(
      { error: "Cannot attribute an affiliate's own account to themselves" },
      { status: 400 }
    );
  }

  // Don't double-attribute
  const existingReferral = await prisma.referral.findUnique({
    where: { referredUserId: targetUser.id },
    select: { id: true, affiliateId: true, status: true },
  });
  if (existingReferral) {
    return NextResponse.json(
      {
        error: `User is already attributed to another affiliate (referral ${existingReferral.id}, status: ${existingReferral.status})`,
      },
      { status: 409 }
    );
  }

  // Check whether the user already has an active paid subscription —
  // if so, we should auto-convert the referral immediately.
  const enrolment = await prisma.subjectEnrolment.findFirst({
    where: { userId: targetUser.id, tier: "PAID" },
    select: { subscriptionStatus: true },
  });
  const isAlreadyPaid =
    enrolment?.subscriptionStatus === "active" ||
    enrolment?.subscriptionStatus === "trialing";

  const reward = rewardForType(affiliate.type);
  const isStudent = affiliate.type === "STUDENT_REFERRAL";

  // Create the Referral, optionally converting in the same transaction
  await prisma.$transaction(async (tx) => {
    // Set referredByCode on the user (idempotent — only if not already set)
    await tx.user.update({
      where: { id: targetUser.id },
      data: { referredByCode: affiliate.referralCode },
    });

    if (isAlreadyPaid) {
      await tx.referral.create({
        data: {
          affiliateId: affiliate.id,
          referredUserId: targetUser.id,
          status: "CONVERTED",
          rewardAmount: reward,
          convertedAt: new Date(),
        },
      });
      if (isStudent) {
        await tx.affiliate.update({
          where: { id: affiliate.id },
          data: { creditBalance: { increment: reward } },
        });
      }
    } else {
      await tx.referral.create({
        data: {
          affiliateId: affiliate.id,
          referredUserId: targetUser.id,
          status: "PENDING",
        },
      });
    }
  });

  // If we converted, also push the Stripe credit so it auto-applies to the
  // referrer's next invoice (matches the webhook flow).
  if (isAlreadyPaid && isStudent && affiliate.user.stripeCustomerId) {
    try {
      const stripe = getStripe();
      await stripe.customers.createBalanceTransaction(affiliate.user.stripeCustomerId, {
        amount: -reward,
        currency: "aud",
        description: `Referral reward (retroactive attribution) — user ${targetUser.email}`,
        metadata: {
          affiliateId: affiliate.id,
          referredUserId: targetUser.id,
          type: "STUDENT_REFERRAL_CREDIT",
          retroactive: "true",
        },
      });
    } catch (err) {
      console.error(`[attribute-referral] Failed to apply Stripe credit:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    converted: isAlreadyPaid,
    user: { id: targetUser.id, email: targetUser.email },
  });
}
