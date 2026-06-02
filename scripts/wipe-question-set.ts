/**
 * Delete all items from a QuestionSet. Used to wipe before re-seeding.
 * Usage: tsx wipe-question-set.ts <question-set-id>
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: wipe-question-set <question-set-id>");
    process.exit(1);
  }
  const set = await prisma.questionSet.findUnique({
    where: { id },
    include: { _count: { select: { items: true } } },
  });
  if (!set) {
    console.error(`Set ${id} not found.`);
    process.exit(1);
  }
  console.log(`Wiping ${set.name} (${id}) — currently ${set._count.items} items`);
  const r = await prisma.questionSetItem.deleteMany({
    where: { questionSetId: id },
  });
  console.log(`Deleted ${r.count} items.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
