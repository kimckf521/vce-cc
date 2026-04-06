"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Plus, CheckCircle, Pencil, Trash2, X, Check, Loader2, Eye, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";

interface Question {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageUrl: string | null;
  exam: { year: number; examType: string };
  topic: { name: string };
  solution: { id: string } | null;
}

function formatExamType(type: string) {
  return type === "EXAM_1" ? "Exam 1" : "Exam 2";
}

function difficultyBadge(d: string) {
  switch (d) {
    case "EASY":
      return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800";
    case "MEDIUM":
      return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800";
    case "HARD":
      return "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800";
    default:
      return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800";
  }
}

function EditQuestionRow({
  question,
  onSave,
  onCancel,
}: {
  question: Question;
  onSave: (id: string, data: Partial<Question>) => Promise<void>;
  onCancel: () => void;
}) {
  const [qNum, setQNum] = useState(String(question.questionNumber));
  const [part, setPart] = useState(question.part || "");
  const [marks, setMarks] = useState(String(question.marks));
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [content, setContent] = useState(question.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(question.id, {
      questionNumber: parseInt(qNum),
      part: part || null,
      marks: parseInt(marks),
      difficulty,
      content,
    });
    setSaving(false);
  }

  return (
    <div className="px-5 py-4 lg:px-6 lg:py-5 bg-brand-50/30 dark:bg-brand-950/20 space-y-3">
      {/* Metadata row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Q#</label>
          <input
            type="number"
            value={qNum}
            onChange={(e) => setQNum(e.target.value)}
            className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Part</label>
          <input
            type="text"
            value={part}
            onChange={(e) => setPart(e.target.value)}
            placeholder="a, b..."
            className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Marks</label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Split pane: Preview (left) | Editor (right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Student preview */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <label className="text-xs text-gray-500 dark:text-gray-400">Student Preview</label>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 min-h-[160px] text-base leading-relaxed overflow-auto">
            <MathContent content={content} />
          </div>
        </div>

        {/* Right: Markdown + LaTeX editor */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Code2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <label className="text-xs text-gray-500 dark:text-gray-400">Content (Markdown + LaTeX)</label>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y min-h-[160px]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalSolutions, setTotalSolutions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/questions").then((r) => r.json()),
      fetch("/api/admin/solutions").then((r) => r.json()),
    ]).then(([qData, sData]) => {
      setQuestions(qData.questions || []);
      setTotalSolutions(sData.count ?? 0);
    }).catch(() => {
      // Fallback: just load questions
      fetch("/api/admin/questions")
        .then((r) => r.json())
        .then((data) => setQuestions(data.questions || []));
    }).finally(() => setLoading(false));
  }, []);

  // We need a GET endpoint for questions. Let me fetch from the page itself instead.
  useEffect(() => {
    fetch("/api/search?q=&limit=0")
      .catch(() => {});
  }, []);

  async function handleSave(id: string, data: Partial<Question>) {
    const res = await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...data } : q))
      );
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setConfirmDeleteId(null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  // Group by exam
  const grouped = new Map<string, { label: string; questions: Question[] }>();
  for (const q of questions) {
    const key = `${q.exam.year}-${q.exam.examType}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        label: `${q.exam.year} ${formatExamType(q.exam.examType)}`,
        questions: [],
      });
    }
    grouped.get(key)!.questions.push(q);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 lg:mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HelpCircle className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Questions</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
            {questions.length} questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions/bulk"
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Bulk import
          </Link>
          <Link
            href="/admin/questions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add question
          </Link>
        </div>
      </div>

      {/* Questions grouped by exam */}
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          No questions yet. Add your first question to get started.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([key, { label, questions: qs }]) => (
            <div key={key}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{label}</h2>
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
                {qs.map((q) => {
                  const isEditing = editingId === q.id;
                  const isConfirmingDelete = confirmDeleteId === q.id;
                  const isDeleting = deletingId === q.id;

                  if (isEditing) {
                    return (
                      <EditQuestionRow
                        key={q.id}
                        question={q}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                      />
                    );
                  }

                  if (isConfirmingDelete) {
                    return (
                      <div key={q.id} className="px-5 py-3 lg:px-6 lg:py-4 bg-red-50 dark:bg-red-950/50 flex items-center justify-between gap-3">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          Delete Q{q.questionNumber}{q.part || ""}? This removes the question, its solution, and all attempts.
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleDelete(q.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                          >
                            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="px-5 py-3.5 lg:px-6 lg:py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          Q{q.questionNumber}{q.part || ""}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{q.topic.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${difficultyBadge(q.difficulty)}`}>
                          {q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-gray-400 dark:text-gray-500">{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>
                        {q.solution ? (
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border-2 border-gray-200 dark:border-gray-700" />
                        )}
                        <button
                          onClick={() => { setEditingId(q.id); setConfirmDeleteId(null); }}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit question"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(q.id); setEditingId(null); }}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
