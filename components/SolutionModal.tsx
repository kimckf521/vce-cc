"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import MathContent from "@/components/MathContent";
import FunctionGraph from "@/components/FunctionGraph";
import CartesianGrid from "@/components/CartesianGrid";

interface SolutionPart {
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
  return <img src={imageUrl} alt="Solution diagram" className="my-4 max-w-full rounded-lg border border-gray-100" />;
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
}

export default function SolutionModal({ questionLabel, solutions, onClose }: SolutionModalProps) {
  const isMultiPart = solutions.length > 1;

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
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Worked Solution — {questionLabel}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {solutions.map((s, i) => {
            const mcq = parseMCQSolution(s.content);
            const isMCQ = mcq.answer !== null;
            return (
            <div key={i}>
              {/* Part label if multi-part */}
              {isMultiPart && s.part && (
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600 mb-2">
                  Part {s.part.toUpperCase()}
                </p>
              )}

              {/* MCQ: show answer badge then explanation */}
              {isMCQ ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-base font-bold">
                        {mcq.answer}
                      </span>
                      <span className="text-base font-semibold text-green-700">Correct answer</span>
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
                  className="mt-3 inline-flex items-center gap-1.5 text-brand-600 font-medium hover:underline text-sm"
                >
                  Watch video solution →
                </a>
              )}

              {/* Divider between parts */}
              {isMultiPart && i < solutions.length - 1 && (
                <div className="mt-6 border-t border-dashed border-gray-200" />
              )}
            </div>
          );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
