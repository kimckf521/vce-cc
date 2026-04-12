"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/affiliate";

type Contract = {
  id: string;
  platform: string;
  platformHandle: string;
  followerCount: number | null;
  contentFee: number;
  feePaid: boolean;
  contentUrl: string | null;
  contentDeadline: Date | null;
  contentVerified: boolean;
  notes: string | null;
};

export default function ContractsSection({
  affiliateId,
  contracts,
}: {
  affiliateId: string;
  contracts: Contract[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New contract form state
  const [platform, setPlatform] = useState("YouTube");
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [feeDollars, setFeeDollars] = useState("");
  const [deadline, setDeadline] = useState("");

  async function createContract() {
    setLoading(true);
    setError(null);
    const body: Record<string, unknown> = {
      platform,
      platformHandle: handle,
      contentFee: Math.round(parseFloat(feeDollars) * 100),
    };
    if (followers) body.followerCount = parseInt(followers, 10);
    if (deadline) body.contentDeadline = new Date(deadline).toISOString();

    const res = await fetch(`/api/admin/affiliates/${affiliateId}/contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed");
      return;
    }
    setShowForm(false);
    setHandle("");
    setFollowers("");
    setFeeDollars("");
    setDeadline("");
    router.refresh();
  }

  async function patchContract(contractId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/affiliates/${affiliateId}/contracts/${contractId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Influencer contracts
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-brand-600 text-white text-sm font-medium px-4 py-2 hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "+ New contract"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 mb-4">
          {error && (
            <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option>YouTube</option>
              <option>TikTok</option>
              <option>Instagram</option>
              <option>Other</option>
            </select>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Handle / channel URL"
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="Follower count"
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.01"
              value={feeDollars}
              onChange={(e) => setFeeDollars(e.target.value)}
              placeholder="Content fee ($AUD)"
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
            <button
              onClick={createContract}
              disabled={loading || !handle || !feeDollars}
              className="rounded-xl bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Create contract"}
            </button>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 text-center text-sm text-gray-400">
          No contracts yet.
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5"
            >
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {c.platform} — {c.platformHandle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {c.followerCount ? `${c.followerCount.toLocaleString()} followers · ` : ""}
                    Fee {formatCents(c.contentFee)}
                    {c.contentDeadline
                      ? ` · Due ${new Date(c.contentDeadline).toLocaleDateString("en-AU")}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-medium ${
                      c.contentVerified
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {c.contentVerified ? "Verified" : "Unverified"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-medium ${
                      c.feePaid
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {c.feePaid ? "Fee paid" : "Fee unpaid"}
                  </span>
                </div>
              </div>

              <ContractActions contract={c} onPatch={(body) => patchContract(c.id, body)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContractActions({
  contract,
  onPatch,
}: {
  contract: Contract;
  onPatch: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [url, setUrl] = useState(contract.contentUrl ?? "");

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Published video URL"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
        />
        <button
          onClick={() => onPatch({ contentUrl: url })}
          disabled={!url}
          className="rounded-lg bg-brand-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-brand-700 disabled:opacity-50"
        >
          Save URL
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {!contract.contentVerified && (
          <button
            onClick={() => onPatch({ contentVerified: true })}
            className="rounded-lg bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-emerald-700"
          >
            Mark verified
          </button>
        )}
        {!contract.feePaid && (
          <button
            onClick={() => onPatch({ feePaid: true })}
            className="rounded-lg bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-emerald-700"
          >
            Mark fee paid
          </button>
        )}
      </div>
    </div>
  );
}
