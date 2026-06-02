/**
 * Random spot-check of tech classifications.
 * Samples 5 from each tech category, prints content + assigned tech.
 */
import { PrismaClient, Tech } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function sampleByTech(tech: Tech, n: number) {
  const all = await prisma.questionSetItem.findMany({
    where: {
      tech,
      questionSet: { subject: { slug: "mathematical-methods" } },
    },
    select: {
      id: true,
      type: true,
      marks: true,
      content: true,
      solutionContent: true,
    },
  });
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, n);
  return shuffled;
}

async function main() {
  for (const tech of [Tech.TECH_FREE, Tech.CAS_REQUIRED, Tech.CAS_ALLOWED]) {
    const samples = await sampleByTech(tech, 5);
    console.log(`\n══ ${tech} (sample ${samples.length}) ══\n`);
    for (const q of samples) {
      const preview = q.content.replace(/\s+/g, " ").slice(0, 150);
      const sol = (q.solutionContent ?? "").replace(/\s+/g, " ").slice(0, 100);
      console.log(`[${q.type} ${q.marks}m] ${preview}…`);
      console.log(`  sol: ${sol}…\n`);
    }
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
