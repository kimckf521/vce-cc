/**
 * Inspect findings filtered to specific subject + set name.
 * Usage: tsx inspect-set-findings.ts <subject-slug> "<set name>"
 */
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const subject = process.argv[2];
  const setName = process.argv[3];
  if (!subject || !setName) {
    console.error('Usage: <subject-slug> "<set name>"');
    process.exit(1);
  }
  const findings = JSON.parse(fs.readFileSync("/tmp/rendering-findings.json", "utf-8"));
  const filtered = findings.filter(
    (f: { subject: string; setName: string; category: string }) =>
      f.subject === subject &&
      f.setName === setName &&
      ["thinking-out-loud", "latex-outside-math", "mcq-answer-mismatch", "latex-balance"].includes(f.category),
  );
  console.log(`Filtered to ${filtered.length} findings`);

  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const f of filtered) {
    if (seen.has(f.itemId)) continue;
    seen.add(f.itemId);
    const it = await prisma.questionSetItem.findUnique({
      where: { id: f.itemId },
      select: {
        id: true,
        type: true,
        marks: true,
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
    out.push({
      findings: filtered.filter((g: { itemId: string }) => g.itemId === f.itemId),
      item: it,
    });
  }
  fs.writeFileSync("/tmp/filtered-findings.json", JSON.stringify(out, null, 2));
  console.log(`${out.length} distinct items → /tmp/filtered-findings.json`);
  await prisma.$disconnect();
}

main();
