/**
 * Seed VCE Foundation Mathematics — Subject row + Topic rows + Subtopic rows.
 *
 * Mirrors the canonical VCAA Study Design taxonomy as established by the
 * one-shot migration in scripts/migrate-vce-subject-topics.ts. Keep this file
 * in sync with that migration whenever the canonical taxonomy changes.
 *
 * Idempotent — safe to re-run. Existing topics/subtopics are left alone;
 * missing ones are added. Re-running won't delete anything.
 *
 * Usage:
 *   npm run seed-foundation
 */

import { prisma } from "../lib/prisma";

const VCE_SLUG = "vce";
const FOUNDATION_SLUG = "vce-foundation";
const FOUNDATION_NAME = "VCE Foundation Mathematics";

type TopicSpec = { name: string; slug: string; subtopics: string[] };

const FOUNDATION_TOPICS: TopicSpec[] = [
  {
    name: "Algebra, Number, and Structure",
    slug: "algebra-number-and-structure",
    subtopics: [
      "Compound Interest",
      "Credit and Loans",
      "Currency Conversion",
      "Depreciation",
      "Estimation and Rounding",
      "Formulas and Substitution",
      "Linear Equations",
      "Percentages",
      "Ratios and Rates",
      "Scientific Notation",
      "Simple Interest",
      "Spreadsheet Modelling",
      "Taxation",
      "Unit Conversions",
      "Wages and Salaries",
    ],
  },
  {
    name: "Data Analysis, Probability, and Statistics",
    slug: "data-analysis-probability-and-statistics",
    subtopics: [
      "Bar Graphs and Column Charts",
      "Categorical and Numerical Data",
      "Data Collection Methods",
      "Frequency Tables",
      "Line Graphs",
      "Mean, Median, and Mode",
      "Pie Charts",
      "Probability of Everyday Events",
      "Range and Spread",
      "Statistical Investigations",
      "Two-Way Tables",
    ],
  },
  {
    name: "Discrete Mathematics",
    slug: "discrete-mathematics",
    subtopics: [
      "Counting and Combinations",
      "Flowcharts",
      "Networks and Graphs",
      "Project Scheduling",
      "Sequencing Problems",
      "Travel and Route Planning",
    ],
  },
  {
    name: "Space and Measurement",
    slug: "space-and-measurement",
    subtopics: [
      "Area and Perimeter",
      "Bearings and Navigation",
      "Maps and Plans",
      "Pythagoras' Theorem",
      "Right-Angled Trigonometry",
      "Scale Drawings",
      "Similarity and Congruence",
      "Surface Area",
      "Time and Time Zones",
      "Units of Measurement",
      "Volume and Capacity",
    ],
  },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const vce = await prisma.curriculum.findUnique({ where: { slug: VCE_SLUG } });
  if (!vce) {
    throw new Error(
      `Curriculum "${VCE_SLUG}" not found — run multi-subject-backfill first.`
    );
  }

  const subject = await prisma.subject.upsert({
    where: { slug: FOUNDATION_SLUG },
    update: { curriculumId: vce.id },
    create: {
      slug: FOUNDATION_SLUG,
      name: FOUNDATION_NAME,
      order: 2,
      curriculumId: vce.id,
    },
  });
  console.log(`✅ subject "${subject.name}" (slug=${subject.slug}) ready`);

  let topicsCreated = 0;
  let topicsExisting = 0;
  let subtopicsCreated = 0;
  let subtopicsExisting = 0;

  for (let i = 0; i < FOUNDATION_TOPICS.length; i++) {
    const t = FOUNDATION_TOPICS[i];
    const topic = await prisma.topic.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: t.slug } },
      update: { order: i },
      create: {
        name: t.name,
        slug: t.slug,
        order: i,
        subjectId: subject.id,
      },
      select: { id: true, createdAt: true },
    });
    const isNewTopic = Date.now() - topic.createdAt.getTime() < 5000;
    if (isNewTopic) topicsCreated++;
    else topicsExisting++;
    console.log(`   ${isNewTopic ? "➕" : "= "} ${t.name}`);

    for (let j = 0; j < t.subtopics.length; j++) {
      const subName = t.subtopics[j];
      const subSlug = toSlug(subName);
      const sub = await prisma.subtopic.upsert({
        where: { topicId_slug: { topicId: topic.id, slug: subSlug } },
        update: { order: j },
        create: { name: subName, slug: subSlug, order: j, topicId: topic.id },
        select: { createdAt: true },
      });
      const isNewSub = Date.now() - sub.createdAt.getTime() < 5000;
      if (isNewSub) subtopicsCreated++;
      else subtopicsExisting++;
    }
  }

  console.log(
    `\n📊 Topics: ${topicsCreated} created, ${topicsExisting} existed`
  );
  console.log(
    `   Subtopics: ${subtopicsCreated} created, ${subtopicsExisting} existed`
  );
  console.log(
    `\n✅ Foundation Mathematics ready. URL: /vce/foundation/topics`
  );

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
