import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { MIN_PAYOUT_AMOUNT, formatCents, affiliateTypeLabel } from "@/lib/affiliate";
import { sendEmail } from "@/lib/email";

// Internal address for payout-request notifications. Pulled from env so it
// can be overridden per environment without a code change.
const PAYOUT_NOTIFY_TO =
  process.env.PAYOUT_NOTIFY_EMAIL ?? "support@atarhero.com.au";

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

  // Calculate available payout. Sources differ by track:
  // - Influencer: admin-managed `creditBalance` (renamed "Payout balance" in UI)
  //               minus any pending/processing payouts already in flight.
  // - Tutor:      sum of CONVERTED referrals minus already paid-out commissions.
  // Pending/processing payouts are subtracted in both cases so users can't
  // double-request while one is being processed.
  const inFlightAgg = await prisma.payout.aggregate({
    where: {
      affiliateId: affiliate.id,
      type: "COMMISSION",
      status: { in: ["PENDING", "PROCESSING"] },
    },
    _sum: { amount: true },
  });
  const inFlight = inFlightAgg._sum.amount ?? 0;

  let available: number;
  if (affiliate.type === "INFLUENCER_AFFILIATE") {
    available = affiliate.creditBalance - inFlight;
  } else {
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
    available = (convertedAgg._sum.rewardAmount ?? 0) - (paidAgg._sum.amount ?? 0);
  }

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

  // Notify the support inbox so admins can process the payout. Pull the
  // affiliate's user info for the email body. Email failures are logged but
  // don't break the request — the payout record still gets created.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });
    const trackLabel = affiliateTypeLabel(affiliate.type);
    const amountFmt = formatCents(available);
    const origin =
      request.headers.get("origin") ??
      request.nextUrl.origin ??
      "http://localhost:3000";
    const adminUrl = `${origin}/admin/affiliates/${affiliate.id}`;

    const text = [
      `New payout request received.`,
      ``,
      `Affiliate: ${dbUser?.name ?? "—"} (${dbUser?.email ?? user.email ?? "unknown"})`,
      `Track: ${trackLabel}`,
      `Referral code: ${affiliate.referralCode}`,
      `Amount: ${amountFmt}`,
      `Payout ID: ${payout.id}`,
      ``,
      `Open admin: ${adminUrl}`,
    ].join("\n");

    await sendEmail({
      to: PAYOUT_NOTIFY_TO,
      subject: `Payout request: ${amountFmt} from ${dbUser?.name ?? dbUser?.email ?? "an affiliate"}`,
      text,
      replyTo: dbUser?.email ?? undefined,
    });
  } catch (err) {
    console.error(
      `[payouts] Failed to send notification email for payout ${payout.id}:`,
      err
    );
  }

  return NextResponse.json({ payout }, { status: 201 });
}
