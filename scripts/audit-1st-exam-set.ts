/**
 * Comprehensive audit of the "1st Generated Exam Set" (300 items).
 *
 * Produces:
 *   - Aggregate stats (type, difficulty, topic, subtopic, tech, marks)
 *   - Automated quality findings:
 *       * MCQ answer mismatch (correctOption vs the answer claimed in the solution)
 *       * Empty or trivially-short content / solutions
 *       * LaTeX delimiter imbalance ($ pairs, \( \), \[ \])
 *       * Thinking-out-loud / self-correction leakage in solutions
 *       * Step-marks vs declared marks consistency
 *       * Missing sub-topic tags
 *   - A random sample of 30 items written to /tmp/audit-sample.json for
 *     downstream content review
 */
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });
const SET_NAME = "1st Generated Exam Set";

interface Finding {
  id: string;
  category: string;
  detail: string;
  snippet?: string;
}

const findings: Finding[] = [];

const thinkingPatterns: [RegExp, string][] = [
  [/\bwait[,\s]/i, "wait"],
  [/\brecompute/i, "recompute"],
  [/\bre-?check/i, "re-check"],
  [/\bre-?examine/i, "re-examine"],
  [/intended answer/i, "intended answer"],
  [/\(assume corrected/i, "assume corrected"],
  [/hmm[,\s]/i, "hmm"],
  [/\bretry with/i, "retry with"],
  [/let me (?:re-?|double-?)check/i, "let me check"],
  [/assume intended/i, "assume intended"],
  [/\bactually[,]/i, "actually,"],
  [/\bre-?read/i, "re-read"],
  [/something'?s weird/i, "something's weird"],
  [/let me think/i, "let me think"],
  [/\bOr\b[^.]*\bcheck/i, "or... check"],
  [/let me reconsider/i, "let me reconsider"],
  [/on second thought/i, "on second thought"],
];

function countUnmatched(text: string, delim: string): number {
  const re = new RegExp(`(?<!\\\\)\\${delim}`, "g");
  return (text.match(re) ?? []).length;
}

function checkLatex(text: string): string | null {
  // Count single $ (not escaped, not part of $$)
  // Strip $$ first
  const noBlock = text.replace(/\$\$[\s\S]*?\$\$/g, "");
  const dollars = countUnmatched(noBlock, "$");
  if (dollars % 2 !== 0) return `unbalanced $ (${dollars} unmatched)`;
  const opens = (text.match(/\\\(/g) ?? []).length;
  const closes = (text.match(/\\\)/g) ?? []).length;
  if (opens !== closes) return `unbalanced \\(...\\) (${opens} open, ${closes} close)`;
  const bopens = (text.match(/\\\[/g) ?? []).length;
  const bcloses = (text.match(/\\\]/g) ?? []).length;
  if (bopens !== bcloses) return `unbalanced \\[...\\] (${bopens} open, ${bcloses} close)`;
  return null;
}

function extractMCQAnswerFromSolution(solution: string): string | null {
  // VCAA solutions use either "**Answer: X**" or "The correct answer is **X**"
  const m1 = solution.match(/\*\*Answer:\s*([A-D])\*\*/i);
  if (m1) return m1[1].toUpperCase();
  const m2 = solution.match(/correct answer is \*\*([A-D])\*\*/i);
  if (m2) return m2[1].toUpperCase();
  return null;
}

function checkStepMarks(solution: string, totalMarks: number): string | null {
  // Look for "Step N (M mark[s])" patterns and sum M values
  const stepMarks = [...solution.matchAll(/Step\s+\d+\s*\((\d+)\s*marks?\)/gi)].map(
    (m) => parseInt(m[1], 10),
  );
  if (stepMarks.length === 0) return null; // not a step-marked solution, skip
  const sum = stepMarks.reduce((a, b) => a + b, 0);
  if (sum !== totalMarks) {
    return `step marks ${stepMarks.join("+")}=${sum}, declared ${totalMarks}`;
  }
  return null;
}

async function main() {
  // There are multiple rows named "1st Generated Exam Set"; pick the one
  // that actually has items.
  const allSets = await prisma.questionSet.findMany({
    where: { name: SET_NAME },
    select: { id: true, name: true, isDefault: true, _count: { select: { items: true } } },
  });
  console.log("All sets named:", JSON.stringify(allSets, null, 2));
  const set = allSets.find((s) => s._count.items > 0);
  if (!set) {
    console.error(`No non-empty set named "${SET_NAME}".`);
    process.exit(1);
  }
  console.log(`Auditing: ${set.name} (${set.id}, ${set._count.items} items)\n`);

  const items = await prisma.questionSetItem.findMany({
    where: { questionSetId: set.id },
    select: {
      id: true,
      type: true,
      status: true,
      marks: true,
      difficulty: true,
      tech: true,
      preamble: true,
      parts: true,
      content: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correctOption: true,
      solutionContent: true,
      topic: { select: { name: true, slug: true } },
      subtopics: { select: { name: true, slug: true } },
    },
  });
  console.log(`Total items: ${items.length}\n`);

  // ── Aggregate stats ───────────────────────────────────────────
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byTech: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  const subtopicCounts: Record<string, number> = {};
  const marksHistogram: Record<number, number> = {};
  let noSubtopics = 0;
  let multipleSubtopics = 0;

  for (const it of items) {
    byType[it.type] = (byType[it.type] ?? 0) + 1;
    byStatus[it.status] = (byStatus[it.status] ?? 0) + 1;
    byDifficulty[it.difficulty] = (byDifficulty[it.difficulty] ?? 0) + 1;
    byTech[it.tech ?? "null"] = (byTech[it.tech ?? "null"] ?? 0) + 1;
    byTopic[it.topic.name] = (byTopic[it.topic.name] ?? 0) + 1;
    marksHistogram[it.marks] = (marksHistogram[it.marks] ?? 0) + 1;
    if (it.subtopics.length === 0) noSubtopics++;
    if (it.subtopics.length > 1) multipleSubtopics++;
    for (const st of it.subtopics) {
      subtopicCounts[st.name] = (subtopicCounts[st.name] ?? 0) + 1;
    }
  }

  console.log("By type:", byType);
  console.log("By status:", byStatus);
  console.log("By difficulty:", byDifficulty);
  console.log("By tech:", byTech);
  console.log("By topic:", byTopic);
  console.log("Marks histogram:", marksHistogram);
  console.log(`Items with NO subtopics: ${noSubtopics}`);
  console.log(`Items with multiple subtopics: ${multipleSubtopics}`);
  console.log(`Distinct subtopics tagged: ${Object.keys(subtopicCounts).length}`);
  const sortedSubtopics = Object.entries(subtopicCounts).sort((a, b) => b[1] - a[1]);
  console.log("Top 10 subtopics:");
  for (const [name, n] of sortedSubtopics.slice(0, 10)) {
    console.log(`  ${name.padEnd(35)} ${n}`);
  }

  // ── Automated quality checks ───────────────────────────────────
  for (const it of items) {
    const content = it.content ?? "";
    const sol = it.solutionContent ?? "";

    // 1. Content / solution empty or trivially short
    if (content.length < 20) {
      findings.push({ id: it.id, category: "content-too-short", detail: `content length ${content.length}`, snippet: content.slice(0, 50) });
    }
    if (sol.length < 30) {
      findings.push({ id: it.id, category: "solution-too-short", detail: `solution length ${sol.length}`, snippet: sol.slice(0, 50) });
    }

    // 2. MCQ answer mismatch
    if (it.type === "MCQ") {
      if (!it.correctOption) {
        findings.push({ id: it.id, category: "mcq-missing-correct-option", detail: "no correctOption set" });
      } else if (!it.optionA || !it.optionB || !it.optionC || !it.optionD) {
        findings.push({ id: it.id, category: "mcq-missing-option", detail: `A=${!!it.optionA} B=${!!it.optionB} C=${!!it.optionC} D=${!!it.optionD}` });
      } else {
        const claimed = extractMCQAnswerFromSolution(sol);
        if (claimed && claimed !== it.correctOption.toUpperCase()) {
          findings.push({
            id: it.id,
            category: "mcq-answer-mismatch",
            detail: `correctOption=${it.correctOption}, solution claims ${claimed}`,
            snippet: sol.slice(0, 100),
          });
        }
        if (!claimed) {
          findings.push({ id: it.id, category: "mcq-no-claim-in-solution", detail: "solution doesn't include **Answer: X**" });
        }
      }
    }

    // 3. LaTeX balance
    const latexIssue = checkLatex(content);
    if (latexIssue) {
      findings.push({ id: it.id, category: "latex-content", detail: latexIssue, snippet: content.slice(0, 100) });
    }
    const latexIssueSol = checkLatex(sol);
    if (latexIssueSol) {
      findings.push({ id: it.id, category: "latex-solution", detail: latexIssueSol, snippet: sol.slice(0, 100) });
    }

    // 4. Thinking-out-loud
    for (const [rx, name] of thinkingPatterns) {
      const m = sol.match(rx);
      if (m) {
        findings.push({ id: it.id, category: "thinking-out-loud", detail: name, snippet: m[0] });
        break;
      }
    }

    // 5. Step-marks consistency (only for non-MCQ; MCQs are 1 mark)
    if (it.type !== "MCQ" && it.parts === null) {
      const issue = checkStepMarks(sol, it.marks);
      if (issue) {
        findings.push({ id: it.id, category: "step-marks-mismatch", detail: issue });
      }
    }

    // 6. Missing subtopic
    if (it.subtopics.length === 0) {
      findings.push({ id: it.id, category: "no-subtopic", detail: "no sub-topic tagged" });
    }
  }

  // ── Findings summary ──────────────────────────────────────────
  const byCategory: Record<string, number> = {};
  for (const f of findings) byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
  console.log("\n── Findings ──");
  console.log(`Total findings: ${findings.length}`);
  for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(30)} ${n}`);
  }

  // Write detailed findings + sample
  fs.writeFileSync("/tmp/audit-findings.json", JSON.stringify(findings, null, 2));
  console.log(`\nDetailed findings written to /tmp/audit-findings.json`);

  // 30 random samples for content review
  const sample = [...items].sort(() => Math.random() - 0.5).slice(0, 30);
  fs.writeFileSync("/tmp/audit-sample.json", JSON.stringify(sample, null, 2));
  console.log(`30-item random sample written to /tmp/audit-sample.json`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
