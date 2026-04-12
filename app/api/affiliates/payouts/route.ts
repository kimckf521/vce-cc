import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { MIN_PAYOUT_AMOUNT } from "@/lib/affiliate";

/**
 * GET /api/affiliates/payouts — list the current affiliate's payouts.
 * POST /api/affiliates/payouts — request a new payout for unpaid commission earnings.
 *
 * Cash payouts are only available to TUTOR_AFFILIATE and INFLUENCER_AFFILIATE.
 * Students earn platform credit instead, applied automatically via Stripe.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`payouts-get:${ip}`, { maxRequests: 30 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: user.id },
    include: {
      payouts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!affiliate) {
    return NextResponse.json({ error: "No affiliate record" }, { status: 404 });
  }

  return NextResponse.json({ payouts: affiliate.payouts });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`payouts-post:${ip}`, { maxRequests: 5 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: user.id },
  });
  if (!affiliate || !affiliate.approved || !affiliate.active) {
    return NextResponse.json({ error: "Affiliate not approved" }, { status: 403 });
  }
  if (affiliate.type === "STUDENT_REFERRAL") {
    return NextResponse.json(
      { error: "Students earn platform credit, not cash payouts" },
      { status: 400 }
    );
  }

  // Calculate unpaid commission: sum of CONVERTED referrals minus already paid out.
  const [convertedAgg, paidAgg] = await Promise.all([
    prisma.referral.aggregate({
      where: { affiliateId: affiliate.id, status: "CONVERTED" },
      _sum: { rewardAmount: true },
    }),
    prisma.payout.aggregate({
      where: {
        affiliateId: affiliate.id,
        type: "COMMISSION",
        status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
      },
      _sum: { amount: true },
    }),
  ]);

  const earned = convertedAgg._sum.rewardAmount ?? 0;
  const alreadyPaid = paidAgg._sum.amount ?? 0;
  const available = earned - alreadyPaid;

  if (available < MIN_PAYOUT_AMOUNT) {
    return NextResponse.json(
      {
        error: `Minimum payout is $${MIN_PAYOUT_AMOUNT / 100}. You have $${(available / 100).toFixed(2)} available.`,
      },
      { status: 400 }
    );
  }

  const payout = await prisma.payout.create({
    data: {
      affiliateId: affiliate.id,
      amount: available,
      type: "COMMISSION",
      status: "PENDING",
    },
  });

  return NextResponse.json({ payout }, { status: 201 });
}
