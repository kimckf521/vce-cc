"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

const DIFFICULTIES = [
  {
    key: "easy",
    label: "Easy",
    card: "bg-green-50 border-green-200",
    text: "text-green-700",
    bar: "bg-green-500",
    btn: "bg-green-100 hover:bg-green-200 text-green-700",
  },
  {
    key: "medium",
    label: "Medium",
    card: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    bar: "bg-amber-500",
    btn: "bg-amber-100 hover:bg-amber-200 text-amber-700",
  },
  {
    key: "hard",
    label: "Hard",
    card: "bg-red-50 border-red-200",
    text: "text-red-700",
    bar: "bg-red-500",
    btn: "bg-red-100 hover:bg-red-200 text-red-700",
  },
] as const;

// [easy%, medium%, hard%] — should sum to 100
export type DiffDist = [number, number, number];

interface Props {
  distribution: DiffDist;
  onChange: (newDist: DiffDist) => void;
  label?: string;
}

const STEP = 5;

export default function DifficultyDistributionControl({ distribution, onChange, label }: Props) {
  const total = distribution[0] + distribution[1] + distribution[2];
  const isValid = total === 100;

  function adjust(index: number, delta: number) {
    const newVal = distribution[index] + delta;
    if (newVal < 0 || newVal > 100) return;
    const next = [...distribution] as DiffDist;
    next[index] = newVal;
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 lg:text-lg">{label ?? "Difficulty Distribution"}</h3>
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}
        >
          {total}%{!isValid && " · must be 100%"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        {DIFFICULTIES.map((d, i) => (
          <div key={d.key} className={cn("rounded-xl border p-3 lg:p-5 space-y-2 lg:space-y-3", d.card)}>
            <p className={cn("text-sm lg:text-base font-semibold", d.text)}>{d.label}</p>

            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => adjust(i, -STEP)}
                disabled={distribution[i] <= 0}
                className={cn(
                  "h-7 w-7 lg:h-8 lg:w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30",
                  d.btn
                )}
              >
                <Minus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </button>
              <span className={cn("text-sm lg:text-base font-bold tabular-nums", d.text)}>
                {distribution[i]}%
              </span>
              <button
                type="button"
                onClick={() => adjust(i, STEP)}
                disabled={distribution[i] >= 100}
                className={cn(
                  "h-7 w-7 lg:h-8 lg:w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30",
                  d.btn
                )}
              >
                <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </button>
            </div>

            <div className="h-1.5 lg:h-2 rounded-full bg-black/5 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-200", d.bar)}
                style={{ width: `${distribution[i]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
