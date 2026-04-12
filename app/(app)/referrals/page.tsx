import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { Users, DollarSign, CheckCircle, Clock } from "lucide-react";
import {
  affiliateTypeLabel,
  buildReferralUrl,
  formatCents,
  MIN_PAYOUT_AMOUNT,
} from "@/lib/affiliate";
import ReferralLinkCard from "./ReferralLinkCard";
import RegisterAffiliateForm from "./RegisterAffiliateForm";
import { isAdminRole } from "@/lib/utils";
import RequestPayoutButton from "./RequestPayoutButton";

export const dynamic = "force-dynamic";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}${"*".repeat(Math.min(name.length - 2, 5))}@${domain}`;
}

export default async function ReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!dbUser) redirect("/login");

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
  if (!affiliate) {
    const isAdmin = isAdminRole(dbUser.role);
    const availableTracks: Array<"STUDENT_REFERRAL" | "TUTOR_AFFILIATE" | "INFLUENCER_AFFILIATE"> =
      isAdmin
        ? ["STUDENT_REFERRAL", "TUTOR_AFFILIATE", "INFLUENCER_AFFILIATE"]
        : dbUser.role === "TUTOR"
          ? ["TUTOR_AFFILIATE"]
          : dbUser.role === "INFLUENCER"
            ? ["INFLUENCER_AFFILIATE"]
            : ["STUDENT_REFERRAL"];

    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Refer &amp; Earn
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 lg:text-base">
          Earn rewards by referring others to VCE Methods.
        </p>
        <RegisterAffiliateForm availableTracks={availableTracks} />
      </div>
    );
  }

  const totalReferrals = affiliate.referrals.length;
  const pendingCount = affiliate.referrals.filter((r) => r.status === "PENDING").length;
  const convertedCount = affiliate.referrals.filter((r) => r.status === "CONVERTED").length;
  const totalEarned = affiliate.referrals
    .filter((r) => r.status === "CONVERTED")
    .reduce((s, r) => s + r.rewardAmount, 0);

  // For tutors/influencers: calculate available cash payout
  const paidOut = affiliate.payouts
    .filter((p) => p.type === "COMMISSION" && p.status !== "FAILED")
    .reduce((s, p) => s + p.amount, 0);
  const availableCash = totalEarned - paidOut;

  const referralUrl = buildReferralUrl(affiliate.referralCode, baseUrl);
  const isStudentTrack = affiliate.type === "STUDENT_REFERRAL";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Refer &amp; Earn
          </h1>
          <span className="rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-medium px-2.5 py-0.5">
            {affiliateTypeLabel(affiliate.type)}
          </span>
          {!affiliate.approved && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium px-2.5 py-0.5">
              Pending approval
            </span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base">
          {isStudentTrack
            ? "Earn $5 platform credit for each friend who subscribes."
            : "Earn $10 cash commission for each referred student who subscribes."}
        </p>
      </div>

      {!affiliate.approved && (
        <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-5 text-amber-800 dark:text-amber-300">
          Your application is awaiting admin approval. You&apos;ll be able to share your referral link once approved.
        </div>
      )}

      {/* Referral link */}
      {affiliate.approved && (
        <ReferralLinkCard url={referralUrl} code={affiliate.referralCode} />
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8">
        <StatCard icon={Users} label="Total Referrals" value={totalReferrals.toString()} />
        <StatCard icon={Clock} label="Pending" value={pendingCount.toString()} />
        <StatCard icon={CheckCircle} label="Converted" value={convertedCount.toString()} />
        <StatCard
          icon={DollarSign}
          label={isStudentTrack ? "Credit Balance" : "Total Earned"}
          value={formatCents(isStudentTrack ? affiliate.creditBalance : totalEarned)}
        />
      </div>

      {/* Cash payout panel for tutors/influencers */}
      {!isStudentTrack && affiliate.approved && (
        <div className="mb-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available for payout</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatCents(availableCash)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Minimum payout: {formatCents(MIN_PAYOUT_AMOUNT)}
              </p>
            </div>
            <RequestPayoutButton disabled={availableCash < MIN_PAYOUT_AMOUNT} />
          </div>
        </div>
      )}

      {/* Referrals table */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your referrals</h2>
      {affiliate.referrals.length === 0 ? (
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
              {affiliate.referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4 text-gray-900 dark:text-gray-100">
                    {maskEmail(r.referredUser.email)}
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {r.referredUser.createdAt.toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                    {r.status === "CONVERTED" ? formatCents(r.rewardAmount) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payout history */}
      {!isStudentTrack && affiliate.payouts.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-10">
            Payout history
          </h2>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
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
                    <td className="px-5 py-4">
                      <PayoutStatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCents(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      label: "Pending",
    },
    CONVERTED: {
      bg: "bg-emerald-100 dark:bg-emerald-900",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Converted",
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
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
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
