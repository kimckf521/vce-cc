import { prisma } from "@/lib/prisma";

// ── Types ──────────────────────────────────────────────────────────────

export interface SubtopicInfo {
  id: string;
  name: string;
  slug: string;
  frequency: "rare" | "normal" | "often";
}

export interface QuestionGroupPart {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  imageUrl: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solution: { content: string; imageUrl: string | null; videoUrl: string | null } | null;
  initialStatus: "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW" | null;
}

export interface QuestionGroupData {
  key: string;
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  sectionLabel: string;
  frequency: "rare" | "normal" | "often" | undefined;
  topicName: string;
  subtopics: string[];
  calculatorAllowed: boolean;
  parts: QuestionGroupPart[];
}

// ── Filters ────────────────────────────────────────────────────────────

export interface TopicQuestionFilters {
  subtopic?: string;
  exam?: string;
  difficulty?: string;
  frequency?: string;
}

// ── Core logic ─────────────────────────────────────────────────────────

const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;

function getGroupSortType(examType: string, part: string | null): 0 | 1 | 2 {
  if (examType === "EXAM_2" && part === null) return 0;
  if (examType === "EXAM_1") return 1;
  return 2;
}

function getSectionLabel(examType: string, part: string | null): "Exam 1" | "Exam 2A" | "Exam 2B" {
  if (examType === "EXAM_1") return "Exam 1";
  if (part === null) return "Exam 2A";
  return "Exam 2B";
}

function getGroupFrequency(
  subtopicNames: string[],
  subtopicInfos: SubtopicInfo[]
): "rare" | "normal" | "often" | undefined {
  const freqs = subtopicNames
    .map((n) => subtopicInfos.find((s) => s.name === n)?.frequency)
    .filter(Boolean) as ("rare" | "normal" | "often")[];
  if (freqs.includes("often")) return "often";
  if (freqs.includes("normal")) return "normal";
  if (freqs.length > 0) return "rare";
  return undefined;
}

/**
 * Phase 1: Fetch lightweight group keys (no content/solutions) to determine
 * which groups to display. This is fast because it only fetches IDs and metadata.
 */
async function fetchGroupKeys(
  topicId: string,
  filters: TopicQuestionFilters,
  subtopicInfos: SubtopicInfo[]
) {
  const examValues = filters.exam ? filters.exam.split(",").filter(Boolean) : [];
  const difficultyValues = filters.difficulty ? filters.difficulty.split(",").filter(Boolean) : [];
  const frequencyValues = filters.frequency ? filters.frequency.split(",").filter(Boolean) : [];

  const frequencySubtopicIds =
    frequencyValues.length > 0
      ? subtopicInfos.filter((s) => frequencyValues.includes(s.frequency)).map((s) => s.id)
      : null;

  const subtopicConditions: Record<string, unknown>[] = [];
  if (filters.subtopic) subtopicConditions.push({ slug: filters.subtopic });
  if (frequencySubtopicIds !== null)
    subtopicConditions.push({ id: { in: frequencySubtopicIds } });

  const subtopicsWhere =
    subtopicConditions.length === 0
      ? {}
      : subtopicConditions.length === 1
      ? { subtopics: { some: subtopicConditions[0] } }
      : { subtopics: { some: { AND: subtopicConditions } } };

  const examOrConditions: Record<string, unknown>[] = [];
  if (examValues.includes("EXAM_1"))
    examOrConditions.push({ exam: { examType: "EXAM_1" } });
  if (examValues.includes("EXAM_2_MC"))
    examOrConditions.push({ exam: { examType: "EXAM_2" }, part: null });
  if (examValues.includes("EXAM_2_B"))
    examOrConditions.push({ exam: { examType: "EXAM_2" }, part: { not: null } });

  // Lightweight query — only metadata needed for grouping/sorting
  const questions = await prisma.question.findMany({
    where: {
      topicId,
      exam: { year: { not: 9999 } },
      ...subtopicsWhere,
      ...(difficultyValues.length > 0 && {
        difficulty: { in: difficultyValues as ("EASY" | "MEDIUM" | "HARD")[] },
      }),
      ...(examOrConditions.length > 0 && { OR: examOrConditions }),
    },
    select: {
      id: true,
      questionNumber: true,
      part: true,
      difficulty: true,
      examId: true,
      exam: { select: { year: true, examType: true } },
      subtopics: { select: { name: true } },
    },
    orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }],
  });

  // Post-filter by exam section
  const filtered =
    examValues.length > 0
      ? questions.filter((q) => {
          if (q.exam.examType === "EXAM_1") return examValues.includes("EXAM_1");
          if (q.part === null) return examValues.includes("EXAM_2_MC");
          return examValues.includes("EXAM_2_B");
        })
      : questions;

  // Group into display groups
  const groupMap = filtered.reduce(
    (acc, q) => {
      const key =
        q.part === null
          ? `${q.examId}-MCQ-${q.questionNumber}`
          : `${q.examId}-PART-${q.questionNumber}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    },
    {} as Record<string, typeof filtered>
  );
  const rawGroups = Object.entries(groupMap);

  // Sort
  rawGroups.sort(([, a], [, b]) => {
    const typeA = getGroupSortType(a[0].exam.examType, a[0].part);
    const typeB = getGroupSortType(b[0].exam.examType, b[0].part);
    if (typeA !== typeB) return typeA - typeB;
    const diffA = DIFFICULTY_ORDER[a[0].difficulty];
    const diffB = DIFFICULTY_ORDER[b[0].difficulty];
    if (diffA !== diffB) return diffA - diffB;
    if (a[0].exam.year !== b[0].exam.year) return b[0].exam.year - a[0].exam.year;
    return a[0].questionNumber - b[0].questionNumber;
  });

  return rawGroups;
}

/**
 * Phase 2: Given a slice of group keys, fetch the full question data
 * (content, solutions, attempts) for only those groups.
 */
async function hydrateGroups(
  groupSlice: [string, { id: string; questionNumber: number; part: string | null; difficulty: string; examId: string; exam: { year: number; examType: string }; subtopics: { name: string }[] }[]][],
  subtopicInfos: SubtopicInfo[],
  userId?: string
): Promise<QuestionGroupData[]> {
  if (groupSlice.length === 0) return [];

  // Collect all question IDs we need, PLUS section B sibling IDs
  const mcqIds: string[] = [];
  const sectionBKeys: { examId: string; questionNumber: number }[] = [];

  for (const [, group] of groupSlice) {
    for (const q of group) {
      if (q.part === null) {
        mcqIds.push(q.id);
      } else {
        // Only add unique (examId, questionNumber) pairs
        if (!sectionBKeys.some((k) => k.examId === q.examId && k.questionNumber === q.questionNumber)) {
          sectionBKeys.push({ examId: q.examId, questionNumber: q.questionNumber });
        }
      }
    }
  }

  // Single query for all needed questions (MCQs by ID + Section B siblings)
  const orConditions: Record<string, unknown>[] = [];
  if (mcqIds.length > 0) orConditions.push({ id: { in: mcqIds } });
  for (const k of sectionBKeys) {
    orConditions.push({ examId: k.examId, questionNumber: k.questionNumber, part: { not: null } });
  }

  const fullQuestions = orConditions.length > 0
    ? await prisma.question.findMany({
        where: { OR: orConditions },
        select: {
          id: true,
          questionNumber: true,
          part: true,
          marks: true,
          content: true,
          imageUrl: true,
          difficulty: true,
          examId: true,
          exam: { select: { year: true, examType: true } },
          topic: { select: { name: true } },
          subtopics: { select: { name: true } },
          solution: { select: { content: true, imageUrl: true, videoUrl: true } },
          attempts: userId
            ? ({ where: { userId }, select: { status: true } } as const)
            : (false as const),
        },
        orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
      })
    : [];

  // Index by group key for fast lookup
  const questionMap = new Map<string, typeof fullQuestions>();
  for (const q of fullQuestions) {
    const key =
      q.part === null
        ? `${q.examId}-MCQ-${q.questionNumber}`
        : `${q.examId}-PART-${q.questionNumber}`;
    if (!questionMap.has(key)) questionMap.set(key, []);
    questionMap.get(key)!.push(q);
  }

  // Build final groups
  return groupSlice.map(([key, metaGroup]) => {
    const fullGroup = questionMap.get(key) ?? [];
    // Sort parts within group
    fullGroup.sort((a, b) => {
      if (a.part === null && b.part === null) return 0;
      if (a.part === null) return -1;
      if (b.part === null) return 1;
      return a.part.localeCompare(b.part);
    });

    const allSubtopics = Array.from(
      new Set((fullGroup.length > 0 ? fullGroup : metaGroup).flatMap((q) => q.subtopics.map((s) => s.name)))
    );

    const representative = fullGroup[0] ?? metaGroup[0];

    return {
      key,
      year: representative.exam.year,
      examType: representative.exam.examType as "EXAM_1" | "EXAM_2",
      sectionLabel: getSectionLabel(representative.exam.examType, representative.part),
      frequency: getGroupFrequency(allSubtopics, subtopicInfos),
      topicName: "topic" in representative ? (representative as any).topic.name : "",
      subtopics: allSubtopics,
      calculatorAllowed: representative.exam.examType === "EXAM_2",
      parts: fullGroup.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        part: q.part,
        marks: q.marks,
        content: q.content,
        imageUrl: q.imageUrl,
        difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
        solution: q.solution,
        initialStatus: (q.attempts && Array.isArray(q.attempts) ? q.attempts[0]?.status : null) ?? null,
      })),
    };
  });
}

/**
 * Fetch question groups for a topic with pagination support.
 * Phase 1: Lightweight query to get all group keys (no content/solutions).
 * Phase 2: Hydrate only the requested slice with full data.
 */
export async function fetchQuestionGroups(
  topicId: string,
  subtopicInfos: SubtopicInfo[],
  filters: TopicQuestionFilters,
  userId?: string
): Promise<QuestionGroupData[]> {
  const allGroupKeys = await fetchGroupKeys(topicId, filters, subtopicInfos);

  // Hydrate all groups — caller will slice
  return hydrateGroups(allGroupKeys, subtopicInfos, userId);
}

/**
 * Optimised version: fetch group keys then hydrate only one page.
 * Returns { groups, totalCount, hasMore }.
 */
export async function fetchQuestionGroupsPaginated(
  topicId: string,
  subtopicInfos: SubtopicInfo[],
  filters: TopicQuestionFilters,
  userId: string | undefined,
  offset: number,
  limit: number
): Promise<{ groups: QuestionGroupData[]; totalCount: number; hasMore: boolean }> {
  // Phase 1: fast lightweight query for all group keys
  const allGroupKeys = await fetchGroupKeys(topicId, filters, subtopicInfos);
  const totalCount = allGroupKeys.length;

  // Phase 2: hydrate only the slice we need
  const slice = allGroupKeys.slice(offset, offset + limit);
  const groups = await hydrateGroups(slice, subtopicInfos, userId);

  return { groups, totalCount, hasMore: offset + limit < totalCount };
}
