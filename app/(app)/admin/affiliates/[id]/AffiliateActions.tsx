"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AffiliateType } from "@prisma/client";

export default function AffiliateActions({
  affiliateId,
  affiliateType,
  approved,
  active,
  notes,
  referralCode,
}: {
  affiliateId: string;
  affiliateType: AffiliateType;
  approved: boolean;
  active: boolean;
  notes: string;
  referralCode: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditAdj, setCreditAdj] = useState("");
  const [notesText, setNotesText] = useState(notes);
  const [codeText, setCodeText] = useState(referralCode);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);

  const isInfluencer = affiliateType === "INFLUENCER_AFFILIATE";

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
            {isInfluencer ? "Adjust payout" : "Adjust credit"} (cents, ± allowed)
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
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            {isInfluencer
              ? "Pushes a Stripe customer balance transaction — adjusts the influencer's owed payout total."
              : "Pushes a Stripe customer balance transaction — applies to the user's next subscription invoice."}
          </p>
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

      {/* Influencer-only: rebrand referral code */}
      {isInfluencer && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Referral code
            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
              Influencers can use a custom branded code (e.g. their channel handle).
            </span>
          </label>
          {codeSuccess && (
            <div className="mb-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              {codeSuccess}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={codeText}
              onChange={(e) => setCodeText(e.target.value.toLowerCase())}
              placeholder="e.g. mychannel-yt"
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono"
            />
            <button
              onClick={async () => {
                const trimmed = codeText.trim();
                if (!trimmed || trimmed === referralCode) return;
                setCodeSuccess(null);
                setError(null);
                setLoading(true);
                const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ referralCode: trimmed }),
                });
                setLoading(false);
                if (!res.ok) {
                  const d = await res.json().catch(() => ({}));
                  setError(d?.error ?? "Failed to update code");
                  return;
                }
                setCodeSuccess(`Referral code updated to ${trimmed}.`);
                router.refresh();
                setTimeout(() => setCodeSuccess(null), 5000);
              }}
              disabled={loading || !codeText.trim() || codeText.trim() === referralCode}
              className="rounded-xl bg-brand-600 text-white text-sm font-medium px-4 py-2 hover:bg-brand-700 disabled:opacity-50"
            >
              Update code
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            3–40 chars, lowercase letters, numbers, single hyphens. Must be unique. Old links will stop working.
          </p>
        </div>
      )}
    </div>
  );
}
