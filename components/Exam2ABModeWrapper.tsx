"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trophy, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import QuestionGroup, { parseMCQAnswer } from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import SelfMarkStepper from "@/components/SelfMarkStepper";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { useAutoSave } from "@/hooks/useAutoSave";
import NavigationGuard from "@/components/NavigationGuard";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

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

interface Exam2ABModeWrapperProps {
  groupsA: QuestionGroupData[];
  groupsB: QuestionGroupData[];
  /** "Show solutions as I go" toggle from setup */
  showSolutionsAsYouGo?: boolean;
  /** Whether to show the countdown timer */
  showTimer?: boolean;
  readingSeconds?: number;
  writingSeconds?: number;
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

export default function Exam2ABModeWrapper({
  groupsA,
  groupsB,
  historyHref = "/history",
  showSolutionsAsYouGo = false,
  showTimer = false,
  readingSeconds = 15 * 60,
  writingSeconds = 2 * 60 * 60,
}: Exam2ABModeWrapperProps) {
  useSessionRefresh();
  const router = useRouter();

  // Stable session key based on question IDs
  const sessionKey = useMemo(
    () => "exam2ab:" + groupsA.map((g) => g.parts[0]?.id).join(","),
    [groupsA]
  );
  const autoSave = useAutoSave(sessionKey);

  // Section A — MCQ selections (one letter per question id).
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const saved = autoSave.restore();
    return saved?.selections ?? {};
  });
  // Section B — self-marks keyed by part id (one number per part).
  const [selfMarks, setSelfMarks] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [finalising, setFinalising] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const saved = autoSave.restore();
    return saved?.elapsedSeconds ?? 0;
  });
  const [finalTime, setFinalTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Section A answer key — questionId → correct letter, derived from each
  // MCQ's solution content via the shared parseMCQAnswer helper.
  const answerKey = useMemo(() => {
    const key: Record<string, string | null> = {};
    for (const group of groupsA) {
      for (const part of group.parts) {
        key[part.id] = parseMCQAnswer(part.solution?.content);
      }
    }
    return key;
  }, [groupsA]);

  // Marks math
  const sectionAMarks = groupsA.reduce(
    (s, g) => s + g.parts.reduce((p, part) => p + part.marks, 0),
    0
  );
  const sectionBMarks = groupsB.reduce(
    (s, g) => s + g.parts.reduce((p, part) => p + part.marks, 0),
    0
  );
  const totalMaxMarks = sectionAMarks + sectionBMarks;

  const sectionACorrectCount = useMemo(() => {
    let n = 0;
    for (const group of groupsA) {
      for (const part of group.parts) {
        const ans = answerKey[part.id];
        if (ans && selections[part.id] === ans) n++;
      }
    }
    return n;
  }, [groupsA, answerKey, selections]);
  // Each Section A MCQ is worth 1 mark, so correct count == marks earned.
  const sectionAEarned = sectionACorrectCount;
  const sectionBEarned = useMemo(
    () => Object.values(selfMarks).reduce((a, b) => a + b, 0),
    [selfMarks]
  );
  const totalEarned = sectionAEarned + sectionBEarned;
  const totalPercentage =
    totalMaxMarks > 0 ? Math.round((totalEarned / totalMaxMarks) * 100) : 0;

  const totalSectionBParts = useMemo(
    () => groupsB.reduce((s, g) => s + g.parts.length, 0),
    [groupsB]
  );
  const sectionBPartsMarked = Object.keys(selfMarks).length;
  const allSectionBMarked =
    totalSectionBParts === 0 || sectionBPartsMarked === totalSectionBParts;

  function handleMcqSelect(questionId: string, letter: string) {
    if (submitted) return;
    setSelections((prev) => {
      const next = { ...prev, [questionId]: letter };
      autoSave.updateSelections(next);
      return next;
    });
  }

  function handleSelfMark(partId: string, earned: number) {
    setSelfMarks((prev) => ({ ...prev, [partId]: earned }));
  }

  // Debounced PATCH: 400ms after the last self-mark click, push the latest
  // aggregate score to the server.
  useEffect(() => {
    if (!sessionId) return;
    if (Object.keys(selfMarks).length === 0) return;

    const timeout = setTimeout(() => {
      const earnedTotal =
        sectionAEarned + Object.values(selfMarks).reduce((a, b) => a + b, 0);
      const pct =
        totalMaxMarks > 0
          ? Math.round((earnedTotal / totalMaxMarks) * 100)
          : 0;

      // "Correct" = MCQs answered correctly (Section A) + Section B parts
      // awarded full marks. "Incorrect" = wrongly answered MCQs + Section B
      // parts awarded zero. Partials fall into neither bucket.
      let correctCountLocal = sectionACorrectCount;
      let incorrectCountLocal = 0;
      for (const group of groupsA) {
        for (const part of group.parts) {
          const ans = answerKey[part.id];
          if (ans && selections[part.id] && selections[part.id] !== ans) {
            incorrectCountLocal++;
          }
        }
      }
      for (const g of groupsB) {
        for (const part of g.parts) {
          const earned = selfMarks[part.id];
          if (earned === undefined) continue;
          if (earned === part.marks) correctCountLocal++;
          else if (earned === 0) incorrectCountLocal++;
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
  }, [
    selfMarks,
    sessionId,
    totalMaxMarks,
    groupsB,
    groupsA,
    answerKey,
    selections,
    sectionAEarned,
    sectionACorrectCount,
  ]);

  function handleSubmit() {
    setFinalTime(elapsedSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    autoSave.markSubmitted();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const totalQuestions = groupsA.length + groupsB.length;
    const initialPct =
      totalMaxMarks > 0 ? Math.round((sectionAEarned / totalMaxMarks) * 100) : 0;

    // Per-question manifest. Section A is single-part (1 row per MCQ) with
    // the user's selection + whether it was correct. Section B questions
    // are multi-part EXTENDED_RESPONSE items where each part has a
    // synthetic id like `${itemId}::a` — collapse those down to ONE row
    // per parent QuestionSetItem (the FK requires a real id) so the row
    // represents the whole question, not the part.
    const sessionQuestions = [
      ...groupsA.flatMap((group, gIdx) =>
        group.parts.map((p, pIdx) => {
          const selected = selections[p.id] ?? null;
          const ans = answerKey[p.id];
          return {
            questionSetItemId: p.id,
            order: gIdx * 100 + pIdx,
            section: "A",
            selectedOption: selected,
            correct: ans ? selected === ans : null,
          };
        })
      ),
      ...groupsB.map((group, gIdx) => {
        // Strip the `::partLetter` suffix to get the parent id. All parts
        // of a single Section B group share the same parent.
        const firstPartId = group.parts[0]?.id ?? "";
        const sep = firstPartId.indexOf("::");
        const parentId = sep === -1 ? firstPartId : firstPartId.slice(0, sep);
        return {
          questionSetItemId: parentId,
          order: 10000 + gIdx * 100,
          section: "B",
          selectedOption: null,
          correct: null,
        };
      }),
    ];

    fetch("/api/exam-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "Exam 2A & 2B",
        totalQuestions,
        // Initial graded state: only Section A MCQs counted. Section B
        // remains 0 until the user self-marks (then PATCH lifts the score).
        // graded:false keeps the history row marked "not finalised" in
        // the meantime — flipping to true happens via PATCH.
        correctCount: sectionACorrectCount,
        incorrectCount: 0,
        score: initialPct,
        elapsedSeconds,
        graded: false,
        questions: sessionQuestions,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session?.id) setSessionId(data.session.id);
      })
      .catch(() => {});

    trackEvent("exam_submitted", {
      mode: "Exam 2A & 2B",
      totalQuestions,
      correctCount: sectionACorrectCount,
      score: initialPct,
      elapsedSeconds,
    });
  }

  const shouldShowSolutions = submitted || showSolutionsAsYouGo;
  const hasResultColor = submitted;

  // Banner colour follows the running total once submit happens.
  const bannerPct = totalPercentage;

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Warn before leaving while Section B self-marking is unfinished. */}
      <NavigationGuard
        enabled={submitted && !finalising}
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
      {submitted && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div
            className={cn(
              "px-6 py-6 lg:px-8 lg:py-8",
              hasResultColor
                ? bannerPct >= 80
                  ? "bg-green-50 dark:bg-green-950"
                  : bannerPct >= 50
                    ? "bg-yellow-50 dark:bg-yellow-950"
                    : "bg-red-50 dark:bg-red-950"
                : "bg-blue-50 dark:bg-blue-950"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy
                className={cn(
                  "h-7 w-7 lg:h-8 lg:w-8",
                  bannerPct >= 80
                    ? "text-green-600 dark:text-green-400"
                    : bannerPct >= 50
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                )}
              />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Self-mark Section B
              </h2>
            </div>

            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-4">
              Section A is auto-graded from your MCQ selections. For Section B, check each solution and award yourself marks using the stepper beneath each question. Your total updates as you go.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">
                  Marks earned
                </p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {totalEarned}
                  <span className="text-lg lg:text-xl text-gray-400 dark:text-gray-500">
                    /{totalMaxMarks}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">
                  Percentage
                </p>
                <p
                  className={cn(
                    "text-3xl lg:text-4xl font-bold",
                    bannerPct >= 80
                      ? "text-green-600 dark:text-green-400"
                      : bannerPct >= 50
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  )}
                >
                  {totalPercentage}%
                </p>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">
                  Time taken
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-500" />
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatElapsed(finalTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Per-section breakdown */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-4 border-t border-black/5 text-sm lg:text-base text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium">
                  Section A: {sectionAEarned}/{sectionAMarks}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  · {sectionACorrectCount} of {groupsA.length} correct
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">
                  Section B: {sectionBEarned}/{sectionBMarks}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  · {sectionBPartsMarked} of {totalSectionBParts} parts marked
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section A — Multiple Choice */}
      <div className="space-y-5 lg:space-y-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 lg:pb-3">
          Section A — Multiple choice ({groupsA.length} questions · {sectionAMarks} marks)
        </h2>
        <div className="space-y-4 lg:space-y-5">
          {groupsA.map((group, idx) => (
            <QuestionGroup
              key={`a-${group.examId}-${group.parts[0].questionNumber}-${idx}`}
              year={group.year}
              examType={group.examType}
              sectionLabel="Exam 2A"
              questionIndex={idx + 1}
              topic={group.topicName}
              subtopics={group.subtopics}
              calculatorAllowed={true}
              parts={group.parts}
              examMode={true}
              revealAnswers={submitted}
              showSolutionButton={shouldShowSolutions}
              onMcqSelect={handleMcqSelect}
              // The parent server component re-runs the random picker on
              // every render, so a router.refresh() triggered by a status
              // or bookmark save would silently swap the questions out
              // from under the user. The optimistic local state is enough.
              disableServerRefresh
            />
          ))}
        </div>
      </div>

      {/* Section B — Extended Response */}
      <div className="space-y-5 lg:space-y-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 lg:pb-3">
          Section B — Extended response ({groupsB.length} questions · {sectionBMarks} marks)
        </h2>
        <div className="space-y-4 lg:space-y-5">
          {groupsB.map((group, idx) => (
            <div key={`b-${group.examId}-${group.parts[0].questionNumber}-${idx}`}>
              <QuestionGroup
                year={group.year}
                examType={group.examType}
                sectionLabel="Exam 2B"
                questionIndex={idx + 1}
                topic={group.topicName}
                subtopics={group.subtopics}
                calculatorAllowed={true}
                parts={group.parts}
                examMode={true}
                revealAnswers={false}
                showSolutionButton={shouldShowSolutions}
                // Same reason as Section A: the parent re-randomises on every
                // server render, so any router.refresh() would shuffle the
                // questions mid-exam. Use optimistic local state only.
                disableServerRefresh
              />
              {submitted && (
                <SelfMarkStepper
                  parts={group.parts}
                  selfMarks={selfMarks}
                  onChange={handleSelfMark}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit button — pre-submit only */}
      {!submitted && (
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-brand-600 px-8 py-4 lg:py-5 text-base lg:text-lg font-bold text-white hover:bg-brand-700 transition-colors shadow-lg"
          >
            Submit exam ({Object.keys(selections).length}/{groupsA.length} MCQs answered)
          </button>
        </div>
      )}

      {/* Finish-marking footer — post-submit */}
      {submitted && (
        <div className="pt-2 pb-2 space-y-2">
          {!allSectionBMarked && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Mark every Section B part to finish — {sectionBPartsMarked}/{totalSectionBParts} done.
            </p>
          )}
          <button
            type="button"
            disabled={!allSectionBMarked || finalising}
            onClick={async () => {
              setFinalising(true);
              if (sessionId) {
                const earnedTotal =
                  sectionAEarned +
                  Object.values(selfMarks).reduce((a, b) => a + b, 0);
                const pct =
                  totalMaxMarks > 0
                    ? Math.round((earnedTotal / totalMaxMarks) * 100)
                    : 0;
                let correctCountLocal = sectionACorrectCount;
                let incorrectCountLocal = 0;
                for (const group of groupsA) {
                  for (const part of group.parts) {
                    const ans = answerKey[part.id];
                    if (
                      ans &&
                      selections[part.id] &&
                      selections[part.id] !== ans
                    ) {
                      incorrectCountLocal++;
                    }
                  }
                }
                for (const g of groupsB) {
                  for (const part of g.parts) {
                    const earned = selfMarks[part.id];
                    if (earned === undefined) continue;
                    if (earned === part.marks) correctCountLocal++;
                    else if (earned === 0) incorrectCountLocal++;
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
                  // Last debounced PATCH is already saved; continue.
                }
              }
              router.push(sessionId ? `${historyHref}/${sessionId}` : historyHref);
            }}
            className={cn(
              "w-full rounded-2xl px-8 py-4 lg:py-5 text-base lg:text-lg font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2",
              !allSectionBMarked || finalising
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                : "bg-brand-600 hover:bg-brand-700"
            )}
          >
            {finalising
              ? "Saving…"
              : allSectionBMarked
                ? `Finish marking (${totalEarned}/${totalMaxMarks} marks)`
                : "Finish marking"}
            {allSectionBMarked && !finalising && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );
}
