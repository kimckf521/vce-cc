"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  topics: Topic[];
  distribution: number[]; // index-aligned, values 0-100, should sum to 100
  onChange: (newDist: number[]) => void;
  label?: string;
}

const TOPIC_COLORS = [
  {
    card: "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950",
    bar: "bg-violet-500",
    badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400",
    btn: "border-violet-200 dark:border-violet-800 bg-white dark:bg-violet-950 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900",
  },
  {
    card: "border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950",
    bar: "bg-sky-500",
    badge: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400",
    btn: "border-sky-200 dark:border-sky-800 bg-white dark:bg-sky-950 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900",
  },
  {
    card: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950",
    bar: "bg-amber-500",
    badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400",
    btn: "border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900",
  },
  {
    card: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400",
    btn: "border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900",
  },
];

export default function TopicDistributionControl({ topics, distribution, onChange, label }: Props) {
  const total = distribution.reduce((a, b) => a + b, 0);
  const isValid = total === 100;

  function adjust(index: number, delta: number) {
    const next = distribution.map((v, i) => (i === index ? Math.min(100, Math.max(0, v + delta)) : v));
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        {label && (
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
        )}
        <div className={cn(
          "ml-auto rounded-full px-3 py-1 text-xs font-semibold",
          isValid ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400"
        )}>
          {isValid ? `Total: ${total}%` : `Total: ${total}% — must be 100%`}
        </div>
      </div>

      {/* Topic cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {topics.map((topic, i) => {
          const colors = TOPIC_COLORS[i % TOPIC_COLORS.length];
          const pct = distribution[i] ?? 0;

          return (
            <div
              key={topic.id}
              className={cn("rounded-xl border p-4 lg:p-5 space-y-3 lg:space-y-4", colors.card)}
            >
              {/* Topic name + percentage */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm lg:text-base font-medium text-gray-800 dark:text-gray-200 leading-tight">{topic.name}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs lg:text-sm font-bold shrink-0", colors.badge)}>
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 lg:h-2.5 rounded-full bg-white/70 dark:bg-black/20 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", colors.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Minus / Plus buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjust(i, -5)}
                  disabled={pct <= 0}
                  className={cn(
                    "flex items-center justify-center rounded-lg border p-1.5 lg:p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    colors.btn
                  )}
                  aria-label={`Decrease ${topic.name} percentage`}
                >
                  <Minus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
                <div className="flex-1 text-center text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                  {pct}%
                </div>
                <button
                  type="button"
                  onClick={() => adjust(i, 5)}
                  disabled={pct >= 100}
                  className={cn(
                    "flex items-center justify-center rounded-lg border p-1.5 lg:p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    colors.btn
                  )}
                  aria-label={`Increase ${topic.name} percentage`}
                >
                  <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
