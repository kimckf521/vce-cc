"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import MathContent from "@/components/MathContent";
import FunctionGraph from "@/components/FunctionGraph";
import CartesianGrid from "@/components/CartesianGrid";
import SolutionEditor from "@/components/SolutionEditor";

interface SolutionPart {
  questionId: string;
  part: string | null;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

function SolutionVisual({ imageUrl }: { imageUrl?: string | null }) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("function:")) {
    const cfg = JSON.parse(imageUrl.slice(9));
    return <FunctionGraph {...cfg} />;
  }
  if (imageUrl.startsWith("grid:")) {
    const cfg = JSON.parse(imageUrl.slice(5));
    return <CartesianGrid {...cfg} />;
  }
  return <img src={imageUrl} alt="Solution diagram" className="my-4 max-w-full rounded-lg border border-gray-100 dark:border-gray-800" />;
}

// Parse MCQ solution content into answer letter + explanation
function parseMCQSolution(content: string): { answer: string | null; explanation: string } {
  const m = content.match(/\*\*Answer:\s*([A-E])\*\*/);
  if (!m) return { answer: null, explanation: content };
  const explanation = content.slice(m.index! + m[0].length).trim();
  return { answer: m[1], explanation };
}

interface SolutionModalProps {
  questionLabel: string;
  solutions: SolutionPart[];
  onClose: () => void;
  isAdmin?: boolean;
}

function SolutionSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-6 py-5">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mt-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}

export default function SolutionModal({ questionLabel, solutions, onClose, isAdmin }: SolutionModalProps) {
  const isMultiPart = solutions.length > 1;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Allow one frame for KaTeX to render before hiding skeleton
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Worked Solution — {questionLabel}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {!loaded && <SolutionSkeleton />}
        <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-6 ${loaded ? "" : "sr-only"}`}>
          {solutions.map((s, i) => {
            const mcq = parseMCQSolution(s.content);
            const isMCQ = mcq.answer !== null;
            return (
            <div key={i}>
              {/* Part label if multi-part */}
              {isMultiPart && s.part && (
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-2">
                  Part {s.part.toUpperCase()}
                </p>
              )}

              {/* MCQ: show answer badge then explanation */}
              {isMCQ ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-base font-bold">
                        {mcq.answer}
                      </span>
                      <span className="text-base font-semibold text-green-700 dark:text-green-400">Correct answer</span>
                    </div>
                  </div>
                  {mcq.explanation && <MathContent content={mcq.explanation} />}
                </>
              ) : (
                <MathContent content={s.content} />
              )}

              <SolutionVisual imageUrl={s.imageUrl} />

              {s.videoUrl && (
                <a
                  href={s.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium hover:underline text-sm"
                >
                  Watch video solution →
                </a>
              )}

              {/* Admin inline editor */}
              {isAdmin && (
                <div className="mt-3">
                  <SolutionEditor
                    questionId={s.questionId}
                    initialContent={s.content}
                    initialVideoUrl={s.videoUrl}
                  />
                </div>
              )}

              {/* Divider between parts */}
              {isMultiPart && i < solutions.length - 1 && (
                <div className="mt-6 border-t border-dashed border-gray-200 dark:border-gray-700" />
              )}
            </div>
          );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
