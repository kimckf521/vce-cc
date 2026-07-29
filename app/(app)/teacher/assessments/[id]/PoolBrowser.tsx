"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PoolItem } from "@/lib/teacher-assessments";
import MathContent from "@/components/MathContent";
import { ItemMetaChips } from "./itemMeta";

interface TopicOption {
  id: string;
  name: string;
}

interface PoolBrowserProps {
  onClose: () => void;
  subjectSlug: string;
  topics: TopicOption[];
  /** questionSetItemIds already in the paper — their cards show as added. */
  inPaperIds: Set<string>;
  /** questionSetItemId of the add currently in flight, if any. */
  addingId: string | null;
  /** Resolves true when the server accepted the add. */
  onAdd: (questionSetItemId: string) => Promise<boolean>;
}

interface PoolFilters {
  topicId: string;
  difficulty: string;
  type: string;
  tech: string;
  q: string;
}

const DIFFICULTY_OPTIONS: [string, string][] = [
  ["", "All difficulties"],
  ["EASY", "Easy"],
  ["MEDIUM", "Medium"],
  ["HARD", "Hard"],
];

const TYPE_OPTIONS: [string, string][] = [
  ["", "All types"],
  ["MCQ", "MCQ"],
  ["SHORT_ANSWER", "Short Answer"],
  ["EXTENDED_ANSWER", "Extended Answer"],
  ["EXTENDED_RESPONSE", "Extended Response"],
];

const TECH_OPTIONS: [string, string][] = [
  ["", "Any tech"],
  ["TECH_FREE", "Tech-free"],
  ["CAS_ALLOWED", "CAS allowed"],
  ["CAS_REQUIRED", "CAS required"],
];

const fieldClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500";

/**
 * "Add questions" panel — a browser over GET /api/teacher/question-pool for
 * the assessment's subject. Slide-over on desktop, full-screen sheet on
 * mobile. Mounted only while open, so each open starts with fresh results.
 */
export default function PoolBrowser({
  onClose,
  subjectSlug,
  topics,
  inPaperIds,
  addingId,
  onAdd,
}: PoolBrowserProps) {
  const [filters, setFilters] = useState<PoolFilters>({
    topicId: "",
    difficulty: "",
    type: "",
    tech: "",
    q: "",
  });
  const [qInput, setQInput] = useState("");
  const [items, setItems] = useState<PoolItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  // Monotonic request id — a stale response (filters changed mid-flight)
  // must never overwrite the results of a newer one.
  const seqRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce free-text search into the filter state (300ms).
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) =>
        prev.q === qInput.trim() ? prev : { ...prev, q: qInput.trim() }
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [qInput]);

  const load = useCallback(
    async (cursor: string | null, append: boolean) => {
      const seq = ++seqRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ subjectSlug, limit: "20" });
        if (filters.topicId) params.set("topicId", filters.topicId);
        if (filters.difficulty) params.set("difficulty", filters.difficulty);
        if (filters.type) params.set("type", filters.type);
        if (filters.tech) params.set("tech", filters.tech);
        if (filters.q) params.set("q", filters.q);
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`/api/teacher/question-pool?${params.toString()}`);
        if (!res.ok) throw new Error(`pool fetch failed (${res.status})`);
        const data = await res.json();
        if (seq !== seqRef.current) return; // superseded
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor ?? null);
      } catch {
        if (seq === seqRef.current) {
          setError("We couldn't load the question pool. Please try again.");
        }
      } finally {
        if (seq === seqRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filters, subjectSlug]
  );

  // (Re)load the first page on mount and whenever a filter changes.
  useEffect(() => {
    load(null, false);
  }, [load]);

  // Infinite scroll: prefetch the next page as the sentinel nears the
  // bottom of the panel's own scroll container.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          load(nextCursor, true);
        }
      },
      { root: scrollRef.current, rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, loading, loadingMore, load]);

  // Escape closes; lock body scroll behind the sheet while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function handleAdd(questionSetItemId: string) {
    setAddError(null);
    const ok = await onAdd(questionSetItemId);
    if (!ok) setAddError("We couldn't add that question. Please try again.");
  }

  const setFilter = (key: keyof PoolFilters) => (e: ChangeEvent<HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Add questions">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Full-screen sheet on mobile; right-hand slide-over from sm: up */}
      <div className="absolute inset-y-0 right-0 flex w-full flex-col bg-white dark:bg-gray-950 shadow-2xl sm:max-w-lg sm:border-l sm:border-gray-200 sm:dark:border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Add questions</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-2 border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search question text"
              aria-label="Search question text"
              className={cn(fieldClass, "pl-8")}
            />
          </div>
          <select
            value={filters.topicId}
            onChange={setFilter("topicId")}
            aria-label="Filter by topic"
            className={fieldClass}
          >
            <option value="">All topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <select
              value={filters.difficulty}
              onChange={setFilter("difficulty")}
              aria-label="Filter by difficulty"
              className={fieldClass}
            >
              {DIFFICULTY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={setFilter("type")}
              aria-label="Filter by question type"
              className={fieldClass}
            >
              {TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.tech}
              onChange={setFilter("tech")}
              aria-label="Filter by tech requirement"
              className={cn(fieldClass, "col-span-2 sm:col-span-1")}
            >
              {TECH_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
          {addError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="status">
              {addError}
            </p>
          )}
          {error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
              <button
                onClick={() => load(null, false)}
                className="mt-3 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No questions match these filters.
            </p>
          ) : (
            <>
              {items.map((item) => {
                const added = inPaperIds.has(item.questionSetItemId);
                const adding = addingId === item.questionSetItemId;
                return (
                  <div
                    key={item.questionSetItemId}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        <ItemMetaChips
                          type={item.type}
                          marks={item.marks}
                          topicName={item.topicName}
                          difficulty={item.difficulty}
                          tech={item.tech}
                        />
                      </div>
                      <button
                        onClick={() => handleAdd(item.questionSetItemId)}
                        disabled={added || addingId !== null}
                        aria-label={added ? "Already in this paper" : "Add to paper"}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                          added
                            ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                            : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                        )}
                      >
                        {added ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Added
                          </>
                        ) : adding ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" /> Add
                          </>
                        )}
                      </button>
                    </div>
                    {/* Clipped content preview with a bottom fade. Parts-based
                        items (e.g. Foundation extended response) keep their
                        text in preamble + parts with an empty content column —
                        fall back to the first sub-question so the preview
                        shows more than the scenario stem. */}
                    <div className="relative mt-2 max-h-36 min-w-0 overflow-hidden">
                      {item.preamble && <MathContent content={item.preamble} />}
                      {item.content.trim() !== "" ? (
                        <MathContent content={item.content} />
                      ) : item.parts && item.parts.length > 0 ? (
                        <MathContent
                          content={`**${item.parts[0].label}.** ${item.parts[0].content}`}
                        />
                      ) : null}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white dark:from-gray-900" />
                    </div>
                  </div>
                );
              })}
              {nextCursor && (
                <div ref={sentinelRef} className="flex justify-center py-3" aria-hidden="true">
                  {loadingMore && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
