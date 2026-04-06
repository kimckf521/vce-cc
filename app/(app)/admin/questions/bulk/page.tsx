"use client";

import { useState } from "react";
import { Upload, CheckCircle, XCircle } from "lucide-react";

export default function BulkImportPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number; results: { index: number; id?: string; error?: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const body = Array.isArray(parsed) ? { questions: parsed } : parsed;

      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to import");
      } else {
        setResult(data);
      }
    } catch {
      setError("Invalid JSON format");
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonInput(ev.target?.result as string);
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bulk Import Questions</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Paste JSON output from the extraction scripts, or upload a JSON file. Accepts an array of questions or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{ questions: [...] }"}</code>.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      {result && (
        <div className="mb-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Import Complete</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl bg-green-50 dark:bg-green-950 p-4">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.created}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Created</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950 p-4">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{result.failed}</p>
              <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
            </div>
          </div>
          {result.failed > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Errors:</p>
              {result.results.filter((r) => r.error).map((r) => (
                <div key={r.index} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Question {r.index + 1}: {r.error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File upload */}
        <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4 cursor-pointer hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors">
          <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Upload JSON file</span>
          <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
        </label>

        {/* JSON textarea */}
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={16}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder='[{ "examId": "...", "topicId": "...", "questionNumber": 1, "marks": 2, "content": "...", "difficulty": "MEDIUM" }]'
        />

        <button
          type="submit"
          disabled={loading || !jsonInput.trim()}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Importing..." : "Import Questions"}
        </button>
      </form>
    </div>
  );
}
