"use client";

import { useState } from "react";
import { CheckCircle, XCircle, BookmarkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";
import SolutionModal from "@/components/SolutionModal";

type AttemptStatus = "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW" | null;

interface QuestionCardProps {
  id: string;
  questionNumber: number;
  part?: string | null;
  marks: number;
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  topic: string;
  subtopic?: string | null;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solution?: {
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
  } | null;
  initialStatus?: AttemptStatus;
  onStatusChange?: (id: string, status: AttemptStatus) => void;
}

const difficultyStyles = {
  EASY: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  HARD: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const difficultyLabel = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

export default function QuestionCard({
  id,
  questionNumber,
  part,
  marks,
  year,
  examType,
  topic,
  subtopic,
  content,
  difficulty,
  solution,
  initialStatus = null,
  onStatusChange,
}: QuestionCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [status, setStatus] = useState<AttemptStatus>(initialStatus);

  const questionLabel = `Q${questionNumber}${part ? part.toUpperCase() : ""} (${year} Exam ${examType === "EXAM_1" ? "1" : "2"})`;

  function setAndNotify(s: AttemptStatus) {
    setStatus(s);
    onStatusChange?.(id, s);
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {year} · {examType === "EXAM_1" ? "Exam 1" : "Exam 2"} · Q{questionNumber}
              {part ? part.toUpperCase() : ""}
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", difficultyStyles[difficulty])}>
              {difficultyLabel[difficulty]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 px-2.5 py-0.5 text-xs font-medium">
              {topic}
            </span>
            {subtopic && (
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 text-xs font-medium">
                {subtopic}
              </span>
            )}
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 text-xs font-medium">
              {marks} {marks === 1 ? "mark" : "marks"}
            </span>
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setAndNotify(status === "CORRECT" ? null : "CORRECT")}
            title="Mark correct"
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              status === "CORRECT" ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" : "text-gray-300 dark:text-gray-600 hover:text-green-500"
            )}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => setAndNotify(status === "INCORRECT" ? null : "INCORRECT")}
            title="Mark incorrect"
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              status === "INCORRECT" ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" : "text-gray-300 dark:text-gray-600 hover:text-red-500"
            )}
          >
            <XCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => setAndNotify(status === "NEEDS_REVIEW" ? null : "NEEDS_REVIEW")}
            title="Needs review"
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              status === "NEEDS_REVIEW" ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400" : "text-gray-300 dark:text-gray-600 hover:text-yellow-500"
            )}
          >
            <BookmarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Question content */}
      <div className="px-5 pb-4 text-sm leading-relaxed">
        <MathContent content={content} />
      </div>

      {/* Solution button */}
      {solution && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowSolution(true)}
            className="rounded-lg px-4 py-1.5 text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Solution
          </button>
        </div>
      )}

      {/* Solution modal */}
      {showSolution && solution && (
        <SolutionModal
          questionLabel={questionLabel}
          solutions={[{ questionId: id, part: part ?? null, content: solution.content, videoUrl: solution.videoUrl }]}
          onClose={() => setShowSolution(false)}
        />
      )}
    </div>
  );
}
