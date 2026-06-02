/**
 * Mark each non-Methods subject's "1st Generated Exam Set" as the practice
 * default for that subject. Methods keeps its existing default (Methods
 * Wave 1 Bank). `isDefault` is now scoped per subject, so multiple rows
 * can be true at once.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

const SUBJECTS_TO_DEFAULT = ["vce-foundation", "vce-general", "vce-specialist"];

async function main() {
  for (const slug of SUBJECTS_TO_DEFAULT) {
    const set = await prisma.questionSet.findFirst({
      where: {
        name: "1st Generated Exam Set",
        subject: { slug },
        items: { some: {} },
      },
      include: { _count: { select: { items: true } } },
    });
    if (!set) {
      console.log(`[SKIP] ${slug}: no non-empty exam set found`);
      continue;
    }
    // Clear any other defaults in this subject, then flag the target.
    await prisma.$transaction([
      prisma.questionSet.updateMany({
        where: {
          isDefault: true,
          subject: { slug },
          id: { not: set.id },
        },
        data: { isDefault: false },
      }),
      prisma.questionSet.update({
        where: { id: set.id },
        data: { isDefault: true },
      }),
    ]);
    console.log(`[OK] ${slug} → ${set.name} (${set._count.items} items)`);
  }

  // Methods: confirm its current default. Don't change it.
  const methodsDefault = await prisma.questionSet.findFirst({
    where: { isDefault: true, subject: { slug: "mathematical-methods" } },
    select: { id: true, name: true, _count: { select: { items: true } } },
  });
  console.log(
    `\nMethods default (unchanged): ${methodsDefault?.name ?? "NONE"} (${methodsDefault?._count.items ?? 0} items)`,
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
