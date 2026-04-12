import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { affiliateTypeLabel, formatCents } from "@/lib/affiliate";
import { ChevronLeft } from "lucide-react";
import AffiliateActions from "./AffiliateActions";
import ReferralActions from "./ReferralActions";
import PayoutActions from "./PayoutActions";
import ContractsSection from "./ContractsSection";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      referrals: {
        orderBy: { createdAt: "desc" },
        include: { referredUser: { select: { email: true, name: true, createdAt: true } } },
      },
      payouts: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!affiliate) notFound();

  const totalConverted = affiliate.referrals.filter((r) => r.status === "CONVERTED");
  const totalEarned = totalConverted.reduce((s, r) => s + r.rewardAmount, 0);
  const totalPaidOut = affiliate.payouts
    .filter((p) => p.type === "COMMISSION" && p.status !== "FAILED")
    .reduce((s, p) => s + p.amount, 0);
  const owed = totalEarned - totalPaidOut;

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/affiliates"
        className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to affiliates
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {affiliate.user.name ?? affiliate.user.email}
          </h1>
          <span className="rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-medium px-2.5 py-0.5">
            {affiliateTypeLabel(affiliate.type)}
          </span>
          {!affiliate.approved ? (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium px-2.5 py-0.5">
              Pending
            </span>
          ) : !affiliate.active ? (
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2.5 py-0.5">
              Inactive
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-0.5">
              Active
            </span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400">{affiliate.user.email}</p>
      </div>

      {/* Profile / details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Profile</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Referral code</dt>
              <dd className="font-mono text-gray-900 dark:text-gray-100">{affiliate.referralCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">ABN</dt>
              <dd className="text-gray-900 dark:text-gray-100">{affiliate.abn ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Joined</dt>
              <dd className="text-gray-900 dark:text-gray-100">
                {affiliate.createdAt.toLocaleDateString("en-AU")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Credit balance</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatCents(affiliate.creditBalance)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Earnings</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Total referrals</dt>
              <dd className="text-gray-900 dark:text-gray-100">{affiliate.referrals.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Converted</dt>
              <dd className="text-emerald-700 dark:text-emerald-400 font-medium">
                {totalConverted.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Total earned</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatCents(totalEarned)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Paid out</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatCents(totalPaidOut)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2 font-semibold">
              <dt className="text-gray-700 dark:text-gray-300">Owed</dt>
              <dd className="text-brand-700 dark:text-brand-400">{formatCents(owed)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Admin actions */}
      <AffiliateActions
        affiliateId={affiliate.id}
        approved={affiliate.approved}
        active={affiliate.active}
        notes={affiliate.notes ?? ""}
      />

      {/* Influencer contracts */}
      {affiliate.type === "INFLUENCER_AFFILIATE" && (
        <ContractsSection affiliateId={affiliate.id} contracts={affiliate.contracts} />
      )}

      {/* Referrals */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-10">Referrals</h2>
      {affiliate.referrals.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400">
          No referrals yet.
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
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {affiliate.referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4">
                    <p className="text-gray-900 dark:text-gray-100">{r.referredUser.name ?? "—"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.referredUser.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {r.referredUser.createdAt.toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-5 py-4 text-gray-900 dark:text-gray-100">{r.status}</td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                    {r.status === "CONVERTED" ? formatCents(r.rewardAmount) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {r.status === "PENDING" && (
                      <ReferralActions affiliateId={affiliate.id} referralId={r.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payouts */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-10">Payouts</h2>
      {affiliate.payouts.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400">
          No payouts yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {affiliate.payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {p.createdAt.toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-5 py-4 text-gray-900 dark:text-gray-100">
                    {p.type === "CONTENT_FEE" ? "Content fee" : "Commission"}
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {formatCents(p.amount)}
                  </td>
                  <td className="px-5 py-4 text-gray-900 dark:text-gray-100">{p.status}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                    {p.reference ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {p.status !== "COMPLETED" && p.status !== "FAILED" && (
                      <PayoutActions payoutId={p.id} currentStatus={p.status} />
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
