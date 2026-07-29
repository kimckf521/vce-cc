/**
 * Paper assembler — the engine that builds a practice / assessment paper from
 * the generated question bank (QuestionSetItem rows, APPROVED only).
 *
 * Extracted from app/(app)/[curriculum]/[subject]/practice/session/page.tsx
 * so two callers can share it:
 *
 *   1. The student practice session page (personalisation ON). It composes
 *      the low-level helpers directly — fetchWithFallback → rankPool /
 *      findExactMarksSubset / pickGroupsGloballyByMarks / pickGroupsForTopic —
 *      because each exam mode (Exam 1 dual-pool, Exam 2A/2B, 2A&2B, General,
 *      Foundation sections, Freedom) has its own paper shape.
 *
 *   2. The teacher assessment builder (personalisation OFF). It calls the
 *      high-level assemblePaper() with explicit constraints: topicIds,
 *      difficulty percents, tech, targetMarks, questionCount, excludeItemIds.
 *
 * Every function here is side-effect free apart from the two fetchers, which
 * read from Prisma. Randomness is plain Math.random() — papers are meant to
 * differ between runs.
 */

import { Tech } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { approvedItemsFilter } from "@/lib/question-set-groups";

// ---------- shared types ----------

/** The four generated-bank item types (QuestionSetItem.type). */
export type QuestionSetItemType =
  | "MCQ"
  | "SHORT_ANSWER"
  | "EXTENDED_ANSWER"
  | "EXTENDED_RESPONSE";

/** QuestionSetItem.difficulty values. */
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

/**
 * Filter for the `tech` column on QuestionSetItem. Used by the practice
 * assembler to keep Exam 1 tech-free and Exam 2 CAS-only.
 *
 *   - Single enum value → `tech = <value>`
 *   - `{ in: [...] }`   → `tech IN (...)`
 *   - `undefined`        → no filter applied
 */
export type TechFilter = Tech | { in: Tech[] } | undefined;

/**
 * One assembled question as consumed by the QuestionGroup component. Every
 * generated item becomes one group; multi-part items explode into one `parts`
 * row per sub-part so each can be self-marked independently.
 *
 * NOTE: distinct from the QuestionGroupData in lib/question-groups.ts (the
 * VCAA past-paper shape) — this is the generated-bank / practice-session
 * shape. Both are structurally accepted by QuestionGroup's props.
 */
export interface QuestionGroupData {
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
    difficulty: Difficulty;
    solution: { content: string; videoUrl: string | null } | null;
    initialStatus: null;
  }[];
}

/** Per-difficulty buckets for one topic's fetched pool. */
export type DifficultyPools = Record<Difficulty, QuestionGroupData[]>;

/** topicId → per-difficulty pools, as returned by fetchAllGrouped. */
export type TopicPools = Map<string, DifficultyPools>;

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
export function techFilterForMode(mode: string): TechFilter {
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

// ---------- helpers ----------

/** Uniform Fisher–Yates shuffle. Returns a new array; the input is untouched. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Distribute `total` items proportionally across buckets defined by percentages. */
export function distributeToCounts(percentages: number[], total: number): number[] {
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
 * Fetch QuestionSetItems from the given question set (resolve the id via
 * getPracticeQuestionSetId / getGeneratedQuestionSetId in
 * lib/question-set-groups.ts) for the given item types in ONE query. Groups
 * them by topic and difficulty in memory. Only APPROVED items are returned —
 * approvedItemsFilter is baked into the where clause.
 *
 * Each item becomes a single-part group (the generated set has no multi-part
 * structure — every item stands alone), except items whose `parts` JSON (or
 * textual sub-part markers) explode into one row per sub-part.
 *
 * @param types      Item types to fetch (e.g. ["MCQ"]).
 * @param setId      QuestionSet id; null returns an empty pool.
 * @param techFilter Optional tech-column filter (see TechFilter).
 * @param excludeIds Item ids to omit (recent-seen dedup / already-in-paper).
 * @param topicIds   Optional hard topic scoping — only items whose topicId is
 *                   in this list are fetched. Used by the teacher builder's
 *                   explicit topic selection; omit for the whole subject.
 */
export async function fetchAllGrouped(
  types: QuestionSetItemType[],
  setId: string | null,
  techFilter?: TechFilter,
  excludeIds?: Set<string>,
  topicIds?: string[]
): Promise<TopicPools> {
  const byTopic: TopicPools = new Map();
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
      // Hard topic scoping for the teacher builder — an explicit topicIds
      // list means "only these topics", enforced at the query so unchosen
      // topics can't leak in through the soft rank weights.
      ...(topicIds && topicIds.length > 0 && {
        topicId: { in: topicIds },
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
    const diff = it.difficulty as Difficulty;

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
export function poolSize(pool: TopicPools): number {
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
export interface FallbackTracker {
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
export async function fetchWithFallback(
  types: QuestionSetItemType[],
  setId: string | null,
  techFilter: TechFilter,
  excludeIds: Set<string>,
  minPoolSize: number,
  tracker: FallbackTracker,
): Promise<TopicPools> {
  if (excludeIds.size === 0) {
    return fetchAllGrouped(types, setId, techFilter);
  }
  const withExclude = await fetchAllGrouped(types, setId, techFilter, excludeIds);
  if (poolSize(withExclude) >= minPoolSize) return withExclude;
  tracker.fellBack = true;
  return fetchAllGrouped(types, setId, techFilter);
}

// ---------- picking ----------

/**
 * Strip the part suffix (`::a`) from an EXTENDED_RESPONSE part id so we can
 * compare it against the QuestionSetItem id stored in QuestionSetAttempt
 * (and in AssessmentItem.questionSetItemId).
 */
export function getParentItemId(group: QuestionGroupData): string {
  const partId = group.parts[0]?.id ?? "";
  const i = partId.indexOf("::");
  return i === -1 ? partId : partId.slice(0, i);
}

/**
 * Weighted shuffle: items in `weakIds` get a 3× boost (their random sort key
 * is divided by 3, so they tend to land at the front and get picked first).
 * Falls through to a plain uniform shuffle when `weakIds` is empty.
 */
export function weightedShuffle(
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
export function groupMarks(g: QuestionGroupData): number {
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
const DIFFICULTY_RANK: Record<Difficulty, number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

/**
 * Stable-sort groups into the VCAA difficulty escalation (EASY → MEDIUM →
 * HARD). Ties keep their incoming (randomised) order.
 */
export function sortByDifficultyEscalation(groups: QuestionGroupData[]): QuestionGroupData[] {
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
export function sectionBCoverageIssues(
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
 *
 * @param poolsByTopic Pool from fetchAllGrouped / fetchWithFallback.
 * @param topicIds     Topic ids in the same order as `topicDist`.
 * @param topicDist    Per-topic percent weights (soft preference, not a hard
 *                     split). Zero weights become an epsilon so ratios stay
 *                     sane.
 * @param diffDist     [easy, medium, hard] percent weights (soft preference).
 * @param weakIds      Item ids to boost 3× (pass an empty Set to disable).
 */
export function rankPool(
  poolsByTopic: TopicPools,
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
 * Satisfiable inputs over our pool sizes (20-60 items, 4-15 mark range)
 * resolve in low single-digit milliseconds. UNSATISFIABLE inputs are the
 * dangerous case — without guard rails the DFS enumerates every subset
 * (2^60 worst case) before concluding "no", and the teacher API exposes
 * caller-controlled targets. Three guards keep the search bounded:
 *
 *   - impossible targets bail out before any search (target beyond the
 *     pool's total marks; exactCount targets beyond the sum of the
 *     exactCount largest items)
 *   - a suffix-sum prune abandons any branch whose remaining items can no
 *     longer reach the target
 *   - a hard node budget (DFS_NODE_BUDGET) aborts pathological searches
 *     (e.g. parity-unreachable targets); the function then returns null and
 *     callers fall back to the greedy closest-fit picker
 */
const DFS_NODE_BUDGET = 100_000;

export function findExactMarksSubset(
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

  const marks = items.map(groupMarks);

  // suffix[i] = total marks of items[i..end]. Feeds the up-front
  // "target exceeds the whole pool" bail-out AND the per-branch prune below.
  const suffix = new Array<number>(items.length + 1);
  suffix[items.length] = 0;
  for (let i = items.length - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + marks[i];
  if (targetMarks > suffix[0]) return null;

  // With an exact item count, the best any subset can do is the exactCount
  // largest items — if even those fall short, no search can succeed.
  if (exactCount !== undefined) {
    if (exactCount > items.length) return null;
    const sortedDesc = [...marks].sort((a, b) => b - a);
    let bestReach = 0;
    for (let i = 0; i < exactCount; i++) bestReach += sortedDesc[i];
    if (bestReach < targetMarks) return null;
  }

  const picked: QuestionGroupData[] = [];
  let budget = DFS_NODE_BUDGET;

  function dfs(start: number, remaining: number): boolean {
    if (remaining === 0) {
      // Hit the marks target — accept only if count constraint is also satisfied.
      return exactCount === undefined || picked.length === exactCount;
    }
    if (picked.length >= cap) return false;
    // The items left from `start` onward can't sum to the target — dead branch.
    if (remaining > suffix[start]) return false;
    // Pruning: when exactCount is set, give up early if we couldn't pack
    // enough items into the remaining slots (cap - picked.length).
    if (exactCount !== undefined) {
      const slotsLeft = cap - picked.length;
      const itemsLeft = items.length - start;
      if (itemsLeft < slotsLeft) return false;
    }
    // Budget exhausted — abort the whole search: every in-flight frame's
    // recursive calls now fail fast, so the stack unwinds in O(depth × n).
    // The caller treats the resulting null as "no exact subset" and falls
    // back to the greedy picker, so behaviour degrades gracefully.
    if (--budget < 0) return false;
    for (let i = start; i < items.length; i++) {
      const m = marks[i];
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
export function pickGroupsGloballyByMarks(
  poolsByTopic: TopicPools,
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
 * Count-based (Freedom mode / Exam 2A): `topicCount` items split across
 * difficulty buckets per `diffDist`, backfilling across buckets when one
 * runs short.
 */
export function pickGroupsForTopic(
  pool: DifficultyPools | undefined,
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

// ---------- URL param parsing (setup form → session page) ----------

/**
 * Parse the per-topic distribution URL param (e.g. "25,25,25,25"). The setup
 * form sends ONE weight per topic in the active subject — 4 for Methods/
 * Foundation, 5 for General, 6 for Specialist — so we must accept any length,
 * not just 4. Earlier this hard-rejected anything ≠ 4 elements, silently
 * dropping General's 5th and Specialist's 6th topic weight back to the
 * Methods-shaped default. Now we accept any all-numeric array of length ≥1;
 * only a malformed/empty param falls back to the 4-way even split.
 */
export function parseDist(raw: string | undefined): number[] {
  if (!raw) return [25, 25, 25, 25];
  const parts = raw.split(",").map(Number);
  if (parts.length < 1 || parts.some(isNaN)) return [25, 25, 25, 25];
  return parts;
}

/**
 * Parse the difficulty distribution URL param — 3 values [easy%, medium%,
 * hard%]. The default matches the VCAA Methods Section A profile: ~30% easy /
 * ~50% mid / ~20% hard. Earlier code defaulted to [50, 30, 20] which skewed
 * practice papers toward easy questions and didn't reflect a real exam's
 * difficulty mix. Users who want a different mix can still override via the
 * `diff=` URL param from the setup page.
 */
export function parseDiff(raw: string | undefined): [number, number, number] {
  if (!raw) return [30, 50, 20];
  const parts = raw.split(",").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return [30, 50, 20];
  return [parts[0], parts[1], parts[2]];
}

// ---------- high-level assembly ----------

/**
 * Cap on how many ranked items the exact-subset finder searches over in
 * assemblePaper(). The rank order is random(-weighted), so the front slice is
 * a fresh sample each call — plenty of variety — while keeping the DFS
 * search space bounded even when the caller's pool is the whole bank
 * (1,000+ items for Methods).
 */
const SUBSET_SEARCH_CAP = 60;

/**
 * Options for assemblePaper(). Designed to serve both callers:
 *
 *   - Teacher assessment builder (personalisation OFF): pass topicIds,
 *     difficulty percents, tech, targetMarks and/or questionCount, and
 *     excludeItemIds for items already in the paper. Leave the
 *     personalisation fields unset.
 *   - Student-style callers (personalisation ON): additionally pass
 *     weakItemIds (3× boost), recentSeenIds (soft exclusion with thin-pool
 *     fallback), minPoolSize and a shared FallbackTracker.
 */
export interface AssemblePaperOptions {
  /**
   * QuestionSet to draw from. Resolve via getPracticeQuestionSetId /
   * getGeneratedQuestionSetId in lib/question-set-groups.ts — both return
   * per-subject sets, so the pool is already subject-scoped.
   */
  setId: string;
  /**
   * Topic ids to draw from, applied as a HARD filter (items outside these
   * topics never appear). When the caller has no topic restriction, pass
   * every topic id for the subject. Order aligns with `topicWeights`.
   */
  topicIds: string[];
  /**
   * Item types eligible for the paper. Defaults to all four generated-bank
   * types.
   */
  types?: QuestionSetItemType[];
  /**
   * Per-topic percent weights (soft preference), aligned by index with
   * `topicIds`. Defaults to an even split.
   */
  topicWeights?: number[];
  /**
   * Difficulty mix as percents (soft preference, sum ~100). Matches the
   * teacher API contract shape. Defaults to the VCAA-like 30/50/20.
   */
  difficulty?: { easy: number; medium: number; hard: number };
  /**
   * Tech constraint. 'TECH_FREE' → only TECH_FREE items; 'ANY' / unset → no
   * filter. A raw TechFilter (e.g. techFilterForMode's Exam 1 value) is also
   * accepted for student-style callers.
   */
  tech?: "TECH_FREE" | "ANY" | Exclude<TechFilter, undefined>;
  /**
   * Marks target. When set, the assembler looks for an exact-sum subset
   * (≤ questionCount items when that is also set) and falls back to the
   * closest-fit greedy picker when no exact subset exists.
   */
  targetMarks?: number;
  /**
   * Question count. With `targetMarks`: acts as the max (or exact, see
   * `exactQuestionCount`) number of items in the subset. Alone: picks
   * exactly this many items off the top of the weighted ranking.
   */
  questionCount?: number;
  /**
   * When both `targetMarks` and `questionCount` are set, require the subset
   * to contain *exactly* questionCount items rather than at most.
   */
  exactQuestionCount?: boolean;
  /**
   * Item ids that must NEVER appear (e.g. items already in the assessment,
   * or every current item when re-rolling one slot). Hard exclusion — never
   * dropped by the thin-pool fallback.
   */
  excludeItemIds?: Iterable<string>;
  /**
   * Personalisation: recently-attempted item ids to avoid. Soft exclusion —
   * dropped (and `tracker.fellBack` set) when it would shrink the pool
   * below `minPoolSize`.
   */
  recentSeenIds?: Set<string>;
  /**
   * Personalisation: item ids the user got wrong / flagged — boosted 3× in
   * the ranking.
   */
  weakItemIds?: Set<string>;
  /**
   * Minimum viable pool size for the recent-seen fallback check. Defaults
   * to `questionCount`, else 1.
   */
  minPoolSize?: number;
  /** Shared tracker for the recent-seen fallback notice (see FallbackTracker). */
  tracker?: FallbackTracker;
}

/** Result of assemblePaper(). */
export interface AssembledPaper {
  /**
   * Picked questions in paper order (difficulty escalation: EASY → MEDIUM →
   * HARD, random within a band), render-ready for QuestionGroup.
   */
  groups: QuestionGroupData[];
  /**
   * Parent QuestionSetItem ids in the same order as `groups` — what the
   * teacher API stores in AssessmentItem.questionSetItemId.
   */
  itemIds: string[];
  /** Sum of marks across all picked groups. */
  totalMarks: number;
  /** True when the recent-seen exclusion was dropped (thin pool). */
  fellBack: boolean;
}

/**
 * One-call paper assembly: fetch the APPROVED pool for the given set /
 * topics / types / tech, rank it with topic + difficulty (+ weak-area)
 * weights, then select by marks target and/or question count.
 *
 * Selection strategy:
 *   - targetMarks set → findExactMarksSubset over the ranked front slice
 *     (falls back to pickGroupsGloballyByMarks closest-fit when no exact
 *     subset exists);
 *   - only questionCount set → top `questionCount` of the ranking;
 *   - neither → the whole filtered pool, ranked.
 *
 * The teacher builder's auto-assemble calls this with personalisation off;
 * see AssemblePaperOptions for the exact knobs. Returns an empty paper
 * (never throws) when the pool can't satisfy the constraints at all.
 */
export async function assemblePaper(options: AssemblePaperOptions): Promise<AssembledPaper> {
  const {
    setId,
    topicIds,
    types = ["MCQ", "SHORT_ANSWER", "EXTENDED_ANSWER", "EXTENDED_RESPONSE"],
    topicWeights,
    difficulty,
    tech,
    targetMarks,
    questionCount,
    exactQuestionCount = false,
    excludeItemIds,
    recentSeenIds,
    weakItemIds = new Set<string>(),
    minPoolSize,
    tracker,
  } = options;

  // 'ANY' / unset → no filter; 'TECH_FREE' happens to equal the Prisma enum
  // value, so both string forms and raw TechFilter objects normalise cleanly.
  const techFilter: TechFilter =
    tech === "ANY" || tech === undefined
      ? undefined
      : tech === "TECH_FREE"
        ? Tech.TECH_FREE
        : tech;

  const hardExclude = new Set(excludeItemIds ?? []);
  const localTracker: FallbackTracker = tracker ?? { fellBack: false };

  // Fetch with the soft recent-seen exclusion layered on top of the hard
  // exclusion; when the pool comes up thinner than the picker needs, drop
  // ONLY the soft layer and refetch (mirrors fetchWithFallback, but keeps
  // the hard exclusions intact).
  const hasSoft = recentSeenIds !== undefined && recentSeenIds.size > 0;
  const combinedExclude = hasSoft
    ? new Set([...Array.from(hardExclude), ...Array.from(recentSeenIds)])
    : hardExclude;
  let pool = await fetchAllGrouped(types, setId, techFilter, combinedExclude, topicIds);
  if (hasSoft && poolSize(pool) < (minPoolSize ?? questionCount ?? 1)) {
    localTracker.fellBack = true;
    pool = await fetchAllGrouped(types, setId, techFilter, hardExclude, topicIds);
  }

  const weights = topicWeights ?? topicIds.map(() => 1);
  const diffDist: [number, number, number] = difficulty
    ? [difficulty.easy, difficulty.medium, difficulty.hard]
    : [30, 50, 20];

  const ranked = rankPool(pool, topicIds, weights, diffDist, weakItemIds);

  let picked: QuestionGroupData[];
  if (targetMarks !== undefined) {
    // Bound the DFS search space; the slice is a fresh weighted-random
    // sample each call so variety is preserved (see SUBSET_SEARCH_CAP).
    const searchPool = ranked.slice(0, Math.max(SUBSET_SEARCH_CAP, questionCount ?? 0));
    const maxItems = questionCount ?? searchPool.length;
    picked =
      findExactMarksSubset(
        searchPool,
        targetMarks,
        maxItems,
        exactQuestionCount && questionCount !== undefined ? questionCount : undefined,
      ) ??
      pickGroupsGloballyByMarks(
        pool,
        topicIds,
        weights,
        targetMarks,
        diffDist,
        weakItemIds,
        questionCount,
      );
  } else if (questionCount !== undefined) {
    picked = ranked.slice(0, questionCount);
  } else {
    picked = ranked;
  }

  const ordered = sortByDifficultyEscalation(picked);
  return {
    groups: ordered,
    itemIds: ordered.map(getParentItemId),
    totalMarks: ordered.reduce((s, g) => s + groupMarks(g), 0),
    fellBack: localTracker.fellBack,
  };
}
