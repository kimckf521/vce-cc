// Sweep every MCQ solution for answer-header problems.
//
// Motivated by the 2026-07-11 solution accuracy audit, which found two MCQ
// solutions whose "**Answer: X**" header contradicted the letter their own
// working concluded (cmn63nye9001j1edqh0hnnase: header E, working A;
// cmn63n4vx001jl0ojcdv9hpic: header D, working B).
//
// Flags, in decreasing severity:
//   CONTRADICTION      — header letter differs from the letter the working
//                        concludes with (high-precision heuristics only)
//   MULTIPLE_HEADERS   — more than one answer-header pattern with differing letters
//   NO_HEADER          — MCQ solution the app's parseMCQAnswer cannot parse
//                        (the interactive option list silently loses its
//                        correct-answer marking)
//
// Solutions whose working never names an option letter can't be checked by
// regex; they are counted as UNVERIFIABLE, not flagged (an LLM pass can cover
// them later).
//
// Usage: npx tsx --env-file=.env.local scripts/check-mcq-answer-headers.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

// Mirror of parseMCQContent in components/QuestionGroup.tsx — keep in sync.
// part=null alone does NOT mean MCQ: Specialist Exam 1 / pre-2023 General
// Exam 2 short-answer questions are also stored partless. The app only
// renders the interactive option list when the content parses as MCQ.
function isMCQContent(content: string): boolean {
  const matches = Array.from(content.matchAll(/\*\*([A-E])\.\*\*/g));
  return matches.length >= 2;
}

// Mirror of parseMCQAnswer in components/QuestionGroup.tsx — keep in sync.
function parseHeaderAnswer(content: string): string | null {
  const m =
    content.match(/\*\*Answer:\s*([A-E])\*\*/) ??
    content.match(/answer is \*\*([A-E])\*\*/i);
  return m ? m[1] : null;
}

// All answer-header occurrences (to catch contradictory duplicates).
function allHeaderAnswers(content: string): string[] {
  const out: string[] = [];
  for (const m of content.matchAll(/\*\*Answer:\s*([A-E])\*\*/g)) out.push(m[1]);
  for (const m of content.matchAll(/answer is \*\*([A-E])\*\*/gi)) out.push(m[1]);
  return out;
}

// The option letter the WORKING concludes with, if it states one explicitly.
// Deliberately conservative: only phrasings that unambiguously assert the
// conclusion count; bare mentions like "option B gives 8.32%" (an elimination
// step) do not.
function workingConclusionLetter(content: string): string | null {
  // Strip the header lines so we only look at the working itself.
  const working = content
    .replace(/\*\*Answer:\s*[A-E]\*\*/g, "")
    .replace(/answer is \*\*[A-E]\*\*/gi, "");

  const patterns = [
    /(?:which|this)\s+(?:is|corresponds to|matches|gives)\s+(?:option|answer)\s+\*{0,2}([A-E])\*{0,2}\b/gi,
    /(?:i\.?e\.?|so|hence|therefore|thus)[,:]?\s+(?:the answer is\s+)?(?:option|answer)\s+\*{0,2}([A-E])\*{0,2}\b/gi,
    /(?:option|answer)\s+\*{0,2}([A-E])\*{0,2}\s+is\s+(?:the\s+)?correct/gi,
    /→\s*(?:option\s+)?\*{0,2}([A-E])\*{0,2}\s*$/gim,
  ];

  let last: string | null = null;
  let lastIndex = -1;
  for (const re of patterns) {
    for (const m of working.matchAll(re)) {
      if ((m.index ?? -1) > lastIndex) {
        lastIndex = m.index ?? -1;
        last = m[1].toUpperCase();
      }
    }
  }
  return last;
}

// Normalize a LaTeX-ish expression for containment comparison.
function normalizeExpr(s: string): string {
  return s
    .replace(/\\left|\\right/g, "")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/\\[,;!]/g, "")
    .replace(/[\s${}]/g, "")
    .replace(/\*\*/g, "")
    .toLowerCase();
}

// Which option's text the working's tail ends on, by value matching.
// Returns a letter only when exactly one option wins (longest normalized
// match in the final chunk of working) — precision over recall.
function tailValueMatch(
  working: string,
  options: { letter: string; text: string }[]
): string | null {
  const tail = normalizeExpr(working.slice(-250));
  let best: { letter: string; len: number } | null = null;
  let tie = false;
  for (const o of options) {
    const norm = normalizeExpr(o.text);
    if (norm.length < 2 || !tail.includes(norm)) continue;
    if (!best || norm.length > best.len) {
      best = { letter: o.letter, len: norm.length };
      tie = false;
    } else if (norm.length === best.len && o.letter !== best.letter) {
      tie = true;
    }
  }
  return best && !tie ? best.letter : null;
}

// Mirror of parseMCQContent's option extraction — keep in sync.
function parseOptions(content: string): { letter: string; text: string }[] {
  const matches = Array.from(content.matchAll(/\*\*([A-E])\.\*\*/g));
  const options: { letter: string; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
    options.push({ letter: matches[i][1], text: content.slice(start, end).trim() });
  }
  return options;
}

async function main() {
  const partless = await prisma.question.findMany({
    where: { part: null, solution: { isNot: null } },
    select: {
      id: true,
      questionNumber: true,
      content: true,
      exam: { select: { year: true, examType: true } },
      subject: { select: { slug: true } },
      solution: { select: { content: true } },
    },
  });
  // Only questions the app will actually render as interactive MCQs.
  const mcqs = partless.filter((q) => isMCQContent(q.content));
  console.log(
    `partless questions: ${partless.length}; render as MCQ: ${mcqs.length}; short-answer (skipped): ${partless.length - mcqs.length}`
  );

  type Finding = {
    questionId: string;
    subject: string;
    exam: string;
    severity: "CONTRADICTION" | "MULTIPLE_HEADERS" | "NO_HEADER";
    detail: string;
  };
  const findings: Finding[] = [];
  let verifiable = 0;
  let unverifiable = 0;

  for (const q of mcqs) {
    const content = q.solution!.content;
    const label = `${q.subject?.slug ?? "?"} ${q.exam.year} ${q.exam.examType} Q${q.questionNumber}`;
    const header = parseHeaderAnswer(content);
    const headers = [...new Set(allHeaderAnswers(content))];
    const concluded = workingConclusionLetter(content);

    if (!header) {
      findings.push({
        questionId: q.id,
        subject: q.subject?.slug ?? "?",
        exam: label,
        severity: "NO_HEADER",
        detail: "parseMCQAnswer finds no answer letter — interactive MCQ loses its correct-answer marking",
      });
      continue;
    }
    if (headers.length > 1) {
      findings.push({
        questionId: q.id,
        subject: q.subject?.slug ?? "?",
        exam: label,
        severity: "MULTIPLE_HEADERS",
        detail: `conflicting answer headers: ${headers.join(", ")}`,
      });
      continue;
    }
    if (concluded) {
      verifiable++;
      if (concluded !== header) {
        findings.push({
          questionId: q.id,
          subject: q.subject?.slug ?? "?",
          exam: label,
          severity: "CONTRADICTION",
          detail: `header says ${header} but working concludes option ${concluded}`,
        });
      }
      continue;
    }

    // Value-matching fallback: does the working's final value single out an
    // option? Catches headers like "Answer: E" over working ending "p = -16"
    // when -16 is option A.
    const working = content
      .replace(/\*\*Answer:\s*[A-E]\*\*/g, "")
      .replace(/answer is \*\*[A-E]\*\*/gi, "");
    const valueLetter = tailValueMatch(working, parseOptions(q.content));
    if (valueLetter) {
      verifiable++;
      if (valueLetter !== header) {
        findings.push({
          questionId: q.id,
          subject: q.subject?.slug ?? "?",
          exam: label,
          severity: "CONTRADICTION",
          detail: `header says ${header} but the working's final value matches option ${valueLetter}`,
        });
      }
    } else {
      unverifiable++;
    }
  }

  const order = { CONTRADICTION: 0, MULTIPLE_HEADERS: 1, NO_HEADER: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  console.log(`MCQ solutions scanned: ${mcqs.length}`);
  console.log(`  working names its conclusion (regex-verifiable): ${verifiable}`);
  console.log(`  unverifiable by regex (working never names an option): ${unverifiable}`);
  console.log(`  findings: ${findings.length}\n`);
  for (const f of findings) {
    console.log(`[${f.severity}] ${f.exam} (${f.questionId})`);
    console.log(`    ${f.detail}`);
  }

  const outPath = `reports/mcq-header-check-${new Date().toISOString().slice(0, 10)}.json`;
  fs.writeFileSync(
    outPath,
    JSON.stringify({ scanned: mcqs.length, verifiable, unverifiable, findings }, null, 2)
  );
  console.log(`\nreport -> ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
