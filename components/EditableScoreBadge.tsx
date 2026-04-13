"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  initialScore: number;
  totalQuestions: number;
}

function badgeClasses(score: number) {
  if (score >= 80)
    return "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400";
  if (score >= 50)
    return "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400";
  return "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400";
}

export default function EditableScoreBadge({
  sessionId,
  initialScore,
  totalQuestions,
}: Props) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(String(Math.round(score)));
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function save() {
    const val = Number(draft);
    if (isNaN(val) || val < 0 || val > 100) {
      setError("0–100");
      return;
    }

    const rounded = Math.round(val);
    if (rounded === Math.round(score)) {
      setEditing(false);
      return;
    }

    const correctCount = Math.round((rounded / 100) * totalQuestions);
    const incorrectCount = totalQuestions - correctCount;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/exam-sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: rounded, correctCount, incorrectCount }),
    });

    if (!res.ok) {
      setError("Failed");
      setLoading(false);
      return;
    }

    setScore(rounded);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          autoFocus
          type="number"
          min={0}
          max={100}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className={cn(
            "h-10 w-14 rounded-xl border text-center text-sm font-bold",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-brand-500",
            error
              ? "border-red-400 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          )}
          disabled={loading}
        />
        <button
          onClick={save}
          disabled={loading}
          className="p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-50"
          title="Save"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={cancel}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        "group relative flex items-center justify-center h-10 w-10 rounded-xl text-sm font-bold transition-all cursor-pointer",
        badgeClasses(score)
      )}
      title="Click to edit score"
    >
      {Math.round(score)}%
      <Pencil className="absolute -top-1 -right-1 h-3 w-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
