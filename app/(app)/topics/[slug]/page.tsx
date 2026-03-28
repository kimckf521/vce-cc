export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";
import TopicFilters from "@/components/TopicFilters";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    subtopic?: string;
    exam?: string;
    difficulty?: string;
    frequency?: string;
  }>;
}

export default async function TopicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { subtopic, exam, difficulty, frequency } = await searchParams;

  // Fetch topic with subtopics + question years for frequency computation
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      subtopics: {
        orderBy: { order: "asc" },
        include: {
          questions: { select: { exam: { select: { year: true } } } },
        },
      },
    },
  });
  if (!topic) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Compute frequency tier for each subtopic (based on number of distinct years it appears in)
  const subtopicInfos = topic.subtopics.map((sub) => {
    const yearCount = new Set(sub.questions.map((q) => q.exam.year)).size;
    const freq: "rare" | "normal" | "often" =
      yearCount >= 6 ? "often" : yearCount >= 3 ? "normal" : "rare";
    return { id: sub.id, name: sub.name, slug: sub.slug, frequency: freq };
  });

  // Parse filters
  const examValues = exam ? exam.split(",").filter(Boolean) : [];
  const difficultyValues = difficulty ? difficulty.split(",").filter(Boolean) : [];
  const frequencyValues = frequency ? frequency.split(",").filter(Boolean) : [];

  // Frequency → subtopicIds
  const frequencySubtopicIds =
    frequencyValues.length > 0
      ? subtopicInfos.filter((s) => frequencyValues.includes(s.frequency)).map((s) => s.id)
      : null;

  // Build subtopics WHERE condition (subtopic slug + frequency)
  const subtopicConditions: Record<string, unknown>[] = [];
  if (subtopic) subtopicConditions.push({ slug: subtopic });
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
    attempts: user ? ({ where: { userId: user.id }, select: { status: true } } as const) : (false as const),
  };

  // Fetch matching questions for this topic
  const topicQuestions = await prisma.question.findMany({
    where: {
      topicId: topic.id,
      ...subtopicsWhere,
      ...(difficultyValues.length > 0 && {
        difficulty: { in: difficultyValues as ("EASY" | "MEDIUM" | "HARD")[] },
      }),
      ...(examOrConditions.length > 0 && { OR: examOrConditions }),
    },
    select,
    orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }],
  });

  // For Section B questions (part !== null), fetch all sibling parts (even from other topics)
  // so the full question group is always shown together.
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
              part: { not: null }, // never mix with MCQs
            })),
          },
          select,
          orderBy: [
            { exam: { year: "desc" } },
            { questionNumber: "asc" },
            { part: "asc" },
          ],
        })
      : [];

  // Merge: MCQs stay standalone, Section B siblings fill out full question groups
  const mcqQuestions = topicQuestions.filter((q) => q.part === null);
  const seenIds = new Set<string>();
  const merged = [...mcqQuestions, ...sectionBSiblings].filter((q) => {
    if (seenIds.has(q.id)) return false;
    seenIds.add(q.id);
    return true;
  });

  // Post-filter by exam section (handles cases where siblings added unwanted types)
  const questions =
    examValues.length > 0
      ? merged.filter((q) => {
          if (q.exam.examType === "EXAM_1") return examValues.includes("EXAM_1");
          if (q.part === null) return examValues.includes("EXAM_2_MC");
          return examValues.includes("EXAM_2_B");
        })
      : merged;

  // Group questions:
  //   MCQs (part=null) → each is its own group, key: examId-MCQ-questionNumber
  //   Section B (part≠null) → grouped by questionNumber, key: examId-PART-questionNumber
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
  const groups = Object.values(groupMap);

  // ── Sorting ──────────────────────────────────────────────────────────────
  // Priority 1: MCQ (Exam 2A) → Short answer (Exam 1) → Extended (Exam 2B)
  // Priority 2: Easy → Medium → Hard
  // Tiebreaker: most recent year first, then question number ascending
  const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;

  // Frequency: pick the highest tier among all subtopics of the group
  function getGroupFrequency(subtopicNames: string[]): "rare" | "normal" | "often" | undefined {
    const freqs = subtopicNames
      .map((n) => subtopicInfos.find((s) => s.name === n)?.frequency)
      .filter(Boolean) as ("rare" | "normal" | "often")[];
    if (freqs.includes("often")) return "often";
    if (freqs.includes("normal")) return "normal";
    if (freqs.length > 0) return "rare";
    return undefined;
  }

  function getGroupSortType(g: (typeof groups)[0]): 0 | 1 | 2 {
    if (g[0].exam.examType === "EXAM_2" && g[0].part === null) return 0; // MCQ first
    if (g[0].exam.examType === "EXAM_1") return 1;                        // Exam 1 second
    return 2;                                                              // Exam 2B last
  }

  function getSectionLabel(g: (typeof groups)[0]): "Exam 1" | "Exam 2A" | "Exam 2B" {
    if (g[0].exam.examType === "EXAM_1") return "Exam 1";
    if (g[0].part === null) return "Exam 2A";
    return "Exam 2B";
  }

  groups.sort((a, b) => {
    const typeA = getGroupSortType(a);
    const typeB = getGroupSortType(b);
    if (typeA !== typeB) return typeA - typeB;
    const diffA = DIFFICULTY_ORDER[a[0].difficulty];
    const diffB = DIFFICULTY_ORDER[b[0].difficulty];
    if (diffA !== diffB) return diffA - diffB;
    if (a[0].exam.year !== b[0].exam.year) return b[0].exam.year - a[0].exam.year;
    return a[0].questionNumber - b[0].questionNumber;
  });

  return (
    <div>
      <Link
        href="/topics"
        className="inline-flex items-center gap-1 text-sm lg:text-base text-gray-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" /> All topics
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{topic.name}</h1>
      <p className="text-gray-500 lg:text-base mb-8">{groups.length} questions</p>

      {/* Horizontal filter bar */}
      <Suspense>
        <TopicFilters slug={slug} subtopics={subtopicInfos} />
      </Suspense>

      {/* Question list */}
      <div className="space-y-4 lg:space-y-5">
          {groups.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
              No questions found for this filter.
            </div>
          )}
          {groups.map((group, i) => {
            const allSubtopics = Array.from(
              new Set(group.flatMap((q) => q.subtopics.map((s) => s.name)))
            );
            const calculatorAllowed = group[0].exam.examType === "EXAM_2";
            const groupKey =
              group[0].part === null
                ? `${group[0].examId}-MCQ-${group[0].questionNumber}`
                : `${group[0].examId}-PART-${group[0].questionNumber}`;

            return (
              <QuestionGroup
                key={groupKey}
                year={group[0].exam.year}
                examType={group[0].exam.examType}
                sectionLabel={getSectionLabel(group)}
                questionIndex={i + 1}
                frequency={getGroupFrequency(allSubtopics)}
                topic={group[0].topic.name}
                subtopics={allSubtopics}
                calculatorAllowed={calculatorAllowed}
                parts={group.map((q) => ({
                  id: q.id,
                  questionNumber: q.questionNumber,
                  part: q.part,
                  marks: q.marks,
                  content: q.content,
                  imageUrl: q.imageUrl,
                  difficulty: q.difficulty,
                  solution: q.solution,
                  initialStatus: q.attempts?.[0]?.status ?? null,
                }))}
              />
            );
          })}
      </div>
    </div>
  );
}
