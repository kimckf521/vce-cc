/**
 * Switch the Methods practice default from "Methods Wave 1 Bank" (1540
 * items, unclassified `tech` field, breaks Exam 1) to the "1st Generated
 * Exam Set" (300 items, classified, audited A−).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const target = await prisma.questionSet.findFirst({
    where: {
      name: "1st Generated Exam Set",
      subject: { slug: "mathematical-methods" },
      items: { some: {} },
    },
    include: { _count: { select: { items: true } } },
  });
  if (!target) {
    console.error("Methods Exam Set not found.");
    process.exit(1);
  }
  await prisma.$transaction([
    prisma.questionSet.updateMany({
      where: {
        isDefault: true,
        subject: { slug: "mathematical-methods" },
        id: { not: target.id },
      },
      data: { isDefault: false },
    }),
    prisma.questionSet.update({
      where: { id: target.id },
      data: { isDefault: true },
    }),
  ]);
  console.log(`✓ Methods default → ${target.name} (${target._count.items} items)`);

  const all = await prisma.questionSet.findMany({
    where: { isDefault: true },
    include: { subject: { select: { slug: true } }, _count: { select: { items: true } } },
    orderBy: { subject: { slug: "asc" } },
  });
  console.log("\nAll per-subject defaults:");
  for (const s of all) {
    console.log(`  ${s.subject?.slug?.padEnd(25)} ${s.name.padEnd(35)} ${s._count.items} items`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
