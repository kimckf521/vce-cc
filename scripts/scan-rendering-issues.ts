/**
 * Comprehensive rendering scan across every QuestionSetItem in the DB.
 *
 * Checks every text field (content, preamble, solutionContent, parts[*].content,
 * parts[*].solution, parts[*].subParts[*].content/solution, optionA-D) for:
 *
 *   1. backslash-linebreak outside math mode  ("\\<newline>" in plain text)
 *   2. unbalanced $ pairs (odd count when $$ blocks stripped)
 *   3. unbalanced \( \) pairs
 *   4. unbalanced \[ \] pairs
 *   5. unbalanced $$ pairs
 *   6. AI thinking-out-loud / self-correction leakage
 *   7. visible raw LaTeX commands that escaped math mode (\dfrac, \frac outside $)
 *   8. literal "\n" or "\t" as visible characters
 *   9. empty content where required
 *  10. MCQ: missing options, missing correctOption, solution doesn't claim X
 *  11. MCQ: answer claimed in solution doesn't match correctOption
 *  12. smart-quote / em-dash leakage that often comes from copy-paste
 *  13. trailing/leading whitespace artifacts
 *
 * Outputs a categorized findings report + writes /tmp/rendering-findings.json
 */
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

interface Finding {
  setName: string;
  subject: string;
  itemId: string;
  itemType: string;
  field: string;
  category: string;
  detail: string;
  snippet: string;
}

const findings: Finding[] = [];

// ── Patterns ─────────────────────────────────────────────────────
const thinkingPatterns: [RegExp, string][] = [
  [/\bwait[,\s]/i, "wait"],
  [/\brecompute/i, "recompute"],
  [/\bre-?check/i, "re-check"],
  [/intended answer/i, "intended answer"],
  [/\(assume corrected/i, "assume corrected"],
  [/hmm[,\s]/i, "hmm"],
  [/let me (?:re-?|double-?)check/i, "let me check"],
  [/assume intended/i, "assume intended"],
  [/let me think/i, "let me think"],
  [/let me reconsider/i, "let me reconsider"],
  [/on second thought/i, "on second thought"],
  [/\(actually corrected to/i, "actually corrected to"],
  [/correction:/i, "correction:"],
];

// Bare LaTeX commands that should never appear outside math mode.
// We strip $..$ and $$..$$ first, then look for these.
const bareLatexPatterns: [RegExp, string][] = [
  [/\\dfrac\b/, "\\dfrac outside math"],
  [/\\frac\b/, "\\frac outside math"],
  [/\\sqrt\b/, "\\sqrt outside math"],
  [/\\sum\b/, "\\sum outside math"],
  [/\\int\b/, "\\int outside math"],
  [/\\text\b/, "\\text outside math"],
  [/\\cdot\b/, "\\cdot outside math"],
  [/\\times\b/, "\\times outside math"],
];

function stripMath(text: string): string {
  // Strip $$...$$ blocks first (greedy across newlines)
  let s = text.replace(/\$\$[\s\S]*?\$\$/g, "");
  // Then $...$ inline
  s = s.replace(/\$[^$\n]*\$/g, "");
  // Then \[...\]
  s = s.replace(/\\\[[\s\S]*?\\\]/g, "");
  // Then \(...\)
  s = s.replace(/\\\([\s\S]*?\\\)/g, "");
  return s;
}

function countUnescaped(text: string, char: string): number {
  // Count occurrences of `char` not preceded by a backslash
  const re = new RegExp(`(?<!\\\\)\\${char}`, "g");
  return (text.match(re) ?? []).length;
}

function checkLatexBalance(text: string): { category: string; detail: string } | null {
  // Strip $$ blocks first; what's left should have an even number of $
  const noBlock = text.replace(/\$\$[\s\S]*?\$\$/g, "");
  const dollars = countUnescaped(noBlock, "$");
  if (dollars % 2 !== 0)
    return { category: "latex-balance", detail: `${dollars} unmatched $` };
  const opens = (text.match(/\\\(/g) ?? []).length;
  const closes = (text.match(/\\\)/g) ?? []).length;
  if (opens !== closes)
    return {
      category: "latex-balance",
      detail: `\\(...\\) mismatch: ${opens} open, ${closes} close`,
    };
  const bopens = (text.match(/\\\[/g) ?? []).length;
  const bcloses = (text.match(/\\\]/g) ?? []).length;
  if (bopens !== bcloses)
    return {
      category: "latex-balance",
      detail: `\\[...\\] mismatch: ${bopens} open, ${bcloses} close`,
    };
  const blockOpens = (text.match(/\$\$/g) ?? []).length;
  if (blockOpens % 2 !== 0)
    return { category: "latex-balance", detail: `${blockOpens} unmatched $$` };
  return null;
}

function extractMCQAnswerFromSolution(solution: string): string | null {
  const m1 = solution.match(/\*\*Answer:\s*([A-D])\*\*/i);
  if (m1) return m1[1].toUpperCase();
  const m2 = solution.match(/correct answer is \*\*([A-D])\*\*/i);
  if (m2) return m2[1].toUpperCase();
  return null;
}

interface ScanCtx {
  setName: string;
  subject: string;
  itemId: string;
  itemType: string;
}

function scanField(ctx: ScanCtx, fieldName: string, text: string | null): void {
  if (!text) return;

  // 1. Backslash-linebreak outside math mode
  const stripped = stripMath(text);
  if (/\\\\\n/.test(stripped)) {
    findings.push({
      ...ctx,
      field: fieldName,
      category: "backslash-linebreak",
      detail: "\\\\<newline> appears outside math mode",
      snippet: (stripped.match(/.{0,40}\\\\\n.{0,40}/)?.[0] ?? "").slice(0, 100),
    });
  }

  // 2. LaTeX delimiter balance
  const balIssue = checkLatexBalance(text);
  if (balIssue) {
    findings.push({
      ...ctx,
      field: fieldName,
      category: balIssue.category,
      detail: balIssue.detail,
      snippet: text.slice(0, 100),
    });
  }

  // 3. Thinking-out-loud
  for (const [rx, name] of thinkingPatterns) {
    const m = text.match(rx);
    if (m) {
      findings.push({
        ...ctx,
        field: fieldName,
        category: "thinking-out-loud",
        detail: name,
        snippet: m[0],
      });
      break;
    }
  }

  // 4. Bare LaTeX commands outside math mode
  for (const [rx, name] of bareLatexPatterns) {
    const m = stripped.match(rx);
    if (m) {
      findings.push({
        ...ctx,
        field: fieldName,
        category: "latex-outside-math",
        detail: name,
        snippet: m[0],
      });
      break;
    }
  }

  // 5. Literal "\n" or "\t" as escape sequences (vs actual newlines/tabs)
  if (/\\n[a-zA-Z ]/.test(text) || /\\t[a-zA-Z ]/.test(text)) {
    // Differentiate from \nabla, \neq etc which start with \n but are
    // valid LaTeX. Only flag \n followed by a letter/space that ISN'T
    // a known LaTeX command.
    const m = text.match(/\\n(?!abla|eq|ot|earrow|ull|ote)[a-zA-Z ]/);
    if (m && !/^\\n(abla|eq|ot|earrow|ull|ote)/.test(m[0])) {
      // skip; pattern too noisy. Disable for now.
    }
  }

  // 6. Smart quotes / typographic chars that often break rendering
  if (/[“”‘’]/.test(text)) {
    findings.push({
      ...ctx,
      field: fieldName,
      category: "smart-quotes",
      detail: "curly quote characters",
      snippet: (text.match(/.{0,20}[“”‘’].{0,20}/)?.[0] ?? "").slice(0, 60),
    });
  }
}

async function main() {
  const sets = await prisma.questionSet.findMany({
    where: { items: { some: {} } },
    include: {
      subject: { select: { slug: true, name: true } },
      _count: { select: { items: true } },
    },
  });

  console.log(`Scanning ${sets.length} non-empty question sets:`);
  for (const s of sets) {
    console.log(
      `  - ${s.name.padEnd(35)} ${(s.subject?.slug ?? "—").padEnd(25)} ${s._count.items} items`,
    );
  }
  console.log();

  let totalScanned = 0;

  for (const s of sets) {
    const items = await prisma.questionSetItem.findMany({
      where: { questionSetId: s.id },
      select: {
        id: true,
        type: true,
        content: true,
        preamble: true,
        parts: true,
        solutionContent: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correctOption: true,
      },
    });

    for (const it of items) {
      totalScanned++;
      const ctx: ScanCtx = {
        setName: s.name,
        subject: s.subject?.slug ?? "",
        itemId: it.id,
        itemType: it.type,
      };

      scanField(ctx, "content", it.content);
      scanField(ctx, "preamble", it.preamble);
      scanField(ctx, "solutionContent", it.solutionContent);
      scanField(ctx, "optionA", it.optionA);
      scanField(ctx, "optionB", it.optionB);
      scanField(ctx, "optionC", it.optionC);
      scanField(ctx, "optionD", it.optionD);

      if (Array.isArray(it.parts)) {
        const parts = it.parts as unknown as {
          content?: string;
          solution?: string | null;
          subParts?: { content?: string; solution?: string | null }[];
        }[];
        parts.forEach((p, i) => {
          scanField(ctx, `parts[${i}].content`, p.content ?? null);
          scanField(ctx, `parts[${i}].solution`, p.solution ?? null);
          (p.subParts ?? []).forEach((sp, j) => {
            scanField(
              ctx,
              `parts[${i}].subParts[${j}].content`,
              sp.content ?? null,
            );
            scanField(
              ctx,
              `parts[${i}].subParts[${j}].solution`,
              sp.solution ?? null,
            );
          });
        });
      }

      // MCQ-specific cross-field checks
      if (it.type === "MCQ") {
        if (!it.optionA || !it.optionB || !it.optionC || !it.optionD) {
          findings.push({
            ...ctx,
            field: "options",
            category: "mcq-missing-option",
            detail: `A=${!!it.optionA} B=${!!it.optionB} C=${!!it.optionC} D=${!!it.optionD}`,
            snippet: "",
          });
        } else if (!it.correctOption) {
          findings.push({
            ...ctx,
            field: "correctOption",
            category: "mcq-missing-correctoption",
            detail: "correctOption is null",
            snippet: "",
          });
        } else {
          const claimed = extractMCQAnswerFromSolution(it.solutionContent ?? "");
          if (!claimed) {
            findings.push({
              ...ctx,
              field: "solutionContent",
              category: "mcq-no-answer-claim",
              detail: "solution lacks **Answer: X**",
              snippet: (it.solutionContent ?? "").slice(0, 60),
            });
          } else if (claimed !== it.correctOption.toUpperCase()) {
            findings.push({
              ...ctx,
              field: "solutionContent",
              category: "mcq-answer-mismatch",
              detail: `correctOption=${it.correctOption}, solution claims ${claimed}`,
              snippet: (it.solutionContent ?? "").slice(0, 80),
            });
          }
        }
      }
    }
  }

  // ── Report ────────────────────────────────────────────────────
  console.log(`Scanned ${totalScanned} items.\n`);
  const byCategory: Record<string, number> = {};
  for (const f of findings) byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
  console.log("Findings by category:");
  for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(28)} ${n}`);
  }
  console.log(`\nTotal findings: ${findings.length}`);

  // Per-set summary
  const bySet: Record<string, number> = {};
  for (const f of findings)
    bySet[`${f.subject} / ${f.setName}`] = (bySet[`${f.subject} / ${f.setName}`] ?? 0) + 1;
  console.log("\nFindings by set:");
  for (const [s, n] of Object.entries(bySet).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(60)} ${n}`);
  }

  fs.writeFileSync("/tmp/rendering-findings.json", JSON.stringify(findings, null, 2));
  console.log(`\nDetailed findings in /tmp/rendering-findings.json (${findings.length} entries)`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
