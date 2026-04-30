"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  questionId: string;
  initialMarksEarned: number | null;
  totalMarks: number;
  /** Disable editing (e.g. for auto-graded MCQs). */
  readOnly?: boolean;
  /** Mark the badge visually as an auto-derived estimate (italic/opacity). */
  isEstimated?: boolean;
}

function toneFor(earned: number | null, total: number) {
  if (earned === null)
    return "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400";
  if (earned === total)
    return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400";
  if (earned === 0)
    return "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400";
  return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400";
}

export default function EditableMarksBadge({
  sessionId,
  questionId,
  initialMarksEarned,
  totalMarks,
  readOnly = false,
  isEstimated = false,
}: Props) {
  const router = useRouter();
  const [marksEarned, setMarksEarned] = useState<number | null>(initialMarksEarned);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state whenever the server-provided prop changes (e.g. after
  // router.refresh() or a hard page reload). Without this, a stale value
  // can persist after marks are saved elsewhere.
  useEffect(() => {
    if (!editing) setMarksEarned(initialMarksEarned);
  }, [initialMarksEarned, editing]);

  function startEdit() {
    setDraft(marksEarned === null ? "" : String(marksEarned));
    setError(false);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(false);
  }

  async function save() {
    const trimmed = draft.trim();
    // Empty input = clear marks (null)
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (
      parsed !== null &&
      (isNaN(parsed) || parsed < 0 || parsed > totalMarks)
    ) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch(
        `/api/exam-sessions/${sessionId}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marksEarned: parsed }),
        }
      );
      if (!res.ok) throw new Error();
      setMarksEarned(parsed);
      setEditing(false);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const badgeClass = toneFor(marksEarned, totalMarks);
  const label =
    marksEarned !== null ? `${marksEarned}/${totalMarks}` : `— / ${totalMarks}`;

  if (readOnly) {
    return (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          badgeClass,
          isEstimated && "italic opacity-80"
        )}
        title={isEstimated ? "Estimated from the session score" : undefined}
      >
        {label} mark{totalMarks !== 1 ? "s" : ""}
      </span>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          autoFocus
          type="number"
          min={0}
          max={totalMarks}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          placeholder="—"
          className={cn(
            "h-6 w-12 rounded text-center text-xs font-bold",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border",
            "focus:outline-none focus:ring-1 focus:ring-brand-500",
            error
              ? "border-red-400 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          )}
          disabled={loading}
        />
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
          / {totalMarks}
        </span>
        <button
          onClick={save}
          disabled={loading}
          className="p-1 rounded bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-50"
          title="Save"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={cancel}
          className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      title={
        isEstimated
          ? "Estimated from the session score — click to set an exact value"
          : "Click to edit marks"
      }
      className={cn(
        "group inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-colors",
        badgeClass,
        isEstimated && "italic opacity-80"
      )}
    >
      {label} mark{totalMarks !== 1 ? "s" : ""}
      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-70 transition-opacity" />
    </button>
  );
}
