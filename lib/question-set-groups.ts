import { prisma } from "@/lib/prisma";
import type { QuestionGroupData, TopicQuestionFilters } from "@/lib/question-groups";

export const GENERATED_QUESTION_SET_NAME = "1st Generated Question Set";

const TYPE_LABEL: Record<"MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE", string> = {
  MCQ: "MCQ",
  SHORT_ANSWER: "Short Answer",
  EXTENDED_RESPONSE: "Extended Response",
};

const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;

/**
 * Resolve the active generated question set id (cached via module-level lookup).
 */
export async function getGeneratedQuestionSetId(): Promise<string | null> {
  const row = await prisma.questionSet.findFirst({
    where: { name: GENERATED_QUESTION_SET_NAME },
    select: { id: true },
  });
  return row?.id ?? null;
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
  userId?: string
): Promise<{ groups: QuestionGroupData[]; totalCount: number; hasMore: boolean }> {
  const setId = await getGeneratedQuestionSetId();
  if (!setId) return { groups: [], totalCount: 0, hasMore: false };

  const difficultyValues = filters.difficulty
    ? (filters.difficulty.split(",").filter(Boolean) as ("EASY" | "MEDIUM" | "HARD")[])
    : [];

  // Repurpose the "exam" filter to select QuestionSetItem types:
  //   Exam 1  → SHORT_ANSWER
  //   Exam 2A → MCQ
  //   Exam 2B → EXTENDED_RESPONSE
  const EXAM_TO_TYPE: Record<string, "MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE"> = {
    EXAM_1: "SHORT_ANSWER",
    EXAM_2_MC: "MCQ",
    EXAM_2_B: "EXTENDED_RESPONSE",
  };
  const typeValues = filters.exam
    ? (filters.exam
        .split(",")
        .filter(Boolean)
        .map((v) => EXAM_TO_TYPE[v])
        .filter(Boolean) as ("MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE")[])
    : [];

  const where: Record<string, unknown> = {
    questionSetId: setId,
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
            difficulty: true,
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
        sectionLabel: TYPE_LABEL[it.type as keyof typeof TYPE_LABEL],
        frequency: undefined,
        topicName,
        subtopics: it.subtopics.map((s) => s.name),
        calculatorAllowed: true,
        parts: [
          {
            id: it.id,
            questionNumber: offset + idx + 1,
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
