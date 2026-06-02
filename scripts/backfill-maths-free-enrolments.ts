/**
 * One-time backfill: every existing user gets a FREE enrolment row for any
 * VCE maths subject they don't already have one for. Existing rows (FREE or
 * PAID) are left untouched.
 *
 * Why: B5 added the dashboard SubjectsGrid which reads enrolments. Users who
 * only have a Methods FREE row from earlier signups can't see the other 3
 * subjects in the grid — discovery hole. This fills the gap retroactively;
 * new signups handle it via sync-user post-F2.
 *
 * Default: DRY RUN. Pass --execute to actually write rows.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/backfill-maths-free-enrolments.ts
 *   npx tsx --env-file=.env.local scripts/backfill-maths-free-enrolments.ts --execute
 */

import { prisma } from "../lib/prisma";
import { PRICE_CATALOG } from "../lib/pricing-catalog";

const execute = process.argv.includes("--execute");
const mode = execute ? "EXECUTE" : "DRY RUN";

async function main() {
  console.log(`\n🦘 Maths FREE-enrolment backfill (${mode})\n`);

  const slugs = PRICE_CATALOG.vceMaths.subjectSlugs;
  const subjects = await prisma.subject.findMany({
    where: { slug: { in: [...slugs] } },
    select: { id: true, slug: true },
  });
  if (subjects.length !== slugs.length) {
    const found = subjects.map((s) => s.slug);
    const missing = slugs.filter((s) => !found.includes(s));
    console.error(`❌ Missing Subject rows: ${missing.join(", ")}`);
    process.exit(1);
  }
  const subjectIdBySlug = new Map(subjects.map((s) => [s.slug, s.id]));
  console.log(`✅ Subjects: ${subjects.map((s) => s.slug).join(", ")}\n`);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      enrolments: { select: { subjectId: true } },
    },
  });
  console.log(`Scanning ${users.length} users...\n`);

  let toCreate = 0;
  let skipped = 0;
  for (const u of users) {
    const existing = new Set(u.enrolments.map((e) => e.subjectId));
    const missing = subjects.filter((s) => !existing.has(s.id));
    if (missing.length === 0) {
      skipped++;
      continue;
    }
    for (const s of missing) {
      toCreate++;
      if (execute) {
        await prisma.subjectEnrolment.create({
          data: { userId: u.id, subjectId: s.id, tier: "FREE" },
        });
      }
      console.log(`  ➕ ${u.email} → ${s.slug} (FREE)`);
    }
  }

  console.log(`\n📊 Summary (${mode})`);
  console.log(`   Users scanned:               ${users.length}`);
  console.log(`   New FREE rows:               ${toCreate}`);
  console.log(`   Users already fully enrolled:${" ".repeat(2)}${skipped}`);

  if (!execute) {
    console.log(`\nℹ️  DRY RUN — nothing written. Re-run with --execute.`);
  } else {
    console.log(`\n✅ Backfill complete.`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
