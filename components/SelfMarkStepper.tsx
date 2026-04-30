"use client";

import { cn } from "@/lib/utils";

/**
 * Self-mark stepper — rendered beneath each question after the user submits
 * a short-answer / extended-response exam. One row per part, with buttons
 * 0…marks so students can award themselves partial credit.
 *
 * Stateless / presentational — the parent owns the `selfMarks` state and
 * is responsible for persisting changes (debounced PATCH, etc.).
 */
export interface SelfMarkPart {
  id: string;
  part: string | null;
  marks: number;
}

interface Props {
  parts: SelfMarkPart[];
  selfMarks: Record<string, number>;
  onChange: (partId: string, earned: number) => void;
}

export default function SelfMarkStepper({ parts, selfMarks, onChange }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 lg:px-5 lg:py-4">
      <p className="text-[10px] lg:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">
        Self-Mark
      </p>
      <div className="space-y-2.5">
        {parts.map((p) => {
          const current = selfMarks[p.id];
          return (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              {parts.length > 1 && (
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                  {p.part ? `(${p.part.toLowerCase()})` : "Question"}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: p.marks + 1 }, (_, i) => i).map((n) => {
                  const selected = current === n;
                  const isFull = n === p.marks;
                  const isZero = n === 0;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChange(p.id, n)}
                      className={cn(
                        "rounded-lg px-3 py-1 text-sm font-semibold tabular-nums transition-colors border",
                        selected
                          ? isFull
                            ? "bg-green-600 border-green-600 text-white"
                            : isZero
                              ? "bg-red-600 border-red-600 text-white"
                              : "bg-yellow-500 border-yellow-500 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                  / {p.marks} {p.marks === 1 ? "mark" : "marks"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
