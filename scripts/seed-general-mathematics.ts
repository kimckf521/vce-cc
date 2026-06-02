/**
 * Seed VCE General Mathematics — Subject row + Topic rows + Subtopic rows.
 *
 * Mirrors the canonical VCAA Study Design taxonomy as established by the
 * one-shot migration in scripts/migrate-vce-subject-topics.ts. Keep this file
 * in sync with that migration whenever the canonical taxonomy changes.
 *
 * Idempotent — safe to re-run. Existing topics/subtopics are left alone;
 * missing ones are added. Re-running won't delete anything.
 *
 * Usage:
 *   npm run seed-general
 */

import { prisma } from "../lib/prisma";

const VCE_SLUG = "vce";
const GENERAL_SLUG = "vce-general";
const GENERAL_NAME = "VCE General Mathematics";

type TopicSpec = { name: string; slug: string; subtopics: string[] };

const GENERAL_TOPICS: TopicSpec[] = [
  {
    name: "Algebra, Number, and Structure",
    slug: "algebra-number-and-structure",
    subtopics: [
      "Arithmetic Sequences",
      "Compound Interest",
      "Depreciation (Flat-Rate, Reducing-Balance, Unit-Cost)",
      "Geometric Sequences",
      "Leslie Matrices",
      "Linear Equations and Inequalities",
      "Loans and Annuities",
      "Matrices and Matrix Operations",
      "Matrix Inverses and Determinants",
      "Perpetuities",
      "Recurrence Relations",
      "Simple Interest",
      "Simultaneous Linear Equations",
      "Transition Matrices",
    ],
  },
  {
    name: "Data Analysis, Probability, and Statistics",
    slug: "data-analysis-probability-and-statistics",
    subtopics: [
      "Bivariate Data",
      "Box Plots",
      "Coefficient of Determination",
      "Correlation (Pearson's r)",
      "Data Transformations",
      "Five-Number Summary",
      "Histograms",
      "Least-Squares Regression",
      "Mean, Median, and Standard Deviation",
      "Moving Average Smoothing",
      "Outliers",
      "Residual Analysis",
      "Scatterplots",
      "Seasonal Indices and Deseasonalisation",
      "Stem Plots",
      "Time Series Analysis",
      "Univariate Data Distributions",
    ],
  },
  {
    name: "Discrete Mathematics",
    slug: "discrete-mathematics",
    subtopics: [
      "Activity Networks",
      "Adjacency Matrices",
      "Bipartite Graphs",
      "Critical Path Analysis",
      "Eulerian Trails and Circuits",
      "Flow Problems (Max Flow / Min Cut)",
      "Graphs and Networks",
      "Hamiltonian Paths and Cycles",
      "Matching and Assignment Problems",
      "Minimum Spanning Trees",
      "Planar Graphs",
      "Project Scheduling",
      "Shortest Path Problems",
      "Trees",
    ],
  },
  {
    name: "Functions, Relations, and Graphs",
    slug: "functions-relations-and-graphs",
    subtopics: [
      "Direct and Inverse Variation",
      "Joint Variation",
      "Linear Functions",
      "Linear Inequalities",
      "Linear Modelling",
      "Piecewise-Linear Functions",
      "Simultaneous Linear Equations (Graphical)",
    ],
  },
  {
    name: "Space and Measurement",
    slug: "space-and-measurement",
    subtopics: [
      "Area and Surface Area",
      "Mensuration",
      "Pythagoras' Theorem",
      "Right-Angled Trigonometry",
      "Similar Triangles",
      "Sine and Cosine Rules",
      "Volume",
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
    where: { slug: GENERAL_SLUG },
    update: { curriculumId: vce.id },
    create: {
      slug: GENERAL_SLUG,
      name: GENERAL_NAME,
      order: 3,
      curriculumId: vce.id,
    },
  });
  console.log(`✅ subject "${subject.name}" (slug=${subject.slug}) ready`);

  let topicsCreated = 0;
  let topicsExisting = 0;
  let subtopicsCreated = 0;
  let subtopicsExisting = 0;

  for (let i = 0; i < GENERAL_TOPICS.length; i++) {
    const t = GENERAL_TOPICS[i];
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
    `\n✅ General Mathematics ready. URL: /vce/general/topics`
  );

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
