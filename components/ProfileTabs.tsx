"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, CreditCard, MessageSquare, Gift, ArrowRight, Check, LogOut } from "lucide-react";
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

const TABS = [
  { key: "account", label: "Account", icon: User },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "referrals", label: "Refer & earn", icon: Gift },
  { key: "report", label: "Report", icon: MessageSquare },
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
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // Server-side logout clears the Prisma activeSessionId + vce_sid cookie
      // and runs supabase.auth.signOut() in one round trip.
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* ── tab bar ──────────────────────────────────────────────────── */}
      {/* On narrow screens the four tab labels (especially "Refer & earn")
          would wrap onto two lines and overlap. Make the row horizontally
          scrollable and force every tab to stay on a single line.
          `overflow-y-hidden` is needed because `overflow-x-auto` alone
          promotes the y-axis from `visible` to `auto`, which lets the row
          scroll vertically too — that's what we want to suppress. */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-2 lg:px-4 overflow-x-auto overflow-y-hidden">
        <div className="flex flex-nowrap min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "shrink-0 whitespace-nowrap flex items-center gap-2 px-3 sm:px-4 lg:px-5 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── tab content ──────────────────────────────────────────────── */}
      <div className="p-5 lg:p-7">
        {activeTab === "account" && (
          <div className="space-y-5 lg:space-y-6">
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

            {/* Sign out — duplicated here so mobile users (who don't see the
                desktop sidebar) can log out without leaving the Profile page. */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm lg:text-base font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
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
                      Share your link. Earn cash.
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Send your link to your students. When they subscribe:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">You</strong> earn
                          <strong className="text-emerald-600 dark:text-emerald-400"> $10 cash</strong> per student — paid via bank transfer
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">Your student</strong> gets their first month at
                          <strong className="text-emerald-600 dark:text-emerald-400"> half price</strong> ($4.99 instead of $9.99)
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          Cash out once you reach
                          <strong className="text-gray-900 dark:text-gray-100"> $20</strong>. No limit on how many students you can refer.
                        </span>
                      </li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Your $10 unlocks after your student has paid for 30 days.
                    </p>
                  </>
                ) : role === "Influencer" ? (
                  <>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Promote, earn cash + content fees.
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Share your link with your audience. When they subscribe:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">You</strong> earn
                          <strong className="text-emerald-600 dark:text-emerald-400"> $10 cash</strong> per subscriber — paid via bank transfer
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">Plus</strong> a
                          <strong className="text-emerald-600 dark:text-emerald-400"> negotiable upfront fee</strong> for every video you publish
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-gray-900 dark:text-gray-100">Your audience</strong> gets their
                          <strong className="text-emerald-600 dark:text-emerald-400"> first month at half price</strong> ($4.99 instead of $9.99)
                        </span>
                      </li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Your $10 unlocks after the subscriber has paid for 30 days.
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
