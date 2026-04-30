import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import ExamModeWrapper from "@/components/ExamModeWrapper";
import Exam2ABModeWrapper from "@/components/Exam2ABModeWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import FreedomModeEnd from "@/components/FreedomModeEnd";
import { EXAM_CONFIG, type ExamMode } from "@/lib/exam-config";
import { getPracticeQuestionSetId, approvedItemsFilter } from "@/lib/question-set-groups";
import { createClient } from "@/lib/supabase/server";

type QuestionSetItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

/**
 * Shape of the `parts` JSON column. Multi-part items (EXTENDED_ANSWER,
 * EXTENDED_RESPONSE) store their sub-structure natively in this array.
 * Single-part items (MCQ, SHORT_ANSWER) have parts=null.
 */
interface PartJson {
  label: string; // "a", "b", "c", ...
  marks: number;
  content: string;
  solution: string | null;
  subParts?: {
    label: string; // "i", "ii", ...
    marks: number;
    content: string;
    solution: string | null;
  }[];
}

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
    /** "1" → bias the random pick toward questions the user got wrong / flagged for review */
    weak?: string;
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
  const setId = await getPracticeQuestionSetId();
  const byTopic = new Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>();
  if (!setId) return byTopic;

  const items = await prisma.questionSetItem.findMany({
    where: {
      ...approvedItemsFilter(setId),
      type: { in: types },
    },
    select: {
      id: true,
      topicId: true,
      type: true,
      marks: true,
      preamble: true,
      parts: true,
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

    let groupParts: QuestionGroupData["parts"];

    // Multi-part items (EXTENDED_ANSWER, EXTENDED_RESPONSE) render from the
    // `parts` JSON column directly — no markdown parsing.
    if ((it.type === "EXTENDED_ANSWER" || it.type === "EXTENDED_RESPONSE") && Array.isArray(it.parts)) {
      const parts = it.parts as unknown as PartJson[];
      const rows: QuestionGroupData["parts"] = [];
      let rowIndex = 0;

      for (const p of parts) {
        // If a part has sub-parts, each sub-part becomes its own rendered row
        // (so SelfMarkStepper can mark each independently). Otherwise the
        // part itself is a single row.
        const sub = Array.isArray(p.subParts) ? p.subParts : null;
        if (sub && sub.length > 0) {
          for (const sp of sub) {
            const partLabel = `${p.label}.${sp.label}`;
            const partId = `${it.id}::${partLabel}`;
            const content =
              rowIndex === 0 && it.preamble
                ? `---PREAMBLE---\n${it.preamble}\n---QUESTION---\n${sp.content}`
                : sp.content;
            rows.push({
              id: partId,
              questionNumber: 1,
              part: partLabel,
              marks: sp.marks,
              content,
              imageUrl: null,
              difficulty: diff,
              solution: sp.solution ? { content: sp.solution, videoUrl: null } : null,
              initialStatus: null,
            });
            rowIndex++;
          }
        } else {
          const partId = `${it.id}::${p.label}`;
          const content =
            rowIndex === 0 && it.preamble
              ? `---PREAMBLE---\n${it.preamble}\n---QUESTION---\n${p.content}`
              : p.content;
          rows.push({
            id: partId,
            questionNumber: 1,
            part: p.label,
            marks: p.marks,
            content,
            imageUrl: null,
            difficulty: diff,
            solution: p.solution ? { content: p.solution, videoUrl: null } : null,
            initialStatus: null,
          });
          rowIndex++;
        }
      }
      groupParts = rows;
    } else {
      // MCQ + SHORT_ANSWER stay single-part. MCQs stitch options into the
      // body and embed the answer key inside the solution.
      const contentWithOptions =
        it.type === "MCQ" && it.optionA
          ? `${it.content}\n\n**A.** ${it.optionA}\n\n**B.** ${it.optionB ?? ""}\n\n**C.** ${it.optionC ?? ""}\n\n**D.** ${it.optionD ?? ""}`
          : it.content;

      const solutionContent =
        it.type === "MCQ" && it.correctOption && it.solutionContent
          ? `**Answer: ${it.correctOption}**\n\n${it.solutionContent}`
          : it.solutionContent ?? "";

      groupParts = [
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
      ];
    }

    const group: QuestionGroupData = {
      examId: `gen-${it.id}`,
      year: 0, // sentinel — QuestionGroup hides year when 0
      examType: "EXAM_1", // placeholder; not rendered (sectionLabel is passed explicitly)
      topicName: it.topic.name,
      subtopics: it.subtopics.map((s) => s.name),
      parts: groupParts,
    };
    byTopic.get(topicId)![diff].push(group);
  }

  return byTopic;
}

/**
 * Strip the part suffix (`::a`) from an EXTENDED_RESPONSE part id so we can
 * compare it against the QuestionSetItem id stored in QuestionSetAttempt.
 */
function getParentItemId(group: QuestionGroupData): string {
  const partId = group.parts[0]?.id ?? "";
  const i = partId.indexOf("::");
  return i === -1 ? partId : partId.slice(0, i);
}

/**
 * Weighted shuffle: items in `weakIds` get a 3× boost (their random sort key
 * is divided by 3, so they tend to land at the front and get picked first).
 * Falls through to a plain uniform shuffle when `weakIds` is empty.
 */
function weightedShuffle(
  items: QuestionGroupData[],
  weakIds: Set<string>
): QuestionGroupData[] {
  if (weakIds.size === 0) return shuffle(items);
  return items
    .map((g) => {
      const isWeak = weakIds.has(getParentItemId(g));
      return { g, sort: Math.random() / (isWeak ? 3 : 1) };
    })
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.g);
}

/**
 * Sum the marks across all parts of a single QuestionGroupData.
 */
function groupMarks(g: QuestionGroupData): number {
  return g.parts.reduce((s, p) => s + p.marks, 0);
}

/**
 * Pick question groups across the *combined* pool of all topics whose
 * cumulative marks land as close as possible to the target without going
 * over (greedy fit). Drives the Exam Version of Exam 1 (40-mark target)
 * and Exam 2B / Section B of 2A&2B (60-mark target) so the practice paper
 * hits the real VCAA mark totals regardless of question count.
 *
 * Topic and difficulty distributions are applied as *soft preferences* on
 * the shuffle weight (not hard splits) — splitting a small budget into
 * tiny per-topic / per-difficulty buckets caused large EXTENDED_RESPONSE
 * questions to either overshoot wildly or get rejected and the budget
 * unfilled. With one global pool, the picker can land within a couple of
 * marks of the target every time.
 */
function pickGroupsGloballyByMarks(
  poolsByTopic: Map<
    string,
    Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>
  >,
  topicIds: string[],
  topicDist: number[],
  marksTarget: number,
  diffDist: [number, number, number],
  weakIds: Set<string> = new Set()
): QuestionGroupData[] {
  if (marksTarget <= 0) return [];

  // Topic id → weight (replace 0 with epsilon so ratios stay sane).
  const topicWeight = new Map<string, number>();
  topicIds.forEach((tid, i) => {
    topicWeight.set(tid, (topicDist[i] ?? 0) > 0 ? topicDist[i] : 0.0001);
  });
  const [wEasy, wMed, wHard] = diffDist.map((p) =>
    p > 0 ? p : 0.0001
  ) as [number, number, number];

  // Build the combined ranked list once.
  const score = (g: QuestionGroupData, tid: string, diffWeight: number) => {
    const isWeak = weakIds.has(getParentItemId(g));
    const tWeight = topicWeight.get(tid) ?? 0.0001;
    return Math.random() / (tWeight * diffWeight * (isWeak ? 3 : 1));
  };

  // Build the un-ranked pool once; we'll re-shuffle a few times and keep
  // the attempt that lands closest to target. With large EXTENDED_RESPONSE
  // questions (9-15 marks), a single greedy pass often overshoots by ~5
  // marks, but ~10 random restarts reliably find one within ±2.
  const buildAttempt = (): { picked: QuestionGroupData[]; total: number } => {
    const all: { g: QuestionGroupData; sort: number }[] = [];
    Array.from(poolsByTopic.entries()).forEach(([tid, byDiff]) => {
      byDiff.EASY.forEach((g) => all.push({ g, sort: score(g, tid, wEasy) }));
      byDiff.MEDIUM.forEach((g) => all.push({ g, sort: score(g, tid, wMed) }));
      byDiff.HARD.forEach((g) => all.push({ g, sort: score(g, tid, wHard) }));
    });
    const ranked = all.sort((a, b) => a.sort - b.sort).map((x) => x.g);

    const picked: QuestionGroupData[] = [];
    let total = 0;

    // Pass 1: greedy fit — only accept questions that don't overshoot.
    for (const g of ranked) {
      if (total >= marksTarget) break;
      const m = groupMarks(g);
      if (total + m <= marksTarget) {
        picked.push(g);
        total += m;
      }
    }

    // Pass 2: if still under target (no remaining question fits the gap),
    // accept the smallest available overshoot to close it.
    if (total < marksTarget) {
      const used = new Set(picked);
      const remaining = ranked
        .filter((g) => !used.has(g))
        .sort((a, b) => groupMarks(a) - groupMarks(b));
      for (const g of remaining) {
        if (total >= marksTarget) break;
        picked.push(g);
        total += groupMarks(g);
      }
    }

    return { picked, total };
  };

  // Restart loop: keep the attempt with the smallest distance from target.
  // Bail early if any attempt hits the target exactly.
  let bestPicked: QuestionGroupData[] = [];
  let bestDistance = Infinity;
  const ATTEMPTS = 12;
  for (let i = 0; i < ATTEMPTS; i++) {
    const { picked, total } = buildAttempt();
    const distance = Math.abs(total - marksTarget);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPicked = picked;
      if (distance === 0) break;
    }
  }
  return bestPicked;
}

/**
 * Pick question groups from a pre-fetched pool for a single topic.
 * When `weakIds` is non-empty the sampling is biased toward those items.
 */
function pickGroupsForTopic(
  pool: Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]> | undefined,
  topicCount: number,
  diffDist: [number, number, number],
  weakIds: Set<string> = new Set()
): QuestionGroupData[] {
  if (topicCount <= 0 || !pool) return [];

  const [easyCount, mediumCount, hardCount] = distributeToCounts(diffDist, topicCount);
  const easyPool = weightedShuffle([...pool.EASY], weakIds);
  const mediumPool = weightedShuffle([...pool.MEDIUM], weakIds);
  const hardPool = weightedShuffle([...pool.HARD], weakIds);

  const picked = [
    ...easyPool.splice(0, easyCount),
    ...mediumPool.splice(0, mediumCount),
    ...hardPool.splice(0, hardCount),
  ];

  let deficit = topicCount - picked.length;
  if (deficit > 0) {
    const remaining = weightedShuffle(
      [...easyPool, ...mediumPool, ...hardPool],
      weakIds
    );
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
  const focusWeak = params.weak === "1";

  // When "Focus on weak areas" is on, pull the user's incorrect / needs-review
  // QuestionSetItem ids so the sampler can give them a 3× weight.
  let weakItemIds = new Set<string>();
  if (focusWeak) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const weakAttempts = await prisma.questionSetAttempt.findMany({
        where: {
          userId: user.id,
          status: { in: ["INCORRECT", "NEEDS_REVIEW"] },
        },
        select: { questionSetItemId: true },
      });
      weakItemIds = new Set(weakAttempts.map((a) => a.questionSetItemId));
    }
  }

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
    const countsA = distributeToCounts(dist, countA);
    // Section B targets the real VCAA mark total (60) rather than a fixed
    // count, so the practice paper hits the right marks regardless of how
    // many extended-response questions that takes.
    const SECTION_B_MARKS_TARGET = 60;

    // Single batch fetch for all MCQ + Extended Response items across all topics
    const [poolA, poolB] = await Promise.all([
      fetchAllGrouped(["MCQ"]),
      fetchAllGrouped(["EXTENDED_RESPONSE"]),
    ]);

    const groupsA: QuestionGroupData[] = [];
    // Section A — one MCQ per mark, count-based (always 20 MCQs = 20 marks).
    topics.forEach((topic, i) => {
      groupsA.push(
        ...pickGroupsForTopic(
          poolA.get(topic.id),
          countsA[i] ?? 0,
          diffDist,
          weakItemIds
        )
      );
    });
    // Section B — single global marks-target pick so the total lands at ~60.
    const groupsB: QuestionGroupData[] = pickGroupsGloballyByMarks(
      poolB,
      topics.map((t) => t.id),
      distB,
      SECTION_B_MARKS_TARGET,
      diffDist,
      weakItemIds
    );

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
            {Math.abs(totalMarksAB - 80) > 2 && (
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
    // Exam 1 = short-answer (Q1–Q5) + extended-answer (Q6–Q9). The picker
    // hits the 40-mark target by mixing both — no in-code compounding needed
    // because EXTENDED_ANSWER items are already multi-part in the DB.
    itemTypes = ["SHORT_ANSWER", "EXTENDED_ANSWER"];
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

  // Single batch fetch, then pick per topic.
  //
  // Exam Version of Exam 1 / Exam 2B sample by *marks* so the practice paper
  // hits the real VCAA total (40 / 60 marks) regardless of how many questions
  // that takes. Exam 2A and the Freedom Version stay count-based — Exam 2A
  // is exactly 20 × 1 mark MCQs, and Freedom is "pick N questions" by design.
  const pool = await fetchAllGrouped(itemTypes);
  const isMarksTargetMode =
    version === "exam" && (mode === "exam1" || mode === "exam2b");
  const marksTarget = mode === "exam1" ? 40 : 60;
  const allGroups: QuestionGroupData[] = [];

  if (isMarksTargetMode) {
    // Single global pick across all topics — topic + difficulty distributions
    // become soft preferences on the shuffle weight, not hard splits.
    const picked = pickGroupsGloballyByMarks(
      pool,
      topics.map((t) => t.id),
      dist,
      marksTarget,
      diffDist,
      weakItemIds
    );
    // Picker returns items as-is — EXTENDED_ANSWER / EXTENDED_RESPONSE are
    // already natively multi-part via the `parts` JSON column. No in-code
    // synthesis, no markdown parsing.
    allGroups.push(...picked);
  } else {
    topics.forEach((topic, i) => {
      allGroups.push(
        ...pickGroupsForTopic(
          pool.get(topic.id),
          counts[i] ?? 0,
          diffDist,
          weakItemIds
        )
      );
    });
  }

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
          {isExamMode &&
            realTotal !== null &&
            Math.abs(totalMarks - realTotal) > 2 && (
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
