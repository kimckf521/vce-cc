"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Loader2,
  Shuffle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentItemView } from "@/lib/teacher-assessments";
import MathContent from "@/components/MathContent";
import { asParts, ItemMetaChips, type ItemPart } from "./itemMeta";

export type ItemAction = "up" | "down" | "shuffle" | "remove";

interface ItemCardProps {
  item: AssessmentItemView;
  /** 0-based position in the paper. */
  index: number;
  /** Total items in the paper (bounds the move buttons). */
  count: number;
  /** True while ANY mutation is in flight — all controls disable. */
  disabled: boolean;
  /** This card's own in-flight action, shown as a spinner on its control. */
  pendingAction: ItemAction | null;
  /** Transient inline note (shuffle 409, reorder failure). */
  note?: string;
  onMove: (dir: -1 | 1) => void;
  onShuffle: () => void;
  onRemove: () => void;
}

const iconBtn =
  "rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition disabled:opacity-40";

// First sub-part label token in a flat content blob — "**a.**", "(a)", "a.",
// "a)" — mirroring SUBPART_LABEL_SOURCE in lib/paper-assembler.ts.
const FIRST_PART_LABEL_RE =
  /(?:^|\s)(?:\*\*\s*\(?a\)?[.)]?\s*\*\*|\(a\)|a[.)])\s+/;

/**
 * Multi-part items often duplicate their entire sub-part text inside the flat
 * `content` column (all 260 General SHORT_ANSWER parts-items do), while the
 * shared question stem lives ONLY in content's opening line. When PartsBlock
 * renders the sub-parts structurally, the flat content must contribute just
 * that stem — rendering it whole showed every question twice.
 */
function stemBeforeParts(content: string): string {
  const m = content.match(FIRST_PART_LABEL_RE);
  return (m ? content.slice(0, m.index) : content).trim();
}

/** MCQ options A–D, the correct one subtly marked for the teacher's eye. */
function McqOptions({
  options,
  correctOption,
}: {
  options: { A: string; B: string; C: string; D: string };
  correctOption: string | null;
}) {
  return (
    <div className="mt-3 space-y-2">
      {(["A", "B", "C", "D"] as const).map((letter) => {
        const correct = letter === correctOption;
        return (
          <div
            key={letter}
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-3 py-2",
              correct
                ? "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/40"
                : "border-gray-200 dark:border-gray-800"
            )}
          >
            <span
              className={cn(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                correct
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              )}
            >
              {letter}
            </span>
            <div className="min-w-0 flex-1">
              <MathContent content={options[letter]} />
            </div>
            {correct && (
              <Check
                className="mt-1.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500"
                aria-label="Correct option"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Multi-part (EA/ER) body: lettered parts with marks, sub-parts indented. */
function PartsBlock({ parts }: { parts: ItemPart[] }) {
  return (
    <div className="mt-3 space-y-4">
      {parts.map((part) => (
        <div key={part.label}>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {part.label}.{" "}
            <span className="font-normal">
              ({part.marks} mark{part.marks === 1 ? "" : "s"})
            </span>
          </p>
          <div className="min-w-0">
            <MathContent content={part.content} />
          </div>
          {part.subParts && part.subParts.length > 0 && (
            <div className="mt-2 space-y-3 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
              {part.subParts.map((sub) => (
                <div key={sub.label}>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {sub.label}.{" "}
                    <span className="font-normal">
                      ({sub.marks} mark{sub.marks === 1 ? "" : "s"})
                    </span>
                  </p>
                  <div className="min-w-0">
                    <MathContent content={sub.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Collapsed-by-default worked solution (teacher convenience). */
function SolutionBlock({
  item,
  parts,
}: {
  item: AssessmentItemView;
  parts: ItemPart[] | null;
}) {
  // Parts-items usually carry the SAME worked solution twice: once as a
  // top-level solutionContent blob and once per part. Prefer the structured
  // per-part solutions; fall back to the flat blob only when no part has one.
  const hasPartSolutions =
    parts?.some((p) => p.solution || p.subParts?.some((sub) => sub.solution)) ??
    false;
  return (
    <div className="mt-3 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/30 p-3 sm:p-4">
      {item.correctOption && (
        <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
          Answer: {item.correctOption}
        </p>
      )}
      {item.solutionContent && !hasPartSolutions && (
        <MathContent content={item.solutionContent} />
      )}
      {parts?.map((part) =>
        part.solution || part.subParts?.some((sub) => sub.solution) ? (
          <div key={part.label} className="mt-3 first:mt-0">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Part {part.label}
            </p>
            {part.solution && <MathContent content={part.solution} />}
            {part.subParts
              ?.filter((sub) => sub.solution)
              .map((sub) => (
                <div key={sub.label} className="mt-2 pl-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Part {part.label}({sub.label})
                  </p>
                  <MathContent content={sub.solution as string} />
                </div>
              ))}
          </div>
        ) : null
      )}
    </div>
  );
}

/**
 * One question card in the paper: numbered, chip row, full rendered content
 * (preamble / parts / MCQ options), collapsed solution, and the four item
 * actions as icon buttons (mobile-friendly, aria-labelled).
 */
export default function ItemCard({
  item,
  index,
  count,
  disabled,
  pendingAction,
  note,
  onMove,
  onShuffle,
  onRemove,
}: ItemCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const parts = asParts(item.parts);
  // When PartsBlock renders the sub-parts, the flat content contributes only
  // its shared stem (often empty for EXTENDED items) — never the full blob,
  // which duplicates the parts text. Single-part items render content whole.
  const flatContent = parts ? stemBeforeParts(item.content) : item.content;
  const hasSolution =
    !!item.solutionContent ||
    (parts?.some((p) => p.solution || p.subParts?.some((sub) => sub.solution)) ?? false);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="flex h-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 px-2 text-xs font-bold text-white">
            Q{index + 1}
          </span>
          <ItemMetaChips
            type={item.type}
            marks={item.marks}
            topicName={item.topicName}
            difficulty={item.difficulty}
            tech={item.tech}
          />
        </div>
        <div className="flex shrink-0 items-center">
          <button
            aria-label="Move up"
            title="Move up"
            disabled={disabled || index === 0}
            onClick={() => onMove(-1)}
            className={iconBtn}
          >
            {pendingAction === "up" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
          <button
            aria-label="Move down"
            title="Move down"
            disabled={disabled || index === count - 1}
            onClick={() => onMove(1)}
            className={iconBtn}
          >
            {pendingAction === "down" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
          <button
            aria-label="Swap for a similar question"
            title="Swap for a similar question"
            disabled={disabled}
            onClick={onShuffle}
            className={iconBtn}
          >
            {pendingAction === "shuffle" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shuffle className="h-4 w-4" />
            )}
          </button>
          <button
            aria-label="Remove from paper"
            title="Remove from paper"
            disabled={disabled}
            onClick={onRemove}
            className={cn(iconBtn, "hover:text-red-600 dark:hover:text-red-400")}
          >
            {pendingAction === "remove" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {note && (
        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400" role="status">
          {note}
        </p>
      )}

      {/* Shared scenario preamble for multi-part items */}
      {item.preamble && (
        <div className="mt-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4">
          <MathContent content={item.preamble} />
        </div>
      )}

      {flatContent && (
        <div className="mt-3 min-w-0">
          <MathContent content={flatContent} />
        </div>
      )}

      {parts && <PartsBlock parts={parts} />}

      {item.options && <McqOptions options={item.options} correctOption={item.correctOption} />}

      {hasSolution && (
        <>
          <button
            onClick={() => setShowSolution((v) => !v)}
            aria-expanded={showSolution}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showSolution && "rotate-180")}
            />
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
          {showSolution && <SolutionBlock item={item} parts={parts} />}
        </>
      )}
    </div>
  );
}
