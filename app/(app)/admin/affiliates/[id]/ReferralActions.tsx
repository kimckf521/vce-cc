"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReferralActions({
  affiliateId,
  referralId,
}: {
  affiliateId: string;
  referralId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markConverted() {
    if (!confirm("Manually mark this referral as converted? This will accrue the reward.")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/affiliates/${affiliateId}/mark-converted`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={markConverted}
      disabled={loading}
      className="text-xs rounded-lg bg-emerald-600 text-white font-medium px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? "…" : "Mark converted"}
    </button>
  );
}
