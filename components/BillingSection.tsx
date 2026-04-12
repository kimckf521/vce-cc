"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";

type Props = {
  hasSubscription: boolean;
  planName: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/**
 * Billing section for the profile page. Shows current subscription status
 * and a button to open the Stripe Billing Portal (for active subscribers)
 * or a link to /pricing (for free users).
 */
export default function BillingSection({
  hasSubscription,
  planName,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openBillingPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setLoading(false);
    }
  }

  const statusLabel = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-5">
        Billing
      </h2>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 lg:p-7">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-xl bg-brand-50 dark:bg-brand-950 p-3">
            <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-brand-600 dark:text-brand-400" />
          </div>

          <div className="flex-1 min-w-0">
            {hasSubscription ? (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                    {planName ?? "Standard"}
                  </p>
                  {statusLabel && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        status === "active" || status === "trialing"
                          ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  )}
                </div>
                {periodEndLabel && (
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {cancelAtPeriodEnd
                      ? `Cancels on ${periodEndLabel}`
                      : `Renews on ${periodEndLabel}`}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                  Free plan
                </p>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Upgrade to Standard for full access to Mathematical Methods.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {hasSubscription ? (
            <button
              type="button"
              onClick={openBillingPortal}
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading…" : "Manage billing"}
              <ExternalLink className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Upgrade to Standard
            </Link>
          )}
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
