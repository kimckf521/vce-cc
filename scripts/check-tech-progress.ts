/**
 * Quick progress check on tech classification.
 * Usage: npm run check-tech
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });
const SUBJECT_SLUG = "mathematical-methods";

async function main() {
  const where = { questionSet: { subject: { slug: SUBJECT_SLUG } } };
  const total = await prisma.questionSetItem.count({ where });
  const classified = await prisma.questionSetItem.count({
    where: { ...where, tech: { not: null } },
  });
  const breakdown = await prisma.questionSetItem.groupBy({
    by: ["tech"],
    where,
    _count: { _all: true },
  });

  console.log(`Total Methods questions: ${total}`);
  console.log(`Classified:              ${classified} (${((classified / total) * 100).toFixed(1)}%)`);
  console.log(`Remaining:               ${total - classified}`);
  console.log(`\nBreakdown:`);
  for (const row of breakdown) {
    const pct = ((row._count._all / total) * 100).toFixed(1);
    console.log(`  ${(row.tech ?? "null").toString().padEnd(13)} ${row._count._all.toString().padStart(5)}  (${pct}%)`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
