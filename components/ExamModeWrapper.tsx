"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import QuestionGroup, { parseMCQAnswer } from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { useAutoSave } from "@/hooks/useAutoSave";
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
  sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B";
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
  showSolutionsAsYouGo = false,
  showTimer = false,
  readingSeconds = 15 * 60,
  writingSeconds = 60 * 60,
  isMcqMode = true,
  showScore = true,
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
      }),
    }).catch(() => {});

    trackEvent("exam_submitted", {
      mode: sectionLabel,
      totalQuestions,
      correctCount: correct,
      score: pct,
      elapsedSeconds,
    });
  }

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
      {/* Timer — hidden after submit */}
      {showTimer && !submitted && (
        <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />
      )}

      {/* Results banner — shown after submit */}
      {submitted && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className={cn(
            "px-6 py-6 lg:px-8 lg:py-8",
            showScore
              ? percentage >= 80 ? "bg-green-50" : percentage >= 50 ? "bg-yellow-50" : "bg-red-50"
              : "bg-blue-50"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className={cn(
                "h-7 w-7 lg:h-8 lg:w-8",
                showScore
                  ? percentage >= 80 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-500"
                  : "text-blue-600"
              )} />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Exam Results</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {/* Score */}
              <div className="rounded-xl bg-white/80 border border-white p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 mb-1">Score</p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {showScore ? (
                    <>{correctCount}<span className="text-lg lg:text-xl text-gray-400">/{totalQuestions}</span></>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              {/* Percentage */}
              <div className="rounded-xl bg-white/80 border border-white p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 mb-1">Percentage</p>
                <p className={cn(
                  "text-3xl lg:text-4xl font-bold",
                  showScore
                    ? percentage >= 80 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"
                    : "text-gray-900"
                )}>
                  {showScore ? `${percentage}%` : "N/A"}
                </p>
              </div>

              {/* Time taken */}
              <div className="rounded-xl bg-white/80 border border-white p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 mb-1">Time Taken</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{formatElapsed(finalTime)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown — only when showScore */}
            {showScore && (
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-black/5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm lg:text-base font-medium text-gray-700">{correctCount} correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm lg:text-base font-medium text-gray-700">{answeredCount - correctCount} incorrect</span>
                </div>
                {answeredCount < totalQuestions && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    <span className="text-sm lg:text-base font-medium text-gray-700">{totalQuestions - answeredCount} unanswered</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions */}
      {groups.map((group, idx) => (
        <QuestionGroup
          key={`${group.examId}-${group.parts[0].questionNumber}-${idx}`}
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
        />
      ))}

      {/* Submit button — after the last question, only before submission */}
      {!submitted && (
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-brand-600 px-8 py-4 lg:py-5 text-base lg:text-lg font-bold text-white hover:bg-brand-700 transition-colors shadow-lg"
          >
            {showScore ? `Submit Exam (${answeredCount}/${totalQuestions} answered)` : "Submit Exam"}
          </button>
        </div>
      )}
    </div>
  );
}
