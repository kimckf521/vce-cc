import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * GET /api/cron/finalize-referrals
 *
 * Daily job: finalize referrals whose 30-day hold has expired AND whose
 * referee is still subscribed. Each finalized referral:
 *   - Flips status PENDING_HOLD → CONVERTED
 *   - Stamps `finalizedAt`
 *   - For STUDENT_REFERRAL: increments the affiliate's `creditBalance`
 *     and pushes a Stripe customer balance credit
 *   - For TUTOR/INFLUENCER: leaves rewardPaid=false; the admin payout flow
 *     picks it up from CONVERTED status via the regular payout path
 *
 * Idempotent — uses status guard so reruns don't double-pay.
 *
 * Safety: gated by `CRON_SECRET` env var via Bearer token. Vercel Cron sends
 * this header automatically when configured in `vercel.json`.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Auth — accept either Vercel's cron header or a manual Bearer token
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const summary = {
    inspected: 0,
    finalized: 0,
    stillActive: 0,
    skippedNotPaid: 0,
    errors: [] as string[],
  };

  // Find all referrals whose hold has expired
  const ripe = await prisma.referral.findMany({
    where: {
      status: "PENDING_HOLD",
      commissionLocksAt: { lte: now },
    },
    include: {
      affiliate: {
        select: {
          id: true,
          type: true,
          user: { select: { stripeCustomerId: true } },
        },
      },
      referredUser: {
        select: {
          id: true,
          email: true,
          enrolments: {
            where: { subject: { slug: "mathematical-methods" } },
            select: { tier: true, subscriptionStatus: true },
            take: 1,
          },
        },
      },
    },
  });

  summary.inspected = ripe.length;
  const stripe = getStripe();

  for (const r of ripe) {
    const enrol = r.referredUser.enrolments[0];
    const stillActive =
      enrol?.tier === "PAID" &&
      (enrol.subscriptionStatus === "active" ||
        enrol.subscriptionStatus === "trialing");

    if (!stillActive) {
      // Subscription lapsed before hold expired — skip and downgrade status
      // (treat as churned, unless already in a terminal state).
      try {
        await prisma.referral.update({
          where: { id: r.id, status: "PENDING_HOLD" },
          data: { status: "CHURNED_NO_COMMISSION" },
        });
        summary.skippedNotPaid++;
      } catch (err) {
        summary.errors.push(`churn ${r.id}: ${(err as Error).message}`);
      }
      continue;
    }

    // Hold passed AND referee is still subscribed — finalize the commission
    const isStudent = r.affiliate.type === "STUDENT_REFERRAL";
    try {
      await prisma.$transaction(async (tx) => {
        // Re-check status inside the txn so reruns don't double-credit
        const fresh = await tx.referral.findUnique({
          where: { id: r.id },
          select: { status: true },
        });
        if (!fresh || fresh.status !== "PENDING_HOLD") return;

        await tx.referral.update({
          where: { id: r.id },
          data: { status: "CONVERTED", finalizedAt: now },
        });

        if (isStudent) {
          await tx.affiliate.update({
            where: { id: r.affiliateId },
            data: { creditBalance: { increment: r.rewardAmount } },
          });
        }
      });

      // Push Stripe customer balance credit (students only — tutors/influencers
      // get cash payouts via the existing admin flow).
      if (isStudent && r.affiliate.user.stripeCustomerId) {
        try {
          await stripe.customers.createBalanceTransaction(
            r.affiliate.user.stripeCustomerId,
            {
              amount: -r.rewardAmount,
              currency: "aud",
              description: `Referral reward (hold finalized) — referral ${r.id}`,
              metadata: {
                referralId: r.id,
                affiliateId: r.affiliateId,
                type: "STUDENT_REFERRAL_CREDIT",
              },
            }
          );
        } catch (err) {
          summary.errors.push(`stripe ${r.id}: ${(err as Error).message}`);
        }
      }

      summary.finalized++;
      summary.stillActive++;
      console.log(
        `[cron-finalize] Referral ${r.id} finalized (${r.rewardAmount}c, ${r.affiliate.type})`
      );
    } catch (err) {
      summary.errors.push(`finalize ${r.id}: ${(err as Error).message}`);
    }
  }

  console.log(`[cron-finalize] Done`, summary);
  return NextResponse.json({ ok: true, ...summary });
}
