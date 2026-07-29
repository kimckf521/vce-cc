"use client";

import { cn } from "@/lib/utils";

/**
 * Shared display metadata for assessment items — labels, chip styles, and the
 * parsed shape of QuestionSetItem.parts JSON. Used by both the item cards in
 * the editor and the pool-browser result cards so the two always match.
 */

/** Display labels for QuestionSetItem types — mirrors lib/question-set-groups.ts. */
export const TYPE_LABEL: Record<string, string> = {
  MCQ: "MCQ",
  SHORT_ANSWER: "Short Answer",
  EXTENDED_ANSWER: "Extended Answer",
  EXTENDED_RESPONSE: "Extended Response",
};

export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

// Same tones as QuestionGroup's difficulty badges.
export const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  HARD: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};

export const TECH_LABEL: Record<string, string> = {
  TECH_FREE: "Tech-free",
  CAS_ALLOWED: "CAS allowed",
  CAS_REQUIRED: "CAS required",
};

export const chipClass =
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

/**
 * Parsed shape of QuestionSetItem.parts JSON (see prisma/schema.prisma):
 * array of { label, marks, content, solution, subParts? }. Null for
 * single-part items (MCQ, SHORT_ANSWER).
 */
export interface ItemSubPart {
  label: string;
  marks: number;
  content: string;
  solution?: string | null;
}

export interface ItemPart extends ItemSubPart {
  subParts?: ItemSubPart[];
}

/** Narrow the serialized `parts` value (Json passthrough) to the known shape. */
export function asParts(parts: unknown): ItemPart[] | null {
  return Array.isArray(parts) && parts.length > 0 ? (parts as ItemPart[]) : null;
}

/**
 * The standard chip row for a question: type, marks, topic, difficulty, and
 * tech (when classified). Rendered inside a flex-wrap container.
 */
export function ItemMetaChips({
  type,
  marks,
  topicName,
  difficulty,
  tech,
}: {
  type: string;
  marks: number;
  topicName: string;
  difficulty: string;
  tech: string | null;
}) {
  return (
    <>
      <span className={cn(chipClass, "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300")}>
        {TYPE_LABEL[type] ?? type}
      </span>
      <span className={cn(chipClass, "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400")}>
        {marks} mark{marks === 1 ? "" : "s"}
      </span>
      <span className={cn(chipClass, "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300")}>
        {topicName}
      </span>
      <span className={cn(chipClass, DIFFICULTY_STYLES[difficulty])}>
        {DIFFICULTY_LABEL[difficulty] ?? difficulty}
      </span>
      {tech && (
        <span className={cn(chipClass, "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400")}>
          {TECH_LABEL[tech] ?? tech}
        </span>
      )}
    </>
  );
}
