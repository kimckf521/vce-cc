/**
 * Seed VCE Specialist Mathematics — Subject row + Topic rows + Subtopic rows.
 *
 * Mirrors the canonical VCAA Study Design taxonomy as established by the
 * one-shot migration in scripts/migrate-vce-subject-topics.ts. Keep this file
 * in sync with that migration whenever the canonical taxonomy changes.
 *
 * Specialist Mathematics has 6 Areas of Study under VCAA Units 3 & 4.
 *
 * Idempotent — safe to re-run. Existing topics/subtopics are left alone;
 * missing ones are added. Re-running won't delete anything.
 *
 * Usage:
 *   npm run seed-specialist
 */

import { prisma } from "../lib/prisma";

const VCE_SLUG = "vce";
const SPECIALIST_SLUG = "vce-specialist";
const SPECIALIST_NAME = "VCE Specialist Mathematics";

type TopicSpec = { name: string; slug: string; subtopics: string[] };

const SPECIALIST_TOPICS: TopicSpec[] = [
  {
    name: "Algebra, Number, and Structure",
    slug: "algebra-number-and-structure",
    subtopics: [
      "Complex Numbers (Cartesian Form)",
      "Complex Numbers (Polar Form)",
      "Conjugate Root Theorem",
      "De Moivre's Theorem",
      "Factorisation of Polynomials over ℂ",
      "Modulus and Argument",
      "Number Systems (Real, Rational, Irrational)",
      "Polynomial Equations over ℂ",
      "Roots of Unity",
    ],
  },
  {
    name: "Calculus",
    slug: "calculus",
    subtopics: [
      "Differential Equations (First-Order Separable)",
      "Differential Equations (Second-Order)",
      "Differentiation of Inverse Circular Functions",
      "Euler's Method",
      "Implicit Differentiation",
      "Integration by Partial Fractions",
      "Integration by Parts",
      "Integration by Substitution",
      "Kinematics with Variable Acceleration",
      "Logarithmic Differentiation",
      "Trigonometric Substitution",
      "Volumes of Revolution",
    ],
  },
  {
    name: "Data Analysis, Probability, and Statistics",
    slug: "data-analysis-probability-and-statistics",
    subtopics: [
      "Central Limit Theorem",
      "Confidence Intervals for Population Mean",
      "Distribution of Sample Means",
      "Hypothesis Testing (One-Tailed and Two-Tailed)",
      "Linear Combinations of Random Variables",
      "p-Values and Significance Levels",
      "Type I Errors",
      "z-Tests",
    ],
  },
  {
    name: "Discrete Mathematics",
    slug: "discrete-mathematics",
    subtopics: [
      "Counterexamples",
      "Direct Proof",
      "Logic and Propositions",
      "Mathematical Induction",
      "Number-Theoretic Proofs",
      "Proof by Contradiction",
      "Proof by Contrapositive",
      "Quantifiers",
      "Truth Tables",
    ],
  },
  {
    name: "Functions, Relations, and Graphs",
    slug: "functions-relations-and-graphs",
    subtopics: [
      "Implicit Relations (Ellipses, Hyperbolas)",
      "Inverse Circular Functions (arcsin, arccos, arctan)",
      "Locus Problems",
      "Rational Functions",
      "Reciprocal Circular Functions (sec, cosec, cot)",
    ],
  },
  {
    name: "Space and Measurement",
    slug: "space-and-measurement",
    subtopics: [
      "Cross Product (Vector Product)",
      "Dot Product (Scalar Product)",
      "Forces and Equilibrium",
      "Friction",
      "Inclined Planes",
      "Momentum and Impulse",
      "Newton's Laws of Motion",
      "Vector Calculus",
      "Vector Equations of Lines and Planes",
      "Vectors in 2D and 3D",
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
    where: { slug: SPECIALIST_SLUG },
    update: { curriculumId: vce.id },
    create: {
      slug: SPECIALIST_SLUG,
      name: SPECIALIST_NAME,
      order: 1,
      curriculumId: vce.id,
    },
  });
  console.log(`✅ subject "${subject.name}" (slug=${subject.slug}) ready`);

  let topicsCreated = 0;
  let topicsExisting = 0;
  let subtopicsCreated = 0;
  let subtopicsExisting = 0;

  for (let i = 0; i < SPECIALIST_TOPICS.length; i++) {
    const t = SPECIALIST_TOPICS[i];
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
    `\n✅ Specialist Mathematics ready. URL: /vce/specialist/topics`
  );

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
