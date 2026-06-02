/**
 * Update the 6 remaining un-classified Methods questions.
 * After manual review, all 6 are TECH_FREE (clean exact-form algebra/calculus,
 * including a "show that" polynomial factorisation, a stationary point with
 * exact answer, an exact definite integral, and a pendulum question with
 * exact cos values).
 */
import { PrismaClient, Tech } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const result = await prisma.questionSetItem.updateMany({
    where: {
      tech: null,
      questionSet: { subject: { slug: "mathematical-methods" } },
    },
    data: { tech: Tech.TECH_FREE },
  });
  console.log(`Updated ${result.count} stragglers to TECH_FREE.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
