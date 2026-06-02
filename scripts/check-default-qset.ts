/**
 * Show which QuestionSet the practice picker uses, and its tech×type breakdown.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const defaultSet = await prisma.questionSet.findFirst({
    where: { isDefault: true },
    select: { id: true, name: true, subjectId: true, subject: { select: { slug: true, name: true } } },
  });
  const fallback = await prisma.questionSet.findFirst({
    where: { name: "1st Generated Question Set" },
    select: { id: true, name: true },
  });
  console.log("isDefault QuestionSet:", defaultSet);
  console.log("Legacy fallback set:  ", fallback);

  const setId = defaultSet?.id ?? fallback?.id;
  if (!setId) {
    console.log("No set found");
    await prisma.$disconnect();
    return;
  }

  const rows = await prisma.questionSetItem.groupBy({
    by: ["type", "tech"],
    where: { questionSetId: setId, status: "APPROVED" },
    _count: { _all: true },
  });

  const grid: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    grid[r.type] = grid[r.type] ?? {};
    grid[r.type][r.tech ?? "null"] = r._count._all;
  }

  console.log(`\nBreakdown for set id=${setId}:\n`);
  const types = ["MCQ", "SHORT_ANSWER", "EXTENDED_ANSWER", "EXTENDED_RESPONSE"];
  const techs = ["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED", "null"];
  console.log(
    `${"type".padEnd(20)} ${techs.map((t) => t.padStart(13)).join(" ")}  total`,
  );
  for (const t of types) {
    const row = grid[t] ?? {};
    const cells = techs.map((tech) =>
      (row[tech] ?? 0).toString().padStart(13),
    );
    const total = Object.values(row).reduce((a, b) => a + b, 0);
    console.log(`${t.padEnd(20)} ${cells.join(" ")} ${total.toString().padStart(6)}`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
