"use client";

import { useState } from "react";
import Link from "next/link";
import { User, CreditCard, MessageSquare, Gift, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import EditDisplayName from "@/components/EditDisplayName";
import ChangePassword from "@/components/ChangePassword";
import ThemeToggle from "@/components/ThemeToggle";
import BillingSection from "@/components/BillingSection";
import ReportForm from "@/components/ReportForm";

/* ─── types ──────────────────────────────────────────────────────────── */

type ProfileTabsProps = {
  displayName: string;
  email: string;
  role: string;
  memberSince: string | null;
  billing: {
    hasSubscription: boolean;
    planName: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
};

/* ─── tab definitions ─────────────────────────────────────────────────── */

const ALL_TABS = [
  { key: "account", label: "Account", icon: User },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "referrals", label: "Refer & earn", icon: Gift },
  { key: "report", label: "Report", icon: MessageSquare },
] as const;

type TabKey = (typeof ALL_TABS)[number]["key"];

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */

export default function ProfileTabs({
  displayName,
  email,
  role,
  memberSince,
  billing,
}: ProfileTabsProps) {
  // Tutors / influencers access "Refer & earn" via the sidebar instead, so we
  // hide the duplicate tab on their Profile page to avoid two entry points.
  const TABS = ALL_TABS.filter(
    (t) => t.key !== "referrals" || (role !== "Tutor" && role !== "Influencer")
  );
  const [activeTab, setActiveTab] = useState<TabKey>("account");

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* ── tab bar ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-2 lg:px-4">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 lg:px-5 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── tab content ──────────────────────────────────────────────── */}
      <div className="p-5 lg:p-7">
        {activeTab === "account" && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {/* Name row */}
            <div className="flex items-center px-5 lg:px-6 py-4 lg:py-5">
              <EditDisplayName initialName={displayName} />
            </div>

            {/* Email row */}
            <div className="px-5 lg:px-6 py-4 lg:py-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                Email
              </p>
              <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">
                {email}
              </p>
            </div>

            {/* Role row */}
            <div className="px-5 lg:px-6 py-4 lg:py-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                Role
              </p>
              <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">
                {role}
              </p>
            </div>

            {/* Password row */}
            <div className="px-5 lg:px-6 py-4 lg:py-5">
              <ChangePassword />
            </div>

            {/* Theme row */}
            <div className="px-5 lg:px-6 py-4 lg:py-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                Theme
              </p>
              <ThemeToggle />
            </div>

            {/* Member since row */}
            {memberSince && (
              <div className="px-5 lg:px-6 py-4 lg:py-5">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                  Member since
                </p>
                <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">
                  {memberSince}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "billing" && (
          <BillingSection
            hasSubscription={billing.hasSubscription}
            planName={billing.planName}
            status={billing.status}
            currentPeriodEnd={billing.currentPeriodEnd}
            cancelAtPeriodEnd={billing.cancelAtPeriodEnd}
            hideTitle
          />
        )}

        {activeTab === "referrals" && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-5 lg:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
                <Gift className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                {role === "Tutor" ? (
                  <>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Earn cash commission per student
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Refer your students with your unique link. Earn{" "}
                      <strong className="text-gray-900 dark:text-gray-100">$10 cash</strong>{" "}
                      for each student who subscribes — paid via bank transfer
                      once you reach $20.
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Commission unlocks 30 days after the student subscribes.
                      Your students also get 50% off their first month.
                    </p>
                  </>
                ) : role === "Influencer" ? (
                  <>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Earn commission + content fees
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Earn{" "}
                      <strong className="text-gray-900 dark:text-gray-100">$10 cash</strong>{" "}
                      per student who subscribes via your link, plus a negotiable
                      upfront fee for each video you publish.
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Commission unlocks 30 days after the student subscribes.
                      Your audience also gets 50% off their first month.
                    </p>
                  </>
                ) : role === "Admin" || role === "Super Admin" ? (
                  <>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Refer & earn — admin preview
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      View and test all three affiliate tracks (Student, Tutor,
                      Influencer) without registering. Manage approvals, payouts,
                      and commission rates from the admin panel.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Share your link. Both save.
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Send your link to a classmate. When they subscribe:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">You</strong> get
                          <strong className="text-emerald-600 dark:text-emerald-400"> $5 off</strong> your next month
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">Your friend</strong> gets their first month at
                          <strong className="text-emerald-600 dark:text-emerald-400"> half price</strong> ($4.99 instead of $9.99)
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          Refer <strong className="text-gray-900 dark:text-gray-100">2 friends</strong> = your next month is
                          <strong className="text-emerald-600 dark:text-emerald-400"> free</strong>. No limit on how many you can refer.
                        </span>
                      </li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Your $5 shows up after your friend has paid for 30 days.
                    </p>
                  </>
                )}
                <Link
                  href="/referrals"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  Open Refer &amp; earn
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "report" && <ReportForm />}
      </div>
    </div>
  );
}
