/**
 * Reorder VCE Maths subjects so they appear as:
 *   Foundation → General → Methods → Specialist
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

const ORDER: Array<[string, number]> = [
  ["vce-foundation", 0],
  ["vce-general", 1],
  ["mathematical-methods", 2],
  ["vce-specialist", 3],
];

async function main() {
  for (const [slug, order] of ORDER) {
    const r = await prisma.subject.updateMany({
      where: { slug },
      data: { order },
    });
    console.log(`[${r.count > 0 ? "OK" : "SKIP"}] ${slug} → order=${order}`);
  }
  const after = await prisma.subject.findMany({
    where: { slug: { in: ORDER.map(([s]) => s) } },
    select: { slug: true, name: true, order: true },
    orderBy: { order: "asc" },
  });
  console.log("\nResulting order:");
  for (const s of after) console.log(`  ${s.order}  ${s.name} (${s.slug})`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
