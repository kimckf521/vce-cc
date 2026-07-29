/**
 * Teacher assessment API layer — shared response shapes + serializers.
 *
 * This module is the single source of truth for the wire format of
 * /api/teacher/**. Every route serializes through these functions and the
 * teacher UI imports the TS types (type-only imports are erased at build
 * time, so client components can safely `import type` from here even though
 * this file touches Prisma).
 *
 * T1 product rule baked in: the question pool is the ORIGINAL generated bank
 * only (QuestionSetItem, APPROVED). AssessmentItem.questionId (VCAA
 * past-paper source) exists in the schema but is never written or read by
 * these routes — rows without a questionSetItem are skipped defensively.
 */

import { prisma } from "@/lib/prisma";
import { getUrlSubjectSlug } from "@/lib/subject-context";

// ---------- wire types (UI imports these) ----------

/** QuestionSetItem.type values as they appear on the wire. */
export type AssessmentItemType =
  | "MCQ"
  | "SHORT_ANSWER"
  | "EXTENDED_ANSWER"
  | "EXTENDED_RESPONSE";

/** QuestionSetItem.difficulty values as they appear on the wire. */
export type AssessmentItemDifficulty = "EASY" | "MEDIUM" | "HARD";

/** QuestionSetItem.tech values; null = not yet classified. */
export type AssessmentItemTech = "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED";

/** Assessment.status values. */
export type AssessmentStatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/**
 * One entry of the QuestionSetItem.parts JSON column (multi-part items).
 * Passed through verbatim — the UI renders sub-parts from this shape.
 */
export type AssessmentItemPart = {
  label: string;
  marks: number;
  content: string;
  solution?: string | null;
  subParts?: {
    label: string;
    marks: number;
    content: string;
    solution?: string | null;
  }[];
};

/**
 * Builder settings snapshot stored on Assessment.settings. Written once at
 * create time; never read for access control.
 */
export type AssessmentSettings = {
  topicIds?: string[];
  difficulty?: { easy: number; medium: number; hard: number };
  tech?: "TECH_FREE" | "ANY";
  targetMarks?: number;
  questionCount?: number;
};

/** One row in the teacher's assessment list (GET /api/teacher/assessments). */
export type AssessmentSummary = {
  id: string;
  title: string;
  /**
   * URL subject slug ("methods", "general", …) — the form getSubjectMetadata
   * and route links consume. Serializers translate the DB slug
   * ("mathematical-methods") via getUrlSubjectSlug; the wire NEVER carries
   * the DB form. Query-side helpers accept this via getDbSubjectSlug.
   */
  subjectSlug: string;
  subjectName: string;
  status: AssessmentStatusValue;
  totalMarks: number;
  itemCount: number;
  updatedAt: string; // ISO timestamp
};

/** One hydrated question slot inside an assessment. */
export type AssessmentItemView = {
  id: string;
  order: number;
  questionSetItemId: string;
  marks: number;
  type: AssessmentItemType;
  difficulty: AssessmentItemDifficulty;
  tech: AssessmentItemTech | null;
  topicId: string;
  topicName: string;
  content: string;
  preamble: string | null;
  parts: AssessmentItemPart[] | null;
  options: { A: string; B: string; C: string; D: string } | null;
  correctOption: string | null;
  solutionContent: string | null;
};

/** Full assessment payload returned by every detail read and mutation. */
export type AssessmentDetail = {
  id: string;
  title: string;
  description: string | null;
  status: AssessmentStatusValue;
  /** URL subject slug — same convention as AssessmentSummary.subjectSlug. */
  subjectSlug: string;
  subjectName: string;
  settings: AssessmentSettings | null;
  totalMarks: number;
  items: AssessmentItemView[];
};

/**
 * One question-pool row (GET /api/teacher/question-pool) — an
 * AssessmentItemView that isn't in a paper yet, so no slot id/order.
 */
export type PoolItem = Omit<AssessmentItemView, "id" | "order">;

// ---------- Prisma select shapes ----------

/**
 * The QuestionSetItem fields every serializer needs. Reused by the
 * question-pool route so pool rows and paper rows hydrate identically.
 */
export const questionSetItemSelect = {
  id: true,
  topicId: true,
  type: true,
  marks: true,
  preamble: true,
  parts: true,
  content: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  correctOption: true,
  solutionContent: true,
  difficulty: true,
  tech: true,
  topic: { select: { name: true } },
} as const;

/** Structural shape of a row fetched with {@link questionSetItemSelect}. */
export type QuestionSetItemRow = {
  id: string;
  topicId: string;
  type: string;
  marks: number;
  preamble: string | null;
  parts: unknown;
  content: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  solutionContent: string | null;
  difficulty: string;
  tech: string | null;
  topic: { name: string };
};

// ---------- serializers ----------

/** The pool fields shared by PoolItem and AssessmentItemView. */
function serializeQuestionFields(qsi: QuestionSetItemRow): PoolItem {
  return {
    questionSetItemId: qsi.id,
    marks: qsi.marks,
    type: qsi.type as AssessmentItemType,
    difficulty: qsi.difficulty as AssessmentItemDifficulty,
    tech: (qsi.tech as AssessmentItemTech | null) ?? null,
    topicId: qsi.topicId,
    topicName: qsi.topic.name,
    content: qsi.content,
    preamble: qsi.preamble,
    parts: Array.isArray(qsi.parts) ? (qsi.parts as AssessmentItemPart[]) : null,
    // MCQ options travel as a single object (null for non-MCQ). Options B-D
    // are non-null in practice for MCQs; empty-string fallback keeps the
    // wire shape total rather than leaking nulls into the UI.
    options:
      qsi.type === "MCQ" && qsi.optionA !== null
        ? {
            A: qsi.optionA,
            B: qsi.optionB ?? "",
            C: qsi.optionC ?? "",
            D: qsi.optionD ?? "",
          }
        : null,
    correctOption: qsi.correctOption,
    solutionContent: qsi.solutionContent,
  };
}

/** Serialize one question-pool row. */
export function serializePoolItem(qsi: QuestionSetItemRow): PoolItem {
  return serializeQuestionFields(qsi);
}

/**
 * Serialize one AssessmentItem (with its hydrated QuestionSetItem) into the
 * wire view. Returns null for rows without a questionSetItem — the reserved
 * VCAA past-paper source (questionId) that T1 never writes.
 */
export function serializeAssessmentItem(item: {
  id: string;
  order: number;
  questionSetItem: QuestionSetItemRow | null;
}): AssessmentItemView | null {
  if (!item.questionSetItem) return null;
  return {
    id: item.id,
    order: item.order,
    ...serializeQuestionFields(item.questionSetItem),
  };
}

/** Serialize one assessment list row (see the include in listAssessments). */
export function serializeAssessmentSummary(a: {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
  subject: { slug: string; name: string };
  items: { questionSetItem: { marks: number } | null }[];
}): AssessmentSummary {
  return {
    id: a.id,
    title: a.title,
    // Wire convention: URL slug (see AssessmentSummary.subjectSlug). Unknown
    // DB slugs pass through so the UI still shows a usable fallback.
    subjectSlug: getUrlSubjectSlug(a.subject.slug) ?? a.subject.slug,
    subjectName: a.subject.name,
    status: a.status as AssessmentStatusValue,
    totalMarks: a.items.reduce((s, it) => s + (it.questionSetItem?.marks ?? 0), 0),
    itemCount: a.items.length,
    updatedAt: a.updatedAt.toISOString(),
  };
}

/** Serialize a fully-included assessment row into AssessmentDetail. */
export function serializeAssessmentDetail(a: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  settings: unknown;
  subject: { slug: string; name: string };
  items: { id: string; order: number; questionSetItem: QuestionSetItemRow | null }[];
}): AssessmentDetail {
  const items = a.items
    .map(serializeAssessmentItem)
    .filter((v): v is AssessmentItemView => v !== null);
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    status: a.status as AssessmentStatusValue,
    // Wire convention: URL slug (see AssessmentSummary.subjectSlug).
    subjectSlug: getUrlSubjectSlug(a.subject.slug) ?? a.subject.slug,
    subjectName: a.subject.name,
    settings: (a.settings as AssessmentSettings | null) ?? null,
    totalMarks: items.reduce((s, it) => s + it.marks, 0),
    items,
  };
}

// ---------- ownership-scoped fetch helpers ----------

/**
 * Fetch one assessment by id, scoped to its owner (teacherId === the caller),
 * with items hydrated and ordered. Returns the serialized detail or null —
 * routes treat null as 404, which also hides other teachers' assessment ids.
 *
 * Every mutation route re-reads through this after writing so the contract's
 * "mutations return the full updated AssessmentDetail" holds from one place.
 */
export async function getOwnedAssessmentDetail(
  id: string,
  teacherId: string
): Promise<AssessmentDetail | null> {
  const row = await prisma.assessment.findFirst({
    where: { id, teacherId },
    include: {
      subject: { select: { slug: true, name: true } },
      items: {
        orderBy: { order: "asc" },
        include: { questionSetItem: { select: questionSetItemSelect } },
      },
    },
  });
  return row ? serializeAssessmentDetail(row) : null;
}

/**
 * Lightweight ownership check + current item list for mutation routes that
 * need to validate against the paper's contents before writing (add /
 * remove / reorder / shuffle). Items come back in display order.
 */
export async function getOwnedAssessmentWithItemIds(
  id: string,
  teacherId: string
): Promise<{
  id: string;
  subjectId: string;
  subjectSlug: string;
  items: { id: string; order: number; questionSetItemId: string | null }[];
} | null> {
  const row = await prisma.assessment.findFirst({
    where: { id, teacherId },
    select: {
      id: true,
      subjectId: true,
      subject: { select: { slug: true } },
      items: {
        orderBy: { order: "asc" },
        select: { id: true, order: true, questionSetItemId: true },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    subjectId: row.subjectId,
    subjectSlug: row.subject.slug,
    items: row.items,
  };
}
