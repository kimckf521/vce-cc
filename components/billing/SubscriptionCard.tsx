"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import CancelDialog from "./CancelDialog";

type Props = {
  planName: string;
  status: string;
  priceAmount: number;
  priceCurrency: string;
  priceInterval: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  onChanged: () => void;
};

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  trialing:
    "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  past_due:
    "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  canceled:
    "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
};

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SubscriptionCard({
  planName,
  status,
  priceAmount,
  priceCurrency,
  priceInterval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  onChanged,
}: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isActive = status === "active" || status === "trialing";

  async function handleCancel() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not cancel. Please try again.");
        return;
      }
      setCancelOpen(false);
      onChanged();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResume() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/resume", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not resume. Please try again.");
        return;
      }
      onChanged();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-xl bg-brand-50 dark:bg-brand-950 p-3">
            <CreditCard className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                {planName}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_STYLES[status] ?? STATUS_STYLES.canceled
                }`}
              >
                {cancelAtPeriodEnd && isActive
                  ? "Cancelling"
                  : statusLabel(status)}
              </span>
            </div>

            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {formatPrice(priceAmount, priceCurrency)}
              <span className="text-sm lg:text-base font-normal text-gray-500 dark:text-gray-400">
                /{priceInterval}
              </span>
            </p>

            {periodEndLabel && (
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2">
                {cancelAtPeriodEnd
                  ? `Access until ${periodEndLabel}`
                  : `Next billing date: ${periodEndLabel}`}
              </p>
            )}
          </div>
        </div>

        {isActive && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {cancelAtPeriodEnd ? (
              <button
                type="button"
                onClick={handleResume}
                disabled={actionLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors ${
                  actionLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {actionLoading ? "Resuming…" : "Resume subscription"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={actionLoading}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                Cancel subscription
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <CancelDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={actionLoading}
        currentPeriodEnd={currentPeriodEnd}
      />
    </>
  );
}
