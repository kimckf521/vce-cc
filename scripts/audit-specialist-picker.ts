/**
 * Simulates the practice picker for each Specialist mode 20 times each
 * and reports the count + marks distribution. Mirrors the production
 * picker in session/page.tsx without rendering — fast feedback on whether
 * a paper structure change (e.g. exam1ShortCount) lands the picker on
 * VCAA-realistic totals.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-specialist-picker.ts
 */

import { prisma } from "../lib/prisma";

const PRACTICE_SET_ID = "cmpkc57h60001ofk0ccaxspkl"; // Specialist isDefault

interface Item {
  id: string;
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
  marks: number;
  tech: "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED" | null;
  topicSlug: string;
  subtopicSlug: string | null;
}

// Specialist topic order (matches DB):
//   [0] Algebra, Number, and Structure
//   [1] Calculus
//   [2] Data Analysis, Probability, and Statistics
//   [3] Discrete Mathematics
//   [4] Functions, Relations, and Graphs
//   [5] Space and Measurement
const TOPIC_ORDER = [
  "algebra-number-and-structure",
  "calculus",
  "data-analysis-probability-and-statistics",
  "discrete-mathematics",
  "functions-relations-and-graphs",
  "space-and-measurement",
];

const SPECIALIST_DIST = [20, 25, 15, 10, 10, 20]; // matches vcaaTopicDistFor
const OLD_DIST = [20, 30, 30, 20]; // 4-tuple that bug used

function distributeToCounts(percentages: number[], total: number): number[] {
  const sum = percentages.reduce((a, b) => a + b, 0);
  if (sum === 0) return percentages.map(() => 0);
  const raw = percentages.map((p) => (p / sum) * total);
  const floored = raw.map(Math.floor);
  let remainder = total - floored.reduce((a, b) => a + b, 0);
  const indices = raw.map((v, i) => [v - Math.floor(v), i] as [number, number]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < remainder; k++) floored[indices[k][1]] += 1;
  return floored;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findExactMarksSubset(items: Item[], targetMarks: number, maxItems: number): Item[] | null {
  if (targetMarks === 0) return [];
  if (targetMarks < 0 || maxItems <= 0) return null;
  const picked: Item[] = [];
  function dfs(start: number, remaining: number): boolean {
    if (remaining === 0) return true;
    if (picked.length >= maxItems) return false;
    for (let i = start; i < items.length; i++) {
      if (items[i].marks > remaining) continue;
      picked.push(items[i]);
      if (dfs(i + 1, remaining - items[i].marks)) return true;
      picked.pop();
    }
    return false;
  }
  return dfs(0, targetMarks) ? picked.slice() : null;
}

async function main() {
  const dbItems = await prisma.questionSetItem.findMany({
    where: { questionSetId: PRACTICE_SET_ID, status: "APPROVED" },
    select: {
      id: true,
      type: true,
      marks: true,
      tech: true,
      topic: { select: { slug: true } },
      subtopics: { select: { slug: true } },
    },
  });
  const items: Item[] = dbItems.map((d) => ({
    id: d.id,
    type: d.type as Item["type"],
    marks: d.marks,
    tech: d.tech,
    topicSlug: d.topic.slug,
    subtopicSlug: d.subtopics[0]?.slug ?? null,
  }));

  function simulateExam1(dist: number[], shortCount: number, extMax: number = 5) {
    const techOk = (t: Item["tech"]) => t === "TECH_FREE" || t === "CAS_ALLOWED";
    const shortPool = items.filter((i) => i.type === "SHORT_ANSWER" && techOk(i.tech));
    const extPool = items.filter((i) => i.type === "EXTENDED_ANSWER" && techOk(i.tech));
    const shortCounts = distributeToCounts(dist, shortCount);
    const trialShort: Item[] = [];
    TOPIC_ORDER.forEach((slug, i) => {
      const want = shortCounts[i] ?? 0;
      if (want <= 0) return;
      const topicShort = shuffle(shortPool.filter((it) => it.topicSlug === slug));
      trialShort.push(...topicShort.slice(0, want));
    });
    const shortMarks = trialShort.reduce((s, x) => s + x.marks, 0);
    const extRanked = shuffle(extPool);
    const extSubset = findExactMarksSubset(extRanked, 40 - shortMarks, extMax);
    if (!extSubset) return { count: trialShort.length, marks: shortMarks, picked: trialShort };
    return {
      count: trialShort.length + extSubset.length,
      marks: shortMarks + extSubset.reduce((s, x) => s + x.marks, 0),
      picked: [...trialShort, ...extSubset],
    };
  }

  function simulateExam2a(dist: number[]) {
    const mcqPool = items.filter((i) => i.type === "MCQ");
    const counts = distributeToCounts(dist, 20);
    const picked: Item[] = [];
    TOPIC_ORDER.forEach((slug, i) => {
      const want = counts[i] ?? 0;
      if (want <= 0) return;
      const topicMcqs = shuffle(mcqPool.filter((it) => it.topicSlug === slug));
      picked.push(...topicMcqs.slice(0, want));
    });
    return { count: picked.length, marks: picked.reduce((s, x) => s + x.marks, 0), picked };
  }

  function simulateExam2b(dist: number[]) {
    const extPool = items.filter((i) => i.type === "EXTENDED_RESPONSE");
    const topicWeight = new Map<string, number>();
    TOPIC_ORDER.forEach((s, i) => topicWeight.set(s, dist[i] ?? 0.0001));
    const ranked = extPool
      .map((x) => ({ x, sort: Math.random() / (topicWeight.get(x.topicSlug) || 0.0001) }))
      .sort((a, b) => a.sort - b.sort)
      .map((y) => y.x);
    const subset = findExactMarksSubset(ranked, 60, 6);
    if (!subset) return { count: 0, marks: 0, picked: [] };
    return { count: subset.length, marks: subset.reduce((s, x) => s + x.marks, 0), picked: subset };
  }

  function topicHistogram(picks: Item[]): Record<string, number> {
    const h: Record<string, number> = {};
    for (const t of TOPIC_ORDER) h[t] = 0;
    for (const p of picks) h[p.topicSlug] = (h[p.topicSlug] ?? 0) + 1;
    return h;
  }

  const TRIALS = 30;

  console.log("=== Specialist Exam 1 (NEW: shortCount=5, dist=[20,25,15,10,10,20]) ===");
  let countsHist: Record<number, number> = {};
  let markSum = 0;
  let topicTotals: Record<string, number> = {};
  for (let i = 0; i < TRIALS; i++) {
    const r = simulateExam1(SPECIALIST_DIST, 5, 5);
    countsHist[r.count] = (countsHist[r.count] ?? 0) + 1;
    markSum += r.marks;
    const th = topicHistogram(r.picked);
    for (const t of TOPIC_ORDER) topicTotals[t] = (topicTotals[t] ?? 0) + (th[t] ?? 0);
  }
  console.log("  count histogram:", countsHist, "avg marks:", (markSum / TRIALS).toFixed(2));
  console.log("  topic coverage (avg/trial):");
  for (const t of TOPIC_ORDER) console.log(`    ${t.padEnd(50)} ${((topicTotals[t] ?? 0) / TRIALS).toFixed(2)}`);

  console.log("\n=== Specialist Exam 1 (OLD: shortCount=4, dist=[20,30,30,20]) — bug repro ===");
  countsHist = {};
  markSum = 0;
  topicTotals = {};
  for (let i = 0; i < TRIALS; i++) {
    const r = simulateExam1(OLD_DIST, 4, 5);
    countsHist[r.count] = (countsHist[r.count] ?? 0) + 1;
    markSum += r.marks;
    const th = topicHistogram(r.picked);
    for (const t of TOPIC_ORDER) topicTotals[t] = (topicTotals[t] ?? 0) + (th[t] ?? 0);
  }
  console.log("  count histogram:", countsHist, "avg marks:", (markSum / TRIALS).toFixed(2));
  console.log("  topic coverage (avg/trial):");
  for (const t of TOPIC_ORDER) console.log(`    ${t.padEnd(50)} ${((topicTotals[t] ?? 0) / TRIALS).toFixed(2)}`);

  console.log("\n=== Specialist Exam 2A (20 MCQ) NEW dist ===");
  topicTotals = {};
  for (let i = 0; i < TRIALS; i++) {
    const r = simulateExam2a(SPECIALIST_DIST);
    const th = topicHistogram(r.picked);
    for (const t of TOPIC_ORDER) topicTotals[t] = (topicTotals[t] ?? 0) + (th[t] ?? 0);
  }
  console.log("  topic coverage (avg/trial):");
  for (const t of TOPIC_ORDER) console.log(`    ${t.padEnd(50)} ${((topicTotals[t] ?? 0) / TRIALS).toFixed(2)}`);

  console.log("\n=== Specialist Exam 2A — OLD bug repro ===");
  topicTotals = {};
  for (let i = 0; i < TRIALS; i++) {
    const r = simulateExam2a(OLD_DIST);
    const th = topicHistogram(r.picked);
    for (const t of TOPIC_ORDER) topicTotals[t] = (topicTotals[t] ?? 0) + (th[t] ?? 0);
  }
  console.log("  topic coverage (avg/trial):");
  for (const t of TOPIC_ORDER) console.log(`    ${t.padEnd(50)} ${((topicTotals[t] ?? 0) / TRIALS).toFixed(2)}`);

  console.log("\n=== Specialist Exam 2B (60-mark target, ≤6 EXT_RESP) NEW dist ===");
  countsHist = {};
  markSum = 0;
  topicTotals = {};
  for (let i = 0; i < TRIALS; i++) {
    const r = simulateExam2b(SPECIALIST_DIST);
    countsHist[r.count] = (countsHist[r.count] ?? 0) + 1;
    markSum += r.marks;
    const th = topicHistogram(r.picked);
    for (const t of TOPIC_ORDER) topicTotals[t] = (topicTotals[t] ?? 0) + (th[t] ?? 0);
  }
  console.log("  count histogram:", countsHist, "avg marks:", (markSum / TRIALS).toFixed(2));
  console.log("  topic coverage (avg/trial):");
  for (const t of TOPIC_ORDER) console.log(`    ${t.padEnd(50)} ${((topicTotals[t] ?? 0) / TRIALS).toFixed(2)}`);

  console.log("\n=== Specialist Exam 2B — OLD bug repro ===");
  countsHist = {};
  markSum = 0;
  topicTotals = {};
  for (let i = 0; i < TRIALS; i++) {
    const r = simulateExam2b(OLD_DIST);
    countsHist[r.count] = (countsHist[r.count] ?? 0) + 1;
    markSum += r.marks;
    const th = topicHistogram(r.picked);
    for (const t of TOPIC_ORDER) topicTotals[t] = (topicTotals[t] ?? 0) + (th[t] ?? 0);
  }
  console.log("  count histogram:", countsHist, "avg marks:", (markSum / TRIALS).toFixed(2));
  console.log("  topic coverage (avg/trial):");
  for (const t of TOPIC_ORDER) console.log(`    ${t.padEnd(50)} ${((topicTotals[t] ?? 0) / TRIALS).toFixed(2)}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
