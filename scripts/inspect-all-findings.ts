/**
 * Print the full content for every high-severity finding so we can plan fixes.
 */
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const findings = JSON.parse(fs.readFileSync("/tmp/rendering-findings.json", "utf-8"));
  const high = findings.filter((f: { category: string }) =>
    ["thinking-out-loud", "latex-outside-math", "mcq-answer-mismatch", "latex-balance"].includes(f.category),
  );
  const seen = new Set<string>();
  const out: unknown[] = [];

  for (const f of high) {
    const key = f.itemId;
    if (seen.has(key)) continue;
    seen.add(key);
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
    out.push({ finding: { category: f.category, field: f.field, detail: f.detail, setName: f.setName, subject: f.subject }, item: it });
  }

  fs.writeFileSync("/tmp/high-severity-full.json", JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.length} distinct items to /tmp/high-severity-full.json`);
  await prisma.$disconnect();
}

main();
