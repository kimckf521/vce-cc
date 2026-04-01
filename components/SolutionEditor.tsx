"use client";

import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";

interface SolutionEditorProps {
  questionId: string;
  initialContent: string;
  initialVideoUrl?: string | null;
}

export default function SolutionEditor({ questionId, initialContent, initialVideoUrl }: SolutionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/solutions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, content, videoUrl: videoUrl || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      } else {
        setSaved(true);
        setEditing(false);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-600 transition-colors"
        title="Edit solution"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
        {saved && <span className="text-green-600 ml-1">Saved</span>}
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
      />
      <input
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="Video URL (optional)"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => { setEditing(false); setContent(initialContent); setVideoUrl(initialVideoUrl ?? ""); }}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}
