import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { markConvertedSchema } from "@/lib/validations";
import { rewardForType } from "@/lib/affiliate";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/admin/affiliates/[id]/mark-converted
 * Manually mark a PENDING referral as CONVERTED. Used when an admin needs to
 * attribute a conversion that the Stripe webhook missed (e.g. payment outside
 * the normal flow). Mirrors the conversion logic in the webhook handler.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-mark-conv:${ip}`, { maxRequests: 30 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = markConvertedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const referral = await prisma.referral.findUnique({
    where: { id: parsed.data.referralId },
    include: { affiliate: { include: { user: { select: { stripeCustomerId: true } } } } },
  });
  if (!referral || referral.affiliateId !== id) {
    return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  }
  if (referral.status !== "PENDING") {
    return NextResponse.json({ error: "Referral is not pending" }, { status: 400 });
  }

  const reward = rewardForType(referral.affiliate.type);
  const isStudent = referral.affiliate.type === "STUDENT_REFERRAL";

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: "CONVERTED",
        rewardAmount: reward,
        convertedAt: new Date(),
      },
    });
    if (isStudent) {
      await tx.affiliate.update({
        where: { id: referral.affiliateId },
        data: { creditBalance: { increment: reward } },
      });
    }
  });

  // Push the credit to Stripe so it auto-applies to the referrer's next invoice
  if (isStudent && referral.affiliate.user.stripeCustomerId) {
    try {
      const stripe = getStripe();
      await stripe.customers.createBalanceTransaction(
        referral.affiliate.user.stripeCustomerId,
        {
          amount: -reward,
          currency: "aud",
          description: `Referral reward (manual) — referral ${referral.id}`,
          metadata: {
            referralId: referral.id,
            affiliateId: referral.affiliateId,
            type: "STUDENT_REFERRAL_CREDIT",
            manual: "true",
          },
        }
      );
    } catch (err) {
      console.error(`[mark-converted] Failed to apply Stripe credit:`, err);
    }
  }

  return NextResponse.json({ ok: true });
}
