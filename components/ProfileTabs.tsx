"use client";

import { useState } from "react";
import { User, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import EditDisplayName from "@/components/EditDisplayName";
import ChangePassword from "@/components/ChangePassword";
import ThemeToggle from "@/components/ThemeToggle";
import BillingSection from "@/components/BillingSection";

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

const TABS = [
  { key: "account", label: "Account", icon: User },
  { key: "billing", label: "Billing", icon: CreditCard },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */

export default function ProfileTabs({
  displayName,
  email,
  role,
  memberSince,
  billing,
}: ProfileTabsProps) {
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
      </div>
    </div>
  );
}
