export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";

interface PageProps {
  searchParams: Promise<{
    mode?: string;
    version?: string;
    count?: string;
    countA?: string;
    countB?: string;
    dist?: string;
    distB?: string;
    diff?: string;
  }>;
}

// ---------- helpers ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Distribute `total` items proportionally across buckets defined by percentages. */
function distributeToCounts(percentages: number[], total: number): number[] {
  const sum = percentages.reduce((a, b) => a + b, 0);
  if (sum === 0) return percentages.map(() => 0);

  // Raw fractional shares
  const raw = percentages.map((p) => (p / sum) * total);
  // Floor each
  const floored = raw.map(Math.floor);
  // Remainder to distribute
  let remainder = total - floored.reduce((a, b) => a + b, 0);
  // Sort by fractional part descending
  const indices = raw.map((v, i) => [v - Math.floor(v), i] as [number, number]);
  indices.sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < remainder; k++) {
    floored[indices[k][1]] += 1;
  }
  return floored;
}

// ---------- types ----------

interface QuestionRow {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  exam: { year: number; examType: "EXAM_1" | "EXAM_2" };
  topic: { name: string };
  subtopics: { name: string }[];
  solution: { content: string; imageUrl: string | null; videoUrl: string | null } | null;
}

interface QuestionGroupData {
  examId: string;
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  topicName: string;
  subtopics: string[];
  parts: {
    id: string;
    questionNumber: number;
    part: string | null;
    marks: number;
    content: string;
    imageUrl: string | null;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    solution: { content: string; videoUrl: string | null } | null;
    initialStatus: null;
  }[];
}

// ---------- fetch ----------

type PartCondition = "any" | "null_only" | "not_null";

/** Fetch all question rows for a topic, grouped into QuestionGroupData, split by difficulty. */
async function fetchGroupsByDifficulty(
  topicId: string,
  examTypeFilter: "EXAM_1" | "EXAM_2",
  partCondition: PartCondition
): Promise<Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>> {
  const rows = (await prisma.question.findMany({
    where: {
      topicId,
      exam: { examType: examTypeFilter },
      ...(partCondition === "null_only" ? { part: null } : {}),
      ...(partCondition === "not_null" ? { part: { not: null } } : {}),
    },
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      subtopics: { select: { name: true } },
      solution: { select: { content: true, imageUrl: true, videoUrl: true } },
    },
    orderBy: [{ exam: { year: "asc" } }, { questionNumber: "asc" }],
  })) as QuestionRow[];

  // Group rows into question groups
  const groupMap = new Map<string, QuestionRow[]>();
  for (const row of rows) {
    const key =
      row.part === null
        ? row.id
        : `${row.exam.year}-${row.exam.examType}-${row.questionNumber}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(row);
  }

  const result: Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]> = {
    EASY: [],
    MEDIUM: [],
    HARD: [],
  };

  for (const parts of Array.from(groupMap.values())) {
    const first = parts[0];
    const diff: "EASY" | "MEDIUM" | "HARD" = first.difficulty;
    const group: QuestionGroupData = {
      examId: `${first.exam.year}-${first.exam.examType}`,
      year: first.exam.year,
      examType: first.exam.examType,
      topicName: first.topic.name,
      subtopics: first.subtopics.map((s: { name: string }) => s.name),
      parts: parts.map((p: QuestionRow) => ({
        id: p.id,
        questionNumber: p.questionNumber,
        part: p.part,
        marks: p.marks,
        content: p.content,
        imageUrl: null,
        difficulty: p.difficulty,
        solution: p.solution
          ? { content: p.solution.content, videoUrl: p.solution.videoUrl }
          : null,
        initialStatus: null,
      })),
    };
    result[diff].push(group);
  }

  return result;
}

/**
 * For a single topic: fetch question groups respecting both topic count and
 * difficulty distribution ([easy%, medium%, hard%]).
 */
async function fetchGroupsForTopic(
  topicId: string,
  examTypeFilter: "EXAM_1" | "EXAM_2",
  partCondition: PartCondition,
  topicCount: number,
  diffDist: [number, number, number]
): Promise<QuestionGroupData[]> {
  if (topicCount <= 0) return [];

  const [easyCount, mediumCount, hardCount] = distributeToCounts(diffDist, topicCount);
  const byDiff = await fetchGroupsByDifficulty(topicId, examTypeFilter, partCondition);

  return [
    ...shuffle(byDiff.EASY).slice(0, easyCount),
    ...shuffle(byDiff.MEDIUM).slice(0, mediumCount),
    ...shuffle(byDiff.HARD).slice(0, hardCount),
  ];
}

// ---------- page ----------

export default async function SessionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mode = params.mode;

  if (!mode) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-semibold">Missing mode parameter.</p>
        <Link href="/practice" className="mt-2 inline-block text-sm underline">
          ← Back to Practice
        </Link>
      </div>
    );
  }

  const version = params.version ?? "exam";

  // Parse dist
  function parseDist(raw: string | undefined): number[] {
    if (!raw) return [25, 25, 25, 25];
    const parts = raw.split(",").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return [25, 25, 25, 25];
    return parts;
  }

  const dist = parseDist(params.dist);
  const distB = parseDist(params.distB);

  // Parse difficulty distribution — 3 values [easy%, medium%, hard%]
  function parseDiff(raw: string | undefined): [number, number, number] {
    if (!raw) return [50, 30, 20];
    const parts = raw.split(",").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return [50, 30, 20];
    return [parts[0], parts[1], parts[2]];
  }

  const diffDist = parseDiff(params.diff);

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Mode labels
  const modeLabels: Record<string, string> = {
    exam1: "Exam 1 Practice",
    exam2a: "Exam 2A Practice",
    exam2b: "Exam 2B Practice",
    exam2ab: "Exam 2A & 2B Practice",
  };
  const versionLabel = version === "exam" ? "Exam Version" : "Freedom Version";
  const modeLabel = modeLabels[mode] ?? mode;
  const backHref = `/practice/${mode}`;
  const calculatorAllowed = mode !== "exam1";

  // Fetch questions based on mode
  if (mode === "exam2ab") {
    const countA = parseInt(params.countA ?? "20", 10);
    const countB = parseInt(params.countB ?? "5", 10);
    const countsA = distributeToCounts(dist, countA);
    const countsB = distributeToCounts(distB, countB);

    const groupsA: QuestionGroupData[] = [];
    const groupsB: QuestionGroupData[] = [];

    await Promise.all(
      topics.map(async (topic, i) => {
        const a = await fetchGroupsForTopic(topic.id, "EXAM_2", "null_only", countsA[i] ?? 0, diffDist);
        const b = await fetchGroupsForTopic(topic.id, "EXAM_2", "not_null", countsB[i] ?? 0, diffDist);
        groupsA.push(...a);
        groupsB.push(...b);
      })
    );

    const shuffledA = shuffle(groupsA);
    const shuffledB = shuffle(groupsB);
    const totalQuestions = shuffledA.length + shuffledB.length;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors mb-4">
            ← Back to Setup
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {modeLabel}
            <span className="ml-2 text-lg lg:text-xl font-normal text-gray-400">— {versionLabel}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalQuestions} questions · CAS Calculator allowed
          </p>
        </div>

        {/* Section A */}
        <div className="space-y-5 lg:space-y-6">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 lg:pb-3">
            Section A — Multiple Choice ({shuffledA.length} questions)
          </h2>
          <div className="space-y-4 lg:space-y-5">
            {shuffledA.map((group, idx) => (
              <QuestionGroup
                key={`a-${group.examId}-${group.parts[0].questionNumber}`}
                year={group.year}
                examType={group.examType}
                sectionLabel="Exam 2A"
                questionIndex={idx + 1}
                topic={group.topicName}
                subtopics={group.subtopics}
                calculatorAllowed={true}
                parts={group.parts}
              />
            ))}
          </div>
        </div>

        {/* Section B */}
        <div className="space-y-5 lg:space-y-6">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 lg:pb-3">
            Section B — Extended Response ({shuffledB.length} questions)
          </h2>
          <div className="space-y-4 lg:space-y-5">
            {shuffledB.map((group, idx) => (
              <QuestionGroup
                key={`b-${group.examId}-${group.parts[0].questionNumber}`}
                year={group.year}
                examType={group.examType}
                sectionLabel="Exam 2B"
                questionIndex={idx + 1}
                topic={group.topicName}
                subtopics={group.subtopics}
                calculatorAllowed={true}
                parts={group.parts}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Single-mode (exam1, exam2a, exam2b)
  const count = parseInt(params.count ?? "10", 10);
  const counts = distributeToCounts(dist, count);

  let examTypeFilter: "EXAM_1" | "EXAM_2";
  let partCondition: PartCondition;
  let sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B";
  let calcInfo: string;

  if (mode === "exam1") {
    examTypeFilter = "EXAM_1";
    partCondition = "any";
    sectionLabel = "Exam 1";
    calcInfo = "No calculator";
  } else if (mode === "exam2a") {
    examTypeFilter = "EXAM_2";
    partCondition = "null_only";
    sectionLabel = "Exam 2A";
    calcInfo = "CAS Calculator allowed";
  } else {
    // exam2b
    examTypeFilter = "EXAM_2";
    partCondition = "not_null";
    sectionLabel = "Exam 2B";
    calcInfo = "CAS Calculator allowed";
  }

  const allGroups: QuestionGroupData[] = [];
  await Promise.all(
    topics.map(async (topic, i) => {
      const groups = await fetchGroupsForTopic(topic.id, examTypeFilter, partCondition, counts[i] ?? 0, diffDist);
      allGroups.push(...groups);
    })
  );

  const finalGroups = shuffle(allGroups);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors mb-4">
          ← Back to Setup
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {modeLabel}
          <span className="ml-2 text-lg lg:text-xl font-normal text-gray-400">— {versionLabel}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {finalGroups.length} questions · {calcInfo}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4 lg:space-y-5">
        {finalGroups.map((group, idx) => (
          <QuestionGroup
            key={`${group.examId}-${group.parts[0].questionNumber}-${idx}`}
            year={group.year}
            examType={group.examType}
            sectionLabel={sectionLabel}
            questionIndex={idx + 1}
            topic={group.topicName}
            subtopics={group.subtopics}
            calculatorAllowed={calculatorAllowed}
            parts={group.parts}
          />
        ))}
      </div>
    </div>
  );
}
