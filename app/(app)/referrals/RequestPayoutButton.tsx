"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestPayoutButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/affiliates/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to request payout");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={request}
        disabled={disabled || loading}
        className="rounded-xl bg-brand-600 text-white font-semibold px-6 py-3 hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Requesting…" : "Request payout"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
