"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Loader2, Plus, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentDetail } from "@/lib/teacher-assessments";
import { chipClass } from "./itemMeta";
import CoverageBar from "./CoverageBar";
import ItemCard, { type ItemAction } from "./ItemCard";
import PoolBrowser from "./PoolBrowser";

interface TopicOption {
  id: string;
  name: string;
}

const STATUS_META: Record<string, { label: string; chip: string }> = {
  DRAFT: {
    label: "Draft",
    chip: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  },
  PUBLISHED: {
    label: "Final",
    chip: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  },
  ARCHIVED: {
    label: "Archived",
    chip: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  },
};

const FAIL_NOTE = "We couldn't save that change. Please try again.";

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/**
 * The assessment editor. Server-truthful state: every mutation endpoint
 * returns the full updated AssessmentDetail, which wholesale replaces local
 * state — nothing optimistic to reconcile. Mutations are serialized (one in
 * flight at a time) because two racing full-detail responses could clobber
 * each other; the acted-on control shows a spinner, everything else disables.
 */
export default function AssessmentEditor({
  initial,
  topics,
}: {
  initial: AssessmentDetail;
  topics: TopicOption[];
}) {
  const [assessment, setAssessment] = useState<AssessmentDetail>(initial);
  const [titleDraft, setTitleDraft] = useState(initial.title);
  // Identifies the single in-flight mutation: "title", "status",
  // "<up|down|shuffle|remove>:<itemId>", or "add:<questionSetItemId>".
  const [busyKey, setBusyKey] = useState<string | null>(null);
  // Header-level error note (title/status failures, network drops).
  const [note, setNote] = useState<string | null>(null);
  // Transient per-item notes (e.g. "no equivalent" after a 409 shuffle).
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [poolOpen, setPoolOpen] = useState(false);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const base = `/api/teacher/assessments/${assessment.id}`;

  // Live totals recomputed from items after every mutation.
  const totalMarks = useMemo(
    () => assessment.items.reduce((sum, item) => sum + item.marks, 0),
    [assessment.items]
  );
  const inPaperIds = useMemo(
    () => new Set(assessment.items.map((item) => item.questionSetItemId)),
    [assessment.items]
  );

  /** Show a small inline note on one item card, auto-clearing after 5s. */
  const flagItem = useCallback((itemId: string, text: string) => {
    setItemNotes((prev) => ({ ...prev, [itemId]: text }));
    clearTimeout(noteTimers.current[itemId]);
    noteTimers.current[itemId] = setTimeout(() => {
      setItemNotes((prev) => {
        const rest = { ...prev };
        delete rest[itemId];
        return rest;
      });
    }, 5000);
  }, []);

  /**
   * Run one mutation and adopt the returned AssessmentDetail. Returns the
   * Response for status-specific handling, or null on a network failure.
   */
  const runMutation = useCallback(
    async (key: string, path: string, init?: RequestInit): Promise<Response | null> => {
      setBusyKey(key);
      setNote(null);
      try {
        const res = await fetch(path, init);
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.assessment) setAssessment(data.assessment);
        }
        return res;
      } catch {
        return null;
      } finally {
        setBusyKey(null);
      }
    },
    []
  );

  async function saveTitle() {
    const next = titleDraft.trim();
    if (!next || next === assessment.title) {
      setTitleDraft(assessment.title); // revert empty / unchanged drafts
      return;
    }
    const res = await runMutation("title", base, jsonInit("PATCH", { title: next }));
    if (!res || !res.ok) {
      setTitleDraft(assessment.title);
      setNote(FAIL_NOTE);
    } else {
      setTitleDraft(next);
    }
  }

  // Draft -> "Mark as final" (PUBLISHED); Published/Archived -> back to draft.
  async function toggleStatus() {
    const next = assessment.status === "DRAFT" ? "PUBLISHED" : "DRAFT";
    const res = await runMutation("status", base, jsonInit("PATCH", { status: next }));
    if (!res || !res.ok) setNote(FAIL_NOTE);
  }

  async function moveItem(itemId: string, dir: -1 | 1) {
    const ids = assessment.items.map((item) => item.id);
    const from = ids.indexOf(itemId);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    const key = `${dir === -1 ? "up" : "down"}:${itemId}`;
    const res = await runMutation(key, `${base}/reorder`, jsonInit("POST", { itemIds: ids }));
    if (!res || !res.ok) flagItem(itemId, FAIL_NOTE);
  }

  async function shuffleItem(itemId: string) {
    const res = await runMutation(`shuffle:${itemId}`, `${base}/items/${itemId}/shuffle`, {
      method: "POST",
    });
    if (!res) return flagItem(itemId, FAIL_NOTE);
    if (res.status === 409) {
      return flagItem(itemId, "No equivalent question is available to swap in.");
    }
    if (!res.ok) flagItem(itemId, FAIL_NOTE);
  }

  async function removeItem(itemId: string) {
    const res = await runMutation(`remove:${itemId}`, `${base}/items/${itemId}`, {
      method: "DELETE",
    });
    if (!res || !res.ok) flagItem(itemId, FAIL_NOTE);
  }

  /** Called by the pool browser; resolves true when the add stuck. */
  async function addItem(questionSetItemId: string): Promise<boolean> {
    const res = await runMutation(
      `add:${questionSetItemId}`,
      `${base}/items`,
      jsonInit("POST", { questionSetItemId })
    );
    return !!res && res.ok;
  }

  /** Which of this item's controls is in flight (spinner), if any. */
  function pendingFor(itemId: string): ItemAction | null {
    if (!busyKey) return null;
    const sep = busyKey.indexOf(":");
    if (sep === -1 || busyKey.slice(sep + 1) !== itemId) return null;
    const action = busyKey.slice(0, sep);
    return action === "up" || action === "down" || action === "shuffle" || action === "remove"
      ? (action as ItemAction)
      : null;
  }

  const statusMeta = STATUS_META[assessment.status] ?? STATUS_META.DRAFT;
  const busy = busyKey !== null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/teacher"
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to assessments
      </Link>

      {/* Header: editable title, status, live totals */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          disabled={busyKey === "title"}
          aria-label="Assessment title"
          className="w-full bg-transparent text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-transparent focus:border-brand-500 focus:outline-none disabled:opacity-60"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={cn(chipClass, "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400")}>
            {assessment.subjectName}
          </span>
          <span className={cn(chipClass, statusMeta.chip)}>{statusMeta.label}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {assessment.items.length} question{assessment.items.length === 1 ? "" : "s"} ·{" "}
            {totalMarks} mark{totalMarks === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={toggleStatus}
            disabled={busy}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50",
              assessment.status === "DRAFT"
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            {busyKey === "status" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {assessment.status === "DRAFT" ? "Mark as final" : "Back to draft"}
          </button>
          <button
            onClick={() => setPoolOpen(true)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add questions
          </button>
          {/* Print views open in a new tab and render server-fresh state, so
              they don't participate in the busy/disabled convention (links
              never mutate). Labels collapse to icon-only on mobile. */}
          <Link
            href={`/print/assessments/${assessment.id}`}
            target="_blank"
            rel="noopener"
            aria-label="Print paper"
            title="Print paper"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print paper</span>
          </Link>
          <Link
            href={`/print/assessments/${assessment.id}?solutions=1`}
            target="_blank"
            rel="noopener"
            aria-label="Print marking guide"
            title="Print marking guide"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Print marking guide</span>
          </Link>
        </div>
        {note && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{note}</p>}
      </div>

      {/* Topic coverage — pure client-side, recomputed from items */}
      {assessment.items.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
          <CoverageBar items={assessment.items} />
        </div>
      )}

      {/* Item list */}
      <div className="mt-6 space-y-4">
        {assessment.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              This paper has no questions yet.
            </p>
            <button
              onClick={() => setPoolOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
            >
              <Plus className="h-4 w-4" />
              Add questions
            </button>
          </div>
        ) : (
          assessment.items.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              count={assessment.items.length}
              disabled={busy}
              pendingAction={pendingFor(item.id)}
              note={itemNotes[item.id]}
              onMove={(dir) => moveItem(item.id, dir)}
              onShuffle={() => shuffleItem(item.id)}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </div>

      {poolOpen && (
        <PoolBrowser
          onClose={() => setPoolOpen(false)}
          subjectSlug={assessment.subjectSlug}
          topics={topics}
          inPaperIds={inPaperIds}
          addingId={busyKey?.startsWith("add:") ? busyKey.slice(4) : null}
          onAdd={addItem}
        />
      )}
    </div>
  );
}
