"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExamPage() {
  const router = useRouter();
  const [form, setForm] = useState({ year: "", examType: "EXAM_1", pdfUrl: "", answerUrl: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Add Exam</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <input
              type="number"
              required
              min={2000}
              max={2030}
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="2023"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam type</label>
            <select
              value={form.examType}
              onChange={(e) => set("examType", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="EXAM_1">Exam 1</option>
              <option value="EXAM_2">Exam 2</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF URL (optional)</label>
          <input
            type="url"
            value={form.pdfUrl}
            onChange={(e) => set("pdfUrl", e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer booklet URL (optional)</label>
          <input
            type="url"
            value={form.answerUrl}
            onChange={(e) => set("answerUrl", e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save exam"}
        </button>
      </form>
    </div>
  );
}
