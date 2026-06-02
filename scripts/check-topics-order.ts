/**
 * Show topics in the order they're returned by the practice page picker,
 * so we can see whether index alignment with shortCounts is broken.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      order: true,
      subject: { select: { slug: true } },
    },
  });
  console.log(`Total topics: ${topics.length}\n`);
  topics.forEach((t, i) => {
    console.log(
      `[${i}] order=${t.order} slug=${t.slug.padEnd(45)} subject=${t.subject?.slug ?? "null"}`,
    );
  });
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
