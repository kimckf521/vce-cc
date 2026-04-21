"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Clock, Trophy } from "lucide-react";
import QuestionGroup from "@/components/QuestionGroup";
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

interface Exam2ABModeWrapperProps {
  groupsA: QuestionGroupData[];
  groupsB: QuestionGroupData[];
  /** "Show solutions as I go" toggle from setup */
  showSolutionsAsYouGo?: boolean;
  /** Whether to show the countdown timer */
  showTimer?: boolean;
  readingSeconds?: number;
  writingSeconds?: number;
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
  showSolutionsAsYouGo = false,
  showTimer = false,
  readingSeconds = 15 * 60,
  writingSeconds = 2 * 60 * 60,
}: Exam2ABModeWrapperProps) {
  useSessionRefresh();

  // Stable session key based on question IDs
  const sessionKey = useMemo(
    () => "exam2ab:" + groupsA.map((g) => g.parts[0]?.id).join(","),
    [groupsA]
  );
  const autoSave = useAutoSave(sessionKey);

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

  function handleSubmit() {
    setFinalTime(elapsedSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    autoSave.markSubmitted();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Persist the session + per-question manifest. Exam 2A & 2B is open-ended
    // (the MCQ section is bundled with extended response), so it's flagged
    // ungraded — the score column stays at 0 until the user marks it.
    const totalQuestions = groupsA.length + groupsB.length;
    const sessionQuestions = [
      ...groupsA.flatMap((group, gIdx) =>
        group.parts.map((p, pIdx) => ({
          questionSetItemId: p.id,
          order: gIdx * 100 + pIdx,
          section: "A",
          selectedOption: null,
          correct: null,
        }))
      ),
      ...groupsB.flatMap((group, gIdx) =>
        group.parts.map((p, pIdx) => ({
          questionSetItemId: p.id,
          order: 10000 + gIdx * 100 + pIdx,
          section: "B",
          selectedOption: null,
          correct: null,
        }))
      ),
    ];

    fetch("/api/exam-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "Exam 2A & 2B",
        totalQuestions,
        correctCount: 0,
        incorrectCount: 0,
        score: 0,
        elapsedSeconds,
        graded: false,
        questions: sessionQuestions,
      }),
    }).catch(() => {});

    trackEvent("exam_submitted", {
      mode: "Exam 2A & 2B",
      totalQuestions,
      correctCount: 0,
      score: 0,
      elapsedSeconds,
    });
  }

  const shouldShowSolutions = submitted || showSolutionsAsYouGo;

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Timer — hidden after submit */}
      {showTimer && !submitted && (
        <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />
      )}

      {/* Results banner — shown after submit */}
      {submitted && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-6 py-6 lg:px-8 lg:py-8 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Exam Results</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {/* Score */}
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Score</p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">N/A</p>
              </div>

              {/* Percentage */}
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Percentage</p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">N/A</p>
              </div>

              {/* Time taken */}
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 p-4 lg:p-5">
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Time Taken</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-500" />
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{formatElapsed(finalTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section A — Multiple Choice */}
      <div className="space-y-5 lg:space-y-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 lg:pb-3">
          Section A — Multiple Choice ({groupsA.length} questions ·{" "}
          {groupsA.reduce(
            (acc, g) => acc + g.parts.reduce((p, part) => p + part.marks, 0),
            0
          )}{" "}
          marks)
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
              revealAnswers={false}
              showSolutionButton={shouldShowSolutions}
            />
          ))}
        </div>
      </div>

      {/* Section B — Extended Response */}
      <div className="space-y-5 lg:space-y-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 lg:pb-3">
          Section B — Extended Response ({groupsB.length} questions ·{" "}
          {groupsB.reduce(
            (acc, g) => acc + g.parts.reduce((p, part) => p + part.marks, 0),
            0
          )}{" "}
          marks)
        </h2>
        <div className="space-y-4 lg:space-y-5">
          {groupsB.map((group, idx) => (
            <QuestionGroup
              key={`b-${group.examId}-${group.parts[0].questionNumber}-${idx}`}
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
            />
          ))}
        </div>
      </div>

      {/* Submit button — after the last question, only before submission */}
      {!submitted && (
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-brand-600 px-8 py-4 lg:py-5 text-base lg:text-lg font-bold text-white hover:bg-brand-700 transition-colors shadow-lg"
          >
            Submit Exam
          </button>
        </div>
      )}
    </div>
  );
}
