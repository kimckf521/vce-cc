"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, ExternalLink, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  pdfUrl: string | null;
  answerUrl: string | null;
  _count: { questions: number };
}

function formatExamType(type: string) {
  return type === "EXAM_1" ? "Exam 1" : "Exam 2";
}

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editYear, setEditYear] = useState("");
  const [editType, setEditType] = useState<"EXAM_1" | "EXAM_2">("EXAM_1");
  const [editPdfUrl, setEditPdfUrl] = useState("");
  const [editAnswerUrl, setEditAnswerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/exams")
      .then((r) => r.json())
      .then((data) => setExams(data.exams || []))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(exam: Exam) {
    setEditingId(exam.id);
    setEditYear(String(exam.year));
    setEditType(exam.examType);
    setEditPdfUrl(exam.pdfUrl || "");
    setEditAnswerUrl(exam.answerUrl || "");
    setConfirmDeleteId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          year: parseInt(editYear),
          examType: editType,
          pdfUrl: editPdfUrl,
          answerUrl: editAnswerUrl,
        }),
      });
      if (res.ok) {
        setExams((prev) =>
          prev.map((e) =>
            e.id === editingId
              ? { ...e, year: parseInt(editYear), examType: editType, pdfUrl: editPdfUrl || null, answerUrl: editAnswerUrl || null }
              : e
          )
        );
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteExam(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/exams?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== id));
        setConfirmDeleteId(null);
      }
    } finally {
      setDeletingId(null);
    }
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
            <FileText className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Exams</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
            {exams.length} {exams.length === 1 ? "exam" : "exams"} in the database
          </p>
        </div>
        <Link
          href="/admin/exams/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add exam
        </Link>
      </div>

      {/* Exam list */}
      {exams.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          No exams yet. Add your first exam to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const isEditing = editingId === exam.id;
            const isConfirmingDelete = confirmDeleteId === exam.id;
            const isDeleting = deletingId === exam.id;

            return (
              <div
                key={exam.id}
                className={cn(
                  "rounded-2xl border shadow-sm transition-all",
                  isEditing
                    ? "bg-white dark:bg-gray-900 border-brand-300 dark:border-brand-700 ring-1 ring-brand-200 dark:ring-brand-800"
                    : isConfirmingDelete
                      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                )}
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="p-5 lg:p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Year</label>
                        <input
                          type="number"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Type</label>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as "EXAM_1" | "EXAM_2")}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="EXAM_1">Exam 1</option>
                          <option value="EXAM_2">Exam 2</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">PDF URL</label>
                      <input
                        type="text"
                        value={editPdfUrl}
                        onChange={(e) => setEditPdfUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Answer URL</label>
                      <input
                        type="text"
                        value={editAnswerUrl}
                        onChange={(e) => setEditAnswerUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isConfirmingDelete ? (
                  /* Delete confirmation */
                  <div className="p-5 lg:p-6 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">
                        Delete {exam.year} {formatExamType(exam.examType)}?
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400/80 mt-0.5">
                        This will permanently delete the exam and all {exam._count.questions} questions.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => deleteExam(exam.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal view */
                  <div className="p-5 lg:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-11 w-11 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">
                          {exam.year} {formatExamType(exam.examType)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {exam._count.questions} {exam._count.questions === 1 ? "question" : "questions"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {exam.pdfUrl && (
                        <a
                          href={exam.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                        >
                          PDF <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => startEdit(exam)}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                        title="Edit exam"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setConfirmDeleteId(exam.id); setEditingId(null); }}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title="Delete exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
