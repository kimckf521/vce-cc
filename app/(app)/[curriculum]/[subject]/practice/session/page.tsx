import Link from "next/link";
import BackLink from "@/components/BackLink";
import { Tech } from "@prisma/client";
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
import PaywallScreen from "@/components/PaywallScreen";
import { canAccessPaidPractice } from "@/lib/practice-gate";

type QuestionSetItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

/**
 * Filter for the `tech` column on QuestionSetItem. Used by the practice
 * assembler to keep Exam 1 tech-free and Exam 2 CAS-only.
 *
 *   - Single enum value → `tech = <value>`
 *   - `{ in: [...] }`   → `tech IN (...)`
 *   - `undefined`        → no filter applied
 */
type TechFilter = Tech | { in: Tech[] } | undefined;

/**
 * Map a practice mode to the tech filter the picker should apply.
 *
 * VCAA reality:
 *   - Exam 1 (60 min, no calculator) — CAS_REQUIRED items cannot appear.
 *     TECH_FREE and CAS_ALLOWED (doable by hand) both fit.
 *   - Exam 2 (120 min, CAS allowed) — every question type is fair game,
 *     including TECH_FREE ones. Real VCAA Section A is a mix of "could be
 *     done by hand" + "needs CAS"; filtering to CAS-only would shrink the
 *     pool well below what VCAA expects (and below what we have generated).
 *
 *   exam1               → exclude CAS_REQUIRED (allow TECH_FREE + CAS_ALLOWED)
 *   exam2a/2b/2ab       → no filter (any tech tag fits a CAS paper)
 *   anything else       → no filter
 */
function techFilterForMode(mode: string): TechFilter {
  if (mode === "exam1") return { in: [Tech.TECH_FREE, Tech.CAS_ALLOWED] };
  return undefined;
}

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

// ---------- textual sub-part parsing ----------

interface TextualSubPart {
  label: string;
  marks: number;
  content: string;
}

// Matches a sub-part label token at a line/word boundary, in any of the forms
// the generated content actually uses:
//   - bold-wrapped:  **a.**  **a**  **(a)**  **a)**
//   - parenthesised: (a)
//   - plain:         a.  a)
// Three alternation branches, one capture group each — read the matched label
// with subpartLabelOf(). A trailing \s+ is required so a stray "a" in prose
// (with no terminator) never matches.
const SUBPART_LABEL_SOURCE =
  "(?:^|\\s)(?:\\*\\*\\s*\\(?([a-h])\\)?[.)]?\\s*\\*\\*|\\(([a-h])\\)|([a-h])[.)])\\s+";

function subpartLabelOf(m: RegExpMatchArray | RegExpExecArray): string {
  return (m[1] ?? m[2] ?? m[3] ?? "").toLowerCase();
}

/**
 * Some SHORT_ANSWER items store their sub-parts as plain text in `content`
 * ("a. … (2 marks) b. … (2 marks)") instead of a structured `parts` JSON.
 * This splits such an item into per-sub-part rows so each sub-part gets its
 * own self-mark stepper — mirroring how EXTENDED items already behave.
 *
 * Strict guards keep it safe so the student's marks always reconcile:
 *   - needs ≥2 markers (a, b, c…) at line starts, strictly sequential
 *   - EVERY sub-part must state its own "(N mark[s])"
 *   - those marks must sum EXACTLY to the item's total
 * Any failure returns null and the caller renders a single stepper — no
 * regression, no chance of a mis-totalled paper.
 */
function parseTextualSubParts(
  content: string,
  totalMarks: number
): { stem: string; parts: TextualSubPart[] } | null {
  // Anchor on the "(N mark[s])" annotation that closes each sub-part. This is
  // reliable even when sub-parts run inline on one line
  // ("a. … (2 marks) b. … (2 marks)"), which is how the generated content
  // actually stores them — line-start markers alone missed every one.
  const annotRe = /\((\d+)\s*marks?\)/gi;
  const annots = Array.from(content.matchAll(annotRe));
  if (annots.length < 2) return null;

  // Each sub-part = the text from the previous annotation up to this one,
  // which must begin with a label token ("a.", "a)", "(a)", "**a.**").
  const labelRe = new RegExp(SUBPART_LABEL_SOURCE);
  const parts: TextualSubPart[] = [];
  let cursor = 0;
  let sum = 0;
  let stem = "";

  for (let i = 0; i < annots.length; i++) {
    const annot = annots[i];
    const annotStart = annot.index ?? 0;
    const chunk = content.slice(cursor, annotStart); // body + leading label
    const lm = chunk.match(labelRe);
    if (!lm) return null;

    const beforeLabel = chunk.slice(0, lm.index).trim();
    if (i === 0) {
      stem = beforeLabel; // text before "a" is the shared question stem
    } else if (beforeLabel !== "") {
      return null; // unexpected prose before a later label → bail (safe)
    }

    const marks = parseInt(annot[1], 10);
    if (!(marks > 0)) return null;
    const body = chunk.slice((lm.index ?? 0) + lm[0].length).trim();
    parts.push({ label: subpartLabelOf(lm), marks, content: body });
    sum += marks;
    cursor = annotStart + annot[0].length;
  }

  // Labels must run a, b, c… in order, the marks must reconcile to the item
  // total, and nothing meaningful may trail the last annotation. Any failure
  // → null → caller renders one stepper (no chance of a mis-totalled paper).
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].label !== String.fromCharCode(97 + i)) return null;
  }
  if (sum !== totalMarks) return null;
  if (content.slice(cursor).trim() !== "") return null;

  return { stem, parts };
}

/**
 * Best-effort split of a solution blob along the same sub-part markers, so
 * each sub-part row can show its own worked solution. Returns null when the
 * solution's markers don't line up 1:1 with the question's labels — the
 * caller then attaches the whole solution to the first row instead.
 */
function splitSolutionByLabels(
  solution: string | null,
  labels: string[]
): Record<string, string> | null {
  if (!solution) return null;
  // Inline-capable label markers, mirroring the question parser so an
  // "a. … b. …" solution lines up with the question's sub-parts.
  const markerRe = new RegExp(SUBPART_LABEL_SOURCE, "g");
  const matches = Array.from(solution.matchAll(markerRe));
  if (matches.length !== labels.length) return null;
  for (let i = 0; i < matches.length; i++) {
    if (subpartLabelOf(matches[i]) !== labels[i]) return null;
  }
  const out: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end =
      i + 1 < matches.length ? matches[i + 1].index ?? solution.length : solution.length;
    out[subpartLabelOf(matches[i])] = solution.slice(start, end).trim();
  }
  return out;
}

// ---------- fetch ----------

/**
 * Fetch QuestionSetItems from the current default Practice question set
 * (resolved via getPracticeQuestionSetId — honours isDefault) for the given
 * item types in ONE query. Groups them by topic and difficulty in memory.
 *
 * Each item becomes a single-part group (the generated set has no multi-part
 * structure — every item stands alone).
 */
async function fetchAllGrouped(
  types: QuestionSetItemType[],
  setId: string | null,
  techFilter?: TechFilter,
  excludeIds?: Set<string>
): Promise<Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>> {
  const byTopic = new Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>();
  if (!setId) return byTopic;

  const items = await prisma.questionSetItem.findMany({
    where: {
      ...approvedItemsFilter(setId),
      type: { in: types },
      // The tech filter keeps tech-free questions out of CAS papers and CAS
      // questions out of Exam 1. Null-tech rows are excluded entirely when
      // a filter is set, so we never silently leak unclassified items into
      // either paper.
      ...(techFilter !== undefined && { tech: techFilter }),
      // Session-level dedup: skip items the user has attempted recently.
      // The caller decides "recently" — typically the last N attempts.
      // Empty / undefined sets are no-ops so passing nothing is safe.
      ...(excludeIds && excludeIds.size > 0 && {
        id: { notIn: Array.from(excludeIds) },
      }),
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

    // SHORT_ANSWER items without a structured `parts` JSON may still embed
    // sub-parts as text — try to split them so each sub-part is markable.
    const saSplit =
      it.type === "SHORT_ANSWER" && !Array.isArray(it.parts)
        ? parseTextualSubParts(it.content, it.marks)
        : null;

    // Any non-MCQ item that carries a `parts` JSON array is rendered (and
    // self-marked) part-by-part — EXTENDED_ANSWER, EXTENDED_RESPONSE, and
    // SHORT_ANSWER alike. This is what lets students award marks to each
    // sub-part (a)(i), (a)(ii), (b)… rather than the whole question at once.
    // MCQ is always single-part (auto-graded). SHORT_ANSWER items without a
    // `parts` JSON fall through to the single-row branch below, unchanged.
    if (it.type !== "MCQ" && Array.isArray(it.parts) && it.parts.length > 0) {
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
    } else if (saSplit) {
      // SHORT_ANSWER with textual sub-parts — split into one row per sub-part
      // so each gets its own self-mark stepper. The shared stem (text before
      // "a.") rides along as the preamble on the first row. Solution is split
      // along the same markers when possible, else the whole solution sits on
      // the first row.
      const solMap = splitSolutionByLabels(
        it.solutionContent ?? null,
        saSplit.parts.map((p) => p.label)
      );
      groupParts = saSplit.parts.map((sp, idx) => {
        const body =
          idx === 0 && saSplit.stem
            ? `---PREAMBLE---\n${saSplit.stem}\n---QUESTION---\n${sp.content}`
            : sp.content;
        const sol = solMap
          ? solMap[sp.label] ?? null
          : idx === 0
            ? it.solutionContent ?? null
            : null;
        return {
          id: `${it.id}::${sp.label}`,
          questionNumber: 1,
          part: sp.label,
          marks: sp.marks,
          content: body,
          imageUrl: null,
          difficulty: diff,
          solution: sol ? { content: sol, videoUrl: null } : null,
          initialStatus: null,
        };
      });
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
 * Count how many items live in a fetched pool (sum across topics and
 * difficulties).
 */
function poolSize(
  pool: Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>,
): number {
  let n = 0;
  Array.from(pool.values()).forEach((byDiff) => {
    n += byDiff.EASY.length + byDiff.MEDIUM.length + byDiff.HARD.length;
  });
  return n;
}

/**
 * Tracks whether any fetchWithFallback call had to drop its recent-seen
 * exclusion because the pool would otherwise be too thin. The session page
 * reads this after all fetches finish and shows a small notice if true, so
 * users understand why a recently-attempted question may have reappeared.
 */
interface FallbackTracker {
  fellBack: boolean;
}

/**
 * fetchAllGrouped with a recent-attempts safety net: if the recent-seen
 * exclusion would shrink the pool below the picker's needs (`minPoolSize`),
 * silently retry without the exclusion. The user always gets a complete
 * paper — at worst they see a question they recently attempted, which is
 * still better than getting a half-empty paper. Sets `tracker.fellBack`
 * to true when the fallback is taken.
 */
async function fetchWithFallback(
  types: QuestionSetItemType[],
  setId: string | null,
  techFilter: TechFilter,
  excludeIds: Set<string>,
  minPoolSize: number,
  tracker: FallbackTracker,
): Promise<Map<string, Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>>> {
  if (excludeIds.size === 0) {
    return fetchAllGrouped(types, setId, techFilter);
  }
  const withExclude = await fetchAllGrouped(types, setId, techFilter, excludeIds);
  if (poolSize(withExclude) >= minPoolSize) return withExclude;
  tracker.fellBack = true;
  return fetchAllGrouped(types, setId, techFilter);
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
 * Difficulty rank used to order Section B picks. Real VCAA Section B
 * escalates from easy → mid → hard across the 5 ext-resp questions, so
 * the picker sorts EASY first, MEDIUM next, HARD last. Within the same
 * difficulty band questions stay in the order the picker returned them
 * (which is itself randomised), so two runs with the same pick still feel
 * fresh.
 */
const DIFFICULTY_RANK: Record<"EASY" | "MEDIUM" | "HARD", number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

function sortByDifficultyEscalation(groups: QuestionGroupData[]): QuestionGroupData[] {
  return [...groups].sort((a, b) => {
    const da = DIFFICULTY_RANK[a.parts[0]?.difficulty ?? "MEDIUM"];
    const db = DIFFICULTY_RANK[b.parts[0]?.difficulty ?? "MEDIUM"];
    return da - db;
  });
}

/**
 * Validate Section B coverage rules under the 2023-2027 VCE Methods study
 * design:
 *   - at least 1 Calculus ext-resp
 *   - at least 1 Data Analysis, Probability & Statistics ext-resp
 *   - no two ext-resp on the same sub-topic
 * Returns the list of failing reasons (empty array = pass).
 */
function sectionBCoverageIssues(
  picks: QuestionGroupData[],
  topics: { id: string; name: string; slug: string }[]
): string[] {
  const issues: string[] = [];
  const calculusTopic = topics.find((t) => t.slug === "calculus");
  const dataTopic = topics.find(
    (t) => t.slug === "data-analysis-probability-and-statistics"
  );

  const topicNames = new Set(picks.map((p) => p.topicName));
  if (calculusTopic && !topicNames.has(calculusTopic.name)) {
    issues.push("missing Calculus ext-resp");
  }
  if (dataTopic && !topicNames.has(dataTopic.name)) {
    issues.push("missing Data ext-resp");
  }

  // Sub-topic uniqueness: each pick contributes its primary sub-topic; a
  // duplicate sub-topic across two picks fails the rule. Items with no
  // sub-topics tagged are skipped (they can't violate the rule).
  const seenSubtopics = new Set<string>();
  for (const pick of picks) {
    const primary = pick.subtopics[0];
    if (!primary) continue;
    if (seenSubtopics.has(primary)) {
      issues.push(`duplicate sub-topic: ${primary}`);
    }
    seenSubtopics.add(primary);
  }
  return issues;
}

/**
 * Flatten a per-topic pool into a single ranked list applying topic + diff
 * + weak-area weights. Items closer to the front are preferred picks.
 * Used both by the marks-target greedy picker and the exact-subset finder.
 */
function rankPool(
  poolsByTopic: Map<
    string,
    Record<"EASY" | "MEDIUM" | "HARD", QuestionGroupData[]>
  >,
  topicIds: string[],
  topicDist: number[],
  diffDist: [number, number, number],
  weakIds: Set<string>
): QuestionGroupData[] {
  const topicWeight = new Map<string, number>();
  topicIds.forEach((tid, i) => {
    topicWeight.set(tid, (topicDist[i] ?? 0) > 0 ? topicDist[i] : 0.0001);
  });
  const [wEasy, wMed, wHard] = diffDist.map((p) =>
    p > 0 ? p : 0.0001
  ) as [number, number, number];

  const score = (g: QuestionGroupData, tid: string, dw: number) => {
    const isWeak = weakIds.has(getParentItemId(g));
    const tw = topicWeight.get(tid) ?? 0.0001;
    return Math.random() / (tw * dw * (isWeak ? 3 : 1));
  };

  const all: { g: QuestionGroupData; sort: number }[] = [];
  Array.from(poolsByTopic.entries()).forEach(([tid, byDiff]) => {
    byDiff.EASY.forEach((g) => all.push({ g, sort: score(g, tid, wEasy) }));
    byDiff.MEDIUM.forEach((g) => all.push({ g, sort: score(g, tid, wMed) }));
    byDiff.HARD.forEach((g) => all.push({ g, sort: score(g, tid, wHard) }));
  });
  return all.sort((a, b) => a.sort - b.sort).map((x) => x.g);
}

/**
 * Find a subset of `items` whose marks sum to EXACTLY `targetMarks` using
 * at most `maxItems` items. Returns null if no such subset exists.
 *
 * Uses depth-first backtracking with two prunes:
 *   - bail when accumulated marks would overshoot the remaining budget
 *   - bail when picked.length reaches maxItems but remaining > 0
 *
 * Iteration order respects the pre-shuffled `items` list, so different
 * runs with different shuffles produce different subsets — variety
 * without sacrificing exactness.
 *
 * For our pool sizes (20-60 items, 4-15 mark range) the search space is
 * trivial; the worst case completes in low single-digit milliseconds.
 */
function findExactMarksSubset(
  items: QuestionGroupData[],
  targetMarks: number,
  maxItems: number,
  /**
   * Optional: require the subset to contain *exactly* this many items
   * (not just up to maxItems). Used by Foundation Section B where the
   * VCAA paper has exactly 12 questions totalling 60 marks — we don't
   * want an 11-item subset that happens to sum to 60.
   */
  exactCount?: number,
): QuestionGroupData[] | null {
  if (targetMarks === 0 && (exactCount === undefined || exactCount === 0)) return [];
  if (targetMarks < 0 || maxItems <= 0) return null;
  const cap = exactCount ?? maxItems;
  if (cap > maxItems) return null;

  const picked: QuestionGroupData[] = [];

  function dfs(start: number, remaining: number): boolean {
    if (remaining === 0) {
      // Hit the marks target — accept only if count constraint is also satisfied.
      return exactCount === undefined || picked.length === exactCount;
    }
    if (picked.length >= cap) return false;
    // Pruning: when exactCount is set, give up early if we couldn't pack
    // enough items into the remaining slots (cap - picked.length).
    if (exactCount !== undefined) {
      const slotsLeft = cap - picked.length;
      const itemsLeft = items.length - start;
      if (itemsLeft < slotsLeft) return false;
    }
    for (let i = start; i < items.length; i++) {
      const m = groupMarks(items[i]);
      if (m > remaining) continue; // would overshoot the target
      picked.push(items[i]);
      if (dfs(i + 1, remaining - m)) return true;
      picked.pop();
    }
    return false;
  }

  return dfs(0, targetMarks) ? picked.slice() : null;
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
  weakIds: Set<string> = new Set(),
  /**
   * Optional hard cap on the number of picked items. Used by Exam 1 to
   * prevent the EXT half from blowing past 5 items and pushing the
   * total question count above the real VCAA range of 8–9.
   */
  maxItems?: number
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

    // Pass 1: greedy fit — only accept questions that don't overshoot,
    // and stop once `maxItems` is reached if a cap was provided.
    for (const g of ranked) {
      if (total >= marksTarget) break;
      if (maxItems !== undefined && picked.length >= maxItems) break;
      const m = groupMarks(g);
      if (total + m <= marksTarget) {
        picked.push(g);
        total += m;
      }
    }

    // Pass 2: if still under target (no remaining question fits the gap),
    // accept the smallest available overshoot to close it. Respect the
    // maxItems cap here too — better to undershoot marks slightly than to
    // bust the question count.
    if (total < marksTarget) {
      const used = new Set(picked);
      const remaining = ranked
        .filter((g) => !used.has(g))
        .sort((a, b) => groupMarks(a) - groupMarks(b));
      for (const g of remaining) {
        if (total >= marksTarget) break;
        if (maxItems !== undefined && picked.length >= maxItems) break;
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

  // Parse the per-topic distribution. The setup form sends ONE weight per
  // topic in the active subject — 4 for Methods/Foundation, 5 for General,
  // 6 for Specialist — so we must accept any length, not just 4. Earlier this
  // hard-rejected anything ≠ 4 elements, silently dropping General's 5th and
  // Specialist's 6th topic weight back to the Methods-shaped default. Now we
  // accept any all-numeric array of length ≥1; only a malformed/empty param
  // falls back to the 4-way even split.
  function parseDist(raw: string | undefined): number[] {
    if (!raw) return [25, 25, 25, 25];
    const parts = raw.split(",").map(Number);
    if (parts.length < 1 || parts.some(isNaN)) return [25, 25, 25, 25];
    return parts;
  }

  const dist = parseDist(params.dist);
  const distB = parseDist(params.distB);

  // Parse difficulty distribution — 3 values [easy%, medium%, hard%].
  // The default matches the VCAA Methods Section A profile: ~30% easy /
  // ~50% mid / ~20% hard. Earlier code defaulted to [50, 30, 20] which
  // skewed practice papers toward easy questions and didn't reflect a real
  // exam's difficulty mix. Users who want a different mix can still
  // override via the `diff=` URL param from the setup page.
  function parseDiff(raw: string | undefined): [number, number, number] {
    if (!raw) return [30, 50, 20];
    const parts = raw.split(",").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return [30, 50, 20];
    return [parts[0], parts[1], parts[2]];
  }

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
