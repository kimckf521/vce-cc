/**
 * Distribution of marks for TECH_FREE SHORT_ANSWER items in the default
 * practice set, broken down by topic.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  if (!set) return;

  const items = await prisma.questionSetItem.findMany({
    where: {
      questionSetId: set.id,
      status: "APPROVED",
      tech: "TECH_FREE",
      type: "SHORT_ANSWER",
    },
    select: { marks: true, topic: { select: { name: true, slug: true } } },
  });

  console.log(`TECH_FREE SHORT_ANSWER in default set: ${items.length}\n`);

  const byTopic: Record<string, number[]> = {};
  for (const it of items) {
    byTopic[it.topic.name] = byTopic[it.topic.name] ?? [];
    byTopic[it.topic.name].push(it.marks);
  }
  for (const [topic, marks] of Object.entries(byTopic)) {
    const counts: Record<number, number> = {};
    for (const m of marks) counts[m] = (counts[m] ?? 0) + 1;
    console.log(`${topic.padEnd(40)} ${marks.length} items   marks=${JSON.stringify(counts)}`);
  }

  console.log(`\nTECH_FREE EXTENDED_ANSWER marks histogram:\n`);
  const ext = await prisma.questionSetItem.findMany({
    where: {
      questionSetId: set.id,
      status: "APPROVED",
      tech: "TECH_FREE",
      type: "EXTENDED_ANSWER",
    },
    select: { marks: true, topic: { select: { name: true } } },
  });
  const extByTopic: Record<string, number[]> = {};
  for (const it of ext) {
    extByTopic[it.topic.name] = extByTopic[it.topic.name] ?? [];
    extByTopic[it.topic.name].push(it.marks);
  }
  for (const [topic, marks] of Object.entries(extByTopic)) {
    const counts: Record<number, number> = {};
    for (const m of marks) counts[m] = (counts[m] ?? 0) + 1;
    console.log(`${topic.padEnd(40)} ${marks.length} items   marks=${JSON.stringify(counts)}`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
