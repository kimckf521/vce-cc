import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { affiliateTypeLabel } from "@/lib/affiliate";

/**
 * GET /api/cron/monitor-affiliates
 *
 * Daily monitoring job for the affiliate program. Sends an alert email to
 * the support inbox when either signal is breached:
 *
 *   1. SUSPICIOUS ACTIVITY: any active affiliate has ≥ 20 referrals in the
 *      last 7 days. Possible sockpuppet abuse — review and consider
 *      deactivating.
 *
 *   2. MONTH-1 RETENTION DROP: of converted referrals older than 30 days,
 *      < 50% are still subscribed. Both tracks become unprofitable below
 *      this threshold.
 *
 * If neither signal fires, no email is sent (silence = healthy). The cron
 * runs daily so issues surface within 24h of crossing the threshold.
 *
 * Auth: Bearer-token via CRON_SECRET (same as the finalize-referrals cron).
 *
 * Output: JSON summary of what was checked + whether an alert was sent.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUSPICIOUS_REFERRALS_PER_WEEK = 20;
const RETENTION_FLOOR = 0.5; // alert below 50% retention
const RETENTION_MIN_SAMPLE = 5; // need at least N data points to be confident

const ALERT_TO_EMAIL =
  process.env.AFFILIATE_ALERT_EMAIL ?? "support@atarhero.com.au";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // ── 1. Suspicious activity scan ─────────────────────────────────────────
  // Find active affiliates with 20+ referrals in the last 7 days.
  const suspectAffiliates = await prisma.affiliate.findMany({
    where: { active: true },
    select: {
      id: true,
      type: true,
      referralCode: true,
      user: { select: { email: true, name: true } },
      referrals: {
        where: { createdAt: { gte: oneWeekAgo } },
        select: { id: true },
      },
    },
  });
  const flagged = suspectAffiliates
    .map((a) => ({
      ...a,
      recentReferrals: a.referrals.length,
    }))
    .filter((a) => a.recentReferrals >= SUSPICIOUS_REFERRALS_PER_WEEK);

  // ── 2. Month-1 retention scan ───────────────────────────────────────────
  // For converted referrals older than 30 days, check whether the referee
  // is still subscribed. Below RETENTION_FLOOR with a meaningful sample,
  // raise the alarm.
  const ageable = await prisma.referral.findMany({
    where: {
      status: { in: ["CONVERTED", "REFUNDED", "CHURNED_NO_COMMISSION"] },
      convertedAt: { lt: thirtyDaysAgo, not: null },
    },
    select: {
      affiliate: { select: { type: true } },
      referredUser: {
        select: {
          enrolments: {
            where: { subject: { slug: "mathematical-methods" } },
            select: {
              tier: true,
              subscriptionStatus: true,
              cancelAtPeriodEnd: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  let retained = 0;
  let churned = 0;
  for (const r of ageable) {
    const enrol = r.referredUser.enrolments[0];
    const isActive =
      enrol?.tier === "PAID" &&
      (enrol.subscriptionStatus === "active" ||
        enrol.subscriptionStatus === "trialing") &&
      enrol.cancelAtPeriodEnd !== true;
    if (isActive) retained++;
    else churned++;
  }
  const sample = retained + churned;
  const retentionRate = sample > 0 ? retained / sample : null;
  const retentionAlarm =
    retentionRate !== null &&
    sample >= RETENTION_MIN_SAMPLE &&
    retentionRate < RETENTION_FLOOR;

  // ── Build alert email if either signal fires ────────────────────────────
  const hasSuspicious = flagged.length > 0;
  const shouldAlert = hasSuspicious || retentionAlarm;

  let emailResult: { ok: boolean; id?: string | null; error?: string } | null = null;

  if (shouldAlert) {
    const origin =
      request.headers.get("origin") ??
      request.nextUrl.origin ??
      "https://atarhero.com.au";

    const lines: string[] = [
      `Affiliate program — daily monitoring alert`,
      `Date: ${now.toISOString().slice(0, 10)}`,
      ``,
    ];

    if (hasSuspicious) {
      lines.push(
        `🚨 SUSPICIOUS ACTIVITY (${flagged.length} affiliate${flagged.length !== 1 ? "s" : ""}):`,
        ``
      );
      for (const a of flagged) {
        lines.push(
          `  • ${a.user.name ?? a.user.email} (${a.user.email})`,
          `    Type: ${affiliateTypeLabel(a.type)}  ·  Code: ${a.referralCode}`,
          `    Recent referrals (last 7d): ${a.recentReferrals}`,
          `    Review: ${origin}/admin/affiliates/${a.id}`,
          ``
        );
      }
      lines.push(
        `Action: review each affiliate. Use "Deactivate" if abuse suspected.`,
        ``
      );
    }

    if (retentionAlarm) {
      const pct = Math.round((retentionRate ?? 0) * 100);
      lines.push(
        `⚠️ RETENTION DROP: only ${pct}% of referred users (n=${sample}) are still subscribed past month 1.`,
        `Threshold: ${Math.round(RETENTION_FLOOR * 100)}% (both tracks become unprofitable below this).`,
        ``,
        `Breakdown:`,
        `  • Retained: ${retained}`,
        `  • Churned:  ${churned}`,
        ``,
        `Action: investigate referee quality. What marketing channels are driving signups? Are these real students?`,
        `Dashboard: ${origin}/admin/affiliates`,
        ``
      );
    }

    lines.push(`— Sent automatically by /api/cron/monitor-affiliates`);

    emailResult = await sendEmail({
      to: ALERT_TO_EMAIL,
      subject: hasSuspicious && retentionAlarm
        ? `[ATAR Hero] Affiliate alert: suspicious activity + retention drop`
        : hasSuspicious
          ? `[ATAR Hero] Affiliate alert: ${flagged.length} flagged affiliate${flagged.length !== 1 ? "s" : ""}`
          : `[ATAR Hero] Affiliate alert: retention dropped to ${Math.round((retentionRate ?? 0) * 100)}%`,
      text: lines.join("\n"),
    });

    console.log(
      `[cron-monitor] Sent affiliate alert to ${ALERT_TO_EMAIL}: suspicious=${flagged.length} retentionRate=${retentionRate}`
    );
  } else {
    console.log(
      `[cron-monitor] All quiet (suspicious=0, retention=${retentionRate === null ? "n/a" : Math.round(retentionRate * 100) + "%"} sample=${sample})`
    );
  }

  return NextResponse.json({
    ok: true,
    alerted: shouldAlert,
    suspicious: {
      count: flagged.length,
      affiliates: flagged.map((a) => ({
        id: a.id,
        email: a.user.email,
        recentReferrals: a.recentReferrals,
      })),
    },
    retention: {
      sample,
      retained,
      churned,
      rate: retentionRate,
      alarm: retentionAlarm,
    },
    emailResult,
  });
}
