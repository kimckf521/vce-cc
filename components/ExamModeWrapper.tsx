"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
   * Each stepper change PATCHes the session score.
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
  const [submitted, setSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const saved = autoSave.restore();
    return saved?.elapsedSeconds ?? 0;
  });
  const [finalTime, setFinalTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();

  // Self-marking (Exam 1 / Exam 2B — modes without auto-grading).
  // Keyed by part id; value is the marks the user awarded themselves.
  const [selfMarks, setSelfMarks] = useState<Record<string, number>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  // Start elapsed timer on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        autoSave.updateElapsed(prev + 1);
        return prev + 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoSave]);

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
    autoSave.markSubmitted();
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
    const stripSuffix = (id: string) => {
      const sep = id.indexOf("::");
      return sep === -1 ? id : id.slice(0, sep);
    };
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
        const parentId = stripSuffix(part.id);
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
        if (data?.session?.id) setSessionId(data.session.id);
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

  // Update one part's self-mark. The functional setter keeps back-to-back
  // clicks composable across React's batching; the server-side PATCH is
  // debounced via a useEffect below so each click fires at most once and
  // the updater stays pure.
  function handleSelfMark(partId: string, earned: number) {
    setSelfMarks((prev) => ({ ...prev, [partId]: earned }));
  }

  // Debounced PATCH: 400ms after the last stepper click, send the aggregate
  // score to the server. Avoids hammering the API when the student clicks
  // through their marks quickly.
  useEffect(() => {
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
  }, [selfMarks, sessionId, totalMaxMarks, groups]);

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
              // Cancel the pending debounced PATCH and send the final state
              // synchronously so the user lands on /history with the latest
              // score already persisted.
              if (sessionId) {
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
                    }),
                  });
                } catch {
                  // Even if the final PATCH fails, the most recent debounced
                  // PATCH has already saved a near-current score. Continue
                  // to history rather than block the user.
                }
              }
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

