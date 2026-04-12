"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayoutActions({
  payoutId,
  currentStatus,
}: {
  payoutId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [showRef, setShowRef] = useState(false);

  async function update(status: string, ref?: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reference: ref }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  if (showRef) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Bank ref"
          className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
        />
        <button
          onClick={() => update("COMPLETED", reference)}
          disabled={loading || !reference}
          className="text-xs rounded-lg bg-emerald-600 text-white font-medium px-2 py-1 hover:bg-emerald-700 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => setShowRef(false)}
          className="text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-2 py-1"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      {currentStatus === "PENDING" && (
        <button
          onClick={() => update("PROCESSING")}
          disabled={loading}
          className="text-xs rounded-lg bg-sky-600 text-white font-medium px-2 py-1 hover:bg-sky-700 disabled:opacity-50"
        >
          Process
        </button>
      )}
      <button
        onClick={() => setShowRef(true)}
        className="text-xs rounded-lg bg-emerald-600 text-white font-medium px-2 py-1 hover:bg-emerald-700"
      >
        Complete
      </button>
      <button
        onClick={() => update("FAILED")}
        disabled={loading}
        className="text-xs rounded-lg bg-red-600 text-white font-medium px-2 py-1 hover:bg-red-700 disabled:opacity-50"
      >
        Fail
      </button>
    </div>
  );
}
