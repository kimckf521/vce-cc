"use client";

import { useState } from "react";
import type React from "react";
import { CheckCircle, XCircle, BookmarkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";
import SolutionModal from "@/components/SolutionModal";
import CartesianGrid from "@/components/CartesianGrid";
import FunctionGraph from "@/components/FunctionGraph";

type AttemptStatus = "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW" | null;

interface QuestionPart {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  imageUrl?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solution?: { content: string; imageUrl?: string | null; videoUrl?: string | null } | null;
  initialStatus?: AttemptStatus;
}

function QuestionVisual({ imageUrl }: { imageUrl?: string | null }) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("grid:")) {
    const cfg = JSON.parse(imageUrl.slice(5));
    return <CartesianGrid {...cfg} />;
  }
  if (imageUrl.startsWith("function:")) {
    const cfg = JSON.parse(imageUrl.slice(9));
    return <FunctionGraph {...cfg} />;
  }
  return <img src={imageUrl} alt="Question diagram" className="my-4 max-w-full rounded-lg border border-gray-100" />;
}

interface QuestionGroupProps {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  topic: string;
  subtopics?: string[];
  parts: QuestionPart[];
}

const difficultyStyles = {
  EASY: "bg-green-50 text-green-700",
  MEDIUM: "bg-yellow-50 text-yellow-700",
  HARD: "bg-red-50 text-red-700",
};
const difficultyLabel = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

// Parse preamble out of the first part's content if it uses ---PREAMBLE--- marker
function parsePreamble(content: string): { preamble: string | null; question: string } {
  if (!content.startsWith("---PREAMBLE---")) return { preamble: null, question: content };
  const [, rest] = content.split("---PREAMBLE---");
  const [preambleRaw, questionRaw] = rest.split("---QUESTION---");
  return { preamble: preambleRaw.trim(), question: questionRaw?.trim() ?? "" };
}

// Parse MCQ content into question body + lettered options
function parseMCQContent(content: string): { body: string; options: { letter: string; text: string }[] } | null {
  const optionRegex = /\*\*([A-E])\.\*\*/g;
  const matches = Array.from(content.matchAll(optionRegex));
  if (matches.length < 2) return null;
  const body = content.slice(0, matches[0].index).trim();
  const options: { letter: string; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const letter = matches[i][1];
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
    options.push({ letter, text: content.slice(start, end).trim() });
  }
  return { body, options };
}

// Extract correct answer letter from solution content
function parseMCQAnswer(solutionContent?: string | null): string | null {
  if (!solutionContent) return null;
  const m = solutionContent.match(/\*\*Answer:\s*([A-E])\*\*/);
  return m ? m[1] : null;
}

// Interactive lettered option list for MCQ questions
function InteractiveMCQOptions({
  options,
  correctAnswer,
  selectedOption,
  onSelect,
}: {
  options: { letter: string; text: string }[];
  correctAnswer: string | null;
  selectedOption: string | null;
  onSelect: (letter: string) => void;
}) {
  const hasAnswered = selectedOption !== null;

  return (
    <div className="mt-3 space-y-2">
      {options.map(({ letter, text }) => {
        const isSelected = selectedOption === letter;
        const isCorrect = correctAnswer === letter;

        let wrapperStyle = "border-gray-100 bg-gray-50 hover:border-brand-200 hover:bg-brand-50";
        let badgeStyle = "border-gray-300 text-gray-500";
        let icon: React.ReactNode = null;

        if (hasAnswered) {
          if (isCorrect) {
            wrapperStyle = "border-green-200 bg-green-50";
            badgeStyle = "border-green-500 bg-green-500 text-white";
            if (isSelected) icon = <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />;
          } else if (isSelected) {
            wrapperStyle = "border-red-200 bg-red-50";
            badgeStyle = "border-red-400 bg-red-400 text-white";
            icon = <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />;
          } else {
            wrapperStyle = "border-gray-100 bg-gray-50 opacity-50";
          }
        }

        return (
          <button
            key={letter}
            onClick={() => !hasAnswered && onSelect(letter)}
            disabled={hasAnswered}
            className={cn(
              "w-full flex items-start gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors",
              wrapperStyle,
              !hasAnswered && "cursor-pointer",
              hasAnswered && "cursor-default"
            )}
          >
            <span className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
              badgeStyle
            )}>
              {letter}
            </span>
            <div className="flex-1 text-base leading-relaxed pt-0.5">
              <MathContent content={text} />
            </div>
            {icon}
          </button>
        );
      })}
    </div>
  );
}

// Render content that may contain [GRAPH] placeholder (non-MCQ only)
function PartContent({ content, imageUrl }: { content: string; imageUrl?: string | null }) {
  if (content.includes("[GRAPH]")) {
    const segments = content.split("[GRAPH]");
    return (
      <>
        {segments.map((seg, si) => (
          <div key={si}>
            {seg.trim() && <div className="text-base leading-relaxed"><MathContent content={seg.trim()} /></div>}
            {si < segments.length - 1 && <QuestionVisual imageUrl={imageUrl} />}
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      <div className="text-base leading-relaxed"><MathContent content={content} /></div>
      <QuestionVisual imageUrl={imageUrl} />
    </>
  );
}

export default function QuestionGroup({ year, examType, topic, subtopics, parts }: QuestionGroupProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AttemptStatus>>(
    Object.fromEntries(parts.map((p) => [p.id, p.initialStatus ?? null]))
  );
  const [mcqSelections, setMcqSelections] = useState<Record<string, string | null>>({});

  const questionNumber = parts[0].questionNumber;
  const totalMarks = parts.reduce((sum, p) => sum + p.marks, 0);
  const hasParts = parts.length > 1 || parts.some((p) => p.part !== null);
  const hasSolution = parts.some((p) => p.solution);
  const overallDifficulty = parts[0].difficulty;
  const questionLabel = `Q${questionNumber} (${year} Exam ${examType === "EXAM_1" ? "1" : "2"})`;

  // Extract shared preamble from first part if present
  const { preamble, question: firstPartQuestion } = parsePreamble(parts[0].content);
  const renderedParts = preamble
    ? [{ ...parts[0], content: firstPartQuestion }, ...parts.slice(1)]
    : parts;

  const combinedSolutions = parts
    .filter((p) => p.solution)
    .map((p) => ({ part: p.part, content: p.solution!.content, imageUrl: p.solution!.imageUrl, videoUrl: p.solution!.videoUrl }));

  function toggleStatus(id: string, s: AttemptStatus) {
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === s ? null : s }));
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              {year} · {examType === "EXAM_1" ? "Exam 1" : "Exam 2"} · Q{questionNumber}
            </span>
            <span className={cn("rounded-full px-3 py-1 text-sm font-medium", difficultyStyles[overallDifficulty])}>
              {difficultyLabel[overallDifficulty]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-sm font-medium">{topic}</span>
            {subtopics?.map((s) => (
              <span key={s} className="rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-sm font-medium">{s}</span>
            ))}
            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-sm font-medium">
              {totalMarks} {totalMarks === 1 ? "mark" : "marks"}
            </span>
          </div>
        </div>
      </div>

      {/* Shared preamble (above all parts) */}
      {preamble && (
        <div className="px-5 pb-2">
          <PartContent content={preamble} imageUrl={parts[0].imageUrl} />
        </div>
      )}

      {/* Question body — all parts */}
      <div className="px-5 pb-4 space-y-4">
        {renderedParts.map((p, i) => (
          <div key={p.id}>
            {/* Part label row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {hasParts && p.part && (
                  <span className="text-base font-bold text-gray-800">({p.part.toLowerCase()})</span>
                )}
                <span className="text-sm text-gray-400">{p.marks} {p.marks === 1 ? "mark" : "marks"}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleStatus(p.id, "CORRECT")} title="Mark correct"
                  className={cn("rounded-lg p-1 transition-colors", statuses[p.id] === "CORRECT" ? "bg-green-100 text-green-600" : "text-gray-200 hover:text-green-400")}>
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button onClick={() => toggleStatus(p.id, "INCORRECT")} title="Mark incorrect"
                  className={cn("rounded-lg p-1 transition-colors", statuses[p.id] === "INCORRECT" ? "bg-red-100 text-red-600" : "text-gray-200 hover:text-red-400")}>
                  <XCircle className="h-4 w-4" />
                </button>
                <button onClick={() => toggleStatus(p.id, "NEEDS_REVIEW")} title="Needs review"
                  className={cn("rounded-lg p-1 transition-colors", statuses[p.id] === "NEEDS_REVIEW" ? "bg-yellow-100 text-yellow-600" : "text-gray-200 hover:text-yellow-400")}>
                  <BookmarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Part content — interactive for MCQ, standard otherwise */}
            {(() => {
              const mcqParsed = parseMCQContent(p.content);
              if (mcqParsed) {
                return (
                  <>
                    <div className="text-base leading-relaxed"><MathContent content={mcqParsed.body} /></div>
                    <QuestionVisual imageUrl={preamble ? null : p.imageUrl} />
                    <InteractiveMCQOptions
                      options={mcqParsed.options}
                      correctAnswer={parseMCQAnswer(p.solution?.content)}
                      selectedOption={mcqSelections[p.id] ?? null}
                      onSelect={(letter) => setMcqSelections((prev) => ({ ...prev, [p.id]: letter }))}
                    />
                    {mcqSelections[p.id] !== undefined && mcqSelections[p.id] !== null && (
                      <button
                        onClick={() => setMcqSelections((prev) => ({ ...prev, [p.id]: null }))}
                        className="mt-2 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
                      >
                        Try again
                      </button>
                    )}
                  </>
                );
              }
              return <PartContent content={p.content} imageUrl={preamble ? null : p.imageUrl} />;
            })()}

            {i < renderedParts.length - 1 && (
              <div className="mt-4 border-t border-dashed border-gray-100" />
            )}
          </div>
        ))}
      </div>

      {/* Single solution button at the bottom */}
      {hasSolution && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-50">
          <button
            onClick={() => setShowSolution(true)}
            className="rounded-xl px-6 py-2.5 text-base font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Show Solution
          </button>
        </div>
      )}

      {/* Combined solution modal */}
      {showSolution && (
        <SolutionModal
          questionLabel={questionLabel}
          solutions={combinedSolutions}
          onClose={() => setShowSolution(false)}
        />
      )}
    </div>
  );
}
