/**
 * Breakdown of tech classification by question type, for the Methods pool.
 * Useful for diagnosing why the picker can't form a paper of the expected shape.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const rows = await prisma.questionSetItem.groupBy({
    by: ["type", "tech"],
    where: {
      status: "APPROVED",
      questionSet: { subject: { slug: "mathematical-methods" } },
    },
    _count: { _all: true },
  });

  // Pivot rows[type][tech] = count
  const grid: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    grid[r.type] = grid[r.type] ?? {};
    grid[r.type][r.tech ?? "null"] = r._count._all;
  }

  console.log("APPROVED Methods questions by (type, tech):\n");
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
