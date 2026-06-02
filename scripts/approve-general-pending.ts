/**
 * Bulk-approve all PENDING QuestionSetItems in the General "1st Generated
 * Question Set" placeholder. Run after seed-exam-set has finished with the
 * --pending flag.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/approve-general-pending.ts
 *   npx tsx --env-file=.env.local scripts/approve-general-pending.ts --dry
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";

async function main() {
  const dry = process.argv.includes("--dry");

  // Verify target QuestionSet
  const target = await prisma.questionSet.findUnique({
    where: { id: QUESTION_SET_ID },
    include: { subject: true, _count: { select: { items: true } } },
  });
  if (!target) {
    console.error(`QuestionSet ${QUESTION_SET_ID} not found.`);
    process.exit(1);
  }
  console.log(`Target: ${target.name} (subject=${target.subject?.slug})`);
  console.log(`Current total items: ${target._count.items}`);

  // Count by status
  const byStatus = await prisma.questionSetItem.groupBy({
    by: ["status"],
    where: { questionSetId: QUESTION_SET_ID },
    _count: true,
  });
  for (const row of byStatus) {
    console.log(`  ${row.status}: ${row._count}`);
  }

  const pendingCount = byStatus.find((r) => r.status === "PENDING")?._count ?? 0;
  if (pendingCount === 0) {
    console.log("No PENDING items to approve.");
    await prisma.$disconnect();
    return;
  }

  if (dry) {
    console.log(`(--dry) Would approve ${pendingCount} PENDING items. Not writing.`);
    await prisma.$disconnect();
    return;
  }

  // Bulk approve in a single transaction
  const result = await prisma.$transaction(async (tx) => {
    return tx.questionSetItem.updateMany({
      where: { questionSetId: QUESTION_SET_ID, status: "PENDING" },
      data: { status: "APPROVED" },
    });
  });

  console.log(`✓ Approved ${result.count} items.`);

  // Re-verify
  const finalCounts = await prisma.questionSetItem.groupBy({
    by: ["status"],
    where: { questionSetId: QUESTION_SET_ID },
    _count: true,
  });
  console.log("Final status counts:");
  for (const row of finalCounts) {
    console.log(`  ${row.status}: ${row._count}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
