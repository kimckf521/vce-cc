/**
 * One-shot migration: replace topic + subtopic taxonomies for VCE Foundation,
 * General and Specialist Mathematics with the correct VCAA Study Design data.
 *
 * Goals (per subject):
 *   - Foundation: 4 topics, 42 subtopics. Existing has Functions (35 Q) and
 *     Calculus (0 Q) — both need to be removed and replaced with Discrete +
 *     Space. The 35 Functions questions are RELOCATED to Algebra (default
 *     heuristic — admin can re-categorise individually later).
 *   - General: 5 topics, 59 subtopics. Existing has Calculus (0 Q) which gets
 *     deleted. Algebra/Functions/Data get their subtopics replaced. Discrete
 *     and Space are new.
 *   - Specialist: 6 topics, 53 subtopics. Topic names already match — just
 *     wipe and recreate subtopics across all 6.
 *
 * Idempotent: re-runs detect when a subject already matches target state
 * and skip the destructive ops.
 *
 * Default: DRY RUN. Pass --execute to actually write.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate-vce-subject-topics.ts
 *   npx tsx --env-file=.env.local scripts/migrate-vce-subject-topics.ts --execute
 */

import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Target topic + subtopic data (VCAA Study Design — user-provided)
// ─────────────────────────────────────────────────────────────────────────────

type TopicSpec = { name: string; subtopics: string[] };
type SubjectSpec = {
  slug: string;
  newTopics: TopicSpec[];
  /** Topics to delete by name. Questions are moved to `relocateTarget`. */
  topicsToDelete: string[];
  /** New topic name to receive relocated questions (only used when
   *  topicsToDelete contains topics with questions). */
  relocateTarget: string;
};

const FOUNDATION: SubjectSpec = {
  slug: "vce-foundation",
  topicsToDelete: ["Functions, Relations, and Graphs", "Calculus"],
  relocateTarget: "Algebra, Number, and Structure",
  newTopics: [
    {
      name: "Algebra, Number, and Structure",
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
  ],
};

const GENERAL: SubjectSpec = {
  slug: "vce-general",
  topicsToDelete: ["Calculus"],
  relocateTarget: "Algebra, Number, and Structure",
  newTopics: [
    {
      name: "Algebra, Number, and Structure",
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
  ],
};

const SPECIALIST: SubjectSpec = {
  slug: "vce-specialist",
  topicsToDelete: [],
  relocateTarget: "",
  newTopics: [
    {
      name: "Algebra, Number, and Structure",
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
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const execute = process.argv.includes("--execute");
const MODE = execute ? "EXECUTE" : "DRY RUN";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-subject migration
// ─────────────────────────────────────────────────────────────────────────────

async function migrateSubject(spec: SubjectSpec): Promise<void> {
  console.log(`\n━━ ${spec.slug} ━━`);

  const subject = await prisma.subject.findUnique({
    where: { slug: spec.slug },
    select: {
      id: true,
      topics: {
        select: {
          id: true,
          name: true,
          slug: true,
          subtopics: { select: { id: true, name: true } },
          _count: { select: { questions: true } },
        },
      },
    },
  });
  if (!subject) {
    console.error(`  ❌ subject ${spec.slug} not found, skipping`);
    return;
  }

  // ── Step 1: relocate questions from topics that will be deleted ─────────
  const relocateTargetTopic = subject.topics.find(
    (t) => t.name === spec.relocateTarget
  );
  for (const toDeleteName of spec.topicsToDelete) {
    const t = subject.topics.find((x) => x.name === toDeleteName);
    if (!t) {
      console.log(`  = "${toDeleteName}" — already absent, skipping`);
      continue;
    }
    const qCount = t._count.questions;
    if (qCount === 0) {
      console.log(`  ✓ "${toDeleteName}" — 0 questions, safe to delete`);
      continue;
    }
    if (!relocateTargetTopic) {
      console.error(
        `  ❌ "${toDeleteName}" has ${qCount} questions but relocate target "${spec.relocateTarget}" not found — aborting subject`
      );
      return;
    }
    console.log(
      `  ➜ "${toDeleteName}" → "${spec.relocateTarget}" (relocating ${qCount} question${qCount === 1 ? "" : "s"})`
    );
    if (execute) {
      await prisma.question.updateMany({
        where: { topicId: t.id },
        data: { topicId: relocateTargetTopic.id },
      });
    }
  }

  // ── Step 2: delete the obsolete topics (subtopics cascade) ──────────────
  for (const toDeleteName of spec.topicsToDelete) {
    const t = subject.topics.find((x) => x.name === toDeleteName);
    if (!t) continue;
    console.log(`  🗑  delete topic "${toDeleteName}" (and ${t.subtopics.length} subtopic${t.subtopics.length === 1 ? "" : "s"})`);
    if (execute) {
      await prisma.topic.delete({ where: { id: t.id } });
    }
  }

  // ── Step 3: upsert each new topic ───────────────────────────────────────
  for (let i = 0; i < spec.newTopics.length; i++) {
    const target = spec.newTopics[i];
    const slug = toSlug(target.name);
    const existing = subject.topics.find((x) => x.name === target.name);
    if (existing) {
      // Update order only — name and slug already match
      if (execute) {
        await prisma.topic.update({
          where: { id: existing.id },
          data: { order: i },
        });
      }
    } else {
      console.log(`  ➕ create topic "${target.name}"`);
      if (execute) {
        await prisma.topic.create({
          data: {
            name: target.name,
            slug,
            order: i,
            subjectId: subject.id,
          },
        });
      }
    }
  }

  // ── Step 4: re-read after creates so the next loop sees fresh ids ───────
  const refreshed = execute
    ? await prisma.subject.findUnique({
        where: { slug: spec.slug },
        select: {
          topics: {
            select: {
              id: true,
              name: true,
              subtopics: { select: { id: true, name: true } },
            },
          },
        },
      })
    : null;
  const topicsByName = new Map<string, { id: string; subtopics: { id: string; name: string }[] }>(
    (refreshed?.topics ?? subject.topics).map((t) => [t.name, { id: t.id, subtopics: t.subtopics }])
  );

  // ── Step 5: wipe + recreate subtopics where they differ from target ─────
  for (const target of spec.newTopics) {
    const topic = topicsByName.get(target.name);
    if (!topic) {
      console.log(`  (dry-run) would create "${target.name}" + ${target.subtopics.length} subtopics`);
      continue;
    }
    const currentNames = new Set(topic.subtopics.map((s) => s.name));
    const targetNames = new Set(target.subtopics);
    if (setsEqual(currentNames, targetNames)) {
      console.log(`  = "${target.name}" subtopics already at target (${target.subtopics.length})`);
      continue;
    }
    console.log(
      `  🔁 "${target.name}": wipe ${topic.subtopics.length} subtopic(s), seed ${target.subtopics.length}`
    );
    if (execute) {
      // Delete all current subtopics. M-N junction rows (questions/subtopics,
      // question-set-items/subtopics) get cleaned up by Prisma; Question rows
      // themselves stay (they're tagged to Topic via topicId).
      if (topic.subtopics.length > 0) {
        await prisma.subtopic.deleteMany({ where: { topicId: topic.id } });
      }
      await prisma.subtopic.createMany({
        data: target.subtopics.map((name, idx) => ({
          name,
          slug: toSlug(name),
          order: idx,
          topicId: topic.id,
        })),
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🦘 VCE topic taxonomy migration (${MODE})`);

  for (const spec of [FOUNDATION, GENERAL, SPECIALIST]) {
    await migrateSubject(spec);
  }

  // Verification
  console.log("\n📊 Final state");
  for (const slug of ["vce-foundation", "vce-general", "vce-specialist"]) {
    const s = await prisma.subject.findUnique({
      where: { slug },
      select: {
        name: true,
        topics: {
          orderBy: { order: "asc" },
          select: {
            name: true,
            _count: { select: { subtopics: true, questions: true } },
          },
        },
      },
    });
    if (!s) continue;
    const subtopicTotal = s.topics.reduce((sum, t) => sum + t._count.subtopics, 0);
    console.log(`  ${s.name}: ${s.topics.length} topics, ${subtopicTotal} subtopics`);
    for (const t of s.topics) {
      console.log(
        `     ${t.name.padEnd(45)} ${String(t._count.subtopics).padStart(3)} subt, ${String(t._count.questions).padStart(4)} Q`
      );
    }
  }

  if (!execute) {
    console.log("\nℹ️  DRY RUN — no writes. Re-run with --execute to apply.");
  } else {
    console.log("\n✅ Migration complete.");
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
