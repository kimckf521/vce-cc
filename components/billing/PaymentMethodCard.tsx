"use client";

import { useState } from "react";
import { Wallet, ExternalLink } from "lucide-react";

type Props = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

const BRAND_NAMES: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay",
};

function brandLabel(brand: string): string {
  return BRAND_NAMES[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1);
}

export default function PaymentMethodCard({
  brand,
  last4,
  expMonth,
  expYear,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
        Payment Method
      </p>

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2">
          <Wallet className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {brandLabel(brand)} ending in {last4}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Expires {String(expMonth).padStart(2, "0")}/{expYear}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading}
        className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Loading…" : "Update"}
        <ExternalLink className="h-3.5 w-3.5" />
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
