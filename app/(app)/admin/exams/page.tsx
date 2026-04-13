"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, ExternalLink, Pencil, Trash2, X, Check, Loader2, ChevronDown, ChevronRight, Eye, Code2 } from "lucide-react";
import { cn, stripLatex } from "@/lib/utils";
import MathContent from "@/components/MathContent";

interface ExamQuestion {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  difficulty: string;
  solution: { id: string; content: string } | null;
}

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
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [examQuestions, setExamQuestions] = useState<Record<string, ExamQuestion[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<string | null>(null);

  const toggleExam = useCallback(async (examId: string) => {
    if (expandedExamId === examId) {
      setExpandedExamId(null);
      return;
    }
    setExpandedExamId(examId);
    if (!examQuestions[examId]) {
      setLoadingQuestions(examId);
      try {
        const res = await fetch(`/api/admin/questions?examId=${examId}`);
        const data = await res.json();
        setExamQuestions((prev) => ({ ...prev, [examId]: data.questions || [] }));
      } finally {
        setLoadingQuestions(null);
      }
    }
  }, [expandedExamId, examQuestions]);

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
                  /* Normal view — clickable to expand questions */
                  <>
                    <div
                      className="p-5 lg:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => toggleExam(exam.id)}
                    >
                      <div className="flex items-center gap-4">
                        {expandedExamId === exam.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">
                            {exam.year} {formatExamType(exam.examType)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {exam._count.questions} {exam._count.questions === 1 ? "question" : "questions"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                    {expandedExamId === exam.id && (
                      <ExamQuestionList
                        examType={exam.examType}
                        questions={examQuestions[exam.id]}
                        loading={loadingQuestions === exam.id}
                        onUpdateQuestion={(qId, patch) => {
                          setExamQuestions((prev) => ({
                            ...prev,
                            [exam.id]: (prev[exam.id] ?? []).map((q) =>
                              q.id === qId ? { ...q, ...patch } : q
                            ),
                          }));
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Expandable question list inside an exam card ───────────────────────────
// Styled to match the purple card hierarchy on the Question Sets page.

function ExamQuestionList({
  examType,
  questions,
  loading,
  onUpdateQuestion,
}: {
  examType: "EXAM_1" | "EXAM_2";
  questions: ExamQuestion[] | undefined;
  loading: boolean;
  onUpdateQuestion: (questionId: string, patch: Partial<ExamQuestion>) => void;
}) {
  const [openQIds, setOpenQIds] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [draftSolution, setDraftSolution] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(q: ExamQuestion) {
    setEditingId(q.id);
    setDraftContent(q.content);
    setDraftSolution(q.solution?.content ?? "");
  }

  async function handleSave(questionId: string) {
    setSaving(true);
    try {
      // Save question content
      const qRes = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId, content: draftContent }),
      });
      if (!qRes.ok) return;
      // Save solution content
      const sRes = await fetch("/api/admin/solutions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, content: draftSolution }),
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        onUpdateQuestion(questionId, {
          content: draftContent,
          solution: { id: sData.solution.id, content: sData.solution.content },
        });
      }
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !questions) {
    return (
      <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-8 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No questions in this exam yet.
      </div>
    );
  }

  const isExam2 = examType === "EXAM_2";
  const sectionA = isExam2 ? questions.filter((q) => !q.part) : [];
  const sectionB = isExam2 ? questions.filter((q) => q.part) : questions;

  // Group multi-part questions by questionNumber
  const groups = new Map<number, ExamQuestion[]>();
  for (const q of sectionB) {
    if (!groups.has(q.questionNumber)) groups.set(q.questionNumber, []);
    groups.get(q.questionNumber)!.push(q);
  }

  function toggleQ(id: string) {
    setOpenQIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── Expand All / Collapse All for a section's questions ────
  function sectionExpandAllBtn(sectionQs: ExamQuestion[], sectionGroupKeys: string[]) {
    const allIds = [...sectionQs.map((q) => q.id), ...sectionGroupKeys];
    const allOpen = allIds.length > 0 && allIds.every((id) => openQIds.has(id));
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          const next = new Set(openQIds);
          if (allOpen) {
            allIds.forEach((id) => next.delete(id));
          } else {
            allIds.forEach((id) => next.add(id));
          }
          setOpenQIds(next);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
      >
        {allOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {allOpen ? "Collapse All" : "Expand All"}
      </button>
    );
  }

  // ── Purple chevron pill ────
  function chevronPill(isOpen: boolean) {
    return (
      <span className="inline-flex items-center justify-center rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-1.5 text-purple-700 dark:text-purple-400">
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </span>
    );
  }

  // ── Question row (MCQ or part of a group) ────
  function renderQuestionRow(q: ExamQuestion, idx: number, label?: string) {
    const isOpen = openQIds.has(q.id);
    const isEditing = editingId === q.id;
    return (
      <div key={q.id} className="py-2.5">
        <button
          onClick={() => toggleQ(q.id)}
          className="w-full flex items-start justify-between gap-3 text-left group"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">
              {label ?? String(idx + 1).padStart(2, "0")}
            </span>
            <div className="text-sm text-gray-700 dark:text-gray-300 truncate min-w-0 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {stripLatex(q.content).slice(0, 110)}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400 dark:text-gray-500">{q.marks}m</span>
            {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        </button>
        {isOpen && (
          <div className="mt-3 ml-6 space-y-3">
            {/* Question */}
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Question</div>
                {!isEditing && (
                  <button
                    onClick={() => startEdit(q)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <label className="text-xs text-gray-500 dark:text-gray-400">Preview</label>
                    </div>
                    <div className="flex-1 min-h-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base leading-relaxed overflow-auto">
                      <MathContent content={draftContent} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Code2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <label className="text-xs text-gray-500 dark:text-gray-400">Question (Markdown + LaTeX)</label>
                    </div>
                    <textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="flex-1 min-h-[200px] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <MathContent content={q.content} />
              )}
            </div>
            {/* Solution */}
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Solution</div>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <label className="text-xs text-gray-500 dark:text-gray-400">Preview</label>
                      </div>
                      <div className="flex-1 min-h-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base leading-relaxed overflow-auto">
                        <MathContent content={draftSolution} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Code2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <label className="text-xs text-gray-500 dark:text-gray-400">Solution (Markdown + LaTeX)</label>
                      </div>
                      <textarea
                        value={draftSolution}
                        onChange={(e) => setDraftSolution(e.target.value)}
                        className="flex-1 min-h-[200px] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSave(q.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : q.solution ? (
                <MathContent content={q.solution.content} />
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No solution yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Section card (purple-bordered, collapsible) ────
  function renderSection(
    key: string,
    title: string,
    subtitle: string,
    sectionQuestions: ExamQuestion[],
    sectionGroups: Map<number, ExamQuestion[]>,
    isMCQ: boolean,
  ) {
    const isCollapsed = collapsedSections.has(key);
    const totalMarks = sectionQuestions.reduce((s, q) => s + q.marks, 0);
    const withSolution = sectionQuestions.filter((q) => q.solution).length;
    const groupKeys = isMCQ ? [] : Array.from(sectionGroups.keys()).map((n) => `group-${n}`);

    return (
      <div key={key} className="rounded-xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
        <div
          onClick={() => toggleSection(key)}
          className="px-4 lg:px-5 py-3 grid grid-cols-3 items-center gap-3 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-100/40 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
        >
          {/* Column 1: Section name */}
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm lg:text-base font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide truncate">
              {title}
            </h3>
          </div>
          {/* Column 2: Stats badges */}
          <div className="hidden sm:flex items-center justify-center gap-1.5 text-xs">
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 font-medium">
              {subtitle}
            </span>
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 font-medium">
              {totalMarks}m
            </span>
            <span className="rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 font-medium">
              {withSolution}/{sectionQuestions.length} solved
            </span>
          </div>
          {/* Column 3: Controls */}
          <div className="flex items-center justify-end gap-2">
            {!isCollapsed && sectionExpandAllBtn(sectionQuestions, groupKeys)}
            {chevronPill(!isCollapsed)}
          </div>
        </div>
        {!isCollapsed && (
          <div className="px-4 lg:px-5 py-4 space-y-4">
            {isMCQ ? (
              // MCQ section — flat list
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 p-4 lg:p-5">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {sectionQuestions.map((q, idx) => renderQuestionRow(q, idx))}
                </div>
              </div>
            ) : (
              // Extended response — grouped by question number
              Array.from(sectionGroups.entries()).map(([qNum, parts]) => {
                const groupMarks = parts.reduce((s, p) => s + p.marks, 0);
                const groupKey = `group-${qNum}`;
                const isGroupOpen = openQIds.has(groupKey);
                return (
                  <div key={qNum} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 p-4 lg:p-5">
                    <div
                      className="flex items-center justify-between gap-2 cursor-pointer"
                      onClick={() => toggleQ(groupKey)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">Q{qNum}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{parts.length} parts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{groupMarks}m</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleQ(groupKey); }}
                          className="inline-flex items-center justify-center rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-1.5 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                        >
                          {isGroupOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {isGroupOpen && (
                      <div className="mt-3 divide-y divide-gray-200 dark:divide-gray-800">
                        {parts.map((q, idx) => renderQuestionRow(q, idx, `${q.part}`))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Build section list ────
  const sections: React.ReactNode[] = [];

  if (isExam2) {
    if (sectionA.length > 0) {
      sections.push(
        renderSection("sectionA", "Section A", `${sectionA.length} multiple choice`, sectionA, new Map(), true)
      );
    }
    if (sectionB.length > 0) {
      sections.push(
        renderSection("sectionB", "Section B", `${groups.size} extended response`, sectionB, groups, false)
      );
    }
  } else {
    // Exam 1: all extended response, single section
    sections.push(
      renderSection("questions", "Questions", `${groups.size} questions`, sectionB, groups, false)
    );
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 px-4 lg:px-5 py-4 space-y-4">
      {sections}
    </div>
  );
}
