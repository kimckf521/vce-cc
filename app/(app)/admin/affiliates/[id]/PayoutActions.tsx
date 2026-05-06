"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

export default function PayoutActions({
  payoutId,
  currentStatus,
  proofUrl,
}: {
  payoutId: string;
  currentStatus: string;
  proofUrl: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reference, setReference] = useState("");
  const [showRef, setShowRef] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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

  async function uploadProof(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}/proof`, {
      method: "POST",
      body: fd,
    });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Upload failed");
      return;
    }
    router.refresh();
  }

  // Hidden file input — shared across both rendered branches via portal-style ref.
  // Only PNG, JPEG, WebP, GIF, PDF accepted; size limit enforced server-side too.
  const hiddenFileInput = (
    <input
      ref={fileInput}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) uploadProof(f);
        e.target.value = ""; // allow re-selecting same file
      }}
    />
  );

  if (showRef) {
    return (
      <div className="flex items-center gap-1 justify-end">
        {hiddenFileInput}
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

  // Status-change buttons only apply while a payout is still in flight.
  // COMPLETED/FAILED are terminal — but admins can still attach a proof.
  const isTerminal = currentStatus === "COMPLETED" || currentStatus === "FAILED";

  return (
    <div className="flex items-center gap-1 justify-end flex-wrap">
      {hiddenFileInput}

      {/* Upload / view / replace proof — always available */}
      {proofUrl ? (
        <span className="inline-flex items-center gap-1">
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium px-2 py-1 inline-flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900"
            title="View transaction screenshot"
          >
            <Paperclip className="h-3 w-3" />
            Proof
          </a>
          <button
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="text-xs rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Replace proof"
          >
            {uploading ? "…" : "Replace"}
          </button>
        </span>
      ) : (
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="text-xs rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-2 py-1 inline-flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          title="Upload transaction screenshot"
        >
          <Paperclip className="h-3 w-3" />
          {uploading ? "Uploading…" : "Upload proof"}
        </button>
      )}

      {/* Status-change buttons — hidden once payout is COMPLETED or FAILED */}
      {!isTerminal && (
        <>
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
        </>
      )}
    </div>
  );
}
