"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

type Props = {
  /** When the current billing period ends — last day they have access if not resolved. */
  currentPeriodEnd: string | null;
};

/**
 * Banner shown when a subscription is in `past_due` state — i.e. the renewal
 * payment failed and Stripe is currently retrying. The user keeps access during
 * the dunning window but should update their card before retries are exhausted.
 *
 * Clicking "Update payment method" opens Stripe's hosted card-update flow
 * (the same scoped portal used by PaymentMethodCard).
 */
export default function PaymentFailedBanner({ currentPeriodEnd }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/update-payment-method", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open payment update.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900 p-3">
          <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm lg:text-base font-semibold text-amber-900 dark:text-amber-200">
            We couldn&apos;t process your last payment
          </p>
          <p className="mt-1 text-xs lg:text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed">
            Your subscription is still active{dateLabel ? ` until ${dateLabel}` : ""},
            but we&apos;ll keep retrying your card. Update your payment method to
            avoid losing access.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading…" : "Update payment method"}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
