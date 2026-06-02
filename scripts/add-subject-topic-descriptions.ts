import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Backfills topic (area-of-study) descriptions for Specialist, General, and
 * Foundation Mathematics — bringing them in line with Mathematical Methods,
 * whose descriptions were set in `migrate-topics.ts`.
 *
 * Descriptions are written to each subject's ACTUAL scope (same topic name
 * means different content per subject), grounded in the subtopics seeded by
 * the seed-*-mathematics.ts scripts.
 *
 * Idempotent: keyed on subject.slug + topic.slug, so it is safe to re-run.
 */

type TopicDescription = { slug: string; description: string };

const DESCRIPTIONS: Record<string, TopicDescription[]> = {
  // ── VCE Specialist Mathematics ──────────────────────────────────────────
  "vce-specialist": [
    {
      slug: "algebra-number-and-structure",
      description:
        "Complex numbers in Cartesian and polar form, including modulus–argument representation, De Moivre's theorem, and the roots of unity. Covers factorising and solving polynomial equations over ℂ, the conjugate root theorem, and the structure of the real, rational, and irrational number systems.",
    },
    {
      slug: "calculus",
      description:
        "Advanced differentiation and integration: implicit and logarithmic differentiation, inverse circular functions, and techniques including substitution, parts, partial fractions, and trigonometric substitution. Covers first- and second-order differential equations, Euler's method, volumes of revolution, and kinematics with variable acceleration.",
    },
    {
      slug: "data-analysis-probability-and-statistics",
      description:
        "Statistical inference for the population mean: the distribution of sample means, the central limit theorem, and confidence intervals. Covers hypothesis testing with z-tests, one- and two-tailed tests, p-values and significance levels, Type I errors, and linear combinations of random variables.",
    },
    {
      slug: "discrete-mathematics",
      description:
        "Formal logic and mathematical proof. Covers propositions, quantifiers, and truth tables, alongside proof techniques including direct proof, proof by contradiction and contrapositive, counterexamples, and mathematical induction, with applications to number-theoretic results.",
    },
    {
      slug: "functions-relations-and-graphs",
      description:
        "Extending the function toolkit to rational functions, reciprocal circular functions (sec, cosec, cot), and inverse circular functions (arcsin, arccos, arctan). Covers sketching and analysing implicit relations such as ellipses and hyperbolas, and solving locus problems.",
    },
    {
      slug: "space-and-measurement",
      description:
        "Vectors in two and three dimensions, including the dot and cross products, vector equations of lines and planes, and vector calculus. Covers vector mechanics: Newton's laws of motion, forces and equilibrium, friction, inclined planes, and momentum and impulse.",
    },
  ],

  // ── VCE General Mathematics ─────────────────────────────────────────────
  "vce-general": [
    {
      slug: "algebra-number-and-structure",
      description:
        "Recursion and financial modelling: arithmetic and geometric sequences, recurrence relations, and the mathematics of simple and compound interest, depreciation, loans, annuities, and perpetuities. Covers matrices and their operations, inverses and determinants, and transition and Leslie matrices.",
    },
    {
      slug: "data-analysis-probability-and-statistics",
      description:
        "Investigating univariate and bivariate data using histograms, box plots, and the five-number summary. Covers correlation, least-squares regression, residual analysis and data transformations, and time series methods including moving-average smoothing and seasonal deseasonalisation.",
    },
    {
      slug: "discrete-mathematics",
      description:
        "Networks and decision mathematics. Covers graphs and networks, trees and minimum spanning trees, Eulerian and Hamiltonian paths, and shortest-path and flow problems, with project-planning tools including activity networks, critical path analysis, and matching and assignment.",
    },
    {
      slug: "functions-relations-and-graphs",
      description:
        "Linear functions and their applications, including linear modelling, piecewise-linear functions, and solving simultaneous equations and inequalities graphically. Covers direct, inverse, and joint variation.",
    },
    {
      slug: "space-and-measurement",
      description:
        "Measurement and applied geometry. Covers Pythagoras' theorem, right-angled trigonometry, and the sine and cosine rules, alongside the mensuration of area, surface area, and volume, and the use of similar triangles.",
    },
  ],

  // ── VCE Foundation Mathematics ──────────────────────────────────────────
  "vce-foundation": [
    {
      slug: "algebra-number-and-structure",
      description:
        "Number and algebra for everyday financial and practical contexts. Covers percentages, ratios and rates, estimation, and scientific notation, alongside personal finance — wages and salaries, taxation, simple and compound interest, credit and loans — using formulas and spreadsheet modelling.",
    },
    {
      slug: "data-analysis-probability-and-statistics",
      description:
        "Collecting, displaying, and interpreting everyday data. Covers categorical and numerical data, frequency and two-way tables, and graphs including bar, line, and pie charts, with summary measures of centre and spread and the probability of everyday events.",
    },
    {
      slug: "discrete-mathematics",
      description:
        "Practical applications of networks and counting. Covers graphs and networks for travel and route planning, project scheduling and sequencing problems, flowcharts, and basic counting and combinations.",
    },
    {
      slug: "space-and-measurement",
      description:
        "Measurement in practical and design contexts. Covers units of measurement, area, perimeter, surface area, and volume, with Pythagoras' theorem and right-angled trigonometry applied to maps, plans, scale drawings, bearings, navigation, and time zones.",
    },
  ],
};

async function main() {
  console.log("🔄 Backfilling topic descriptions for Specialist, General, and Foundation...\n");

  let updated = 0;
  let missing = 0;

  for (const [subjectSlug, topics] of Object.entries(DESCRIPTIONS)) {
    const subject = await prisma.subject.findUnique({
      where: { slug: subjectSlug },
      select: { id: true, name: true },
    });

    if (!subject) {
      console.warn(`⚠️  Subject "${subjectSlug}" not found — skipping.`);
      missing += topics.length;
      continue;
    }

    console.log(`📘 ${subject.name} (${subjectSlug})`);

    for (const t of topics) {
      try {
        const topic = await prisma.topic.update({
          where: { subjectId_slug: { subjectId: subject.id, slug: t.slug } },
          data: { description: t.description },
          select: { name: true },
        });
        console.log(`   ✅ ${topic.name}`);
        updated++;
      } catch {
        console.warn(`   ⚠️  Topic slug "${t.slug}" not found for ${subjectSlug} — skipping.`);
        missing++;
      }
    }
    console.log("");
  }

  console.log(`📊 Done: ${updated} topic descriptions written, ${missing} skipped.\n`);

  // ── Verify ──
  console.log("🔎 Verification (description present per topic):");
  for (const subjectSlug of Object.keys(DESCRIPTIONS)) {
    const subject = await prisma.subject.findUnique({
      where: { slug: subjectSlug },
      select: {
        name: true,
        topics: {
          orderBy: { order: "asc" },
          select: { name: true, description: true },
        },
      },
    });
    if (!subject) continue;
    console.log(`\n  ${subject.name}`);
    for (const topic of subject.topics) {
      const mark = topic.description ? "✓" : "✗ (empty)";
      const preview = topic.description ? `${topic.description.slice(0, 60)}…` : "";
      console.log(`    ${mark} ${topic.name} ${preview}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
