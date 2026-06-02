"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Tag } from "lucide-react";

export default function SubtopicTagger({
  questionId,
  topicName,
  availableSubtopics,
  initialSelectedIds,
}: {
  questionId: string;
  topicName: string;
  availableSubtopics: { id: string; name: string }[];
  initialSelectedIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set(initialSelectedIds));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId, subtopicIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Save failed");
      } else {
        setSaved(true);
        // Refresh server data so the untagged list reflects the change
        // when the admin clicks Back.
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Tag className="h-4 w-4 text-brand-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subtopics</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Pick the subtopics inside <span className="font-medium">{topicName}</span> that this question covers.
      </p>

      {availableSubtopics.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          This topic has no subtopics yet. Add them on the Topics admin page first.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {availableSubtopics.map((s) => {
            const isOn = selected.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                  isOn
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700"
                }`}
              >
                {isOn && <Check className="h-3.5 w-3.5" />}
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || availableSubtopics.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save tags
        </button>
        {saved && !error && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</span>
        )}
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        )}
      </div>
    </div>
  );
}
