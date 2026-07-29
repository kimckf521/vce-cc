"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Trophy, ArrowRight } from "lucide-react";
import SelfMarkStepper from "@/components/SelfMarkStepper";
import { cn } from "@/lib/utils";
import QuestionGroup, { parseMCQAnswer } from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { useAutoSave } from "@/hooks/useAutoSave";
import NavigationGuard from "@/components/NavigationGuard";
import { trackEvent } from "@/lib/analytics";

interface QuestionGroupData {
  examId: string;
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  topicName: string;
  subtopics: string[];
  parts: {
    id: string;
    questionNumber: number;
    part: string | null;
    marks: number;
    content: string;
    imageUrl: string | null;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    solution: { content: string; imageUrl?: string | null; videoUrl?: string | null } | null;
    initialStatus: null;
  }[];
}

interface ExamModeWrapperProps {
  groups: QuestionGroupData[];
  totalQuestions: number;
  sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B" | "Section A" | "Section B";
  calculatorAllowed: boolean;
  /** "Show solutions as I go" toggle from setup */
  showSolutionsAsYouGo?: boolean;
  /** Whether to show the countdown timer */
  showTimer?: boolean;
  readingSeconds?: number;
  writingSeconds?: number;
  /** Whether questions are MCQ with auto-grading (default true). Set false for extended-response modes like Exam 2B. */
  isMcqMode?: boolean;
  /** Whether to show score & percentage in results (default true). Only Exam 2A shows these. */
  showScore?: boolean;
  /**
   * When true, render a per-question marks stepper after submit so the user
   * can self-mark (short-answer/extended-response modes — Exam 1, Exam 2B).
   * Each stepper change is saved to localStorage immediately and PATCHed to
   * the per-question endpoint (debounced), which recomputes the session
   * score and flips `graded` once every question is marked.
   */
  enableSelfMarking?: boolean;
  /**
   * Subject-scoped history list URL (e.g. "/vce/general/history"). The
   * post-submit redirect goes to `${historyHref}/${sessionId}` so the review
   * screen's "Back to history" returns to the correct subject. Defaults to the
   * global list for safety.
   */
  historyHref?: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Strip the sub-part suffix (`::a`, `::a.i`) from a rendered part id to get
 * the parent QuestionSetItem id. Single-part items carry the bare item id.
 */
function stripPartSuffix(id: string): string {
  const sep = id.indexOf("::");
  return sep === -1 ? id : id.slice(0, sep);
}

export default function ExamModeWrapper({
  groups,
  totalQuestions,
  sectionLabel,
  calculatorAllowed,
  historyHref = "/history",
  showSolutionsAsYouGo = false,
  showTimer = false,
  readingSeconds = 15 * 60,
  writingSeconds = 60 * 60,
  isMcqMode = true,
  showScore = true,
  enableSelfMarking = false,
}: ExamModeWrapperProps) {
  useSessionRefresh();

  // Stable session key based on question IDs
  const sessionKey = useMemo(
    () => sectionLabel + ":" + groups.map((g) => g.parts[0]?.id).join(","),
    [sectionLabel, groups]
  );
  const autoSave = useAutoSave(sessionKey);

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const saved = autoSave.restore();
    return saved?.selections ?? {};
  });
  // `submitted` survives refreshes during the self-marking phase — the
  // autosave payload records it, so a mid-marking reload restores the
  // marking view instead of a blank exam.
  const [submitted, setSubmitted] = useState(() => {
    const saved = autoSave.restore();
    return saved?.submitted ?? false;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const saved = autoSave.restore();
    return saved?.elapsedSeconds ?? 0;
  });
  const [finalTime, setFinalTime] = useState(() => {
    // Restored post-submit sessions show the time the clock stopped at.
    const saved = autoSave.restore();
    return saved?.submitted ? saved.elapsedSeconds : 0;
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();

  // Self-marking (Exam 1 / Exam 2B — modes without auto-grading).
  // Keyed by part id; value is the marks the user awarded themselves.
  // Restored from the autosave payload so a refresh mid-marking keeps the
  // stepper state — the server holds the durable copy via per-question
  // PATCHes; localStorage covers the gap between click and debounced PATCH.
  const [selfMarks, setSelfMarks] = useState<Record<string, number>>(() => {
    const saved = autoSave.restore();
    return saved?.selfMarks ?? {};
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const saved = autoSave.restore();
    return saved?.sessionId ?? null;
  });
  const [finalising, setFinalising] = useState(false);

  // Total max marks across all parts, used as the denominator for self-mark %.
  const totalMaxMarks = useMemo(
    () =>
      groups.reduce(
        (sum, g) => sum + g.parts.reduce((s, p) => s + p.marks, 0),
        0
      ),
    [groups]
  );
  const selfMarksTotal = useMemo(
    () => Object.values(selfMarks).reduce((a, b) => a + b, 0),
    [selfMarks]
  );
  const selfMarksPercentage =
    totalMaxMarks > 0 ? Math.round((selfMarksTotal / totalMaxMarks) * 100) : 0;
  const totalParts = useMemo(
    () => groups.reduce((sum, g) => sum + g.parts.length, 0),
    [groups]
  );
  const partsMarked = Object.keys(selfMarks).length;
  // "Questions marked" = groups where every part has a self-mark assigned.
  const questionsMarked = groups.filter((g) =>
    g.parts.every((p) => selfMarks[p.id] !== undefined)
  ).length;
  const allMarked = partsMarked === totalParts && totalParts > 0;

  // Start elapsed timer on mount — but not when restoring an
  // already-submitted session, whose clock stopped at submit time.
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        autoSave.updateElapsed(prev + 1);
        return prev + 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoSave, submitted]);

  // Build answer key once: questionId → correct letter (only for MCQ mode)
  const answerKey = useMemo(() => {
    if (!isMcqMode) return {} as Record<string, string | null>;
    const key: Record<string, string | null> = {};
    for (const group of groups) {
      for (const part of group.parts) {
        key[part.id] = parseMCQAnswer(part.solution?.content);
      }
    }
    return key;
  }, [isMcqMode, groups]);

  function handleMcqSelect(questionId: string, letter: string) {
    if (submitted) return;
    setSelections((prev) => {
      const next = { ...prev, [questionId]: letter };
      autoSave.updateSelections(next);
      return next;
    });
  }

  function handleSubmit() {
    setFinalTime(elapsedSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    // Self-marking modes keep autosaving through the marking phase so a
    // refresh restores the stepper state; auto-graded modes are done here.
    autoSave.markSubmitted(enableSelfMarking);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Save exam session to database (fire and forget)
    const correct = groups.reduce((total, group) => {
      return total + group.parts.filter((p) => {
        const ans = answerKey[p.id];
        return ans && selections[p.id] === ans;
      }).length;
    }, 0);
    const incorrect = Object.keys(selections).length - correct;
    const pct = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    // Exam 2A is MCQ (auto-graded). Exam 1 and Exam 2B are open-ended
    // and can't be auto-marked yet, so flag them as ungraded.
    const isGraded = sectionLabel === "Exam 2A";

    // Build the per-question record so the history detail page can show
    // exactly which generated-set items were practiced.
    //
    // Each visible "part" has either a real QuestionSetItem id (single-part
    // MCQ / short-answer) or a synthetic id `${itemId}::label` (multi-part
    // EXTENDED_RESPONSE or Exam 1 sub-parts). Collapse to ONE row per
    // parent QuestionSetItem so:
    //   - The FK to QuestionSetItem is always valid.
    //   - An Exam 1 compound made of two source items posts TWO rows
    //     (one per item), not one — previously the second was dropped.
    //   - An Exam 1 source item with multiple sub-parts (a.i, a.ii, …)
    //     posts ONE row representing the whole item.
    const seenParents = new Set<string>();
    const sessionQuestions: {
      questionSetItemId: string;
      order: number;
      groupIndex: number;
      selectedOption: string | null;
      correct: boolean | null;
    }[] = [];
    let manifestOrder = 0;
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const group = groups[gIdx];
      for (const part of group.parts) {
        const parentId = stripPartSuffix(part.id);
        if (seenParents.has(parentId)) continue;
        seenParents.add(parentId);
        const selected = selections[part.id] ?? null;
        const ans = answerKey[part.id];
        sessionQuestions.push({
          questionSetItemId: parentId,
          order: manifestOrder++ * 100,
          groupIndex: gIdx,
          selectedOption: selected,
          correct: isMcqMode && ans ? selected === ans : null,
        });
      }
    }

    // Capture the session id so subsequent self-mark edits can PATCH the
    // same row (fire-and-forget; any failure leaves sessionId null and the
    // self-mark UI silently skips persistence).
    fetch("/api/exam-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: sectionLabel,
        totalQuestions,
        correctCount: correct,
        incorrectCount: incorrect,
        score: pct,
        elapsedSeconds,
        graded: isGraded,
        questions: sessionQuestions,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session?.id) {
          setSessionId(data.session.id);
          // Persist the id so a refresh mid-marking can keep PATCHing
          // marks to the same session row.
          autoSave.updateSessionId(data.session.id);
        }
      })
      .catch(() => {});

    trackEvent("exam_submitted", {
      mode: sectionLabel,
      totalQuestions,
      correctCount: correct,
      score: pct,
      elapsedSeconds,
    });
  }

  // ---- Live self-mark persistence ---------------------------------------
  // Every self-mark change PATCHes the per-question endpoint
  // (/api/exam-sessions/[id]/questions/[rowId]) — the single source of truth
  // for the session's score/graded recompute. Sends are debounced 400ms
  // trailing-edge per question row with at most one PATCH in flight per row;
  // values changed mid-flight coalesce into a single follow-up send.

  // Latest values for the debounced senders (avoids stale closures).
  const selfMarksRef = useRef(selfMarks);
  useEffect(() => {
    selfMarksRef.current = selfMarks;
  }, [selfMarks]);
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Parent QuestionSetItem id → ExamSessionQuestion row id, fetched once per
  // session (the per-question route is keyed by row id, which the create
  // POST doesn't return).
  const rowIdMapRef = useRef<Record<string, string> | null>(null);
  // When the manifest can't be loaded the per-question path can't run, so
  // the aggregate-PATCH fallback below takes over.
  const [rowMapFailed, setRowMapFailed] = useState(false);
  // Per-row debounce / in-flight bookkeeping.
  const rowPatchStateRef = useRef(
    new Map<
      string,
      {
        timer: ReturnType<typeof setTimeout> | null;
        inflight: boolean;
        dirty: boolean;
      }
    >()
  );

  // Visible parts grouped by parent item — one per-question PATCH covers all
  // of an item's rendered sub-parts.
  const partsByParent = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!enableSelfMarking) return map;
    for (const g of groups) {
      for (const p of g.parts) {
        const parentId = stripPartSuffix(p.id);
        const list = map.get(parentId) ?? [];
        list.push(p.id);
        map.set(parentId, list);
      }
    }
    return map;
  }, [groups, enableSelfMarking]);

  // Build the per-question payload from current self-marks. Single-row items
  // (part id === parent id) send the top-level mark; multi-part items send
  // the full sub-part map keyed by part label ("a", "a.i", …) with null for
  // unmarked parts — the same shape the history review's EditablePartMark
  // sends, so live marking and retro-editing stay interchangeable.
  const buildRowPayload = useCallback(
    (
      parentId: string
    ):
      | { marksEarned: number }
      | { subPartMarks: Record<string, number | null> }
      | null => {
      const partIds = partsByParent.get(parentId);
      if (!partIds || partIds.length === 0) return null;
      const marks = selfMarksRef.current;
      if (partIds.length === 1 && partIds[0] === parentId) {
        const v = marks[parentId];
        return v === undefined ? null : { marksEarned: v };
      }
      const subPartMarks: Record<string, number | null> = {};
      let anyMarked = false;
      for (const pid of partIds) {
        const key = pid.slice(parentId.length + 2); // after "itemId::"
        const v = marks[pid];
        subPartMarks[key] = v === undefined ? null : v;
        if (v !== undefined) anyMarked = true;
      }
      return anyMarked ? { subPartMarks } : null;
    },
    [partsByParent]
  );

  const sendRowPatch = useCallback(
    async (sid: string, rowId: string, payload: object) => {
      await fetch(`/api/exam-sessions/${sid}/questions/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    []
  );

  const flushRowPatch = useCallback(
    async function flushRow(parentId: string) {
      const states = rowPatchStateRef.current;
      let st = states.get(parentId);
      if (!st) {
        st = { timer: null, inflight: false, dirty: false };
        states.set(parentId, st);
      }
      if (st.inflight) {
        // A newer value arrived mid-flight — resend once it completes.
        st.dirty = true;
        return;
      }
      const sid = sessionIdRef.current;
      const rowId = rowIdMapRef.current?.[parentId];
      if (!sid || !rowId) return;
      const payload = buildRowPayload(parentId);
      if (!payload) return;
      st.inflight = true;
      st.dirty = false;
      try {
        await sendRowPatch(sid, rowId, payload);
      } catch {
        // Dropped send — localStorage still has the value, and the Finish
        // flush re-sends every marked question.
      }
      st.inflight = false;
      if (st.dirty) {
        st.dirty = false;
        void flushRow(parentId);
      }
    },
    [buildRowPayload, sendRowPatch]
  );

  const scheduleRowPatch = useCallback(
    (parentId: string) => {
      if (!enableSelfMarking) return;
      const states = rowPatchStateRef.current;
      let st = states.get(parentId);
      if (!st) {
        st = { timer: null, inflight: false, dirty: false };
        states.set(parentId, st);
      }
      if (st.timer) clearTimeout(st.timer);
      const scheduled = st;
      scheduled.timer = setTimeout(() => {
        scheduled.timer = null;
        void flushRowPatch(parentId);
      }, 400);
    },
    [enableSelfMarking, flushRowPatch]
  );

  // Clear any pending debounce timers on unmount.
  useEffect(() => {
    const states = rowPatchStateRef.current;
    return () => {
      for (const st of Array.from(states.values())) {
        if (st.timer) clearTimeout(st.timer);
      }
    };
  }, []);

  // Fetch the session's question manifest once the session exists, then sync
  // any marks awarded before it arrived — including marks restored from
  // localStorage after a refresh, where the server may be missing the tail
  // of them (the gap between a stepper click and its debounced PATCH).
  useEffect(() => {
    if (!sessionId || !enableSelfMarking) return;
    let cancelled = false;
    fetch(`/api/exam-sessions/${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const rows = data?.session?.questions as
          | { id: string; questionSetItemId: string }[]
          | undefined;
        if (!Array.isArray(rows) || rows.length === 0) {
          setRowMapFailed(true);
          return;
        }
        const map: Record<string, string> = {};
        for (const row of rows) map[row.questionSetItemId] = row.id;
        rowIdMapRef.current = map;
        for (const parentId of Array.from(partsByParent.keys())) {
          if (buildRowPayload(parentId) !== null) scheduleRowPatch(parentId);
        }
      })
      .catch(() => {
        if (!cancelled) setRowMapFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [
    sessionId,
    enableSelfMarking,
    partsByParent,
    buildRowPayload,
    scheduleRowPatch,
  ]);

  // Update one part's self-mark. The functional setter keeps back-to-back
  // clicks composable across React's batching; the value is mirrored into
  // the autosave payload so a refresh restores it, and the owning question
  // row is scheduled for a debounced per-question PATCH.
  function handleSelfMark(partId: string, earned: number) {
    setSelfMarks((prev) => {
      const next = { ...prev, [partId]: earned };
      autoSave.updateSelfMarks(next);
      return next;
    });
    scheduleRowPatch(stripPartSuffix(partId));
  }

  // Fallback: when the question manifest is unavailable the per-question
  // path can't run, so keep the previous debounced aggregate score PATCH.
  // The aggregate route now derives `graded` rather than forcing it, so a
  // half-marked session stays un-finalised either way. The two PATCH paths
  // are mutually exclusive — per-question when the manifest loads, aggregate
  // only when it doesn't — so they never fight over the session row.
  useEffect(() => {
    if (!rowMapFailed) return;
    if (!sessionId) return;
    if (Object.keys(selfMarks).length === 0) return;

    const timeout = setTimeout(() => {
      const earnedTotal = Object.values(selfMarks).reduce((a, b) => a + b, 0);
      const pct =
        totalMaxMarks > 0
          ? Math.round((earnedTotal / totalMaxMarks) * 100)
          : 0;

      // A question counts as "correct" only if every part earned full marks,
      // "incorrect" only if every part earned zero; partials fall into
      // neither.
      let correctCountLocal = 0;
      let incorrectCountLocal = 0;
      for (const g of groups) {
        const max = g.parts.reduce((s, p) => s + p.marks, 0);
        const earnedForGroup = g.parts.reduce(
          (s, p) => s + (selfMarks[p.id] ?? 0),
          0
        );
        if (g.parts.every((p) => selfMarks[p.id] !== undefined)) {
          if (earnedForGroup === max) correctCountLocal++;
          else if (earnedForGroup === 0) incorrectCountLocal++;
        }
      }

      fetch(`/api/exam-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: pct,
          correctCount: correctCountLocal,
          incorrectCount: incorrectCountLocal,
        }),
      }).catch(() => {});
    }, 400);

    return () => clearTimeout(timeout);
  }, [rowMapFailed, selfMarks, sessionId, totalMaxMarks, groups]);

  // Calculate score
  const correctCount = submitted
    ? groups.reduce((total, group) => {
        return total + group.parts.filter((p) => {
          const correct = answerKey[p.id];
          return correct && selections[p.id] === correct;
        }).length;
      }, 0)
    : 0;

  const answeredCount = Object.keys(selections).length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Solution button logic:
  // - Before submit: only show if "Show solutions as I go" was toggled on
  // - After submit: always show
  const shouldShowSolutions = submitted || showSolutionsAsYouGo;

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Warn before leaving while self-marking is unfinished. */}
      <NavigationGuard
        enabled={submitted && enableSelfMarking && !finalising}
        title="Leave without finishing?"
        message="You haven't finished marking this exam yet. Your score won't be finalised until you do."
        confirmLabel="Leave anyway"
        cancelLabel="Keep marking"
      />
      {/* Timer — hidden after submit */}
      {showTimer && !submitted && (
        <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />
      )}

      {/* Results banner — shown after submit */}
      {submitted && (() => {
        // Drive the banner colour off whichever score mode is active so
        // self-marked exams (Exam 1 / 2B) also get the green/yellow/red
        // feedback once the student starts marking.
        const bannerPct = showScore
          ? percentage
          : enableSelfMarking
            ? selfMarksPercentage
            : 0;
        const showResultColor = showScore || (enableSelfMarking && questionsMarked > 0);

        return (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className={cn(
            "px-6 py-6 lg:px-8 lg:py-8",
            showResultColor
              ? bannerPct >= 80 ? "bg-green-50 dark:bg-green-950" : bannerPct >= 50 ? "bg-yellow-50 dark:bg-yellow-950" : "bg-red-50 dark:bg-red-950"
              : "bg-blue-50 dark:bg-blue-950"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className={cn(
                "h-7 w-7 lg:h-8 lg:w-8",
                showResultColor
                  ? bannerPct >= 80 ? "text-green-600 dark:text-green-400" : bannerPct >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              )} />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {enableSelfMarking ? "Self-mark your exam" : "Exam results"}
              </h2>
            </div>

            {enableSelfMarking && (
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-4">
                Check each solution and award yourself marks using the stepper beneath each question. Your score updates as you go.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {/* Score */}
              <div className="rounded-xl bg-white/80 border border-white p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">
                  {enableSelfMarking ? "Marks earned" : "Score"}
                </p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {showScore ? (
                    <>{correctCount}<span className="text-lg lg:text-xl text-gray-400 dark:text-gray-500">/{totalQuestions}</span></>
                  ) : enableSelfMarking ? (
                    <>
                      {selfMarksTotal}
                      <span className="text-lg lg:text-xl text-gray-400 dark:text-gray-500">
                        /{totalMaxMarks}
                      </span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              {/* Percentage */}
              <div className="rounded-xl bg-white/80 border border-white p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Percentage</p>
                <p className={cn(
                  "text-3xl lg:text-4xl font-bold",
                  showResultColor
                    ? bannerPct >= 80 ? "text-green-600 dark:text-green-400" : bannerPct >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-gray-100"
                )}>
                  {showScore
                    ? `${percentage}%`
                    : enableSelfMarking
                      ? `${selfMarksPercentage}%`
                      : "N/A"}
                </p>
              </div>

              {/* Time taken */}
              <div className="rounded-xl bg-white/80 border border-white p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Time taken</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-500" />
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{formatElapsed(finalTime)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown — only when showScore */}
            {showScore && (
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-black/5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">{correctCount} correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">{answeredCount - correctCount} incorrect</span>
                </div>
                {answeredCount < totalQuestions && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">{totalQuestions - answeredCount} unanswered</span>
                  </div>
                )}
              </div>
            )}

            {/* Self-mark progress */}
            {enableSelfMarking && (
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-black/5 text-sm lg:text-base text-gray-600 dark:text-gray-400">
                <span className="font-medium">{questionsMarked}</span>
                <span>of {groups.length} questions marked</span>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* Questions */}
      {groups.map((group, idx) => {
        const key = `${group.examId}-${group.parts[0].questionNumber}-${idx}`;
        return (
          <div key={key}>
            <QuestionGroup
              year={group.year}
              examType={group.examType}
              sectionLabel={sectionLabel}
              questionIndex={idx + 1}
              topic={group.topicName}
              subtopics={group.subtopics}
              calculatorAllowed={calculatorAllowed}
              parts={group.parts}
              examMode={true}
              revealAnswers={isMcqMode ? submitted : false}
              showSolutionButton={shouldShowSolutions}
              onMcqSelect={isMcqMode ? handleMcqSelect : undefined}
              // Critical: the parent server component re-runs the random picker
              // on every render, so a router.refresh() triggered by a bookmark
              // or status save would silently swap the questions out from
              // under the user. The optimistic local state is sufficient.
              disableServerRefresh
            />
            {submitted && enableSelfMarking && (
              <SelfMarkStepper
                parts={group.parts}
                selfMarks={selfMarks}
                onChange={handleSelfMark}
              />
            )}
          </div>
        );
      })}

      {/* Submit button — after the last question, only before submission */}
      {!submitted && (
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-brand-600 px-8 py-4 lg:py-5 text-base lg:text-lg font-bold text-white hover:bg-brand-700 transition-colors shadow-lg"
          >
            {showScore ? `Submit exam (${answeredCount}/${totalQuestions} answered)` : "Submit exam"}
          </button>
        </div>
      )}

      {/* Finish-marking footer — only after submit, in self-marking modes */}
      {submitted && enableSelfMarking && (
        <div className="pt-2 pb-2 space-y-2">
          {!allMarked && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Mark every question to finish — {questionsMarked}/{groups.length} done.
            </p>
          )}
          <button
            type="button"
            disabled={!allMarked || finalising}
            onClick={async () => {
              setFinalising(true);
              if (sessionId && rowIdMapRef.current) {
                // Flush every marked question through the per-question route
                // (the source of truth for score/graded) so the user lands
                // on /history with the final state persisted — this also
                // retries any send that was dropped mid-marking.
                for (const st of Array.from(rowPatchStateRef.current.values())) {
                  // Cancel pending debounced sends; the flush below sends
                  // the final authoritative value for every question.
                  if (st.timer) {
                    clearTimeout(st.timer);
                    st.timer = null;
                  }
                }
                const map = rowIdMapRef.current;
                const parentIds = Array.from(partsByParent.keys()).filter(
                  (pid) =>
                    map[pid] !== undefined && buildRowPayload(pid) !== null
                );
                const send = (pid: string) => {
                  const payload = buildRowPayload(pid);
                  return payload
                    ? sendRowPatch(sessionId, map[pid], payload).catch(
                        () => {}
                      )
                    : Promise.resolve();
                };
                await Promise.all(parentIds.map(send));
                // One settling re-send after everything is committed: two
                // concurrent per-question PATCHes can each read the other's
                // uncommitted marks, so re-trigger the server-side recompute
                // (score + graded) against the complete set.
                const last = parentIds[parentIds.length - 1];
                if (last !== undefined && parentIds.length > 1) {
                  await send(last);
                }
              } else if (sessionId) {
                // The question manifest never loaded, so finalise via the
                // aggregate route. `graded: true` is explicit — the route no
                // longer assumes a PATCH means marking finished — and safe
                // here because this button is gated on `allMarked`.
                const earnedTotal = Object.values(selfMarks).reduce(
                  (a, b) => a + b,
                  0
                );
                const pct =
                  totalMaxMarks > 0
                    ? Math.round((earnedTotal / totalMaxMarks) * 100)
                    : 0;
                let correctCountLocal = 0;
                let incorrectCountLocal = 0;
                for (const g of groups) {
                  const max = g.parts.reduce((s, p) => s + p.marks, 0);
                  const earnedForGroup = g.parts.reduce(
                    (s, p) => s + (selfMarks[p.id] ?? 0),
                    0
                  );
                  if (g.parts.every((p) => selfMarks[p.id] !== undefined)) {
                    if (earnedForGroup === max) correctCountLocal++;
                    else if (earnedForGroup === 0) incorrectCountLocal++;
                  }
                }
                try {
                  await fetch(`/api/exam-sessions/${sessionId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      score: pct,
                      correctCount: correctCountLocal,
                      incorrectCount: incorrectCountLocal,
                      graded: true,
                    }),
                  });
                } catch {
                  // Even if the final PATCH fails, the most recent debounced
                  // PATCH has already saved a near-current score. Continue
                  // to history rather than block the user.
                }
              }
              // Marking is finished — drop the autosaved session state.
              autoSave.clear();
              router.push(sessionId ? `${historyHref}/${sessionId}` : historyHref);
            }}
            className={cn(
              "w-full rounded-2xl px-8 py-4 lg:py-5 text-base lg:text-lg font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2",
              !allMarked || finalising
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                : "bg-brand-600 hover:bg-brand-700"
            )}
          >
            {finalising
              ? "Saving…"
              : allMarked
                ? `Finish marking (${selfMarksTotal}/${totalMaxMarks} marks)`
                : "Finish marking"}
            {allMarked && !finalising && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );
}

