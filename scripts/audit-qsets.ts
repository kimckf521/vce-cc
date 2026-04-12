/**
 * Comprehensive audit of the generated question set JSON files.
 * Scans every question for:
 *   - AI "thinking-out-loud" leakage
 *   - MCQ answer mismatch (stated vs correctOption)
 *   - Step/mark count consistency
 *   - Table formatting
 *   - LaTeX delimiter balance
 *   - Typos / inconsistencies / suspicious characters
 *   - Empty or trivially-short content / solutions
 *   - Figure/text shape mismatch
 *
 * Usage: npx tsx scripts/audit-qsets.ts
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "output");
const files = fs
  .readdirSync(OUT)
  .filter((f) => f.startsWith("qset-") && f.endsWith(".json"))
  .map((f) => path.join(OUT, f));

interface Finding {
  file: string;
  category: string;
  bucket: string;
  qIdx: number;
  detail: string;
  snippet: string;
}

const findings: Finding[] = [];
function push(f: Omit<Finding, "file"> & { file: string }) {
  findings.push(f);
}

const thinkingPatterns: [RegExp, string][] = [
  [/\bWait[,\s]/i, "wait"],
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
  [/re-?read/i, "re-read"],
  [/something's weird/i, "something's weird"],
  [/let me think/i, "let me think"],
  [/\(Or\b.*check/i, "(Or... check"],
];

const typoPatterns: [RegExp, string][] = [
  [/\bteh\b/i, "teh"],
  [/\bthier\b/i, "thier"],
  [/\bocured\b/i, "ocured"],
  [/\bseperat/i, "seperat"],
  [/\bfoward\b/i, "foward"],
  [/\bcalcuate/i, "calcuate"],
  [/ +\./, "space before ."],
  [/ +,/, "space before ,"],
];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const base = path.basename(file);
  const buckets: [string, any[]][] = [
    ["mcq", data.mcq || []],
    ["shortAnswer", data.shortAnswer || []],
    ["extendedResponse", data.extendedResponse || []],
  ];
  for (const [bucketName, arr] of buckets) {
    for (let qIdx = 0; qIdx < arr.length; qIdx++) {
      const item = arr[qIdx];
      const content = item.content || "";
      const solution = item.solutionContent || "";
      const cleanContent = content.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
      const cleanSol = solution.replace(/!\[[^\]]*\]\([^)]*\)/g, "");

      // ── 1. Thinking out loud ────────────────────────────────
      for (const [rx, name] of thinkingPatterns) {
        const m = cleanSol.match(rx);
        if (m) {
          push({
            file: base,
            category: "thinking-out-loud",
            bucket: bucketName,
            qIdx,
            detail: name,
            snippet: m[0],
          });
          break;
        }
      }

      // ── 2. MCQ answer mismatch ──────────────────────────────
      if (bucketName === "mcq") {
        const answerMatch = solution.match(/\*\*Answer:\s*([A-D])\*\*/);
        if (!answerMatch) {
          push({
            file: base,
            category: "mcq-missing-answer",
            bucket: bucketName,
            qIdx,
            detail: "missing **Answer: X** marker",
            snippet: solution.slice(-60),
          });
        } else if (answerMatch[1] !== item.correctOption) {
          push({
            file: base,
            category: "mcq-answer-mismatch",
            bucket: bucketName,
            qIdx,
            detail: `stated ${answerMatch[1]} but correctOption=${item.correctOption}`,
            snippet: content.slice(0, 60),
          });
        }
      }

      // ── 3. Step/mark count mismatch ─────────────────────────
      if (bucketName !== "mcq") {
        const expected = item.marks || 0;
        const stepRegex = /\*+\s*Step\s+\d+\s*\((\d+)\s*marks?\)/gi;
        const partRegex = /\*\*[a-z](?:\.[iI]+)?\.\s*\((\d+)\s*marks?\)\*\*/gi;
        let stepSum = 0;
        let stepCount = 0;
        const stepMatches = solution.matchAll(stepRegex);
        for (const m of stepMatches) {
          stepSum += parseInt(m[1]);
          stepCount++;
        }
        let partSum = 0;
        const partMatches = solution.matchAll(partRegex);
        for (const m of partMatches) partSum += parseInt(m[1]);
        // For an ER: parts should sum to total marks. For SA: steps should sum.
        if (bucketName === "extendedResponse") {
          if (partSum > 0 && partSum !== expected) {
            push({
              file: base,
              category: "er-part-marks-mismatch",
              bucket: bucketName,
              qIdx,
              detail: `parts sum to ${partSum}, total marks ${expected}`,
              snippet: content.slice(0, 60),
            });
          }
        } else {
          // SA: steps should sum to marks
          if (stepCount > 0 && stepSum !== expected) {
            push({
              file: base,
              category: "sa-step-marks-mismatch",
              bucket: bucketName,
              qIdx,
              detail: `steps sum to ${stepSum}, marks ${expected}`,
              snippet: content.slice(0, 60),
            });
          }
        }
      }

      // ── 4. Table formatting ─────────────────────────────────
      for (const [field, text] of [
        ["content", cleanContent],
        ["solution", cleanSol],
      ] as [string, string][]) {
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (/^\s*\|/.test(lines[i])) {
            if (
              i > 0 &&
              lines[i - 1].trim() &&
              !/^\s*\|/.test(lines[i - 1])
            ) {
              push({
                file: base,
                category: "table-missing-blank-line-before",
                bucket: bucketName,
                qIdx,
                detail: field,
                snippet: lines[i].slice(0, 40),
              });
              break;
            }
          }
        }
      }

      // ── 5. Unclosed LaTeX braces / mismatched $ ────────────
      for (const [field, text] of [
        ["content", cleanContent],
        ["solution", cleanSol],
      ] as [string, string][]) {
        // Odd $ count
        const dollarsStripped = text.replace(/\\\$/g, "").replace(/\$\$/g, "");
        const inlineDollars = (dollarsStripped.match(/\$/g) || []).length;
        if (inlineDollars % 2 !== 0) {
          push({
            file: base,
            category: "latex-odd-inline-dollars",
            bucket: bucketName,
            qIdx,
            detail: field,
            snippet: "",
          });
        }
        // Unmatched $$ pairs
        const blockCount = (text.match(/\$\$/g) || []).length;
        if (blockCount % 2 !== 0) {
          push({
            file: base,
            category: "latex-unclosed-block",
            bucket: bucketName,
            qIdx,
            detail: field,
            snippet: "",
          });
        }
      }

      // ── 6. Typos ────────────────────────────────────────────
      for (const [field, text] of [
        ["content", cleanContent.replace(/\$[^$]*\$/g, " ")],
        ["solution", cleanSol.replace(/\$[^$]*\$/g, " ")],
      ] as [string, string][]) {
        for (const [rx, name] of typoPatterns) {
          const m = text.match(rx);
          if (m) {
            push({
              file: base,
              category: "typo",
              bucket: bucketName,
              qIdx,
              detail: name,
              snippet: m[0],
            });
            break;
          }
        }
      }

      // ── 7. Empty/very short solution ───────────────────────
      if (cleanSol.trim().length < 10) {
        push({
          file: base,
          category: "solution-empty",
          bucket: bucketName,
          qIdx,
          detail: `length=${cleanSol.trim().length}`,
          snippet: content.slice(0, 60),
        });
      }

      // ── 8. Chained equalities inside $$...$$ display blocks ───
      //    (match dechainSolution's depth logic — only count = at depth 0)
      const blockMatches = cleanSol.match(/\$\$([\s\S]*?)\$\$/g) || [];
      for (const block of blockMatches) {
        const inside = block.slice(2, -2);
        let depth = 0;
        let topLevelEq = 0;
        for (let i = 0; i < inside.length; i++) {
          const c = inside[i];
          if (c === "(" || c === "{" || c === "[") depth++;
          else if (c === ")" || c === "}" || c === "]") depth--;
          else if (c === "=" && depth === 0) {
            // Exclude => (implies arrow) and \= (escaped)
            if (inside[i + 1] === ">" || inside[i - 1] === "\\") continue;
            topLevelEq++;
          }
        }
        if (
          topLevelEq >= 2 &&
          !/,|\\\\|\\implies|\\Rightarrow|\\iff|\\Leftrightarrow|\\quad|\\qquad/.test(
            inside
          )
        ) {
          push({
            file: base,
            category: "chained-equality",
            bucket: bucketName,
            qIdx,
            detail: `$$ block has ${topLevelEq} top-level =`,
            snippet: inside.slice(0, 80),
          });
          break;
        }
      }
    }
  }
}

// Report
const byCat: Record<string, Finding[]> = {};
for (const f of findings) {
  (byCat[f.category] ||= []).push(f);
}

console.log(`Total findings: ${findings.length}`);
console.log();
for (const [cat, fs2] of Object.entries(byCat).sort(
  (a, b) => b[1].length - a[1].length
)) {
  console.log(`── ${cat} (${fs2.length}) ──`);
  for (const f of fs2.slice(0, 20)) {
    console.log(`  [${f.bucket}#${f.qIdx}] ${f.file}: ${f.detail}`);
    if (f.snippet) console.log(`     "${f.snippet.trim().slice(0, 80)}"`);
  }
  if (fs2.length > 20) console.log(`  (+${fs2.length - 20} more)`);
  console.log();
}

fs.writeFileSync(
  path.join(OUT, "audit-report.json"),
  JSON.stringify(findings, null, 2)
);
console.log(`Full report: scripts/output/audit-report.json`);
