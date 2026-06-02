/**
 * Scaffold empty "Exam Set" and "Question Set" QuestionSet rows for the three
 * VCE maths subjects that currently have none.
 *
 * Order chosen per user request: Specialist → General → Foundation.
 * Idempotent: re-running skips any subject/name combination that already exists.
 *
 * Run:  npx tsx --env-file=.env.local scripts/scaffold-empty-question-sets.ts
 */

import { prisma } from "../lib/prisma";

const SUBJECT_SLUGS = [
  "vce-specialist",
  "vce-general",
  "vce-foundation",
] as const;

const SET_TEMPLATES: { name: string; description: string }[] = [
  {
    name: "Exam Set",
    description:
      "Native multi-part VCAA-aligned question set. MCQ (Exam 2A), short answer (Exam 1), extended answer + extended response (Exam 2B). Items added in later phases.",
  },
  {
    name: "Question Set",
    description:
      "AI-generated question pool for practice — MCQ, short, extended answer, extended response. Items added in later phases.",
  },
];

async function main() {
  const subjects = await prisma.subject.findMany({
    where: { slug: { in: [...SUBJECT_SLUGS] } },
    select: { id: true, name: true, slug: true },
  });

  // Re-order to match the user's preferred sequence (Specialist → General → Foundation).
  const orderedSubjects = SUBJECT_SLUGS
    .map((slug) => subjects.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  if (orderedSubjects.length !== SUBJECT_SLUGS.length) {
    const missing = SUBJECT_SLUGS.filter(
      (slug) => !subjects.some((s) => s.slug === slug),
    );
    throw new Error(`Missing subjects in DB: ${missing.join(", ")}`);
  }

  let created = 0;
  let skipped = 0;

  for (const subject of orderedSubjects) {
    console.log(`\n📚 ${subject.name}`);
    const existing = await prisma.questionSet.findMany({
      where: { subjectId: subject.id },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((s) => s.name));

    for (const tpl of SET_TEMPLATES) {
      if (existingNames.has(tpl.name)) {
        console.log(`   ⏭  "${tpl.name}" already exists — skipping`);
        skipped++;
        continue;
      }
      const set = await prisma.questionSet.create({
        data: {
          name: tpl.name,
          description: tpl.description,
          subjectId: subject.id,
          isDefault: false,
        },
        select: { id: true, name: true },
      });
      console.log(`   ✅ Created "${set.name}" (id=${set.id})`);
      created++;
    }
  }

  console.log(`\n🎯 Done. Created ${created}, skipped ${skipped}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
