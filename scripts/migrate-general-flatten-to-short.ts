/**
 * One-shot migration — for VCE General Mathematics only:
 * convert every EXTENDED_ANSWER / EXTENDED_RESPONSE QuestionSetItem in the
 * "1st Generated Question Set" placeholder into a single-card SHORT_ANSWER.
 *
 * Why: VCE General Exam 2 is short-answer in nature — each part of a
 * multi-part question is a discrete short response. The topic page only
 * renders the `content` column, so items with content="" + parts JSON
 * displayed as blank cards. Flattening preamble + parts into one content
 * string fixes the rendering and gives a clean Exam 1 = MCQ /
 * Exam 2 = SHORT_ANSWER taxonomy.
 *
 * Lossless re-run: idempotent — once an item has type=SHORT_ANSWER and
 * non-empty content, it is skipped. Methods/Specialist/Foundation banks
 * are untouched.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate-general-flatten-to-short.ts            # write
 *   npx tsx --env-file=.env.local scripts/migrate-general-flatten-to-short.ts --dry      # preview
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59"; // VCE General "1st Generated Question Set"

interface ItemPart {
  label: string;
  marks: number;
  content: string;
  solution: string | null;
  subParts?: { label: string; marks: number; content: string; solution: string | null }[];
}

function flattenParts(preamble: string | null, parts: ItemPart[]): { content: string; solution: string } {
  const contentLines: string[] = [];
  const solutionLines: string[] = [];

  if (preamble && preamble.trim()) contentLines.push(preamble.trim());

  for (const p of parts) {
    if (p.subParts && p.subParts.length > 0) {
      for (const sp of p.subParts) {
        contentLines.push(`**${p.label}-${sp.label}.** (${sp.marks} mark${sp.marks === 1 ? "" : "s"}) ${sp.content.trim()}`);
        if (sp.solution && sp.solution.trim()) {
          solutionLines.push(`**${p.label}-${sp.label}.** ${sp.solution.trim()}`);
        }
      }
    } else {
      contentLines.push(`**${p.label}.** (${p.marks} mark${p.marks === 1 ? "" : "s"}) ${p.content.trim()}`);
      if (p.solution && p.solution.trim()) {
        solutionLines.push(`**${p.label}.** ${p.solution.trim()}`);
      }
    }
  }

  return {
    content: contentLines.join("\n\n"),
    solution: solutionLines.join("\n\n"),
  };
}

async function main() {
  const dry = process.argv.includes("--dry");

  const candidates = await prisma.questionSetItem.findMany({
    where: {
      questionSetId: QUESTION_SET_ID,
      type: { in: ["EXTENDED_ANSWER", "EXTENDED_RESPONSE"] },
    },
    select: { id: true, type: true, preamble: true, parts: true, content: true, solutionContent: true },
  });

  console.log(`Found ${candidates.length} EXT_ANS/EXT_RESP items to migrate.`);

  let migrated = 0;
  let skipped = 0;
  for (const it of candidates) {
    if (it.content && it.content.length > 10) {
      skipped++;
      continue; // already migrated or already populated
    }
    if (!it.parts || !Array.isArray(it.parts)) {
      console.warn(`  ${it.id}: no parts array — skipping`);
      skipped++;
      continue;
    }
    const parts = it.parts as unknown as ItemPart[];
    const { content, solution } = flattenParts(it.preamble, parts);
    if (dry) {
      if (migrated < 3) {
        console.log(`\n--- Preview ${it.id} (${it.type}) ---`);
        console.log("content:", content.slice(0, 400));
        console.log("solution:", solution.slice(0, 200));
      }
    } else {
      await prisma.questionSetItem.update({
        where: { id: it.id },
        data: {
          type: "SHORT_ANSWER",
          content,
          solutionContent: solution,
          preamble: null,
          parts: undefined,
        },
      });
    }
    migrated++;
  }

  if (dry) {
    console.log(`\n(--dry) Would migrate ${migrated} items, skip ${skipped}.`);
  } else {
    console.log(`\nMigrated ${migrated} items, skipped ${skipped}.`);
    // Verify totals
    const after = await prisma.questionSetItem.groupBy({
      by: ["type"],
      where: { questionSetId: QUESTION_SET_ID, status: "APPROVED" },
      _count: true,
    });
    console.log("\nFinal type counts:");
    for (const r of after) console.log(`  ${r.type}: ${r._count}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
