"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  initialName: string;
}

export default function EditDisplayName({ initialName }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(name);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed) { setError("Name cannot be empty"); return; }
    if (trimmed === name) { setEditing(false); return; }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/user/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to update name");
      setLoading(false);
      return;
    }

    setName(data.name);
    setEditing(false);
    setLoading(false);
    router.refresh(); // re-render server components (avatar initials, header)
  }

  if (editing) {
    return (
      <div className="flex-1">
        <p className="text-xs lg:text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Display name
        </p>
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            className="flex-1 rounded-xl border border-brand-300 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          <button
            onClick={save}
            disabled={loading}
            className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-50"
            title="Save"
          >
            <Check className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          <button
            onClick={cancel}
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            title="Cancel"
          >
            <X className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs lg:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <p className="text-xs lg:text-sm font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
          Display name
        </p>
        <p className="text-sm lg:text-base font-medium text-gray-900">{name}</p>
      </div>
      <button
        onClick={startEdit}
        className="flex items-center gap-1.5 text-xs lg:text-sm text-brand-600 hover:text-brand-700 font-medium transition px-3 py-1.5 rounded-lg hover:bg-brand-50"
      >
        <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        Edit
      </button>
    </div>
  );
}
