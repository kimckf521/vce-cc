/**
 * Replace LaTeX math-comma notation `{,}` with a plain `,` across all
 * QuestionSetItem content and parts JSON.
 *
 * Why: items were generated with thousand-separator commas wrapped in
 * `{,}` (the LaTeX trick for tight inter-digit spacing inside math mode,
 * e.g. `$50{,}000$`). That's fine inside `$...$` math, but when the same
 * fragment sits in plain prose — or after a `\$` currency escape — the
 * `{,}` braces render literally, producing eyesores like
 * `Mei takes out a $20{,}000 loan`.
 *
 * KaTeX renders `$50,000$` correctly (it inserts a small space after the
 * comma — visually almost identical), so normalising everywhere is safe
 * and fixes the prose case without breaking the math case.
 *
 * Idempotent: items without `{,}` are skipped. Safe to re-run.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

function fixCommas(s: string): string {
  return s.replace(/\{,\}/g, ",");
}

function fixPartsJson(parts: unknown): { changed: boolean; value: unknown } {
  if (!Array.isArray(parts)) return { changed: false, value: parts };
  let changed = false;
  const next = parts.map((p) => {
    const part = p as { content?: string; solution?: string | null; subParts?: unknown };
    const newContent = part.content ? fixCommas(part.content) : part.content;
    const newSolution = part.solution ? fixCommas(part.solution) : part.solution;
    if (newContent !== part.content) changed = true;
    if (newSolution !== part.solution) changed = true;
    let subPartsOut = part.subParts;
    if (Array.isArray(part.subParts)) {
      const subs = part.subParts.map((sp) => {
        const subPart = sp as { content?: string; solution?: string | null };
        const sc = subPart.content ? fixCommas(subPart.content) : subPart.content;
        const ss = subPart.solution ? fixCommas(subPart.solution) : subPart.solution;
        if (sc !== subPart.content) changed = true;
        if (ss !== subPart.solution) changed = true;
        return { ...subPart, content: sc, solution: ss };
      });
      subPartsOut = subs;
    }
    return { ...part, content: newContent, solution: newSolution, subParts: subPartsOut };
  });
  return { changed, value: next };
}

async function main() {
  const dry = process.argv.includes("--dry");

  const items = await prisma.questionSetItem.findMany({
    where: {
      OR: [
        { content: { contains: "{,}" } },
        { solutionContent: { contains: "{,}" } },
        { preamble: { contains: "{,}" } },
      ],
    },
    select: {
      id: true,
      content: true,
      solutionContent: true,
      preamble: true,
      parts: true,
    },
  });

  // Also pick up items whose only `{,}` lives in the parts JSON column —
  // Postgres doesn't index Json contains by substring, so we scan all items
  // with non-null parts and check in memory.
  const partsItems = await prisma.questionSetItem.findMany({
    where: { parts: { not: { equals: null } } },
    select: { id: true, parts: true },
  });

  const targets = new Map<string, {
    content: string;
    solutionContent: string | null;
    preamble: string | null;
    parts: unknown;
  }>();

  for (const it of items) {
    targets.set(it.id, {
      content: it.content,
      solutionContent: it.solutionContent,
      preamble: it.preamble,
      parts: it.parts,
    });
  }
  for (const it of partsItems) {
    if (!JSON.stringify(it.parts).includes("{,}")) continue;
    if (!targets.has(it.id)) {
      const full = await prisma.questionSetItem.findUnique({
        where: { id: it.id },
        select: { content: true, solutionContent: true, preamble: true, parts: true },
      });
      if (full) {
        targets.set(it.id, full);
      }
    }
  }

  console.log(`Items with {,} in any field: ${targets.size}`);

  let updated = 0;
  let inspected = 0;
  for (const [id, data] of targets) {
    inspected++;
    const newContent = fixCommas(data.content);
    const newSolution = data.solutionContent ? fixCommas(data.solutionContent) : data.solutionContent;
    const newPreamble = data.preamble ? fixCommas(data.preamble) : data.preamble;
    const partsFix = fixPartsJson(data.parts);

    const contentChanged = newContent !== data.content;
    const solutionChanged = newSolution !== data.solutionContent;
    const preambleChanged = newPreamble !== data.preamble;
    const partsChanged = partsFix.changed;

    if (!contentChanged && !solutionChanged && !preambleChanged && !partsChanged) continue;

    if (dry) {
      if (updated < 3) {
        console.log(`\n--- ${id} ---`);
        if (contentChanged) {
          const m = data.content.match(/.{0,40}\{,\}.{0,40}/);
          if (m) console.log("content before:", m[0]);
          const m2 = newContent.match(/.{0,40},.{0,40}/);
          if (m2) console.log("content after :", m2[0]);
        }
      }
      updated++;
      continue;
    }

    await prisma.questionSetItem.update({
      where: { id },
      data: {
        content: newContent,
        solutionContent: newSolution,
        preamble: newPreamble,
        ...(partsChanged && { parts: partsFix.value as object }),
      },
    });
    updated++;
  }

  console.log(`\nInspected: ${inspected}, Updated: ${updated}`);
  if (dry) console.log("(--dry: no writes)");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
