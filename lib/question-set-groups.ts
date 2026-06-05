import { prisma } from "@/lib/prisma";
import type { QuestionGroupData, TopicQuestionFilters } from "@/lib/question-groups";
import { calculatorBadgeForSubject } from "@/lib/question-groups";
import { getExamFilterOptions, isCalculatorFreeType } from "@/lib/exam-filter-config";

/**
 * Canonical name of the question set used by the Topic page.
 * The Topic page ALWAYS reads from this set — it does not honour isDefault.
 *
 * The Methods row that holds this name is the 1540-item Wave 1 bank (renamed
 * 2026-05-28 from "Methods Wave 1 Bank"). The pre-Wave-1 1575-item legacy bank
 * lives at name="Methods Legacy Bank v0" (archived) for rollback.
 *
 * Multiple subjects (foundation/general/specialist) also have rows with this
 * name, so callers must scope by subjectSlug — see getGeneratedQuestionSetId.
 */
export const GENERATED_QUESTION_SET_NAME = "1st Generated Question Set";

type QSIType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

const TYPE_LABEL: Record<QSIType, string> = {
  MCQ: "MCQ",
  SHORT_ANSWER: "Short Answer",
  EXTENDED_ANSWER: "Extended Answer",
  EXTENDED_RESPONSE: "Extended Response",
};

const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;

/**
 * Resolve the question set id for the Topic page.
 * The Topic page reads from the set named by GENERATED_QUESTION_SET_NAME
 * — it does NOT honour isDefault.
 *
 * To switch the Topic page to a different bank, update the constant above —
 * don't flip isDefault, which only affects the Practice page.
 *
 * `subjectSlug` is required to disambiguate: foundation/general/specialist
 * each hold a row with the same name. `archived: false` excludes the legacy
 * Methods rollback row ("Methods Legacy Bank v0").
 */
export async function getGeneratedQuestionSetId(
  subjectSlug?: string,
): Promise<string | null> {
  const row = await prisma.questionSet.findFirst({
    where: {
      name: GENERATED_QUESTION_SET_NAME,
      archived: false,
      ...(subjectSlug ? { subject: { slug: subjectSlug } } : {}),
    },
    select: { id: true },
  });
  return row?.id ?? null;
}

/**
 * Resolve the question set id for the Practice page (exam-style sessions).
 *
 * Resolution order (`subjectSlug` provided):
 *   1. The `QuestionSet` row for that subject where `isDefault = true`.
 *   2. The `QuestionSet` row for that subject named "1st Generated Exam Set".
 *   3. null — caller should show an empty-pool message.
 *
 * Resolution order (no `subjectSlug`, legacy callers only):
 *   1. The `QuestionSet` row where `isDefault = true`.
 *   2. Fallback to the legacy named set, for safety if no default is set yet.
 *
 * `isDefault` is now scoped per subject — multiple rows may have it set,
 * but at most one per subject. The admin "Make default" action enforces
 * this; see app/api/admin/question-sets/[id]/make-default.
 */
export async function getPracticeQuestionSetId(
  subjectSlug?: string,
): Promise<string | null> {
  if (subjectSlug) {
    const defaultForSubject = await prisma.questionSet.findFirst({
      where: { isDefault: true, subject: { slug: subjectSlug } },
      select: { id: true },
    });
    if (defaultForSubject) return defaultForSubject.id;
    const examSetForSubject = await prisma.questionSet.findFirst({
      where: {
        name: "1st Generated Exam Set",
        subject: { slug: subjectSlug },
        items: { some: {} },
      },
      select: { id: true },
    });
    return examSetForSubject?.id ?? null;
  }

  // Legacy / no-subject fallback (kept for callers that haven't been updated).
  const defaultRow = await prisma.questionSet.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  if (defaultRow) return defaultRow.id;
  const fallback = await prisma.questionSet.findFirst({
    where: { name: GENERATED_QUESTION_SET_NAME },
    select: { id: true },
  });
  return fallback?.id ?? null;
}

/**
 * Central filter used by every query that reads questions for display.
 * Guarantees we never serve PENDING or REJECTED items to the picker / topics pages.
 *
 * Usage:
 *   const where = { ...approvedItemsFilter(setId), topicId };
 *   await prisma.questionSetItem.findMany({ where });
 */
export function approvedItemsFilter(setId: string) {
  return {
    questionSetId: setId,
    status: "APPROVED" as const,
  };
}

/**
 * Fetch QuestionSetItems for a topic (from the generated question set) and
 * adapt them into the QuestionGroupData shape so the existing
 * QuestionGroup / InfiniteQuestionList components can render them unchanged.
 *
 * Each item becomes one group with a single part.
 */
export async function fetchQuestionSetGroupsPaginated(
  topicId: string,
  topicName: string,
  filters: TopicQuestionFilters,
  offset: number,
  limit: number,
  userId?: string,
  subjectSlug?: string,
): Promise<{ groups: QuestionGroupData[]; totalCount: number; hasMore: boolean }> {
  const setId = await getGeneratedQuestionSetId(subjectSlug);
  if (!setId) return { groups: [], totalCount: 0, hasMore: false };

  const difficultyValues = filters.difficulty
    ? (filters.difficulty.split(",").filter(Boolean) as ("EASY" | "MEDIUM" | "HARD")[])
    : [];

  // Repurpose the "exam" filter to select QuestionSetItem types via the
  // per-subject mapping defined in lib/exam-filter-config.ts. Methods /
  // Specialist split into Exam 1 / 2A / 2B; General into Exam 1 / 2;
  // Foundation into Section A / B.
  const examToTypes = new Map<string, QSIType[]>(
    getExamFilterOptions(subjectSlug).map((o) => [o.value, o.types as QSIType[]]),
  );
  const typeValues = filters.exam
    ? (Array.from(
        new Set(
          filters.exam
            .split(",")
            .filter(Boolean)
            .flatMap((v) => examToTypes.get(v) ?? [])
        )
      ) as QSIType[])
    : [];

  const where: Record<string, unknown> = {
    ...approvedItemsFilter(setId),
    topicId,
  };
  if (filters.subtopic) {
    where.subtopics = { some: { slug: filters.subtopic } };
  }
  if (difficultyValues.length > 0) {
    where.difficulty = { in: difficultyValues };
  }
  if (typeValues.length > 0) {
    where.type = { in: typeValues };
  }

  // Fetch all matching ids + sort keys (lightweight) for totalCount + stable ordering
  const allItems = await prisma.questionSetItem.findMany({
    where,
    select: {
      id: true,
      difficulty: true,
      type: true,
      order: true,
      createdAt: true,
    },
  });

  // Sort: difficulty (easy → hard) then order then createdAt
  allItems.sort((a, b) => {
    const da = DIFFICULTY_ORDER[a.difficulty as keyof typeof DIFFICULTY_ORDER];
    const db = DIFFICULTY_ORDER[b.difficulty as keyof typeof DIFFICULTY_ORDER];
    if (da !== db) return da - db;
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const totalCount = allItems.length;
  const sliceIds = allItems.slice(offset, offset + limit).map((i) => i.id);

  // Hydrate only the displayed slice with full content + user attempt statuses
  const [fullItems, userAttempts] = await Promise.all([
    sliceIds.length > 0
      ? prisma.questionSetItem.findMany({
          where: { id: { in: sliceIds } },
          select: {
            id: true,
            type: true,
            marks: true,
            content: true,
            preamble: true,
            parts: true,
            difficulty: true,
            tech: true,
            solutionContent: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctOption: true,
            subtopics: { select: { name: true } },
          },
        })
      : [],
    sliceIds.length > 0 && userId
      ? prisma.questionSetAttempt.findMany({
          where: { userId, questionSetItemId: { in: sliceIds } },
          select: { questionSetItemId: true, status: true, bookmarked: true },
        })
      : [],
  ]);

  const attemptMap = new Map(userAttempts.map((a) => [a.questionSetItemId, { status: a.status, bookmarked: a.bookmarked }]));

  // Index for ordered retrieval
  const byId = new Map(fullItems.map((it) => [it.id, it] as const));

  // Build groups in the paginated order
  const groups = sliceIds
    .map((id, idx) => {
      const it = byId.get(id);
      if (!it) return null;

      const questionNumber = offset + idx + 1;
      const isMultiPart = it.type === "EXTENDED_ANSWER" || it.type === "EXTENDED_RESPONSE";

      // Multi-part EA/ER: explode parts JSON into the QuestionGroupData.parts
      // array. Bake the shared preamble into the FIRST part's content using
      // the ---PREAMBLE--- markers that QuestionGroup already recognises.
      if (isMultiPart && Array.isArray(it.parts)) {
        const rawParts = it.parts as Array<{
          label: string;
          marks: number;
          content: string;
          solution: string;
          subParts?: Array<{ label: string; marks: number; content: string; solution: string }>;
        }>;
        const parts = rawParts.map((p, i) => {
          // For parts with sub-parts, flatten sub-parts into the content + solution
          let partContent = p.content;
          let partSolution = p.solution;
          if (Array.isArray(p.subParts) && p.subParts.length > 0) {
            partContent = `${p.content}\n\n${p.subParts.map((sp) => `**${sp.label}.** (${sp.marks} mark${sp.marks === 1 ? "" : "s"}) ${sp.content}`).join("\n\n")}`;
            partSolution = `${p.solution ? p.solution + "\n\n" : ""}${p.subParts.map((sp) => `**Part ${sp.label}:** ${sp.solution}`).join("\n\n")}`;
          }
          const contentWithPreamble =
            i === 0 && it.preamble
              ? `---PREAMBLE---\n${it.preamble}\n---QUESTION---\n${partContent}`
              : partContent;
          return {
            id: i === 0 ? it.id : `${it.id}-${p.label}`,
            questionNumber,
            part: p.label,
            marks: p.marks,
            content: contentWithPreamble,
            imageUrl: null,
            difficulty: it.difficulty as "EASY" | "MEDIUM" | "HARD",
            solution: partSolution
              ? { content: partSolution, imageUrl: null, videoUrl: null }
              : null,
            initialStatus: i === 0 ? ((attemptMap.get(it.id)?.status as "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW") ?? null) : null,
            initialBookmarked: i === 0 ? (attemptMap.get(it.id)?.bookmarked ?? false) : false,
          };
        });
        return {
          key: `qset-${it.id}`,
          year: 0,
          examType: "EXAM_1" as "EXAM_1" | "EXAM_2",
          sectionLabel: TYPE_LABEL[it.type as QSIType],
          frequency: undefined,
          topicName,
          subtopics: it.subtopics.map((s) => s.name),
          calculatorAllowed: calculatorBadgeForSubject(subjectSlug, isCalculatorFreeType(subjectSlug, it.type as QSIType)),
          parts,
        } satisfies QuestionGroupData;
      }

      // Stitch MCQ options into the content so they render inside the card body
      const contentWithOptions =
        it.type === "MCQ" && it.optionA
          ? `${it.content}\n\n**A.** ${it.optionA}\n\n**B.** ${it.optionB ?? ""}\n\n**C.** ${it.optionC ?? ""}\n\n**D.** ${it.optionD ?? ""}`
          : it.content;

      // Embed the MCQ answer inside the solution text so the existing MCQ
      // parser in QuestionGroup can detect it (format: "**Answer: X**")
      const solutionContent =
        it.type === "MCQ" && it.correctOption && it.solutionContent
          ? `**Answer: ${it.correctOption}**\n\n${it.solutionContent}`
          : it.solutionContent ?? "";

      return {
        key: `qset-${it.id}`,
        year: 0, // sentinel — QuestionGroup will hide year when 0
        examType: "EXAM_1" as "EXAM_1" | "EXAM_2", // placeholder; not rendered
        sectionLabel: TYPE_LABEL[it.type as QSIType],
        frequency: undefined,
        topicName,
        subtopics: it.subtopics.map((s) => s.name),
        calculatorAllowed: calculatorBadgeForSubject(subjectSlug, isCalculatorFreeType(subjectSlug, it.type as QSIType)),
        parts: [
          {
            id: it.id,
            questionNumber,
            part: null,
            marks: it.marks,
            content: contentWithOptions,
            imageUrl: null,
            difficulty: it.difficulty as "EASY" | "MEDIUM" | "HARD",
            solution: solutionContent
              ? { content: solutionContent, imageUrl: null, videoUrl: null }
              : null,
            initialStatus: (attemptMap.get(it.id)?.status as "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW") ?? null,
            initialBookmarked: attemptMap.get(it.id)?.bookmarked ?? false,
          },
        ],
      } satisfies QuestionGroupData;
    })
    .filter((g) => g !== null) as QuestionGroupData[];

  return { groups, totalCount, hasMore: offset + limit < totalCount };
}
