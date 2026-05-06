"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * One-click deactivate button used on the suspicious-activity warning panel.
 * Sets the affiliate's `active` flag to false via the existing PATCH endpoint.
 */
export default function QuickDeactivateButton({ affiliateId }: { affiliateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deactivate() {
    if (!confirm("Deactivate this affiliate? Their referral link will stop attributing new conversions.")) {
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to deactivate");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={deactivate}
        disabled={loading}
        className="rounded-xl bg-red-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "Deactivating…" : "Deactivate"}
      </button>
      {error && (
        <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
