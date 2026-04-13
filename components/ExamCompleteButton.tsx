"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function ExamCompleteButton({
  examId,
  initialCompleted,
}: {
  examId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !completed;
    setCompleted(next);
    setSaving(true);

    try {
      const res = await fetch("/api/exam-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, completed: next }),
      });
      if (!res.ok) setCompleted(!next);
    } catch {
      setCompleted(!next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10 lg:mt-12 flex justify-center">
      <button
        onClick={toggle}
        disabled={saving}
        className={`inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold transition-all ${
          completed
            ? "bg-green-100 dark:bg-green-900/40 border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
            : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-700 hover:text-green-700 dark:hover:text-green-400"
        } disabled:opacity-50`}
      >
        <CheckCircle
          className={`h-6 w-6 ${
            completed
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
        {completed ? "Completed" : "Mark as Complete"}
      </button>
    </div>
  );
}
