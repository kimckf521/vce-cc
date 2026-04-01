import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import ExamModeWrapper from "@/components/ExamModeWrapper";
import Exam2ABModeWrapper from "@/components/Exam2ABModeWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import { EXAM_CONFIG, type ExamMode } from "@/lib/exam-config";

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
    solutions?: string;
    timer?: string;
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

/**
 * Fetch ALL question rows for the given exam type + part condition in ONE query.
 * Groups them by topic and difficulty in memory — far faster than N per-topic queries.
 */
async function fetchAllGrouped(
  examTypeFilter: "EXAM_1" | "EXAM_2",
  partCondition: PartCondition
): Promise<Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>> {
  const rows = (await prisma.question.findMany({
    where: {
      exam: { examType: examTypeFilter },
      ...(partCondition === "null_only" ? { part: null } : {}),
      ...(partCondition === "not_null" ? { part: { not: null } } : {}),
    },
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { id: true, name: true } },
      subtopics: { select: { name: true } },
      solution: { select: { content: true, imageUrl: true, videoUrl: true } },
    },
    orderBy: [{ exam: { year: "asc" } }, { questionNumber: "asc" }],
  })) as (QuestionRow & { topic: { id: string; name: string } })[];

  // Group rows into question groups, keyed by topicId
  const byTopic = new Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>();

  const groupMap = new Map<string, (typeof rows)[0][]>();
  for (const row of rows) {
    const key =
      row.part === null
        ? row.id
        : `${row.exam.year}-${row.exam.examType}-${row.questionNumber}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(row);
  }

  for (const parts of Array.from(groupMap.values())) {
    const first = parts[0];
    const topicId = first.topic.id;
    const diff: "EASY" | "MEDIUM" | "HARD" = first.difficulty;

    if (!byTopic.has(topicId)) {
      byTopic.set(topicId, { EASY: [], MEDIUM: [], HARD: [] });
    }

    const group: QuestionGroupData = {
      examId: `${first.exam.year}-${first.exam.examType}`,
      year: first.exam.year,
      examType: first.exam.examType,
      topicName: first.topic.name,
      subtopics: first.subtopics.map((s: { name: string }) => s.name),
      parts: parts.map((p) => ({
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
    byTopic.get(topicId)![diff].push(group);
  }

  return byTopic;
}

/**
 * Pick question groups from a pre-fetched pool for a single topic.
 */
function pickGroupsForTopic(
  pool: Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]> | undefined,
  topicCount: number,
  diffDist: [number, number, number]
): QuestionGroupData[] {
  if (topicCount <= 0 || !pool) return [];

  const [easyCount, mediumCount, hardCount] = distributeToCounts(diffDist, topicCount);
  const easyPool = shuffle([...pool.EASY]);
  const mediumPool = shuffle([...pool.MEDIUM]);
  const hardPool = shuffle([...pool.HARD]);

  const picked = [
    ...easyPool.splice(0, easyCount),
    ...mediumPool.splice(0, mediumCount),
    ...hardPool.splice(0, hardCount),
  ];

  let deficit = topicCount - picked.length;
  if (deficit > 0) {
    const remaining = shuffle([...easyPool, ...mediumPool, ...hardPool]);
    picked.push(...remaining.slice(0, deficit));
  }

  return picked;
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
  const showSolutionButton = params.solutions === "1";
  const showTimer = params.timer === "1";

  // Timer durations from central config
  const examCfg = EXAM_CONFIG[mode as ExamMode];
  const readingSeconds = examCfg?.readingSeconds ?? 15 * 60;
  const writingSeconds = examCfg?.writingSeconds ?? 60 * 60;

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

    // Single batch fetch for all MCQ + Section B questions across all topics
    const [poolA, poolB] = await Promise.all([
      fetchAllGrouped("EXAM_2", "null_only"),
      fetchAllGrouped("EXAM_2", "not_null"),
    ]);

    const groupsA: QuestionGroupData[] = [];
    const groupsB: QuestionGroupData[] = [];
    topics.forEach((topic, i) => {
      groupsA.push(...pickGroupsForTopic(poolA.get(topic.id), countsA[i] ?? 0, diffDist));
      groupsB.push(...pickGroupsForTopic(poolB.get(topic.id), countsB[i] ?? 0, diffDist));
    });

    const shuffledA = shuffle(groupsA);
    const shuffledB = shuffle(groupsB);
    const totalQuestions = shuffledA.length + shuffledB.length;
    const isExam2ABExamMode = version === "exam";

    return (
      <div className="space-y-8">
        {/* Timer — only for non-exam-mode (Exam2ABModeWrapper manages its own timer) */}
        {showTimer && !isExam2ABExamMode && <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />}

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

        {isExam2ABExamMode ? (
          <ErrorBoundary>
            <Exam2ABModeWrapper
              groupsA={shuffledA}
              groupsB={shuffledB}
              showSolutionsAsYouGo={showSolutionButton}
              showTimer={showTimer}
              readingSeconds={readingSeconds}
              writingSeconds={writingSeconds}
            />
          </ErrorBoundary>
        ) : (
          <>
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
                    showSolutionButton={showSolutionButton}
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
                    showSolutionButton={showSolutionButton}
                  />
                ))}
              </div>
            </div>
          </>
        )}
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

  // Single batch fetch, then pick per topic
  const pool = await fetchAllGrouped(examTypeFilter, partCondition);
  const allGroups: QuestionGroupData[] = [];
  topics.forEach((topic, i) => {
    allGroups.push(...pickGroupsForTopic(pool.get(topic.id), counts[i] ?? 0, diffDist));
  });

  const finalGroups = shuffle(allGroups);

  const isExamMode = (mode === "exam1" || mode === "exam2a" || mode === "exam2b") && version === "exam";

  return (
    <div className="space-y-8">
      {/* Timer — only for non-exam-mode (ExamModeWrapper manages its own timer) */}
      {showTimer && !isExamMode && <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />}

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

      {/* Questions — exam versions use ExamModeWrapper */}
      {isExamMode ? (
        <ErrorBoundary>
          <ExamModeWrapper
            groups={finalGroups}
            totalQuestions={finalGroups.length}
            sectionLabel={sectionLabel}
            calculatorAllowed={calculatorAllowed}
            showSolutionsAsYouGo={showSolutionButton}
            showTimer={showTimer}
            readingSeconds={readingSeconds}
            writingSeconds={writingSeconds}
            isMcqMode={mode !== "exam2b"}
            showScore={mode === "exam2a"}
          />
        </ErrorBoundary>
      ) : (
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
              showSolutionButton={showSolutionButton}
            />
          ))}
        </div>
      )}
    </div>
  );
}
