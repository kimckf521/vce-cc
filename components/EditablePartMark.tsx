"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  questionId: string;
  partKey: string;
  initialEarned: number | null;
  totalMarks: number;
  /** All sub-part values so we can send the whole map on update. */
  initialSubPartMarks: Record<string, number | null>;
  /** Mark the badge as a session-derived estimate (italic/opacity). */
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

export default function EditablePartMark({
  sessionId,
  questionId,
  partKey,
  initialEarned,
  totalMarks,
  initialSubPartMarks,
  isEstimated = false,
}: Props) {
  const router = useRouter();
  const [earned, setEarned] = useState<number | null>(initialEarned);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setEarned(initialEarned);
  }, [initialEarned, editing]);

  function startEdit() {
    setDraft(earned === null ? "" : String(earned));
    setError(false);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(false);
  }

  async function save() {
    const trimmed = draft.trim();
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

    const next = { ...initialSubPartMarks, [partKey]: parsed };
    try {
      const res = await fetch(
        `/api/exam-sessions/${sessionId}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subPartMarks: next }),
        }
      );
      if (!res.ok) throw new Error();
      setEarned(parsed);
      setEditing(false);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const label = earned !== null ? `${earned}/${totalMarks}` : `— / ${totalMarks}`;
  const tone = toneFor(earned, totalMarks);

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
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
            "h-6 w-10 rounded text-center text-xs font-bold",
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
          className="p-0.5 rounded bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-50"
          title="Save"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={cancel}
          className="p-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
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
        "group inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
        tone,
        isEstimated && "italic opacity-80"
      )}
    >
      {label}
      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-70 transition-opacity" />
    </button>
  );
}
