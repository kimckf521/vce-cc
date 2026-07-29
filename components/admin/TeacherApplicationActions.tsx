"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Approve / Reject buttons for one teacher application in the admin queue.
 * Approve asks for confirmation; Reject asks for an optional reason (included
 * in the rejection email). PATCHes /api/admin/teacher-applications/[id].
 */
export default function TeacherApplicationActions({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"APPROVE" | "REJECT" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "APPROVE" | "REJECT") {
    if (action === "APPROVE" && !window.confirm("Approve this application? The user gains /teacher access immediately.")) {
      return;
    }
    let note: string | undefined;
    if (action === "REJECT") {
      const input = window.prompt(
        "Optional reason (included in the rejection email):",
        ""
      );
      if (input === null) return; // cancelled
      note = input.trim() || undefined;
    }

    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/teacher-applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => decide("APPROVE")}
          disabled={busy !== null}
          className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {busy === "APPROVE" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => decide("REJECT")}
          disabled={busy !== null}
          className="flex-1 rounded-xl border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-60"
        >
          {busy === "REJECT" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
