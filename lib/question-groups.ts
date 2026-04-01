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
  sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B";
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
 * Fetch, group, sort, and return all question groups for a topic with filters.
 * Returns the full sorted array of groups — caller handles slicing.
 */
export async function fetchQuestionGroups(
  topicId: string,
  subtopicInfos: SubtopicInfo[],
  filters: TopicQuestionFilters,
  userId?: string
): Promise<QuestionGroupData[]> {
  const examValues = filters.exam ? filters.exam.split(",").filter(Boolean) : [];
  const difficultyValues = filters.difficulty ? filters.difficulty.split(",").filter(Boolean) : [];
  const frequencyValues = filters.frequency ? filters.frequency.split(",").filter(Boolean) : [];

  // Frequency → subtopicIds
  const frequencySubtopicIds =
    frequencyValues.length > 0
      ? subtopicInfos.filter((s) => frequencyValues.includes(s.frequency)).map((s) => s.id)
      : null;

  // Build subtopics WHERE condition
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

  // Build exam OR conditions
  const examOrConditions: Record<string, unknown>[] = [];
  if (examValues.includes("EXAM_1"))
    examOrConditions.push({ exam: { examType: "EXAM_1" } });
  if (examValues.includes("EXAM_2_MC"))
    examOrConditions.push({ exam: { examType: "EXAM_2" }, part: null });
  if (examValues.includes("EXAM_2_B"))
    examOrConditions.push({ exam: { examType: "EXAM_2" }, part: { not: null } });

  const select = {
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
  };

  // Fetch matching questions
  const topicQuestions = await prisma.question.findMany({
    where: {
      topicId,
      ...subtopicsWhere,
      ...(difficultyValues.length > 0 && {
        difficulty: { in: difficultyValues as ("EASY" | "MEDIUM" | "HARD")[] },
      }),
      ...(examOrConditions.length > 0 && { OR: examOrConditions }),
    },
    select,
    orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }],
  });

  // Section B siblings
  const sectionBKeys = topicQuestions
    .filter((q) => q.part !== null)
    .map((q) => ({ examId: q.examId, questionNumber: q.questionNumber }));

  const sectionBSiblings =
    sectionBKeys.length > 0
      ? await prisma.question.findMany({
          where: {
            OR: sectionBKeys.map((k) => ({
              examId: k.examId,
              questionNumber: k.questionNumber,
              part: { not: null },
            })),
          },
          select,
          orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }, { part: "asc" }],
        })
      : [];

  // Merge
  const mcqQuestions = topicQuestions.filter((q) => q.part === null);
  const seenIds = new Set<string>();
  const merged = [...mcqQuestions, ...sectionBSiblings].filter((q) => {
    if (seenIds.has(q.id)) return false;
    seenIds.add(q.id);
    return true;
  });

  // Post-filter by exam section
  const questions =
    examValues.length > 0
      ? merged.filter((q) => {
          if (q.exam.examType === "EXAM_1") return examValues.includes("EXAM_1");
          if (q.part === null) return examValues.includes("EXAM_2_MC");
          return examValues.includes("EXAM_2_B");
        })
      : merged;

  // Group
  const groupMap = questions.reduce(
    (acc, q) => {
      const key =
        q.part === null
          ? `${q.examId}-MCQ-${q.questionNumber}`
          : `${q.examId}-PART-${q.questionNumber}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    },
    {} as Record<string, typeof questions>
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

  // Map to serializable shape
  return rawGroups.map(([key, group]) => {
    const allSubtopics = Array.from(
      new Set(group.flatMap((q) => q.subtopics.map((s) => s.name)))
    );
    return {
      key,
      year: group[0].exam.year,
      examType: group[0].exam.examType as "EXAM_1" | "EXAM_2",
      sectionLabel: getSectionLabel(group[0].exam.examType, group[0].part),
      frequency: getGroupFrequency(allSubtopics, subtopicInfos),
      topicName: group[0].topic.name,
      subtopics: allSubtopics,
      calculatorAllowed: group[0].exam.examType === "EXAM_2",
      parts: group.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        part: q.part,
        marks: q.marks,
        content: q.content,
        imageUrl: q.imageUrl,
        difficulty: q.difficulty,
        solution: q.solution,
        initialStatus: (q.attempts && Array.isArray(q.attempts) ? q.attempts[0]?.status : null) ?? null,
      })),
    };
  });
}
