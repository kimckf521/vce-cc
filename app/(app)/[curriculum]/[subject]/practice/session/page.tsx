import Link from "next/link";
import BackLink from "@/components/BackLink";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";
import PracticeTimer from "@/components/PracticeTimer";
import ExamModeWrapper from "@/components/ExamModeWrapper";
import Exam2ABModeWrapper from "@/components/Exam2ABModeWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import FreedomModeEnd from "@/components/FreedomModeEnd";
import { EXAM_CONFIG, type ExamMode } from "@/lib/exam-config";
import { getPracticeQuestionSetId } from "@/lib/question-set-groups";
import {
  type FallbackTracker,
  type QuestionGroupData,
  type QuestionSetItemType,
  techFilterForMode,
  shuffle,
  distributeToCounts,
  fetchWithFallback,
  getParentItemId,
  groupMarks,
  sortByDifficultyEscalation,
  sectionBCoverageIssues,
  rankPool,
  findExactMarksSubset,
  pickGroupsGloballyByMarks,
  pickGroupsForTopic,
  parseDist,
  parseDiff,
} from "@/lib/paper-assembler";
import { createClient } from "@/lib/supabase/server";
import PaywallScreen from "@/components/PaywallScreen";
import { canAccessPaidPractice } from "@/lib/practice-gate";

interface PageProps {
  params: Promise<{
    curriculum: string;
    /**
     * Subject slug from the URL: `methods` | `general` | `specialist` |
     * `foundation`. Maps to the DB `Subject.slug` (which is prefixed:
     * `mathematical-methods`, `vce-general`, etc.) via `subjectSlugFromUrl`.
     */
    subject: string;
  }>;
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

/**
 * Map the short URL subject segment to the canonical DB `Subject.slug`.
 * URL routes use a friendly short form (`/vce/methods/...`) while the DB
 * uses the full curriculum-prefixed slug. Keep this map in sync with the
 * `Subject` table.
 */
function subjectSlugFromUrl(urlSegment: string): string | null {
  const map: Record<string, string> = {
    methods: "mathematical-methods",
    general: "vce-general",
    specialist: "vce-specialist",
    foundation: "vce-foundation",
  };
  return map[urlSegment] ?? null;
}

/**
 * Subject-specific paper-shape parameters. Each VCE Maths subject has a
 * different exam structure, so the picker can't assume Methods' shape.
 *
 *   Methods    : Exam 1 = 5 short + 4 ext-ans, 40m
 *                Exam 2A = 20 MCQ, 20m
 *                Exam 2B = 5 ext-resp, 60m
 *   Specialist : same as Methods EXCEPT Section B is 6 ext-resp (not 5)
 *   General    : Exam 1 = 40 MCQ, 40m (NO short/ext-ans split)
 *                Exam 2  = 9 ext-resp, 60m (no Section A/B split — there
 *                is just one Exam 2 paper)
 *   Foundation : single paper = 6 short + 4 ext-resp, 60m. We route the
 *                `exam1` mode to this (Foundation only has one paper).
 */
interface PaperStructure {
  /** Type used as the "short" leg of Exam 1 (MCQ for General). */
  exam1ShortType: QuestionSetItemType;
  /**
   * Type used as the "extended" leg of Exam 1.
   * null for General — Exam 1 is MCQ-only, no second leg.
   */
  exam1ExtType: QuestionSetItemType | null;
  /** Target marks for Exam 1 paper. */
  exam1MarksTarget: number;
  /** How many short items (or MCQs, for General). */
  exam1ShortCount: number;
  /** Max number of extended items in Exam 1. */
  exam1ExtMax: number;
  /** Type used in Exam 2 Section B (and full Exam 2 for General). */
  exam2bExtType: QuestionSetItemType;
  /** Target marks for Section B / Exam 2. */
  exam2bMarksTarget: number;
  /** Max number of items in Section B. Methods=5, Specialist=6, General=9, Foundation=5. */
  exam2bMax: number;
}

function getPaperStructure(subjectSlug: string | null): PaperStructure {
  switch (subjectSlug) {
    case "vce-specialist":
      // Real VCE Specialist Exam 1 (2016-2025) consistently has 9-10
      // questions / 40 marks: ~5 short Q1-Q5 (~2-3 marks each, often
      // multi-part) + ~4-5 longer Q6-Q10. The Methods-shaped exam1ShortCount=4
      // was producing 8-question papers (4 SHORT + 4 EXT). Bumping the
      // SHORT half to 5 lands the picker on 9-10 — matching VCAA reality.
      return {
        exam1ShortType: "SHORT_ANSWER",
        exam1ExtType: "EXTENDED_ANSWER",
        exam1MarksTarget: 40,
        exam1ShortCount: 5,
        exam1ExtMax: 5,
        exam2bExtType: "EXTENDED_RESPONSE",
        exam2bMarksTarget: 60,
        exam2bMax: 6,
      };
    case "vce-general":
      // General Exam 2 is one extended-response paper (no Section A/B split).
      // Real VCAA structure: ~15-18 multi-part questions totalling 60 marks.
      // The practice Exam Set (`isDefault: true`) for General holds 54
      // EXTENDED_RESPONSE items at 5-8 marks each — picking ~9 of them
      // covers the 60-mark target.
      return {
        exam1ShortType: "MCQ",
        exam1ExtType: null,
        exam1MarksTarget: 40,
        exam1ShortCount: 40,
        exam1ExtMax: 0,
        exam2bExtType: "EXTENDED_RESPONSE",
        exam2bMarksTarget: 60,
        exam2bMax: 9,
      };
    case "vce-foundation":
      // Real VCE Foundation is a single 80-mark paper: Section A (20 MCQ ·
      // 20 marks) + Section B (12 multi-part questions · 60 marks). The bank
      // matches the real paper directly now: MCQ for Section A (1 mark each)
      // and EXTENDED_ANSWER for Section B (4–8 mark multi-part items, one per
      // real Section B question). exam1ExtMax = 12 enforces "exactly 12
      // Section B questions" against the 60-mark target.
      return {
        exam1ShortType: "MCQ",
        exam1ExtType: "EXTENDED_ANSWER",
        exam1MarksTarget: 80,
        exam1ShortCount: 20,
        exam1ExtMax: 12,
        exam2bExtType: "EXTENDED_ANSWER",
        exam2bMarksTarget: 60,
        exam2bMax: 12,
      };
    case "mathematical-methods":
    default:
      return {
        exam1ShortType: "SHORT_ANSWER",
        exam1ExtType: "EXTENDED_ANSWER",
        exam1MarksTarget: 40,
        exam1ShortCount: 4,
        exam1ExtMax: 5,
        exam2bExtType: "EXTENDED_RESPONSE",
        exam2bMarksTarget: 60,
        exam2bMax: 5,
      };
  }
}

// ---------- page ----------

export default async function SessionPage({ params: routeParams, searchParams }: PageProps) {
  const route = await routeParams;
  const subjectSlug = subjectSlugFromUrl(route.subject);
  const paperStructure = getPaperStructure(subjectSlug);
  const params = await searchParams;
  // Foundation has a single paper instead of Exam 1 / Exam 2, so its Practice
  // landing uses mode="exam". The session-page picker doesn't carry a
  // separate code path for it — Foundation's paperStructure already encodes
  // its single-paper shape (60 marks, 6 short + 4 ext) under the `exam1`
  // branch, so normalise here and reuse that logic for free.
  //
  // General's full Exam 2 paper (mode="exam2") is structurally identical to
  // Methods Section B (extended response only, 60 marks, 1.5h, CAS allowed),
  // so alias to "exam2b" for picker logic. The rawMode is preserved for
  // history/UI so it still reads as "Exam 2 practice" (not "Exam 2B").
  const rawMode = params.mode;
  const mode =
    rawMode === "exam" ? "exam1" : rawMode === "exam2" ? "exam2b" : rawMode;

  const practiceHome = `/${route.curriculum}/${route.subject}/practice`;

  if (!mode) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-red-400">
        <p className="font-semibold">Missing mode parameter — please return to the practice setup page.</p>
        <Link href={practiceHome} className="mt-2 inline-block text-sm underline">
          ← Back to practice
        </Link>
      </div>
    );
  }

  // Exam 1 is free; Exam 2 modes require a paid plan. Foundation's section
  // modes (examA / examB) and its full paper (exam → exam1) are all free —
  // Foundation practice is not gated. The same gate also controls whether
  // free users can self-mark or bookmark questions in a free session — they
  // can practise but not record progress.
  const hasPaidAccess = await canAccessPaidPractice();
  const isFreePracticeMode =
    mode === "exam1" || mode === "examA" || mode === "examB";
  if (!isFreePracticeMode && !hasPaidAccess) {
    return <PaywallScreen feature="practice" backHref={practiceHome} backLabel="Back to practice" />;
  }
  const canTrackProgress = hasPaidAccess;

  const version = params.version ?? "exam";
  const showSolutionButton = params.solutions === "1";
  const showTimer = params.timer === "1";
  const focusWeak = params.weak === "1";

  // Pull user state for two purposes:
  //   - weakItemIds:  questions the user previously got wrong / flagged. The
  //                   picker boosts these 3× when `focusWeak` is on.
  //   - seenItemIds:  the user's last N attempts. The picker filters these
  //                   out so re-running a practice mock yields fresh
  //                   questions rather than the same ones in a different
  //                   order. We disable this exclusion when `focusWeak` is
  //                   on, because the whole point of weak-area practice is
  //                   to bring previously-seen items back.
  //
  // N is sized to comfortably cover several recent papers without exhausting
  // the pool: ~30 covers ~3 Exam 1 mocks (9 questions each) or ~1.5 Exam 2
  // mocks (25 questions each). Past that, the oldest "recent" items fall off
  // and become eligible again — the user naturally rotates through the pool.
  const RECENT_ATTEMPTS_WINDOW = 30;
  let weakItemIds = new Set<string>();
  let seenItemIds = new Set<string>();
  {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (focusWeak) {
        const weakAttempts = await prisma.questionSetAttempt.findMany({
          where: {
            userId: user.id,
            status: { in: ["INCORRECT", "NEEDS_REVIEW"] },
          },
          select: { questionSetItemId: true },
        });
        weakItemIds = new Set(weakAttempts.map((a) => a.questionSetItemId));
      } else {
        const recentAttempts = await prisma.questionSetAttempt.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: RECENT_ATTEMPTS_WINDOW,
          select: { questionSetItemId: true },
        });
        seenItemIds = new Set(
          recentAttempts.map((a) => a.questionSetItemId),
        );
      }
    }
  }

  // Timer durations from central config
  const examCfg = EXAM_CONFIG[mode as ExamMode];
  const readingSeconds = examCfg?.readingSeconds ?? 15 * 60;
  const writingSeconds = examCfg?.writingSeconds ?? 60 * 60;

  // Parse the topic-weight and difficulty URL params from the setup form.
  // Both parsers (and their fallback defaults) live in lib/paper-assembler.ts.
  const dist = parseDist(params.dist);
  const distB = parseDist(params.distB);

  const diffDist = parseDiff(params.diff);

  // Filter topics to the URL-derived subject. The DB holds topics for every
  // VCE subject (~19 rows total). The picker's per-topic distribution arrays
  // (`dist`, `shortCounts`, etc.) only have 4 entries, so without this
  // filter the indices align to wrong-subject topics whose pools are empty
  // and the picker silently returns zero items. `subjectSlug` is the
  // canonical DB slug derived from the URL segment via `subjectSlugFromUrl`.
  const topics = await prisma.topic.findMany({
    where: subjectSlug ? { subject: { slug: subjectSlug } } : undefined,
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Mode labels. Foundation's single paper (rawMode === "exam") is rendered
  // as "Exam practice" rather than the borrowed "Exam 1 practice" label —
  // and the back-link points to `/practice/exam`, not `/practice/exam1`.
  const isFoundationSinglePaper = rawMode === "exam";
  const isGeneralFullExam2 = rawMode === "exam2";
  const modeLabels: Record<string, string> = {
    exam1: "Exam 1 practice",
    exam2a: "Exam 2A practice",
    exam2b: "Exam 2B practice",
    exam2ab: "Exam 2A & 2B practice",
    examA: "Section A practice",
    examB: "Section B practice",
  };
  const versionLabel = version === "exam" ? "Exam simulation" : "Custom practice";
  const modeLabel = isFoundationSinglePaper
    ? "Exam practice"
    : isGeneralFullExam2
    ? "Exam 2 practice"
    : modeLabels[mode] ?? mode;
  const backHref = `${practiceHome}/${rawMode ?? mode}`;
  // Foundation's single paper permits a scientific calculator; Methods'
  // Exam 1 is the only mode that bans calculators outright.
  const calculatorAllowed =
    isFoundationSinglePaper ||
    subjectSlug === "vce-foundation" ||
    mode !== "exam1";

  // Tech filter: gate Exam 1 to TECH_FREE only and Exam 2 to CAS-allowed/
  // required. Mismatched questions never enter the picker pool in the first
  // place — no per-mode post-filter, no leakage.
  const techFilter = techFilterForMode(mode);

  // Resolve the QuestionSet for this subject's practice page. Each subject
  // has its own default set (`isDefault` is scoped per subject), so Methods
  // students draw from the Methods bank and General/Specialist/Foundation
  // students draw from their own per-subject Exam Sets.
  const practiceSetId = await getPracticeQuestionSetId(subjectSlug ?? undefined);
  if (!practiceSetId) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-red-400">
        <p className="font-semibold">
          No question set has been configured for this subject yet.
        </p>
        <p className="mt-2 text-sm">
          Please choose another subject or contact the team.
        </p>
        <Link href={`/${route.curriculum}/${route.subject}/practice`} className="mt-3 inline-block text-sm underline">
          ← Back to practice
        </Link>
      </div>
    );
  }

  // Shared tracker for the recent-attempts dedup fallback. Any
  // fetchWithFallback() call that abandons the exclusion (because the pool
  // would be too thin) sets fellBack=true, and the page header shows a
  // notice so the student knows why a recently-seen question may reappear.
  const dedupTracker: FallbackTracker = { fellBack: false };

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
      fetchWithFallback(["MCQ"], practiceSetId, techFilter, seenItemIds, 20, dedupTracker),
      fetchWithFallback(
        ["EXTENDED_RESPONSE"],
        practiceSetId,
        techFilter,
        seenItemIds,
        paperStructure.exam2bMax,
        dedupTracker,
      ),
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
    // Section B — find an exact-sum subset of EXTENDED_RESPONSE items
    // that totals 60 marks across ≤5 questions (matches real VCAA Section B).
    // Falls back to the closest-match picker only if the pool can't form
    // an exact 60-mark 5-item subset.
    //
    // Exam mode also enforces VCAA Section B coverage rules: at least one
    // Calculus + at least one Data ext-resp, with no two questions on the
    // same sub-topic. The picker uses weighted-random sampling so we re-pick
    // up to MAX_PICK_ATTEMPTS times when the constraints fail. After the cap
    // we log a warning and serve the last attempt so the user always gets
    // a paper, even if their pool is too thin to satisfy the rules.
    const isExam2ABExamMode = version === "exam";
    const MAX_SECTION_B_ATTEMPTS = isExam2ABExamMode ? 10 : 1;
    const pickSectionB = (): QuestionGroupData[] => {
      const rankedB = rankPool(
        poolB,
        topics.map((t) => t.id),
        distB,
        diffDist,
        weakItemIds
      );
      return (
        findExactMarksSubset(
          rankedB,
          SECTION_B_MARKS_TARGET,
          paperStructure.exam2bMax,
        ) ??
        pickGroupsGloballyByMarks(
          poolB,
          topics.map((t) => t.id),
          distB,
          SECTION_B_MARKS_TARGET,
          diffDist,
          weakItemIds,
          paperStructure.exam2bMax,
        )
      );
    };

    let groupsB: QuestionGroupData[] = [];
    let lastIssues: string[] = [];
    for (let attempt = 0; attempt < MAX_SECTION_B_ATTEMPTS; attempt++) {
      groupsB = pickSectionB();
      if (!isExam2ABExamMode) break;
      lastIssues = sectionBCoverageIssues(groupsB, topics);
      if (lastIssues.length === 0) break;
    }
    if (isExam2ABExamMode && lastIssues.length > 0) {
      console.warn(
        `[practice/exam2ab] Section B coverage issues after ${MAX_SECTION_B_ATTEMPTS} attempts:`,
        lastIssues
      );
    }

    // Section A stays shuffled — real VCAA Section A is mixed-difficulty MCQ
    // without strict ordering. Section B follows the difficulty curve
    // (EASY → MEDIUM → HARD) in exam mode so the timed paper escalates the
    // way VCAA papers do; in custom-practice mode keep the shuffle so users
    // browsing the same pool don't see the same order twice.
    const shuffledA = shuffle(groupsA);
    const shuffledB = isExam2ABExamMode
      ? sortByDifficultyEscalation(groupsB)
      : shuffle(groupsB);
    const totalQuestions = shuffledA.length + shuffledB.length;

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
          <BackLink href={backHref} label="Back to Setup" className="mb-4" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {modeLabel}
            <span className="ml-2 text-lg lg:text-xl font-normal text-gray-400 dark:text-gray-500">— {versionLabel}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {totalQuestions} questions · {totalMarksAB} marks
            {Math.abs(totalMarksAB - 80) > 2 && (
              <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                (VCE target: 80)
              </span>
            )}
            {" · CAS calculator allowed"}
          </p>
          {dedupTracker.fellBack && (
            <p className="mt-2 inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
              Your recent-practice pool was thin — this paper may include questions you have attempted recently.
            </p>
          )}
        </div>

        {isExam2ABExamMode ? (
          <ErrorBoundary>
            <Exam2ABModeWrapper
              groupsA={shuffledA}
              groupsB={shuffledB}
              historyHref={`/${route.curriculum}/${route.subject}/history`}
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
                    canTrackProgress={canTrackProgress}
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
                    canTrackProgress={canTrackProgress}
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
  //
  // Exam 2A is a fixed 20-MCQ / 20-mark paper. In exam-simulation mode the
  // setup form locks the count and does NOT pass a `count` param, so without
  // a mode-aware default it fell back to 10 and the paper came up 10 marks
  // short of the real VCAA total. Force 20 for exam2a; other single modes
  // (Freedom version) still honour the user-selected `count` (default 10).
  const count =
    mode === "exam2a"
      ? parseInt(params.count ?? "20", 10)
      : parseInt(params.count ?? "10", 10);
  const counts = distributeToCounts(dist, count);

  let itemTypes: QuestionSetItemType[];
  let sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B" | "Section A" | "Section B";
  let calcInfo: string;

  if (mode === "exam1") {
    // Exam 1 paper shape varies by subject:
    //   Methods / Specialist : SHORT_ANSWER + EXTENDED_ANSWER, 40m, tech-free
    //   General              : MCQ only (40 q × 1 m), CAS-allowed
    //   Foundation           : SHORT_ANSWER + EXTENDED_RESPONSE, 60m
    //                          (single-paper subject; mode=exam1 IS the paper)
    itemTypes = paperStructure.exam1ExtType
      ? [paperStructure.exam1ShortType, paperStructure.exam1ExtType]
      : [paperStructure.exam1ShortType];
    sectionLabel = "Exam 1";
    calcInfo =
      subjectSlug === "vce-foundation"
        ? "Scientific calculator allowed"
        : subjectSlug === "vce-general"
        ? "CAS calculator allowed"
        : "No calculator allowed";
  } else if (mode === "exam2a") {
    itemTypes = ["MCQ"];
    sectionLabel = "Exam 2A";
    calcInfo = "CAS calculator allowed";
  } else if (mode === "examA") {
    // Foundation Section A — 20 multiple-choice questions at 1 mark each.
    itemTypes = ["MCQ"];
    sectionLabel = "Section A";
    calcInfo = "Scientific calculator allowed";
  } else if (mode === "examB") {
    // Foundation Section B — 12 multi-part extended-answer questions
    // totalling 60 marks (each EA item models one Section B question with
    // 2–5 parts at 1–3 marks). EXTENDED_RESPONSE items are too large
    // (9–21 marks) to fit Section B's "12 questions × ~5 marks" shape.
    itemTypes = ["EXTENDED_ANSWER"];
    sectionLabel = "Section B";
    calcInfo = "Scientific calculator allowed";
  } else {
    // exam2b
    itemTypes = [paperStructure.exam2bExtType];
    sectionLabel = "Exam 2B";
    calcInfo = "CAS calculator allowed";
  }

  // Single batch fetch, then pick per topic.
  //
  // Exam Version of Exam 1 / Exam 2B sample by *marks* so the practice paper
  // hits the real VCAA total (40 / 60 marks) regardless of how many questions
  // that takes. Exam 2A and the Freedom Version stay count-based — Exam 2A
  // is exactly 20 × 1 mark MCQs, and Freedom is "pick N questions" by design.
  //
  // The min-pool-size guard for each mode: Exam 1 needs ~9 items, Exam 2A
  // needs 20, Exam 2B needs 5. If recent-attempts exclusion would shrink
  // the pool below that, fetch falls back to no-exclusion so the user
  // always gets a complete paper.
  // Foundation single-section modes — Section A (short-answer, 20 marks) and
  // Section B (extended response, 60 marks). Both pick by marks (not count)
  // so the section total matches the real paper, and neither applies the
  // Methods-specific Section B coverage rules (Foundation has its own topics,
  // none of which are Calculus / Data Analysis by those exact slugs).
  const isFoundationSectionA = mode === "examA";
  const isFoundationSectionB = mode === "examB";
  const isFoundationSection = isFoundationSectionA || isFoundationSectionB;

  const minPoolForMode =
    mode === "exam1"
      ? paperStructure.exam1ShortCount + paperStructure.exam1ExtMax
      : mode === "exam2a"
      ? 20
      : mode === "exam2b"
      ? paperStructure.exam2bMax
      : isFoundationSectionA
      ? 20
      : isFoundationSectionB
      ? 12
      : 5;
  const pool = await fetchWithFallback(
    itemTypes,
    practiceSetId,
    techFilter,
    seenItemIds,
    minPoolForMode,
    dedupTracker,
  );
  const isMarksTargetMode =
    version === "exam" &&
    (mode === "exam1" || mode === "exam2b" || isFoundationSection);
  const marksTarget =
    mode === "exam1"
      ? paperStructure.exam1MarksTarget
      : isFoundationSectionA
      ? 20
      : isFoundationSectionB
      ? 60
      : paperStructure.exam2bMarksTarget;
  const allGroups: QuestionGroupData[] = [];

  // General's Exam 1 is MCQ-only (40 × 1 mark) — bypass the
  // SHORT + EXTENDED dual-pool branch entirely and pick straight from MCQs.
  // Foundation re-uses the dual-pool branch but with EXTENDED_RESPONSE in
  // place of EXTENDED_ANSWER and a 60-mark target.
  const isGeneralExam1 =
    isMarksTargetMode && mode === "exam1" && paperStructure.exam1ExtType === null;

  if (isGeneralExam1) {
    // VCAA General Exam 1 covers 16 Data + 8 Recursion + 8 Matrices +
    // 8 Networks = 40 MCQs. Recursion + Matrices both live under the
    // Algebra topic, so by topic order this is:
    //   topics[0] Algebra (16 MCQs)
    //   topics[1] Data (16 MCQs)
    //   topics[2] Discrete (8 MCQs — Networks)
    //   topics[3] Functions (0)
    //   topics[4] Space (0)
    // The default [25,25,25,25] dist gives 10 each over 4 topics, leaving
    // Functions/Space empty and ending up with 30. Use the VCAA spec
    // distribution directly here.
    const vcaaGeneralExam1Counts = [16, 16, 8, 0, 0];
    topics.forEach((topic, i) => {
      allGroups.push(
        ...pickGroupsForTopic(
          pool.get(topic.id),
          vcaaGeneralExam1Counts[i] ?? 0,
          diffDist,
          weakItemIds,
        ),
      );
    });
  } else if (isMarksTargetMode && mode === "exam1") {
    // Real VCE Exam 1 has a fixed structural shape: ~5 short-answer Qs
    // (Q1–Q5) + ~3–4 extended-answer Qs (Q6–Q8/Q9), totalling 40 marks
    // across 8–9 questions. A pure global marks-target pick over a mixed
    // pool overshoots the count badly because SHORT_ANSWER items (avg ~2
    // marks) fit the budget more easily than EXTENDED_ANSWER (avg ~6).
    //
    // Enforce the structure by picking the two pools separately. The
    // SHORT pool's items are smaller than real Q1–Q5 (which average ~4
    // marks each thanks to multi-part sub-parts that our generated
    // SHORT_ANSWER items don't have). So we pick fewer of them — 4 — to
    // leave enough mark budget for 4–5 EXT items, landing on 8–9 total.
    // Foundation: SHORT_ANSWER + EXTENDED_RESPONSE, 60-mark single paper.
    // Methods/Specialist: SHORT_ANSWER + EXTENDED_ANSWER, 40-mark Exam 1.
    const SHORT_COUNT = paperStructure.exam1ShortCount;
    const shortPool = await fetchWithFallback(
      [paperStructure.exam1ShortType],
      practiceSetId,
      techFilter,
      seenItemIds,
      SHORT_COUNT,
      dedupTracker,
    );
    const extPool = await fetchWithFallback(
      [paperStructure.exam1ExtType ?? "EXTENDED_ANSWER"],
      practiceSetId,
      techFilter,
      seenItemIds,
      paperStructure.exam1ExtMax,
      dedupTracker,
    );
    const shortCounts = distributeToCounts(dist, SHORT_COUNT);

    // Helper: weighted shuffle of a topic's SHORT pool, biased toward
    // higher-mark items so the SHORT half pulls more weight in the
    // 40-mark budget. Returns a fresh shuffle each call.
    const shuffleShortForTopic = (topicId: string) => {
      const topicPool = shortPool.get(topicId);
      if (!topicPool) return [] as QuestionGroupData[];
      const flat = [
        ...topicPool.EASY,
        ...topicPool.MEDIUM,
        ...topicPool.HARD,
      ];
      return flat
        .map((g) => {
          const isWeak = weakItemIds.has(getParentItemId(g));
          const m = groupMarks(g) || 1;
          return { g, sort: Math.random() / (m * (isWeak ? 3 : 1)) };
        })
        .sort((a, b) => a.sort - b.sort)
        .map((x) => x.g);
    };

    // Try up to N times to find a SHORT pick whose remainder (40 − sum)
    // can be closed by an exact-sum subset of EXT items (≤5 items). For
    // most SHORT totals an exact subset exists; the rare exception is
    // when SHORT lands on something the EXT pool can't complement
    // (e.g. SHORT=4 needs 36 EXT marks via ≤5 items — possible but
    // requires the right combo). Retrying with a different SHORT shuffle
    // almost always succeeds.
    const EXT_MAX = paperStructure.exam1ExtMax;
    const TARGET = paperStructure.exam1MarksTarget;
    const MAX_ATTEMPTS = 30;

    let shortPicks: QuestionGroupData[] = [];
    let extPicks: QuestionGroupData[] = [];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const trialShort: QuestionGroupData[] = [];
      topics.forEach((topic, i) => {
        const wantCount = shortCounts[i] ?? 0;
        if (wantCount <= 0) return;
        const ranked = shuffleShortForTopic(topic.id);
        trialShort.push(...ranked.slice(0, wantCount));
      });
      const trialShortMarks = trialShort.reduce(
        (s, g) => s + groupMarks(g),
        0
      );
      const extTarget = TARGET - trialShortMarks;
      if (extTarget < 0) continue;

      const rankedExt = rankPool(
        extPool,
        topics.map((t) => t.id),
        dist,
        diffDist,
        weakItemIds
      );
      const exactExt = findExactMarksSubset(rankedExt, extTarget, EXT_MAX);
      if (exactExt) {
        shortPicks = trialShort;
        extPicks = exactExt;
        break;
      }
    }

    // Last-resort fallback: if no attempt produced an exact subset, run
    // the closest-match picker with the most recent SHORT pick. The user
    // sees a slight overshoot/undershoot rather than nothing.
    if (extPicks.length === 0 && shortPicks.length === 0) {
      topics.forEach((topic, i) => {
        const wantCount = shortCounts[i] ?? 0;
        if (wantCount <= 0) return;
        const ranked = shuffleShortForTopic(topic.id);
        shortPicks.push(...ranked.slice(0, wantCount));
      });
      const shortMarks = shortPicks.reduce((s, g) => s + groupMarks(g), 0);
      extPicks = pickGroupsGloballyByMarks(
        extPool,
        topics.map((t) => t.id),
        dist,
        Math.max(0, TARGET - shortMarks),
        diffDist,
        weakItemIds,
        EXT_MAX
      );
    }

    allGroups.push(...shortPicks, ...extPicks);
  } else if (isMarksTargetMode && isFoundationSection) {
    // Foundation Section A / B — match the real VCAA paper structure exactly:
    //   Section A: exactly 20 MCQs at 1 mark each (= 20 marks)
    //   Section B: exactly 12 EXTENDED_ANSWER questions totalling 60 marks
    // Pass exactCount to the subset picker so both constraints (count AND
    // marks) hit simultaneously — no top-up drift. Our EA pool has 16×4,
    // 48×5, 40×6, 5×7, 1×8 marks; trivially many 12-item subsets sum to
    // 60 (e.g. 12 × 5-mark, or 6×4 + 6×6, etc.).
    const TARGET_QS = isFoundationSectionA ? 20 : 12;
    const ranked = rankPool(
      pool,
      topics.map((t) => t.id),
      dist,
      diffDist,
      weakItemIds,
    );
    let picked =
      findExactMarksSubset(ranked, marksTarget, TARGET_QS, TARGET_QS) ??
      pickGroupsGloballyByMarks(
        pool,
        topics.map((t) => t.id),
        dist,
        marksTarget,
        diffDist,
        weakItemIds,
        TARGET_QS,
      );
    // Safety net: if even the strict (count, marks) subset finder couldn't
    // land on (TARGET_QS, marksTarget), top up by ranked order so the
    // student still sits the right number of questions. Marks may drift.
    if (picked.length < TARGET_QS) {
      const pickedIds = new Set(picked.map((g) => getParentItemId(g)));
      const topUp = ranked
        .filter((g) => !pickedIds.has(getParentItemId(g)))
        .slice(0, TARGET_QS - picked.length);
      picked = [...picked, ...topUp];
    }
    allGroups.push(...picked);
  } else if (isMarksTargetMode) {
    // Exam 2B: find an exact-sum subset of EXTENDED_RESPONSE items that
    // totals 60 marks across ≤5 questions. The pool always admits such
    // a subset (verified via Monte Carlo); the closest-match picker is
    // kept as a safety net only.
    //
    // Exam mode also re-picks (up to MAX_SECTION_B_ATTEMPTS times) until the
    // chosen 5 cover ≥1 Calculus + ≥1 Data ext-resp with no duplicate
    // sub-topics. Same fallback behaviour as exam2ab — if the pool is too
    // thin we serve the last attempt and log a warning.
    // Cap items at the subject's Section B size: 5 for Methods, 6 for
    // Specialist, 9 for General. Foundation doesn't use this branch.
    const SECTION_B_MAX_QS = paperStructure.exam2bMax;
    const MAX_SECTION_B_ATTEMPTS = 10;
    const pickSectionB = (): QuestionGroupData[] => {
      const ranked = rankPool(
        pool,
        topics.map((t) => t.id),
        dist,
        diffDist,
        weakItemIds
      );
      return (
        findExactMarksSubset(ranked, marksTarget, SECTION_B_MAX_QS) ??
        pickGroupsGloballyByMarks(
          pool,
          topics.map((t) => t.id),
          dist,
          marksTarget,
          diffDist,
          weakItemIds,
          SECTION_B_MAX_QS
        )
      );
    };

    let picked: QuestionGroupData[] = [];
    let lastIssues: string[] = [];
    for (let attempt = 0; attempt < MAX_SECTION_B_ATTEMPTS; attempt++) {
      picked = pickSectionB();
      lastIssues = sectionBCoverageIssues(picked, topics);
      if (lastIssues.length === 0) break;
    }
    if (lastIssues.length > 0) {
      console.warn(
        `[practice/exam2b] Section B coverage issues after ${MAX_SECTION_B_ATTEMPTS} attempts:`,
        lastIssues
      );
    }
    // Picker returns items as-is — EXTENDED_RESPONSE items are already
    // natively multi-part via the `parts` JSON column.
    allGroups.push(...picked);
  } else {
    // Freedom Version: count-based per-topic picking. Each topic gets its
    // proportional share of the requested count; the per-topic helper
    // backfills across difficulty buckets when one is short.
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

    // Cross-topic backfill: if any topic was short of items (e.g. the
    // EXTENDED_RESPONSE pool has zero items in Algebra), the per-topic loop
    // above leaves the session under-count. Pull from the remaining items
    // across ALL topics, ranked by the user's requested distribution, until
    // we hit `count`. Without this, picking 10 Exam 2B Freedom questions on
    // a pool that's empty in one topic would silently return 7-8.
    if (allGroups.length < count) {
      const pickedIds = new Set(allGroups.map((g) => getParentItemId(g)));
      const remainingPools = new Map<
        string,
        Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>
      >();
      Array.from(pool.entries()).forEach(([tid, byDiff]) => {
        const filtered = {
          EASY: byDiff.EASY.filter((g) => !pickedIds.has(getParentItemId(g))),
          MEDIUM: byDiff.MEDIUM.filter((g) => !pickedIds.has(getParentItemId(g))),
          HARD: byDiff.HARD.filter((g) => !pickedIds.has(getParentItemId(g))),
        };
        remainingPools.set(tid, filtered);
      });
      const ranked = rankPool(
        remainingPools,
        topics.map((t) => t.id),
        dist,
        diffDist,
        weakItemIds
      );
      const deficit = count - allGroups.length;
      allGroups.push(...ranked.slice(0, deficit));
    }
  }

  // Real VCE Exam 1 has a fixed structural shape: short-answer questions
  // come first (Q1-Q5 region, smaller marks each) and extended-answer
  // questions come last (Q6-Q9 region, larger multi-part questions). A
  // global shuffle could leave a 2-mark short item sitting at Q9, which
  // never happens on a real paper. Detect SHORT vs EXT by part shape
  // (single-part with `part: null` is SHORT_ANSWER / MCQ; multi-part rows
  // are EXTENDED_*) and order accordingly. Within each subgroup, exam mode
  // sorts by difficulty escalation (matches real VCAA easy-to-hard curve);
  // freedom mode still shuffles so the same pool feels fresh each run.
  //
  // Other modes:
  //   - exam2a: all MCQ (1 mark each) → order is meaningless, plain shuffle
  //   - exam2b: all EXTENDED_RESPONSE → exam mode sorts by difficulty,
  //     freedom mode shuffles
  let finalGroups: QuestionGroupData[];
  const orderForExam = (groups: QuestionGroupData[]) =>
    version === "exam" ? sortByDifficultyEscalation(groups) : shuffle(groups);
  if (mode === "exam1") {
    const isShort = (g: QuestionGroupData) =>
      g.parts.length === 1 && g.parts[0].part === null;
    const shortPart = allGroups.filter(isShort);
    const extPart = allGroups.filter((g) => !isShort(g));
    // SHORT half (Q1-Q5) and EXT half (Q6-Q9) each escalate independently
    // in exam mode — the user sees easy short answers first, then hard
    // short answers, then easy extended answers, then hard extended
    // answers.
    finalGroups = [...orderForExam(shortPart), ...orderForExam(extPart)];
  } else if (mode === "exam2b" || isFoundationSection) {
    // Exam 2B and Foundation Section A / B: single-section papers escalate
    // by difficulty in exam mode, shuffle in freedom mode.
    finalGroups = orderForExam(allGroups);
  } else {
    // exam2a (MCQ-only) and freedom mode for any other mode: plain shuffle
    finalGroups = shuffle(allGroups);
  }

  // Sum the marks across every part of every group — used to surface the
  // total in the header so users can compare against the real VCAA target
  // (40 for Exam 1, 20 for Exam 2A, 60 for Exam 2B).
  const totalMarks = finalGroups.reduce(
    (acc, g) => acc + g.parts.reduce((p, part) => p + part.marks, 0),
    0
  );
  // Exam target marks per subject: Foundation's Exam 1 is 60 (single
  // paper), General/Methods/Specialist Exam 1 is 40, Exam 2A is 20,
  // Exam 2B is 60 (Section B target).
  const realTotal =
    mode === "exam1"
      ? paperStructure.exam1MarksTarget
      : mode === "exam2a"
      ? 20
      : mode === "exam2b"
      ? paperStructure.exam2bMarksTarget
      : isFoundationSectionA
      ? 20
      : isFoundationSectionB
      ? 60
      : null;

  const isExamMode =
    (mode === "exam1" ||
      mode === "exam2a" ||
      mode === "exam2b" ||
      isFoundationSection) &&
    version === "exam";

  return (
    <div className="space-y-8">
      {/* Timer — only for non-exam-mode (ExamModeWrapper manages its own timer) */}
      {showTimer && !isExamMode && <PracticeTimer readingSeconds={readingSeconds} writingSeconds={writingSeconds} />}

      {/* Header */}
      <div>
        <BackLink href={backHref} label="Back to Setup" className="mb-4" />
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {modeLabel}
          <span className="ml-2 text-lg lg:text-xl font-normal text-gray-400 dark:text-gray-500">— {versionLabel}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {finalGroups.length} questions · {totalMarks} marks
          {isExamMode &&
            realTotal !== null &&
            Math.abs(totalMarks - realTotal) > 2 && (
              <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                (VCE target: {realTotal})
              </span>
            )}
          {" · "}
          {calcInfo}
        </p>
        {dedupTracker.fellBack && (
          <p className="mt-2 inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
            Your recent-practice pool was thin — this paper may include questions you have attempted recently.
          </p>
        )}
      </div>

      {/* Questions — both exam and freedom versions use ExamModeWrapper so the
          student can always submit + self-mark and have the result recorded
          in History. Only differences between the two versions:
            - Freedom mode never shows the countdown timer (untimed by design)
            - Auto-grading still only applies to MCQ (exam2a); other modes
              fall back to self-marking */}
      <ErrorBoundary>
        <ExamModeWrapper
          groups={finalGroups}
          totalQuestions={finalGroups.length}
          historyHref={`/${route.curriculum}/${route.subject}/history`}
          sectionLabel={sectionLabel}
          calculatorAllowed={calculatorAllowed}
          showSolutionsAsYouGo={showSolutionButton}
          showTimer={showTimer && isExamMode}
          readingSeconds={readingSeconds}
          writingSeconds={writingSeconds}
          isMcqMode={mode === "exam2a"}
          showScore={mode === "exam2a"}
          enableSelfMarking={mode !== "exam2a"}
        />
      </ErrorBoundary>
    </div>
  );
}
