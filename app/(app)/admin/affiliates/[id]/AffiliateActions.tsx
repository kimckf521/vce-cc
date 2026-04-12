"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AffiliateActions({
  affiliateId,
  approved,
  active,
  notes,
}: {
  affiliateId: string;
  approved: boolean;
  active: boolean;
  notes: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditAdj, setCreditAdj] = useState("");
  const [notesText, setNotesText] = useState(notes);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 mb-8">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Admin actions</h3>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {!approved && (
          <button
            onClick={() => patch({ approved: true })}
            disabled={loading}
            className="rounded-xl bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {approved && (
          <button
            onClick={() => patch({ approved: false })}
            disabled={loading}
            className="rounded-xl bg-amber-600 text-white text-sm font-medium px-4 py-2 hover:bg-amber-700 disabled:opacity-50"
          >
            Revoke approval
          </button>
        )}
        <button
          onClick={() => patch({ active: !active })}
          disabled={loading}
          className="rounded-xl bg-gray-600 text-white text-sm font-medium px-4 py-2 hover:bg-gray-700 disabled:opacity-50"
        >
          {active ? "Deactivate" : "Activate"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Adjust credit (cents, ± allowed)
          </label>
          <div className="flex gap-2">
            <input
              value={creditAdj}
              onChange={(e) => setCreditAdj(e.target.value)}
              placeholder="500 or -100"
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                const n = parseInt(creditAdj, 10);
                if (!isNaN(n)) {
                  patch({ creditAdjustment: n });
                  setCreditAdj("");
                }
              }}
              disabled={loading || !creditAdj}
              className="rounded-xl bg-brand-600 text-white text-sm font-medium px-4 py-2 hover:bg-brand-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Admin notes
          </label>
          <div className="flex gap-2">
            <input
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
            <button
              onClick={() => patch({ notes: notesText })}
              disabled={loading}
              className="rounded-xl bg-brand-600 text-white text-sm font-medium px-4 py-2 hover:bg-brand-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
