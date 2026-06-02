/**
 * Phase 1 — Multi-subject backfill
 *
 * Run AFTER `npx prisma db push` with the new schema (which adds nullable
 * `curriculumId` on Subject and `subjectId` on Topic/Exam/Question/QuestionSet).
 *
 * This script:
 *   1. Ensures the VCE Curriculum row exists.
 *   2. Sets curriculumId = VCE on every existing Subject.
 *   3. Backfills subjectId on every Topic/Exam/Question/QuestionSet to point
 *      at the "VCE Mathematical Methods" subject (slug: mathematical-methods).
 *   4. Prints verification counts.
 *
 * Idempotent — safe to re-run. Already-linked rows are skipped via
 * `where: { subjectId: null }` / `curriculumId: null` filters.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-and-backfill-multi-subject.ts
 */

import { prisma } from "../lib/prisma";

const VCE_NAME = "Victorian Certificate of Education";
const VCE_SLUG = "vce";
const VCE_SHORT = "VCE";

const METHODS_SLUG = "mathematical-methods";

async function main() {
  // ── 1. Ensure VCE Curriculum row ─────────────────────────────────
  let vce = await prisma.curriculum.findUnique({ where: { slug: VCE_SLUG } });
  if (!vce) {
    vce = await prisma.curriculum.create({
      data: { name: VCE_NAME, slug: VCE_SLUG, shortName: VCE_SHORT, order: 0 },
    });
    console.log(`✅ created Curriculum "${VCE_NAME}" (slug=${VCE_SLUG})`);
  } else {
    console.log(`= Curriculum "${VCE_NAME}" already exists`);
  }

  // ── 2. Link every Subject to VCE ─────────────────────────────────
  const subjLink = await prisma.subject.updateMany({
    where: { curriculumId: null },
    data: { curriculumId: vce.id },
  });
  console.log(`✅ linked ${subjLink.count} subject(s) → VCE`);

  // ── 3. Find the Mathematical Methods subject for content backfill ─
  const methods = await prisma.subject.findUnique({ where: { slug: METHODS_SLUG } });
  if (!methods) {
    console.warn(
      `⚠️  no subject with slug "${METHODS_SLUG}" — skipping content backfill. ` +
        `Create the subject first, then re-run this script.`
    );
    await prisma.$disconnect();
    return;
  }
  console.log(`→ backfilling content to subject "${methods.name}" (id=${methods.id})`);

  // ── 4. Backfill Topic.subjectId ──────────────────────────────────
  const topicLink = await prisma.topic.updateMany({
    where: { subjectId: null },
    data: { subjectId: methods.id },
  });
  console.log(`✅ backfilled ${topicLink.count} topic(s)`);

  // ── 5. Backfill Exam.subjectId ───────────────────────────────────
  const examLink = await prisma.exam.updateMany({
    where: { subjectId: null },
    data: { subjectId: methods.id },
  });
  console.log(`✅ backfilled ${examLink.count} exam(s)`);

  // ── 6. Backfill Question.subjectId (denormalized) ────────────────
  const qLink = await prisma.question.updateMany({
    where: { subjectId: null },
    data: { subjectId: methods.id },
  });
  console.log(`✅ backfilled ${qLink.count} question(s)`);

  // ── 7. Backfill QuestionSet.subjectId ────────────────────────────
  const qsLink = await prisma.questionSet.updateMany({
    where: { subjectId: null },
    data: { subjectId: methods.id },
  });
  console.log(`✅ backfilled ${qsLink.count} question set(s)`);

  // ── 8. Verification ──────────────────────────────────────────────
  const stats = {
    curricula: await prisma.curriculum.count(),
    subjects: await prisma.subject.count(),
    subjectsLinked: await prisma.subject.count({ where: { curriculumId: { not: null } } }),
    topics: await prisma.topic.count(),
    topicsLinked: await prisma.topic.count({ where: { subjectId: { not: null } } }),
    exams: await prisma.exam.count(),
    examsLinked: await prisma.exam.count({ where: { subjectId: { not: null } } }),
    questions: await prisma.question.count(),
    questionsLinked: await prisma.question.count({ where: { subjectId: { not: null } } }),
    questionSets: await prisma.questionSet.count(),
    questionSetsLinked: await prisma.questionSet.count({ where: { subjectId: { not: null } } }),
  };

  console.log("\n📊 Verification");
  console.log(`   Curricula:     ${stats.curricula}`);
  console.log(`   Subjects:      ${stats.subjectsLinked}/${stats.subjects} linked to a curriculum`);
  console.log(`   Topics:        ${stats.topicsLinked}/${stats.topics} linked to a subject`);
  console.log(`   Exams:         ${stats.examsLinked}/${stats.exams} linked to a subject`);
  console.log(`   Questions:     ${stats.questionsLinked}/${stats.questions} linked to a subject`);
  console.log(`   QuestionSets:  ${stats.questionSetsLinked}/${stats.questionSets} linked to a subject`);

  const allClean =
    stats.subjectsLinked === stats.subjects &&
    stats.topicsLinked === stats.topics &&
    stats.examsLinked === stats.exams &&
    stats.questionsLinked === stats.questions &&
    stats.questionSetsLinked === stats.questionSets;

  if (allClean) {
    console.log("\n✅ Phase 1 backfill complete — every row has its subject/curriculum link.");
    console.log("   You can now (optionally) make the FKs required: edit schema.prisma,");
    console.log("   replace `subjectId String?` with `subjectId String` (same for");
    console.log("   curriculumId on Subject), then run `npx prisma db push` again.");
  } else {
    console.warn("\n⚠️  Some rows are still unlinked. Check the counts above before proceeding.");
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
