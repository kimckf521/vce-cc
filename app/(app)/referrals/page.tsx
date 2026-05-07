import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { Users, DollarSign, CheckCircle, Clock, FileText } from "lucide-react";
import type { AffiliateType } from "@prisma/client";
import {
  affiliateTypeLabel,
  buildReferralUrl,
  formatCents,
  MIN_PAYOUT_AMOUNT,
} from "@/lib/affiliate";
import ReferralLinkCard from "./ReferralLinkCard";
import RegisterAffiliateForm from "./RegisterAffiliateForm";
import { isAdminRole } from "@/lib/utils";
import { cn } from "@/lib/utils";
import RequestPayoutButton from "./RequestPayoutButton";
import ProofViewer from "./ProofViewer";
import { getStripe } from "@/lib/stripe";
import { isResourceMissing } from "@/lib/stripe-customer";

export const dynamic = "force-dynamic";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}${"*".repeat(Math.min(name.length - 2, 5))}@${domain}`;
}

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ReferralsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, stripeCustomerId: true },
  });
  if (!dbUser) redirect("/login");

  // Fetch the live Stripe customer balance — this is the source of truth for
  // credit applied to the next invoice (covers both referral conversions and
  // admin gifts; the DB affiliate.creditBalance only tracks referrals).
  let stripeCreditCents = 0;
  if (dbUser.stripeCustomerId) {
    try {
      const stripe = getStripe();
      const c = await stripe.customers.retrieve(dbUser.stripeCustomerId);
      if (!c.deleted && typeof c.balance === "number" && c.balance < 0) {
        stripeCreditCents = Math.abs(c.balance);
      }
    } catch (err) {
      if (!isResourceMissing(err)) {
        console.error(`[referrals] Stripe balance fetch failed:`, err);
      }
    }
  }

  const isAdmin = isAdminRole(dbUser.role);
  const { view } = await searchParams;

  // Admin-only: allow previewing other track dashboards via ?view=tutor|influencer|student
  const viewOverride: AffiliateType | null = isAdmin
    ? view === "tutor"
      ? "TUTOR_AFFILIATE"
      : view === "influencer"
        ? "INFLUENCER_AFFILIATE"
        : view === "student"
          ? "STUDENT_REFERRAL"
          : null
    : null;

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: user.id },
    include: {
      referrals: {
        orderBy: { createdAt: "desc" },
        include: {
          referredUser: { select: { email: true, createdAt: true } },
        },
      },
      payouts: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
    },
  });

  // Build absolute URL for referral link
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  // No affiliate yet — show registration options. Which tracks are offered
  // depends on the user's role:
  //   STUDENT → student card only
  //   TUTOR → tutor card only
  //   INFLUENCER → influencer card only
  //   ADMIN/SUPER_ADMIN → all three (for testing)
  // EXCEPTION: if admin uses ?view=X, synthesize a demo affiliate for preview
  if (!affiliate && !viewOverride) {
    const availableTracks: Array<"STUDENT_REFERRAL" | "TUTOR_AFFILIATE" | "INFLUENCER_AFFILIATE"> =
      isAdmin
        ? ["STUDENT_REFERRAL", "TUTOR_AFFILIATE", "INFLUENCER_AFFILIATE"]
        : dbUser.role === "TUTOR"
          ? ["TUTOR_AFFILIATE"]
          : dbUser.role === "INFLUENCER"
            ? ["INFLUENCER_AFFILIATE"]
            : ["STUDENT_REFERRAL"];

    return (
      <div className="max-w-6xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Refer &amp; Earn
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 lg:text-base">
          Earn rewards by referring others to ATAR Hero.
        </p>
        {isAdmin && (
          <div className="mb-6 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300 mb-2">
              Admin — Preview dashboards (without registering)
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/referrals?view=student" className="rounded-full px-4 py-1.5 text-sm font-medium bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900">
                Student view
              </Link>
              <Link href="/referrals?view=tutor" className="rounded-full px-4 py-1.5 text-sm font-medium bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900">
                Tutor view
              </Link>
              <Link href="/referrals?view=influencer" className="rounded-full px-4 py-1.5 text-sm font-medium bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900">
                Influencer view
              </Link>
            </div>
          </div>
        )}
        <RegisterAffiliateForm availableTracks={availableTracks} />
      </div>
    );
  }

  // Admin preview without a real affiliate — synthesize an empty one
  // Type-cast is safe because this only runs when viewOverride is set (admin preview).
  type AffiliateData = NonNullable<typeof affiliate>;
  const effectiveAffiliate: AffiliateData = affiliate ?? ({
    id: "demo",
    userId: user.id,
    type: viewOverride!,
    referralCode: "demo-preview",
    approved: true,
    active: true,
    creditBalance: 0,
    totalEarned: 0,
    abn: null,
    platform: null,
    handle: null,
    followerCount: null,
    adminNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    referrals: [],
    payouts: [],
    contracts: [],
  } as unknown as AffiliateData);

  const totalReferrals = effectiveAffiliate.referrals.length;
  const pendingCount = effectiveAffiliate.referrals.filter((r) => r.status === "PENDING").length;
  const convertedCount = effectiveAffiliate.referrals.filter((r) => r.status === "CONVERTED").length;
  const totalEarned = effectiveAffiliate.referrals
    .filter((r) => r.status === "CONVERTED")
    .reduce((s, r) => s + r.rewardAmount, 0);

  // For tutors/influencers: calculate available cash payout
  const paidOut = effectiveAffiliate.payouts
    .filter((p) => p.type === "COMMISSION" && p.status !== "FAILED")
    .reduce((s, p) => s + p.amount, 0);
  const availableCash = totalEarned - paidOut;

  const referralUrl = buildReferralUrl(effectiveAffiliate.referralCode, baseUrl);
  // Admin can preview other track dashboards via ?view=X — use effectiveType for display
  const effectiveType = viewOverride ?? effectiveAffiliate.type;
  const isStudentTrack = effectiveType === "STUDENT_REFERRAL";
  const isInfluencerTrack = effectiveType === "INFLUENCER_AFFILIATE";
  const isPreviewing = viewOverride !== null && (!affiliate || viewOverride !== affiliate.type);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Refer &amp; Earn
          </h1>
          <span className="rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-medium px-2.5 py-0.5">
            {affiliateTypeLabel(effectiveType)}
          </span>
          {!effectiveAffiliate.approved && !isPreviewing && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium px-2.5 py-0.5">
              Pending approval
            </span>
          )}
          {isPreviewing && (
            <span className="rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5">
              Admin preview
            </span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base">
          {isStudentTrack
            ? "Earn $5 credit for each friend who subscribes — automatically applied to your next month's bill (50% off)."
            : isInfluencerTrack
              ? "Earn $10 cash commission + upfront content fee for each video you publish."
              : "Earn $10 cash commission for each referred student who subscribes."}
        </p>
      </div>

      {/* Admin-only view switcher */}
      {isAdmin && (
        <div className="mb-6 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300 mb-2">
            Admin — Preview dashboards
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "student", label: "Student view", type: "STUDENT_REFERRAL" },
                { key: "tutor", label: "Tutor view", type: "TUTOR_AFFILIATE" },
                { key: "influencer", label: "Influencer view", type: "INFLUENCER_AFFILIATE" },
              ] as const
            ).map((tab) => {
              const isActive = effectiveType === tab.type;
              return (
                <Link
                  key={tab.key}
                  href={`/referrals?view=${tab.key}`}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
            {viewOverride && (
              <Link
                href="/referrals"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                Back to my view
              </Link>
            )}
          </div>
        </div>
      )}

      {!effectiveAffiliate.approved && !isPreviewing && (
        <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-5 text-amber-800 dark:text-amber-300">
          Your application is awaiting admin approval. You&apos;ll be able to share your referral link once approved.
        </div>
      )}

      {/* Referral link */}
      {(effectiveAffiliate.approved || isPreviewing) && (
        <ReferralLinkCard url={referralUrl} code={effectiveAffiliate.referralCode} />
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8">
        <StatCard icon={Users} label="Total Referrals" value={totalReferrals.toString()} />
        <StatCard icon={Clock} label="Pending" value={pendingCount.toString()} />
        <StatCard icon={CheckCircle} label="Converted" value={convertedCount.toString()} />
        <StatCard
          icon={DollarSign}
          label={isStudentTrack ? "Credit Balance" : "Total Earned"}
          value={formatCents(isStudentTrack ? stripeCreditCents : totalEarned)}
        />
      </div>

      {/* Cash payout panel for tutors/influencers */}
      {!isStudentTrack && (effectiveAffiliate.approved || isPreviewing) && (() => {
        // For influencers, the source of truth for "Available for payout" is the
        // admin-managed `creditBalance` (renamed to "Payout balance" in admin UI),
        // minus any pending/processing payouts already in flight (so they can't
        // double-request the same amount). Tutors still see the auto-calculated
        // commission cash (totalEarned - paidOut, which already accounts for
        // in-flight and completed payouts).
        const inFlight = effectiveAffiliate.payouts
          .filter(
            (p) =>
              p.type === "COMMISSION" &&
              (p.status === "PENDING" || p.status === "PROCESSING")
          )
          .reduce((sum, p) => sum + p.amount, 0);
        const payoutAmount = isInfluencerTrack
          ? Math.max(0, effectiveAffiliate.creditBalance - inFlight)
          : availableCash;
        return (
        <div className="mb-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available for payout</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatCents(payoutAmount)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Minimum payout: {formatCents(MIN_PAYOUT_AMOUNT)}
              </p>
            </div>
            <RequestPayoutButton disabled={payoutAmount < MIN_PAYOUT_AMOUNT} />
          </div>
          {/* Platform credit — shown only for tutors when admin has issued any.
              Influencers earn cash payouts only and never use platform credit,
              so we hide it on their dashboard to avoid confusion. */}
          {stripeCreditCents > 0 && !isInfluencerTrack && (
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Platform credit (applied to your next subscription invoice)
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCents(stripeCreditCents)}
              </p>
            </div>
          )}
        </div>
        );
      })()}

      {/* Influencer content contracts */}
      {isInfluencerTrack && (effectiveAffiliate.approved || isPreviewing) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" /> Content contracts
          </h2>
          {effectiveAffiliate.contracts.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500">
              No contracts yet. Our team will reach out to negotiate content fees for each video you publish.
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Platform</th>
                    <th className="px-5 py-3">Video URL</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {effectiveAffiliate.contracts.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-4 text-gray-900 dark:text-gray-100 capitalize">
                        {c.platform.toLowerCase()}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {c.contentUrl ?? <span className="italic">Not submitted</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            c.feePaid
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                              : c.contentVerified
                                ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {c.feePaid ? "Fee paid" : c.contentVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCents(c.contentFee)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Referrals table */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your referrals</h2>
      {effectiveAffiliate.referrals.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500">
          No referrals yet. Share your link to get started!
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {effectiveAffiliate.referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4 text-gray-900 dark:text-gray-100">
                    {maskEmail(r.referredUser.email)}
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {r.referredUser.createdAt.toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} commissionLocksAt={r.commissionLocksAt} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    {r.status === "CONVERTED" ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {formatCents(r.rewardAmount)}
                      </span>
                    ) : r.status === "PENDING_HOLD" ? (
                      <span
                        className="text-gray-500 dark:text-gray-400"
                        title="Held during the 30-day commission lock. Unlocks if the referee stays subscribed."
                      >
                        {formatCents(r.rewardAmount)}
                        <span className="ml-1 text-xs font-normal opacity-70">(pending)</span>
                      </span>
                    ) : r.status === "CHURNED_NO_COMMISSION" ? (
                      <span
                        className="text-gray-400 dark:text-gray-500 line-through"
                        title="Referee cancelled within the hold — no commission earned."
                      >
                        {formatCents(r.rewardAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payout history */}
      {!isStudentTrack && (effectiveAffiliate.payouts.length > 0 || isPreviewing) && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-10">
            Payout history
          </h2>
          {effectiveAffiliate.payouts.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500">
              No payouts yet. Request a payout once you reach {formatCents(MIN_PAYOUT_AMOUNT)}.
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Paid Date</th>
                    <th className="px-5 py-3">Paid Time</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Proof</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {effectiveAffiliate.payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {p.processedAt
                          ? new Date(p.processedAt).toLocaleDateString("en-AU")
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {p.processedAt
                          ? new Date(p.processedAt).toLocaleTimeString("en-AU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-900 dark:text-gray-100">
                        {p.type === "CONTENT_FEE" ? "Content fee" : "Commission"}
                      </td>
                      <td className="px-5 py-4">
                        <PayoutStatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4">
                        {p.proofUrl ? (
                          <ProofViewer url={p.proofUrl} />
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCents(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <Icon className="h-5 w-5 text-brand-500 mb-3" />
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function StatusBadge({
  status,
  commissionLocksAt,
}: {
  status: string;
  commissionLocksAt?: Date | null;
}) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      label: "Pending",
    },
    PENDING_HOLD: {
      bg: "bg-sky-100 dark:bg-sky-900",
      text: "text-sky-700 dark:text-sky-300",
      label: "In 30-day hold",
    },
    CONVERTED: {
      bg: "bg-emerald-100 dark:bg-emerald-900",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Converted",
    },
    CHURNED_NO_COMMISSION: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      label: "Churned",
    },
    EXPIRED: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      label: "Expired",
    },
    REFUNDED: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-700 dark:text-red-300",
      label: "Refunded",
    },
  };
  const c = config[status] ?? config.PENDING;

  // For PENDING_HOLD, surface the days remaining so affiliates know when their
  // commission unlocks (it's confusing otherwise — looks like a stuck pending).
  let label = c.label;
  if (status === "PENDING_HOLD" && commissionLocksAt) {
    const ms = new Date(commissionLocksAt).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
    label = days > 0 ? `Locks in ${days}d` : "Unlocking…";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
      title={
        status === "PENDING_HOLD"
          ? "Commission is held for 30 days. If the referee stays subscribed, commission unlocks on the date shown."
          : status === "CHURNED_NO_COMMISSION"
            ? "Referee cancelled before the 30-day hold expired. No commission was earned."
            : undefined
      }
    >
      {label}
    </span>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      label: "Pending",
    },
    PROCESSING: {
      bg: "bg-sky-100 dark:bg-sky-900",
      text: "text-sky-700 dark:text-sky-300",
      label: "Processing",
    },
    COMPLETED: {
      bg: "bg-emerald-100 dark:bg-emerald-900",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Completed",
    },
    FAILED: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-700 dark:text-red-300",
      label: "Failed",
    },
  };
  const c = config[status] ?? config.PENDING;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
