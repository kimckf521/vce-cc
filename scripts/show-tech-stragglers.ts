/**
 * Show the 6 remaining un-classified Methods questions so we can classify them by hand.
 * Usage: tsx --env-file=.env.local scripts/show-tech-stragglers.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const stragglers = await prisma.questionSetItem.findMany({
    where: {
      tech: null,
      questionSet: { subject: { slug: "mathematical-methods" } },
    },
    select: {
      id: true,
      type: true,
      marks: true,
      content: true,
      solutionContent: true,
      parts: true,
    },
  });

  console.log(`Found ${stragglers.length} stragglers:\n`);
  for (const q of stragglers) {
    console.log(`── ${q.id} (${q.type}, ${q.marks}m) ──`);
    console.log(`Content: ${q.content.slice(0, 200).replace(/\s+/g, " ")}`);
    if (q.parts) {
      const parts = q.parts as any[];
      console.log(`Parts: ${parts.length} parts`);
      for (const p of parts.slice(0, 2)) {
        console.log(`  ${p.label}: ${(p.content ?? "").slice(0, 100).replace(/\s+/g, " ")}`);
      }
    }
    if (q.solutionContent) {
      console.log(`Solution: ${q.solutionContent.slice(0, 200).replace(/\s+/g, " ")}`);
    }
    console.log();
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
