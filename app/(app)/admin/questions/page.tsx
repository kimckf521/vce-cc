"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Plus, CheckCircle, Pencil, Trash2, X, Check, Loader2, Eye, Code2, FlaskConical, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
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
  solution: { id: string; content: string } | null;
}

type QuestionSetItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE";

interface QuestionSetItem {
  id: string;
  type: QuestionSetItemType;
  order: number;
  marks: number;
  content: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  solutionContent: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topic: { id: string; name: string };
  subtopics: { id: string; name: string; slug: string }[];
}

interface QuestionSet {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  items: QuestionSetItem[];
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
  content,
  onContentChange,
  onSave,
  onCancel,
}: {
  question: Question;
  content: string;
  onContentChange: (next: string) => void;
  onSave: (id: string, data: Partial<Question>) => Promise<void>;
  onCancel: () => void;
}) {
  const [qNum, setQNum] = useState(String(question.questionNumber));
  const [part, setPart] = useState(question.part || "");
  const [marks, setMarks] = useState(String(question.marks));
  const [difficulty, setDifficulty] = useState(question.difficulty);
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
            onChange={(e) => onContentChange(e.target.value)}
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
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [openSetIds, setOpenSetIds] = useState<Set<string>>(new Set());
  const [openItemIds, setOpenItemIds] = useState<Set<string>>(new Set());
  const [collapsedSubKeys, setCollapsedSubKeys] = useState<Set<string>>(new Set());
  const [collapsedTopicKeys, setCollapsedTopicKeys] = useState<Set<string>>(new Set());
  const [topicSubtopicCounts, setTopicSubtopicCounts] = useState<Record<string, number>>({});
  const [openExamKeys, setOpenExamKeys] = useState<Set<string>>(new Set());
  const [openQuestionIds, setOpenQuestionIds] = useState<Set<string>>(new Set());
  const [openGroupKeys, setOpenGroupKeys] = useState<Set<string>>(new Set());
  const [editContent, setEditContent] = useState<string>("");
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [editSolutionContent, setEditSolutionContent] = useState<string>("");
  const [savingSolution, setSavingSolution] = useState(false);
  const [editingSetItemId, setEditingSetItemId] = useState<string | null>(null);
  const [setItemDraftContent, setSetItemDraftContent] = useState<string>("");
  const [setItemDraftSolution, setSetItemDraftSolution] = useState<string>("");
  const [savingSetItem, setSavingSetItem] = useState(false);

  useEffect(() => {
    fetch("/api/admin/question-sets")
      .then((r) => r.json())
      .then((data) => {
        const sets = data.questionSets || [];
        setQuestionSets(sets);
        // Start every subtopic group collapsed
        const initialSubCollapsed = new Set<string>();
        const initialTopicCollapsed = new Set<string>();
        for (const set of sets) {
          const seenSubKey = new Set<string>();
          const seenTopicKey = new Set<string>();
          for (const item of set.items ?? []) {
            const topicName = item.topic?.name ?? "";
            const subName = item.subtopics?.[0]?.name ?? "(no subtopic)";
            const subKey = `${set.id}::${topicName}::${subName}`;
            const topicKey = `${set.id}::${topicName}`;
            if (!seenSubKey.has(subKey)) {
              seenSubKey.add(subKey);
              initialSubCollapsed.add(subKey);
            }
            if (!seenTopicKey.has(topicKey)) {
              seenTopicKey.add(topicKey);
              initialTopicCollapsed.add(topicKey);
            }
          }
          // Also pre-collapse the canonical four main topics so empty ones start closed too
          for (const name of [
            "Algebra, Number, and Structure",
            "Functions, Relations, and Graphs",
            "Calculus",
            "Data Analysis, Probability, and Statistics",
          ]) {
            initialTopicCollapsed.add(`${set.id}::${name}`);
          }
        }
        setCollapsedSubKeys(initialSubCollapsed);
        setCollapsedTopicKeys(initialTopicCollapsed);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/topics")
      .then((r) => r.json())
      .then((data) => {
        const counts: Record<string, number> = {};
        for (const t of data.topics ?? []) {
          counts[t.name] = (t.subtopics ?? []).length;
        }
        setTopicSubtopicCounts(counts);
      })
      .catch(() => {});
  }, []);

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

  async function handleSaveSetItem(itemId: string) {
    setSavingSetItem(true);
    try {
      const res = await fetch("/api/admin/question-sets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          content: setItemDraftContent,
          solutionContent: setItemDraftSolution,
        }),
      });
      if (res.ok) {
        setQuestionSets((prev) =>
          prev.map((s) => ({
            ...s,
            items: s.items.map((it) =>
              it.id === itemId
                ? { ...it, content: setItemDraftContent, solutionContent: setItemDraftSolution }
                : it
            ),
          }))
        );
        setEditingSetItemId(null);
      }
    } finally {
      setSavingSetItem(false);
    }
  }

  async function handleSaveSolution(questionId: string) {
    setSavingSolution(true);
    try {
      const res = await fetch("/api/admin/solutions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, content: editSolutionContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, solution: { id: data.solution.id, content: data.solution.content } }
              : q
          )
        );
        setEditingSolutionId(null);
      }
    } finally {
      setSavingSolution(false);
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
  const grouped = new Map<string, { label: string; examType: string; questions: Question[] }>();
  for (const q of questions) {
    const key = `${q.exam.year}-${q.exam.examType}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        label: `${q.exam.year} ${formatExamType(q.exam.examType)}`,
        examType: q.exam.examType,
        questions: [],
      });
    }
    grouped.get(key)!.questions.push(q);
  }

  // Helper: render a single question row (used by both ungrouped MCQ rows and parts inside a multi-part group)
  function renderQuestionRow(q: Question, opts?: { partLabel?: string }) {
    const isEditing = editingId === q.id;
    const isConfirmingDelete = confirmDeleteId === q.id;
    const isDeleting = deletingId === q.id;

    if (isEditing) {
      return (
        <EditQuestionRow
          key={q.id}
          question={q}
          content={editContent}
          onContentChange={setEditContent}
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

    const label = opts?.partLabel ?? `Q${q.questionNumber}${q.part || ""}`;
    const isOpen = openQuestionIds.has(q.id);

    return (
      <div key={q.id}>
        <div
          className="px-5 py-3.5 lg:px-6 lg:py-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50/60 dark:hover:bg-gray-900/40 transition-colors"
          onClick={() =>
            setOpenQuestionIds((prev) => {
              const next = new Set(prev);
              if (next.has(q.id)) next.delete(q.id);
              else next.add(q.id);
              return next;
            })
          }
        >
          <div className="flex items-center gap-3 min-w-0">
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {label}
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
              onClick={(e) => { e.stopPropagation(); setEditContent(q.content); setEditingId(q.id); setConfirmDeleteId(null); }}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit question"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(q.id); setEditingId(null); }}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete question"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="px-5 lg:px-6 py-4 bg-gray-50/50 dark:bg-gray-950/40 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Question</div>
              <MathContent content={q.content} />
              {q.imageUrl && (
                <img src={q.imageUrl} alt={`Question ${label}`} className="mt-3 max-w-full rounded-lg border border-gray-200 dark:border-gray-800" />
              )}
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Solution
                </span>
                {editingSolutionId !== q.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditSolutionContent(q.solution?.content ?? "");
                      setEditingSolutionId(q.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    {q.solution ? "Edit" : "Add"} solution
                  </button>
                )}
              </div>
              {editingSolutionId === q.id ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <label className="text-xs text-gray-500 dark:text-gray-400">Preview</label>
                      </div>
                      <div className="flex-1 min-h-[260px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base leading-relaxed overflow-auto">
                        <MathContent content={editSolutionContent} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Code2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <label className="text-xs text-gray-500 dark:text-gray-400">Solution (Markdown + LaTeX)</label>
                      </div>
                      <textarea
                        value={editSolutionContent}
                        onChange={(e) => setEditSolutionContent(e.target.value)}
                        className="flex-1 min-h-[260px] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSaveSolution(q.id)}
                      disabled={savingSolution || !editSolutionContent.trim()}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                    >
                      {savingSolution ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSolutionId(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : q.solution ? (
                <MathContent content={q.solution.content} />
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No solution yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helper: group an array of questions by questionNumber and render them as multi-part cards
  function renderMultiPartGroups(qs: Question[]) {
    const byQNum = new Map<number, Question[]>();
    for (const q of qs) {
      if (!byQNum.has(q.questionNumber)) byQNum.set(q.questionNumber, []);
      byQNum.get(q.questionNumber)!.push(q);
    }
    const sorted = Array.from(byQNum.entries()).sort((a, b) => a[0] - b[0]);

    return (
      <div className="space-y-3 px-5 lg:px-6 py-4">
        {sorted.map(([qNum, parts]) => {
          parts.sort((a, b) => (a.part ?? "").localeCompare(b.part ?? ""));
          const totalMarks = parts.reduce((s, p) => s + p.marks, 0);
          const partLetters = parts.map((p) => p.part).filter(Boolean).join(", ");
          const groupKey = `${parts[0].id}-${qNum}`;
          const isGroupOpen = openGroupKeys.has(groupKey);
          return (
            <div key={qNum} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 overflow-hidden">
              <div
                className="px-4 py-2.5 lg:px-5 lg:py-3 flex items-center justify-between gap-3 bg-gray-100/70 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-200/70 dark:hover:bg-gray-900 transition-colors"
                onClick={() =>
                  setOpenGroupKeys((prev) => {
                    const next = new Set(prev);
                    if (next.has(groupKey)) next.delete(groupKey);
                    else next.add(groupKey);
                    return next;
                  })
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isGroupOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">Q{qNum}</span>
                  {partLetters && (
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">parts {partLetters}</span>
                  )}
                </div>
                <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{totalMarks} marks total</span>
              </div>
              {isGroupOpen && (
                <div className="px-5 lg:px-6 py-5 space-y-4 bg-white dark:bg-gray-950/60 border-b border-gray-100 dark:border-gray-800">
                  {parts.map((p) => (
                    <div key={`full-${p.id}`} className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ({p.part ?? p.questionNumber})
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${difficultyBadge(p.difficulty)}`}>
                          {p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{p.topic.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{p.marks} {p.marks === 1 ? "mark" : "marks"}</span>
                      </div>
                      <MathContent content={editingId === p.id ? editContent : p.content} />
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={`Q${p.questionNumber}${p.part ?? ""}`} className="max-w-full rounded-lg border border-gray-200 dark:border-gray-800" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {parts.map((p) =>
                  renderQuestionRow(p, { partLabel: p.part ? `(${p.part})` : `Q${p.questionNumber}` })
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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

      {/* Question Sets (AI-generated test sessions) */}
      {questionSets.length > 0 && (
        <div className="mb-10 space-y-6">
          {questionSets.map((set) => {
            const isOpen = openSetIds.has(set.id);
            const mcqs = set.items.filter((i) => i.type === "MCQ");
            const shortAns = set.items.filter((i) => i.type === "SHORT_ANSWER");
            const extResp = set.items.filter((i) => i.type === "EXTENDED_RESPONSE");
            // Group items by topic, then by primary subtopic
            const byTopic = new Map<
              string,
              { topicName: string; subtopics: Map<string, { name: string; items: QuestionSetItem[] }> }
            >();
            // Pre-seed all four main topics so they appear even when empty
            const MAIN_TOPICS = [
              "Algebra, Number, and Structure",
              "Functions, Relations, and Graphs",
              "Calculus",
              "Data Analysis, Probability, and Statistics",
            ];
            for (const name of MAIN_TOPICS) {
              byTopic.set(`__placeholder::${name}`, { topicName: name, subtopics: new Map() });
            }
            for (const item of set.items) {
              // If a real topic id matches a placeholder name, replace the placeholder
              const placeholderKey = `__placeholder::${item.topic.name}`;
              if (byTopic.has(placeholderKey) && !byTopic.has(item.topic.id)) {
                byTopic.delete(placeholderKey);
              }
              if (!byTopic.has(item.topic.id)) {
                byTopic.set(item.topic.id, { topicName: item.topic.name, subtopics: new Map() });
              }
              const t = byTopic.get(item.topic.id)!;
              const primary = item.subtopics[0];
              const key = primary?.id ?? "_none";
              if (!t.subtopics.has(key)) {
                t.subtopics.set(key, { name: primary?.name ?? "(no subtopic)", items: [] });
              }
              t.subtopics.get(key)!.items.push(item);
            }
            // Reorder so placeholders/topics follow the canonical order
            const orderedTopicEntries = MAIN_TOPICS.map((name) => {
              const entry = Array.from(byTopic.values()).find((t) => t.topicName === name);
              return entry ?? { topicName: name, subtopics: new Map() };
            });

            return (
              <div key={set.id} className="rounded-2xl bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 shadow-sm overflow-hidden">
                <div
                  onClick={() => {
                    const next = new Set(openSetIds);
                    next.has(set.id) ? next.delete(set.id) : next.add(set.id);
                    setOpenSetIds(next);
                  }}
                  className="w-full px-5 lg:px-6 py-4 grid grid-cols-3 items-center gap-3 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/60 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FlaskConical className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{set.name}</h2>
                      {set.description && (
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">{set.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center gap-2 text-xs lg:text-sm">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 font-medium">{mcqs.length} MCQ</span>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 font-medium">{shortAns.length} short</span>
                    <span className="rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 font-medium">{extResp.length} extended</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {isOpen && (() => {
                      const allOpen =
                        set.items.length > 0 &&
                        set.items.every((i) => openItemIds.has(i.id));
                      // Collect every topic key + sub key in this set
                      const topicKeysInSet: string[] = [];
                      const subKeysInSet: string[] = [];
                      for (const topicEntry of orderedTopicEntries) {
                        topicKeysInSet.push(`${set.id}::${topicEntry.topicName}`);
                        for (const sub of topicEntry.subtopics.values()) {
                          subKeysInSet.push(`${set.id}::${topicEntry.topicName}::${sub.name}`);
                        }
                      }
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (allOpen) {
                              // Collapse: clear items, re-collapse topics + subs
                              const nextItems = new Set(openItemIds);
                              set.items.forEach((i) => nextItems.delete(i.id));
                              setOpenItemIds(nextItems);
                              const nextTopics = new Set(collapsedTopicKeys);
                              topicKeysInSet.forEach((k) => nextTopics.add(k));
                              setCollapsedTopicKeys(nextTopics);
                              const nextSubs = new Set(collapsedSubKeys);
                              subKeysInSet.forEach((k) => nextSubs.add(k));
                              setCollapsedSubKeys(nextSubs);
                            } else {
                              // Expand cascade: open items, uncollapse topics + subs
                              const nextItems = new Set(openItemIds);
                              set.items.forEach((i) => nextItems.add(i.id));
                              setOpenItemIds(nextItems);
                              const nextTopics = new Set(collapsedTopicKeys);
                              topicKeysInSet.forEach((k) => nextTopics.delete(k));
                              setCollapsedTopicKeys(nextTopics);
                              const nextSubs = new Set(collapsedSubKeys);
                              subKeysInSet.forEach((k) => nextSubs.delete(k));
                              setCollapsedSubKeys(nextSubs);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                        >
                          {allOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {allOpen ? "Collapse All" : "Expand All"}
                        </button>
                      );
                    })()}
                    <span
                      aria-label={isOpen ? "Collapse set" : "Expand set"}
                      className="inline-flex items-center justify-center rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-1.5 text-purple-700 dark:text-purple-400"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 lg:px-6 py-5 space-y-5">
                    {orderedTopicEntries.map((topic) => {
                      const topicKey = `${set.id}::${topic.topicName}`;
                      const topicCollapsed = collapsedTopicKeys.has(topicKey);
                      const totalSubs = topicSubtopicCounts[topic.topicName] ?? 0;
                      const doneSubs = topic.subtopics.size;
                      // Sum item counts across all subtopics for this topic
                      let topicMcq = 0, topicShort = 0, topicExt = 0;
                      const topicAllItems: QuestionSetItem[] = [];
                      for (const sub of topic.subtopics.values()) {
                        for (const item of sub.items) {
                          topicAllItems.push(item);
                          if (item.type === "MCQ") topicMcq++;
                          else if (item.type === "SHORT_ANSWER") topicShort++;
                          else if (item.type === "EXTENDED_RESPONSE") topicExt++;
                        }
                      }
                      const topicAllOpen =
                        topicAllItems.length > 0 &&
                        topicAllItems.every((i) => openItemIds.has(i.id));
                      return (
                      <div key={topic.topicName} className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
                        <div
                          onClick={() => {
                            const next = new Set(collapsedTopicKeys);
                            next.has(topicKey) ? next.delete(topicKey) : next.add(topicKey);
                            setCollapsedTopicKeys(next);
                          }}
                          className="px-4 lg:px-5 py-3 grid grid-cols-3 items-center gap-3 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-100/40 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-sm lg:text-base font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide truncate">
                              {topic.topicName}
                            </h3>
                          </div>
                          <div className="hidden sm:flex items-center justify-center gap-1.5 text-xs">
                            <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 font-medium">{topicMcq} MCQ</span>
                            <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-medium">{topicShort} short</span>
                            <span className="rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2 py-0.5 font-medium">{topicExt} extended</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                              {doneSubs}/{totalSubs}
                            </span>
                            {!topicCollapsed && topicAllItems.length > 0 && (() => {
                              const subKeysInTopic = Array.from(topic.subtopics.values()).map(
                                (s) => `${set.id}::${topic.topicName}::${s.name}`
                              );
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (topicAllOpen) {
                                      // Collapse cascade for this topic
                                      const nextItems = new Set(openItemIds);
                                      topicAllItems.forEach((i) => nextItems.delete(i.id));
                                      setOpenItemIds(nextItems);
                                      const nextSubs = new Set(collapsedSubKeys);
                                      subKeysInTopic.forEach((k) => nextSubs.add(k));
                                      setCollapsedSubKeys(nextSubs);
                                    } else {
                                      // Expand cascade
                                      const nextItems = new Set(openItemIds);
                                      topicAllItems.forEach((i) => nextItems.add(i.id));
                                      setOpenItemIds(nextItems);
                                      const nextSubs = new Set(collapsedSubKeys);
                                      subKeysInTopic.forEach((k) => nextSubs.delete(k));
                                      setCollapsedSubKeys(nextSubs);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                                >
                                  {topicAllOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  {topicAllOpen ? "Collapse All" : "Expand All"}
                                </button>
                              );
                            })()}
                            <span
                              aria-label={topicCollapsed ? "Expand topic" : "Collapse topic"}
                              className="inline-flex items-center justify-center rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-1.5 text-purple-700 dark:text-purple-400"
                            >
                              {topicCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        {!topicCollapsed && (
                        <div className="px-4 lg:px-5 py-4 space-y-5">
                          {topic.subtopics.size === 0 && (
                            <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 p-4 lg:p-5 text-sm text-gray-400 dark:text-gray-500 italic">
                              No subtopics yet for this topic.
                            </div>
                          )}
                          {Array.from(topic.subtopics.values()).map((sub) => {
                            const subMcq = sub.items.filter((i) => i.type === "MCQ");
                            const subShort = sub.items.filter((i) => i.type === "SHORT_ANSWER");
                            const subExt = sub.items.filter((i) => i.type === "EXTENDED_RESPONSE");
                            const subKey = `${set.id}::${topic.topicName}::${sub.name}`;
                            const subCollapsed = collapsedSubKeys.has(subKey);
                            return (
                              <div key={sub.name} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 p-4 lg:p-5">
                                {(() => {
                                  const subAllOpen =
                                    sub.items.length > 0 &&
                                    sub.items.every((i) => openItemIds.has(i.id));
                                  return (
                                    <div className={`grid grid-cols-3 items-center gap-2 ${subCollapsed ? "" : "mb-3"}`}>
                                      <h4 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">{sub.name}</h4>
                                      <div className="flex items-center justify-center gap-1.5 text-xs">
                                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5">{subMcq.length} MCQ</span>
                                        <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5">{subShort.length} short</span>
                                        <span className="rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2 py-0.5">{subExt.length} extended</span>
                                      </div>
                                      <div className="flex items-center justify-end gap-2">
                                        {!subCollapsed && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const next = new Set(openItemIds);
                                              if (subAllOpen) {
                                                sub.items.forEach((i) => next.delete(i.id));
                                              } else {
                                                sub.items.forEach((i) => next.add(i.id));
                                              }
                                              setOpenItemIds(next);
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                                          >
                                            {subAllOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                            {subAllOpen ? "Collapse All" : "Expand All"}
                                          </button>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const next = new Set(collapsedSubKeys);
                                            next.has(subKey) ? next.delete(subKey) : next.add(subKey);
                                            setCollapsedSubKeys(next);
                                          }}
                                          aria-label={subCollapsed ? "Expand subtopic" : "Collapse subtopic"}
                                          className="inline-flex items-center justify-center rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-1.5 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                                        >
                                          {subCollapsed ? (
                                            <ChevronRight className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                                {!subCollapsed && (
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                  {sub.items.map((item, idx) => {
                                    const itemOpen = openItemIds.has(item.id);
                                    const typeLabel =
                                      item.type === "MCQ" ? "MCQ" : item.type === "SHORT_ANSWER" ? "Short" : "Extended";
                                    const typeBadge =
                                      item.type === "MCQ"
                                        ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                                        : item.type === "SHORT_ANSWER"
                                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                                          : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400";
                                    return (
                                      <div key={item.id} className="py-2.5">
                                        <button
                                          onClick={() => {
                                            const next = new Set(openItemIds);
                                            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                                            setOpenItemIds(next);
                                          }}
                                          className="w-full flex items-start justify-between gap-3 text-left group"
                                        >
                                          <div className="flex items-start gap-3 min-w-0">
                                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">
                                              {String(idx + 1).padStart(2, "0")}
                                            </span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${typeBadge}`}>
                                              {typeLabel}
                                            </span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium border flex-shrink-0 ${difficultyBadge(item.difficulty)}`}>
                                              {item.difficulty.charAt(0) + item.difficulty.slice(1).toLowerCase()}
                                            </span>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 truncate min-w-0 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                              {item.content.replace(/\$/g, "").slice(0, 110)}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">{item.marks}m</span>
                                            {itemOpen ? (
                                              <ChevronDown className="h-4 w-4 text-gray-400" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-gray-400" />
                                            )}
                                          </div>
                                        </button>
                                        {itemOpen && (
                                          <div className="mt-3 ml-6 space-y-3">
                                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Question</div>
                                                {editingSetItemId !== item.id && (
                                                  <button
                                                    onClick={() => {
                                                      setSetItemDraftContent(item.content);
                                                      setSetItemDraftSolution(item.solutionContent ?? "");
                                                      setEditingSetItemId(item.id);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                                                  >
                                                    <Pencil className="h-3 w-3" />
                                                    Edit
                                                  </button>
                                                )}
                                              </div>
                                              {editingSetItemId === item.id ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                                                  <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                      <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                      <label className="text-xs text-gray-500 dark:text-gray-400">Preview</label>
                                                    </div>
                                                    <div className="flex-1 min-h-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base leading-relaxed overflow-auto">
                                                      <MathContent content={setItemDraftContent} />
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                      <Code2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                      <label className="text-xs text-gray-500 dark:text-gray-400">Question (Markdown + LaTeX)</label>
                                                    </div>
                                                    <textarea
                                                      value={setItemDraftContent}
                                                      onChange={(e) => setSetItemDraftContent(e.target.value)}
                                                      className="flex-1 min-h-[200px] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                                    />
                                                  </div>
                                                </div>
                                              ) : (
                                                <MathContent content={item.content} />
                                              )}
                                              {item.type === "MCQ" && editingSetItemId !== item.id && (
                                                <div className="mt-3 space-y-1.5">
                                                  {(["A", "B", "C", "D"] as const).map((letter) => {
                                                    const text = item[`option${letter}` as "optionA"] || "";
                                                    const isCorrect = item.correctOption === letter;
                                                    return (
                                                      <div
                                                        key={letter}
                                                        className={`flex items-start gap-2 rounded px-2 py-1.5 text-sm ${
                                                          isCorrect
                                                            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                                                            : ""
                                                        }`}
                                                      >
                                                        <span className={`font-semibold ${isCorrect ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                                                          {letter}.
                                                        </span>
                                                        <div className="flex-1"><MathContent content={text} /></div>
                                                        {isCorrect && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Solution</div>
                                              {editingSetItemId === item.id ? (
                                                <div className="space-y-2">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                                                    <div className="flex flex-col">
                                                      <div className="flex items-center gap-1.5 mb-1">
                                                        <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <label className="text-xs text-gray-500 dark:text-gray-400">Preview</label>
                                                      </div>
                                                      <div className="flex-1 min-h-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base leading-relaxed overflow-auto">
                                                        <MathContent content={setItemDraftSolution} />
                                                      </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <div className="flex items-center gap-1.5 mb-1">
                                                        <Code2 className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <label className="text-xs text-gray-500 dark:text-gray-400">Solution (Markdown + LaTeX)</label>
                                                      </div>
                                                      <textarea
                                                        value={setItemDraftSolution}
                                                        onChange={(e) => setSetItemDraftSolution(e.target.value)}
                                                        className="flex-1 min-h-[200px] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      onClick={() => handleSaveSetItem(item.id)}
                                                      disabled={savingSetItem}
                                                      className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                                                    >
                                                      {savingSetItem ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                      Save
                                                    </button>
                                                    <button
                                                      onClick={() => setEditingSetItemId(null)}
                                                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                      Cancel
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : item.solutionContent ? (
                                                <MathContent content={item.solutionContent} />
                                              ) : (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No solution yet.</p>
                                              )}
                                            </div>
                                            {item.subtopics.length > 1 && (
                                              <div className="flex flex-wrap gap-1.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Cross-over:</span>
                                                {item.subtopics.slice(1).map((s) => (
                                                  <span key={s.id} className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                                                    {s.name}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Questions grouped by exam */}
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          No questions yet. Add your first question to get started.
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-5">
          {Array.from(grouped.entries()).map(([key, { label, examType, questions: qs }]) => {
            const isExamOpen = openExamKeys.has(key);
            const totalMarks = qs.reduce((s, q) => s + q.marks, 0);
            const withSolution = qs.filter((q) => q.solution).length;
            return (
            <div key={key} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  const next = new Set(openExamKeys);
                  next.has(key) ? next.delete(key) : next.add(key);
                  setOpenExamKeys(next);
                }}
                className="w-full px-5 lg:px-6 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate text-left">
                    {label} Question Set
                  </h2>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-xs lg:text-sm">
                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 font-medium">{qs.length} questions</span>
                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 font-medium">{totalMarks} marks</span>
                    <span className="rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2.5 py-0.5 font-medium">{withSolution}/{qs.length} solved</span>
                  </div>
                  {isExamOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </button>
              {isExamOpen && (() => {
                const isExam2 = examType === "EXAM_2";
                if (isExam2) {
                  // Section A = MCQs (part === null), Section B = extended response (part !== null)
                  const sectionA = qs.filter((q) => !q.part);
                  const sectionB = qs.filter((q) => q.part);
                  return (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      {/* Section A */}
                      <div>
                        <div className="px-5 lg:px-6 py-3 bg-gray-50/80 dark:bg-gray-950/60 border-b border-gray-100 dark:border-gray-800">
                          <h3 className="text-sm lg:text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Section A <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">{sectionA.length} multiple choice</span>
                          </h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                          {sectionA.map((q) => renderQuestionRow(q))}
                        </div>
                      </div>
                      {/* Section B */}
                      {sectionB.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-gray-800">
                          <div className="px-5 lg:px-6 py-3 bg-gray-50/80 dark:bg-gray-950/60 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm lg:text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                              Section B <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">extended response</span>
                            </h3>
                          </div>
                          {renderMultiPartGroups(sectionB)}
                        </div>
                      )}
                    </div>
                  );
                }
                // Exam 1: all extended response, group by question number
                return (
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    {renderMultiPartGroups(qs)}
                  </div>
                );
              })()}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
