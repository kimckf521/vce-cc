"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
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
  views: number | null;
  viewsUpdatedAt: Date | null;
  notes: string | null;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
}

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

  // New contract form state — simplified to: type, video link, fee, post date.
  const [platform, setPlatform] = useState("YouTube");
  const [videoUrl, setVideoUrl] = useState("");
  const [feeDollars, setFeeDollars] = useState("");
  const [postDate, setPostDate] = useState("");

  async function createContract() {
    setLoading(true);
    setError(null);
    const body: Record<string, unknown> = {
      platform,
      contentFee: Math.round(parseFloat(feeDollars) * 100),
      contentUrl: videoUrl,
    };
    if (postDate) body.contentDeadline = new Date(postDate).toISOString();

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
    setVideoUrl("");
    setFeeDollars("");
    setPostDate("");
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
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option>YouTube</option>
                <option>TikTok</option>
                <option>Instagram</option>
                <option>XHS</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Link of the video</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Content fee ($AUD)</label>
              <input
                type="number"
                step="0.01"
                value={feeDollars}
                onChange={(e) => setFeeDollars(e.target.value)}
                placeholder="e.g. 50.00"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Post date</label>
              <input
                type="date"
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={createContract}
            disabled={loading || !videoUrl || !feeDollars}
            className="mt-3 w-full lg:w-auto rounded-xl bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Create contract"}
          </button>
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
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {c.platform}
                    {c.platformHandle ? ` — ${c.platformHandle}` : ""}
                  </p>
                  {c.contentUrl && (
                    <a
                      href={c.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline break-all"
                    >
                      {c.contentUrl}
                    </a>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {c.followerCount ? `${c.followerCount.toLocaleString()} followers · ` : ""}
                    Fee {formatCents(c.contentFee)}
                    {c.contentDeadline
                      ? ` · Posted ${new Date(c.contentDeadline).toLocaleDateString("en-AU")}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {c.views !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 font-medium">
                      <Eye className="h-3 w-3" />
                      {formatCount(c.views)} views
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-medium ${
                      c.contentVerified
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {c.contentVerified ? "Posted" : "Not posted"}
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
  const [views, setViews] = useState(contract.views?.toString() ?? "");

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

      {/* View count entry — manual for all platforms */}
      <div className="flex gap-2 items-center">
        <Eye className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          type="number"
          min="0"
          value={views}
          onChange={(e) => setViews(e.target.value)}
          placeholder="View count"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
        />
        <button
          onClick={() => {
            const n = parseInt(views, 10);
            if (isNaN(n) || n < 0) return;
            onPatch({ views: n });
          }}
          disabled={!views || isNaN(parseInt(views, 10))}
          className="rounded-lg bg-brand-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-brand-700 disabled:opacity-50"
        >
          Save views
        </button>
        {contract.viewsUpdatedAt && (
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Updated {new Date(contract.viewsUpdatedAt).toLocaleDateString("en-AU")}
          </span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {!contract.contentVerified && (
          <button
            onClick={() => onPatch({ contentVerified: true })}
            className="rounded-lg bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-emerald-700"
          >
            Mark Post
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
