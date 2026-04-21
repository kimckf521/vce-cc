import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import ExamModeWrapper from "@/components/ExamModeWrapper";
import Exam2ABModeWrapper from "@/components/Exam2ABModeWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import FreedomModeEnd from "@/components/FreedomModeEnd";
import { EXAM_CONFIG, type ExamMode } from "@/lib/exam-config";
import { getGeneratedQuestionSetId } from "@/lib/question-set-groups";

type QuestionSetItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE";

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

/**
 * Fetch QuestionSetItems from the "1st Generated Question Set" for the given
 * item types in ONE query. Groups them by topic and difficulty in memory.
 *
 * Each item becomes a single-part group (the generated set has no multi-part
 * structure — every item stands alone).
 */
async function fetchAllGrouped(
  types: QuestionSetItemType[]
): Promise<Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>> {
  const setId = await getGeneratedQuestionSetId();
  const byTopic = new Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>();
  if (!setId) return byTopic;

  const items = await prisma.questionSetItem.findMany({
    where: {
      questionSetId: setId,
      type: { in: types },
    },
    select: {
      id: true,
      topicId: true,
      type: true,
      marks: true,
      content: true,
      difficulty: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correctOption: true,
      solutionContent: true,
      topic: { select: { id: true, name: true } },
      subtopics: { select: { name: true } },
    },
  });

  for (const it of items) {
    const topicId = it.topic.id;
    const diff = it.difficulty as "EASY" | "MEDIUM" | "HARD";

    if (!byTopic.has(topicId)) {
      byTopic.set(topicId, { EASY: [], MEDIUM: [], HARD: [] });
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

    const group: QuestionGroupData = {
      examId: `gen-${it.id}`,
      year: 0, // sentinel — QuestionGroup hides year when 0
      examType: "EXAM_1", // placeholder; not rendered (sectionLabel is passed explicitly)
      topicName: it.topic.name,
      subtopics: it.subtopics.map((s) => s.name),
      parts: [
        {
          id: it.id,
          questionNumber: 1,
          part: null,
          marks: it.marks,
          content: contentWithOptions,
          imageUrl: null,
          difficulty: diff,
          solution: solutionContent
            ? { content: solutionContent, videoUrl: null }
            : null,
          initialStatus: null,
        },
      ],
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
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-red-400">
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

    // Single batch fetch for all MCQ + Extended Response items across all topics
    const [poolA, poolB] = await Promise.all([
      fetchAllGrouped(["MCQ"]),
      fetchAllGrouped(["EXTENDED_RESPONSE"]),
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

    const sumMarks = (groups: QuestionGroupData[]) =>
      groups.reduce(
        (acc, g) => acc + g.parts.reduce((p, part) => p + part.marks, 0),
        0
      );
    const marksA = sumMarks(shuffledA);
    const marksB = sumMarks(shuffledB);
    const totalMarksAB = marksA + marksB;

    return (
      <div className="space-y-8">
        {/* Timer — only for non-exam-mode (Exam2ABModeWrapper manages its own timer) */}
        {showTimer && !isExam2ABExamMode && <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />}

        {/* Header */}
        <div>
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-400 transition-colors mb-4">
            ← Back to Setup
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {modeLabel}
            <span className="ml-2 text-lg lg:text-xl font-normal text-gray-400 dark:text-gray-500">— {versionLabel}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {totalQuestions} questions · {totalMarksAB} marks
            {totalMarksAB !== 80 && (
              <span className="text-gray-400 dark:text-gray-500">
                {" "}(VCE target: 80)
              </span>
            )}
            {" · CAS Calculator allowed"}
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
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 lg:pb-3">
                Section A — Multiple Choice ({shuffledA.length} questions · {marksA} marks)
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
                    disableServerRefresh
                  />
                ))}
              </div>
            </div>

            {/* Section B */}
            <div className="space-y-5 lg:space-y-6">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 lg:pb-3">
                Section B — Extended Response ({shuffledB.length} questions · {marksB} marks)
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
                    disableServerRefresh
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

  let itemTypes: QuestionSetItemType[];
  let sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B";
  let calcInfo: string;

  if (mode === "exam1") {
    itemTypes = ["SHORT_ANSWER"];
    sectionLabel = "Exam 1";
    calcInfo = "No calculator";
  } else if (mode === "exam2a") {
    itemTypes = ["MCQ"];
    sectionLabel = "Exam 2A";
    calcInfo = "CAS Calculator allowed";
  } else {
    // exam2b
    itemTypes = ["EXTENDED_RESPONSE"];
    sectionLabel = "Exam 2B";
    calcInfo = "CAS Calculator allowed";
  }

  // Single batch fetch, then pick per topic
  const pool = await fetchAllGrouped(itemTypes);
  const allGroups: QuestionGroupData[] = [];
  topics.forEach((topic, i) => {
    allGroups.push(...pickGroupsForTopic(pool.get(topic.id), counts[i] ?? 0, diffDist));
  });

  const finalGroups = shuffle(allGroups);

  // Sum the marks across every part of every group — used to surface the
  // total in the header so users can compare against the real VCAA target
  // (40 for Exam 1, 20 for Exam 2A, 60 for Exam 2B).
  const totalMarks = finalGroups.reduce(
    (acc, g) => acc + g.parts.reduce((p, part) => p + part.marks, 0),
    0
  );
  const realTotal =
    mode === "exam1" ? 40 : mode === "exam2a" ? 20 : mode === "exam2b" ? 60 : null;

  const isExamMode = (mode === "exam1" || mode === "exam2a" || mode === "exam2b") && version === "exam";

  return (
    <div className="space-y-8">
      {/* Timer — only for non-exam-mode (ExamModeWrapper manages its own timer) */}
      {showTimer && !isExamMode && <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />}

      {/* Header */}
      <div>
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-400 transition-colors mb-4">
          ← Back to Setup
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {modeLabel}
          <span className="ml-2 text-lg lg:text-xl font-normal text-gray-400 dark:text-gray-500">— {versionLabel}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {finalGroups.length} questions · {totalMarks} marks
          {isExamMode && realTotal !== null && totalMarks !== realTotal && (
            <span className="text-gray-400 dark:text-gray-500">
              {" "}(VCE target: {realTotal})
            </span>
          )}
          {" · "}
          {calcInfo}
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
            enableSelfMarking={mode === "exam1" || mode === "exam2b"}
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
              disableServerRefresh
            />
          ))}
          <FreedomModeEnd setupHref={backHref} />
        </div>
      )}
    </div>
  );
}
