"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Topic { id: string; name: string; subtopics: { id: string; name: string }[] }
interface Exam { id: string; year: number; examType: string }

export default function NewQuestionPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [form, setForm] = useState({
    examId: "", topicId: "", subtopicIds: [] as string[],
    questionNumber: "", part: "", marks: "",
    content: "", difficulty: "MEDIUM",
    solutionContent: "", solutionVideoUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/topics").then((r) => r.json()).then((d) => setTopics(d.topics ?? []));
    fetch("/api/admin/exams").then((r) => r.json()).then((d) => setExams(d.exams ?? []));
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const selectedTopic = topics.find((t) => t.id === form.topicId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        solution: form.solutionContent ? { content: form.solutionContent, videoUrl: form.solutionVideoUrl || null } : null,
      }),
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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Add Question</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        {/* Exam */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam</label>
          <select required value={form.examId} onChange={(e) => set("examId", e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Select exam…</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.year} — {ex.examType === "EXAM_1" ? "Exam 1" : "Exam 2"}
              </option>
            ))}
          </select>
        </div>

        {/* Topic + Subtopic */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
            <select required value={form.topicId} onChange={(e) => set("topicId", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select topic…</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtopics (optional)</label>
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 dark:bg-gray-800">
              {selectedTopic?.subtopics.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.subtopicIds.includes(s.id)}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      subtopicIds: e.target.checked
                        ? [...f.subtopicIds, s.id]
                        : f.subtopicIds.filter((id) => id !== s.id),
                    }))}
                  />
                  {s.name}
                </label>
              ))}
              {!selectedTopic && <span className="text-gray-400 dark:text-gray-500 text-xs">Select a topic first</span>}
            </div>
          </div>
        </div>

        {/* Q number, part, marks, difficulty */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q #</label>
            <input type="number" required min={1} value={form.questionNumber} onChange={(e) => set("questionNumber", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part</label>
            <input type="text" maxLength={2} value={form.part} onChange={(e) => set("part", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="a" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks</label>
            <input type="number" required min={1} max={20} value={form.marks} onChange={(e) => set("marks", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Question content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question content</label>
          <textarea required rows={5} value={form.content} onChange={(e) => set("content", e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Enter the question text here. LaTeX supported." />
        </div>

        {/* Solution */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Worked solution (optional)</h3>
          <div className="space-y-4">
            <textarea rows={4} value={form.solutionContent} onChange={(e) => set("solutionContent", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Step-by-step solution…" />
            <input type="url" value={form.solutionVideoUrl} onChange={(e) => set("solutionVideoUrl", e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Video URL (YouTube, etc.) — optional" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60">
          {loading ? "Saving…" : "Save question"}
        </button>
      </form>
    </div>
  );
}
