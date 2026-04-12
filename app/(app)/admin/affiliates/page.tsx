import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { affiliateTypeLabel, formatCents } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const affiliates = await prisma.affiliate.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true } },
      referrals: { select: { status: true, rewardAmount: true } },
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
    return {
      ...a,
      referralCount: a.referrals.length,
      convertedCount: converted.length,
      totalEarned,
    };
  });

  return (
    <div>
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
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/affiliates/${a.id}`} className="block">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{a.user.name ?? "—"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{a.user.email}</p>
                    </Link>
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
                </tr>
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
