/**
 * One-time migration: upgrade every existing PAID enrolment on
 * `mathematical-methods` to the full VCE Maths plan (4 subjects).
 *
 * Why: pricing changed from "Methods only $9.99" to "VCE Maths $9.99
 * unlocks all 4 maths subjects." Existing paying users get the other 3
 * subjects added to their subscription at no cost.
 *
 * For each PAID Methods enrolment, creates (or upgrades) sibling enrolment
 * rows on Specialist / Foundation / General sharing the same Stripe
 * subscription metadata (id, price id, status, period end, cancel flag).
 *
 * Default: DRY RUN — prints what would happen but writes nothing.
 * Pass --execute to actually create the sibling rows.
 *
 * Idempotent — safe to re-run. Skips users whose siblings already exist
 * at the PAID tier with the matching stripeSubscriptionId.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/upgrade-paying-users-to-vce-maths.ts
 *   npx tsx --env-file=.env.local scripts/upgrade-paying-users-to-vce-maths.ts --execute
 */

import { prisma } from "../lib/prisma";

const METHODS_SLUG = "mathematical-methods";
const SIBLING_SLUGS = [
  "vce-specialist",
  "vce-foundation",
  "vce-general",
] as const;

const execute = process.argv.includes("--execute");
const mode = execute ? "EXECUTE" : "DRY RUN";

async function main() {
  console.log(`\n🦘 VCE Maths sibling-enrolment migration (${mode})\n`);

  // ── 1. Resolve sibling Subject rows up front ──────────────────
  const siblingSubjects = await prisma.subject.findMany({
    where: { slug: { in: [...SIBLING_SLUGS] } },
    select: { id: true, slug: true, name: true },
  });
  if (siblingSubjects.length !== SIBLING_SLUGS.length) {
    const found = siblingSubjects.map((s) => s.slug);
    const missing = SIBLING_SLUGS.filter((s) => !found.includes(s));
    console.error(
      `❌ Missing sibling Subject rows: ${missing.join(", ")}. ` +
        `Seed them first via npm run seed-specialist / seed-foundation / seed-general.`
    );
    process.exit(1);
  }
  console.log(
    `✅ Sibling subjects ready: ${siblingSubjects
      .map((s) => s.slug)
      .join(", ")}\n`
  );

  // ── 2. Find all PAID Methods enrolments ───────────────────────
  const methodsPaid = await prisma.subjectEnrolment.findMany({
    where: {
      tier: "PAID",
      subject: { slug: METHODS_SLUG },
    },
    include: {
      user: { select: { id: true, email: true } },
      subject: { select: { slug: true } },
    },
  });

  console.log(`Found ${methodsPaid.length} PAID Methods enrolment(s).\n`);

  if (methodsPaid.length === 0) {
    console.log("✅ Nothing to migrate.");
    await prisma.$disconnect();
    return;
  }

  let toCreate = 0;
  let toUpgrade = 0;
  let alreadyPaid = 0;
  let skipped = 0;

  for (const methodsEnrol of methodsPaid) {
    const userEmail = methodsEnrol.user.email;

    const data = {
      tier: "PAID" as const,
      stripeSubscriptionId: methodsEnrol.stripeSubscriptionId,
      stripePriceId: methodsEnrol.stripePriceId,
      subscriptionStatus: methodsEnrol.subscriptionStatus,
      currentPeriodEnd: methodsEnrol.currentPeriodEnd,
      cancelAtPeriodEnd: methodsEnrol.cancelAtPeriodEnd,
    };

    for (const sibling of siblingSubjects) {
      const existing = await prisma.subjectEnrolment.findUnique({
        where: {
          userId_subjectId: {
            userId: methodsEnrol.userId,
            subjectId: sibling.id,
          },
        },
      });

      if (!existing) {
        toCreate++;
        if (execute) {
          await prisma.subjectEnrolment.create({
            data: {
              userId: methodsEnrol.userId,
              subjectId: sibling.id,
              ...data,
            },
          });
        }
        console.log(`  ➕ ${userEmail} → ${sibling.slug} (PAID, new row)`);
      } else if (existing.tier === "FREE") {
        toUpgrade++;
        if (execute) {
          await prisma.subjectEnrolment.update({
            where: { id: existing.id },
            data,
          });
        }
        console.log(`  ⬆️  ${userEmail} → ${sibling.slug} (FREE → PAID)`);
      } else if (
        existing.tier === "PAID" &&
        existing.stripeSubscriptionId === methodsEnrol.stripeSubscriptionId
      ) {
        alreadyPaid++;
        // No log — idempotent re-runs would be too noisy
      } else {
        // PAID on a different subscription — keep as is, just warn
        skipped++;
        console.warn(
          `  ⚠️  ${userEmail} → ${sibling.slug}: already PAID on a different sub (${existing.stripeSubscriptionId}); skipping`
        );
      }
    }
  }

  console.log(`\n📊 Summary (${mode})`);
  console.log(`   Methods PAID users:       ${methodsPaid.length}`);
  console.log(`   New sibling rows:         ${toCreate}`);
  console.log(`   FREE → PAID upgrades:     ${toUpgrade}`);
  console.log(`   Already PAID on same sub: ${alreadyPaid}`);
  console.log(`   Skipped (other sub):      ${skipped}`);

  if (!execute) {
    console.log(`\nℹ️  This was a DRY RUN — nothing was written.`);
    console.log(`   Re-run with --execute to apply changes.`);
  } else {
    console.log(`\n✅ Migration complete.`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
