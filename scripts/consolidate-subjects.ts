/**
 * One-shot migration:
 *   1. For every enrolment on the legacy "VCE Methods" subject, upgrade the
 *      user's corresponding "Mathematical Methods" enrolment tier to the
 *      higher of the two (PAID > FREE). Create the MM enrolment if missing.
 *   2. Delete the legacy "VCE Methods" subject (cascade removes its enrolments).
 *   3. Rename "Mathematical Methods" → "VCE Mathematical Methods" (display
 *      name only; slug stays `mathematical-methods` because it is referenced
 *      in Stripe checkout metadata, the webhook handler, and scripts).
 */

import { prisma } from "../lib/prisma";

async function main() {
  const legacy = await prisma.subject.findFirst({ where: { slug: "vce-methods" } });
  const main = await prisma.subject.findFirst({ where: { slug: "mathematical-methods" } });

  if (!main) throw new Error("Mathematical Methods subject not found");

  // ── 1. Merge enrolments ───────────────────────────────────────
  if (legacy) {
    const legacyEnrols = await prisma.subjectEnrolment.findMany({
      where: { subjectId: legacy.id },
      include: { user: { select: { email: true } } },
    });

    for (const le of legacyEnrols) {
      const existing = await prisma.subjectEnrolment.findUnique({
        where: { userId_subjectId: { userId: le.userId, subjectId: main.id } },
      });

      if (!existing) {
        // Create a matching MM enrolment with the legacy tier.
        await prisma.subjectEnrolment.create({
          data: {
            userId: le.userId,
            subjectId: main.id,
            tier: le.tier,
          },
        });
        console.log(`➕ created MM enrolment for ${le.user.email} tier=${le.tier}`);
      } else if (le.tier === "PAID" && existing.tier === "FREE") {
        await prisma.subjectEnrolment.update({
          where: { id: existing.id },
          data: { tier: "PAID" },
        });
        console.log(`⬆️  upgraded ${le.user.email} FREE → PAID on MM`);
      } else {
        console.log(`= ${le.user.email}: MM already tier=${existing.tier}, legacy tier=${le.tier} (no change)`);
      }
    }

    // ── 2. Delete the legacy subject (cascades enrolments) ────
    await prisma.subject.delete({ where: { id: legacy.id } });
    console.log(`🗑️  deleted legacy subject "VCE Methods"`);
  } else {
    console.log("ℹ️  legacy 'VCE Methods' subject not present — skipping merge");
  }

  // ── 3. Rename the display name ────────────────────────────────
  if (main.name !== "VCE Mathematical Methods") {
    await prisma.subject.update({
      where: { id: main.id },
      data: { name: "VCE Mathematical Methods" },
    });
    console.log(`✏️  renamed subject → "VCE Mathematical Methods" (slug unchanged: ${main.slug})`);
  } else {
    console.log("✅ subject already named 'VCE Mathematical Methods'");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
