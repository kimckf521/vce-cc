/**
 * Difficulty distribution of EXTENDED_RESPONSE items in the default practice set.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  if (!set) return;

  const rows = await prisma.questionSetItem.groupBy({
    by: ["difficulty", "tech"],
    where: {
      questionSetId: set.id,
      status: "APPROVED",
      type: "EXTENDED_RESPONSE",
    },
    _count: { _all: true },
  });

  const grid: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    grid[r.difficulty] = grid[r.difficulty] ?? {};
    grid[r.difficulty][r.tech ?? "null"] = r._count._all;
  }

  console.log("EXTENDED_RESPONSE by (difficulty, tech):\n");
  const diffs = ["EASY", "MEDIUM", "HARD"];
  const techs = ["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED"];
  console.log(
    `${"diff".padEnd(10)} ${techs.map((t) => t.padStart(13)).join(" ")}  total`,
  );
  for (const d of diffs) {
    const row = grid[d] ?? {};
    const cells = techs.map((t) => (row[t] ?? 0).toString().padStart(13));
    const total = Object.values(row).reduce((a, b) => a + b, 0);
    console.log(`${d.padEnd(10)} ${cells.join(" ")} ${total.toString().padStart(6)}`);
  }

  // Also breakdown EXTENDED_RESPONSE by topic
  console.log("\nEXTENDED_RESPONSE by topic + difficulty:\n");
  const byTopicDiff = await prisma.questionSetItem.findMany({
    where: {
      questionSetId: set.id,
      status: "APPROVED",
      type: "EXTENDED_RESPONSE",
    },
    select: { difficulty: true, topic: { select: { name: true } }, subtopics: { select: { name: true } } },
  });
  const grid2: Record<string, Record<string, number>> = {};
  for (const it of byTopicDiff) {
    grid2[it.topic.name] = grid2[it.topic.name] ?? {};
    grid2[it.topic.name][it.difficulty] = (grid2[it.topic.name][it.difficulty] ?? 0) + 1;
  }
  for (const [topic, row] of Object.entries(grid2)) {
    const total = Object.values(row).reduce((a, b) => a + b, 0);
    console.log(`${topic.padEnd(45)} E=${row.EASY ?? 0} M=${row.MEDIUM ?? 0} H=${row.HARD ?? 0}  total=${total}`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
