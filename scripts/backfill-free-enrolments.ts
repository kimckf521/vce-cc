/**
 * Backfill FREE SubjectEnrolment rows for every existing user that doesn't
 * already have an enrolment for Mathematical Methods.
 *
 * Safe to run multiple times — it skips users who already have any enrolment
 * (FREE or PAID) for the subject, so existing PAID users are never touched.
 *
 * Usage:
 *   npx tsx scripts/backfill-free-enrolments.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUBJECT_SLUG = "mathematical-methods";

async function main() {
  console.log("🔄 Backfilling FREE enrolments...\n");

  // 1. Make sure the subject exists.
  const subject = await prisma.subject.upsert({
    where: { slug: SUBJECT_SLUG },
    update: {},
    create: {
      name: "Mathematical Methods",
      slug: SUBJECT_SLUG,
      order: 0,
    },
    select: { id: true, name: true },
  });
  console.log(`✅ Subject ready: ${subject.name} (${subject.id})\n`);

  // 2. Find all users that don't have an enrolment for this subject.
  const usersWithoutEnrolment = await prisma.user.findMany({
    where: {
      enrolments: {
        none: { subjectId: subject.id },
      },
    },
    select: { id: true, email: true },
  });

  console.log(`Found ${usersWithoutEnrolment.length} users without an enrolment.\n`);

  if (usersWithoutEnrolment.length === 0) {
    console.log("✅ Nothing to backfill.");
    return;
  }

  // 3. Create FREE enrolments in bulk.
  const result = await prisma.subjectEnrolment.createMany({
    data: usersWithoutEnrolment.map((u) => ({
      userId: u.id,
      subjectId: subject.id,
      tier: "FREE" as const,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Created ${result.count} FREE enrolments.`);
  for (const u of usersWithoutEnrolment) {
    console.log(`   • ${u.email}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
