import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { Users, DollarSign, Clock, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { affiliateTypeLabel, formatCents } from "@/lib/affiliate";
import QuickDeactivateButton from "./QuickDeactivateButton";
import AffiliateRow from "./AffiliateRow";

export const dynamic = "force-dynamic";

// Suspicious-activity threshold: 20+ referrals in the last 7 days flags an
// affiliate as potentially abusing the referral program.
const SUSPICIOUS_REFERRALS_PER_WEEK = 20;

export default async function AdminAffiliatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  // 7-day window for abuse detection
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const affiliates = await prisma.affiliate.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true } },
      referrals: { select: { status: true, rewardAmount: true, createdAt: true } },
      payouts: { select: { amount: true, status: true, type: true } },
    },
  });

  // Aggregate stats
  const totalAffiliates = affiliates.length;
  const pendingApprovals = affiliates.filter((a) => !a.approved).length;
  const studentCount = affiliates.filter((a) => a.type === "STUDENT_REFERRAL").length;
  const tutorCount = affiliates.filter((a) => a.type === "TUTOR_AFFILIATE").length;
  const influencerCount = affiliates.filter((a) => a.type === "INFLUENCER_AFFILIATE").length;
  const totalConverted = affiliates.reduce(
    (s, a) => s + a.referrals.filter((r) => r.status === "CONVERTED").length,
    0
  );
  const totalEarnings = affiliates.reduce(
    (s, a) =>
      s +
      a.referrals
        .filter((r) => r.status === "CONVERTED")
        .reduce((rs, r) => rs + r.rewardAmount, 0),
    0
  );

  const rows = affiliates.map((a) => {
    const converted = a.referrals.filter((r) => r.status === "CONVERTED");
    const totalEarned = converted.reduce((s, r) => s + r.rewardAmount, 0);
    const recentReferrals = a.referrals.filter((r) => r.createdAt >= oneWeekAgo).length;
    const isSuspicious = a.active && recentReferrals >= SUSPICIOUS_REFERRALS_PER_WEEK;
    return {
      ...a,
      referralCount: a.referrals.length,
      convertedCount: converted.length,
      totalEarned,
      recentReferrals,
      isSuspicious,
    };
  });

  const flagged = rows.filter((r) => r.isSuspicious);

  return (
    <div>
      {/* Back to admin */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Affiliates</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          Manage affiliate accounts, approvals, and payouts
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Affiliates" value={totalAffiliates.toString()} />
        <StatCard icon={Clock} label="Pending Approval" value={pendingApprovals.toString()} />
        <StatCard icon={CheckCircle} label="Conversions" value={totalConverted.toString()} />
        <StatCard icon={DollarSign} label="Total Owed" value={formatCents(totalEarnings)} />
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <TypeCard label="Students" count={studentCount} color="sky" />
        <TypeCard label="Tutors" count={tutorCount} color="violet" />
        <TypeCard label="Influencers" count={influencerCount} color="amber" />
      </div>

      {/* Suspicious activity warning */}
      {flagged.length > 0 && (
        <div className="mb-8 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">
                {flagged.length} affiliate{flagged.length !== 1 ? "s" : ""} flagged for review
              </h2>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Each has {SUSPICIOUS_REFERRALS_PER_WEEK}+ referrals in the last 7 days — review for abuse.
              </p>
              <div className="mt-3 space-y-2">
                {flagged.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 px-4 py-3"
                  >
                    <Link
                      href={`/admin/affiliates/${a.id}`}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {a.user.name ?? a.user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {a.recentReferrals} referrals in 7 days · {affiliateTypeLabel(a.type)} · {a.referralCode}
                      </p>
                    </Link>
                    <QuickDeactivateButton affiliateId={a.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affiliate list */}
      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500">
          No affiliates yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Referrals</th>
                <th className="px-5 py-3">Converted</th>
                <th className="px-5 py-3 text-right">Earned</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {rows.map((a) => (
                <AffiliateRow
                  key={a.id}
                  affiliateId={a.id}
                  className={
                    a.isSuspicious
                      ? "bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {a.user.name ?? "—"}
                      {a.isSuspicious && (
                        <span title={`${a.recentReferrals} referrals in 7 days`}>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {affiliateTypeLabel(a.type)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {a.referralCode}
                  </td>
                  <td className="px-5 py-4 text-gray-900 dark:text-gray-100">{a.referralCount}</td>
                  <td className="px-5 py-4 text-emerald-700 dark:text-emerald-400 font-medium">
                    {a.convertedCount}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCents(a.totalEarned)}
                  </td>
                  <td className="px-5 py-4">
                    {!a.approved ? (
                      <span className="rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium px-2.5 py-0.5">
                        Pending
                      </span>
                    ) : !a.active ? (
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2.5 py-0.5">
                        Inactive
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-0.5">
                        Active
                      </span>
                    )}
                  </td>
                </AffiliateRow>
              ))}
            </tbody>
          </table>
        </div>
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

function TypeCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "sky" | "violet" | "amber";
}) {
  const colors = {
    sky: "bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300",
    violet: "bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
    amber: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
