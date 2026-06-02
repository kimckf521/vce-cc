/**
 * Specialist Mathematics question-bank tier matrix.
 *
 * Classifies each subtopic into a tier that controls which question
 * TYPES are appropriate for that subtopic in the generated set.
 *
 *   core-drill      MCQ + SHORT only — narrow technique drills
 *                    (truth tables, basic complex arithmetic). VCAA never
 *                    sets these as standalone Section B questions.
 *   extended-fit    MCQ + SHORT + EXT_ANS — multi-step technique that
 *                    fits an Exam 1 question (3–6 marks), but rarely the
 *                    full Section B scenario.
 *   modelling-rich  All four types — the workhorse subtopics that drive
 *                    Exam 2 Section B scenarios (DEs, kinematics, vector
 *                    geometry, sample means, complex geometric loci).
 *
 * Tier evidence drawn from VCAA Specialist Mathematics past papers
 * (2016–2024) shipped under scripts/output/*-vce-specialist.json.
 * Where a row has been moved between tiers, the past-paper evidence is
 * noted in the comment.
 */

export type Tier = "core-drill" | "extended-fit" | "modelling-rich";

export interface TierTargets {
  mcq: number;
  short: number;
  extAns: number;
  extResp: number;
}

const COUNTS: Record<Tier, TierTargets> = {
  "core-drill": { mcq: 20, short: 15, extAns: 0, extResp: 0 },
  "extended-fit": { mcq: 20, short: 15, extAns: 5, extResp: 0 },
  "modelling-rich": { mcq: 20, short: 15, extAns: 5, extResp: 5 },
};

export function targetsFor(tier: Tier): TierTargets {
  return COUNTS[tier];
}

export interface SubtopicTier {
  slug: string;
  tier: Tier;
  /** Brief justification from VCAA past-paper evidence */
  evidence: string;
}

export const SPECIALIST_TIER_MATRIX: SubtopicTier[] = [
  // ─── Algebra, Number, and Structure ─────────────────────────────────────
  { slug: "complex-numbers-cartesian-form", tier: "modelling-rich",
    evidence: "2020 E2 Q3 (multi-part scenario on solving z^4+... = 0), 2018 E1 Q3 — used as both MCQ technique and Section B opener" },
  { slug: "complex-numbers-polar-form", tier: "modelling-rich",
    evidence: "2023 E1 Q2 (arg(z) constraint), 2017 E2 Q3 — modulus/argument with rotation problems are Section B staples" },
  { slug: "conjugate-root-theorem", tier: "extended-fit",
    evidence: "2019 E1 Q4, 2022 E2 Q5 — short technique application, never a standalone scenario" },
  { slug: "de-moivres-theorem", tier: "modelling-rich",
    evidence: "2021 E2 Q4 (proving identities, finding nth roots), 2016 E1 Q3 — multi-step proofs" },
  { slug: "factorisation-of-polynomials-over", tier: "extended-fit",
    evidence: "2018 E1 Q4, 2024 E1 Q2 — 3–5 mark technique; rarely a standalone Section B question" },
  { slug: "modulus-and-argument", tier: "extended-fit",
    evidence: "2019 E1 Q2 — short conversion / evaluation; feeds into polar form scenarios" },
  { slug: "number-systems-real-rational-irrational", tier: "core-drill",
    evidence: "Almost never asked in isolation; mostly definitional MCQs" },
  { slug: "polynomial-equations-over", tier: "modelling-rich",
    evidence: "2020 E2 Q3, 2017 E1 Q5 — Section B scenarios combine factor theorem + conjugate pairs" },
  { slug: "roots-of-unity", tier: "extended-fit",
    evidence: "2022 E1 Q6 — short geometric / argand answers; rarely Section B scenarios" },

  // ─── Calculus ──────────────────────────────────────────────────────────
  { slug: "differential-equations-first-order-separable", tier: "modelling-rich",
    evidence: "2018 E2 Q5 (population/cooling), 2021 E2 Q6 — quintessential Section B modelling" },
  { slug: "differential-equations-second-order", tier: "modelling-rich",
    evidence: "2022 E2 Q4 — boundary-value problems with mechanical systems; full scenarios" },
  { slug: "differentiation-of-inverse-circular-functions", tier: "extended-fit",
    evidence: "2023 E1 Q4 (implicit + inverse circular), 2019 E1 Q6 — 3–5 mark technique" },
  { slug: "eulers-method", tier: "extended-fit",
    evidence: "2018 E2 Q2 — numerical approximation in CAS-allowed context; ext-ans depth" },
  { slug: "implicit-differentiation", tier: "extended-fit",
    evidence: "2023 E1 Q4 — short technique; combined with inverse circular for Section B" },
  { slug: "integration-by-partial-fractions", tier: "extended-fit",
    evidence: "2017 E2 Q4, 2020 E1 Q5 — chain of technique steps, often paired with DE scenarios" },
  { slug: "integration-by-parts", tier: "modelling-rich",
    evidence: "2023 E1 Q5 (∫x² ln x dx), 2019 E2 Q3 — both short technique and full Section B problems" },
  { slug: "integration-by-substitution", tier: "extended-fit",
    evidence: "2018 E1 Q5, 2022 E1 Q4 — technique drill plus area applications" },
  { slug: "kinematics-with-variable-acceleration", tier: "modelling-rich",
    evidence: "2023 E1 Q3, 2020 E2 Q4 — Section B scenarios on particle motion, projectile" },
  { slug: "logarithmic-differentiation", tier: "extended-fit",
    evidence: "2019 E2 Q4 — efficient differentiation of products of factors; ext-ans depth" },
  { slug: "trigonometric-substitution", tier: "extended-fit",
    evidence: "2017 E2 Q5 — definite integrals with √(a²–x²), often paired with area-of-circle problems" },
  { slug: "volumes-of-revolution", tier: "modelling-rich",
    evidence: "2022 E2 Q5, 2024 E1 Q7 — full Section B scenarios on solids of revolution" },

  // ─── Data, Probability, Statistics ─────────────────────────────────────
  { slug: "central-limit-theorem", tier: "extended-fit",
    evidence: "2019 E2 Q6, 2021 E2 Q7 — application question on normal approximation; ext-ans depth" },
  { slug: "confidence-intervals-for-population-mean", tier: "modelling-rich",
    evidence: "2020 E2 Q7, 2024 E2 Q6 — Section B scenarios on CI construction + interpretation" },
  { slug: "distribution-of-sample-means", tier: "modelling-rich",
    evidence: "2023 E1 Q6b — sample mean distribution + transformation; appears in extended Section B" },
  { slug: "hypothesis-testing-one-tailed-and-two-tailed", tier: "modelling-rich",
    evidence: "2022 E2 Q6, 2018 E2 Q7 — quintessential Section B scenarios" },
  { slug: "linear-combinations-of-random-variables", tier: "modelling-rich",
    evidence: "2023 E1 Q6a, 2021 E2 Q5 — Section B scenarios combining means + variances" },
  { slug: "p-values-and-significance-levels", tier: "extended-fit",
    evidence: "Featured inside hypothesis test Section B parts; rarely standalone" },
  { slug: "type-i-errors", tier: "extended-fit",
    evidence: "2024 E2 Q6c — short conceptual reasoning at end of test Section B" },
  { slug: "z-tests", tier: "modelling-rich",
    evidence: "2022 E2 Q6, 2019 E2 Q7 — full Section B z-test scenarios" },

  // ─── Discrete Mathematics ──────────────────────────────────────────────
  { slug: "counterexamples", tier: "core-drill",
    evidence: "MCQ + short technique; never Section B scope" },
  { slug: "direct-proof", tier: "extended-fit",
    evidence: "2024 E1 Q8 — structured proof in ext-ans depth" },
  { slug: "logic-and-propositions", tier: "core-drill",
    evidence: "Newly examined in Stage 2 study design; short / MCQ only" },
  { slug: "mathematical-induction", tier: "modelling-rich",
    evidence: "2023 E1 Q9, 2024 E1 Q9 — full Section B-style structured proof scenarios" },
  { slug: "number-theoretic-proofs", tier: "extended-fit",
    evidence: "Divisibility / parity proofs in 4–6 mark ext-ans depth" },
  { slug: "proof-by-contradiction", tier: "extended-fit",
    evidence: "2024 E1 Q8 — irrationality / counting proofs; ext-ans depth" },
  { slug: "proof-by-contrapositive", tier: "extended-fit",
    evidence: "Stage 2 syllabus item; ext-ans depth, paired with direct proof" },
  { slug: "quantifiers", tier: "core-drill",
    evidence: "Short conceptual MCQs only" },
  { slug: "truth-tables", tier: "core-drill",
    evidence: "Mechanical construction; MCQ + short only" },

  // ─── Functions, Relations, Graphs ──────────────────────────────────────
  { slug: "implicit-relations-ellipses-hyperbolas", tier: "modelling-rich",
    evidence: "2018 E2 Q6 — Section B scenarios on conic sections with parameters" },
  { slug: "inverse-circular-functions-arcsin-arccos-arctan", tier: "extended-fit",
    evidence: "2019 E1 Q6 — graph sketching + range; ext-ans depth" },
  { slug: "locus-problems", tier: "modelling-rich",
    evidence: "2020 E2 Q2 — locus in complex plane is Section B Argand scenario" },
  { slug: "rational-functions", tier: "modelling-rich",
    evidence: "2023 E1 Q1 (partial fractions + sketch), 2017 E2 Q1 — Section B scenarios" },
  { slug: "reciprocal-circular-functions-sec-cosec-cot", tier: "extended-fit",
    evidence: "2021 E1 Q4 — graph + identity manipulation; ext-ans depth" },

  // ─── Space and Measurement ─────────────────────────────────────────────
  { slug: "cross-product-vector-product", tier: "extended-fit",
    evidence: "Stage 2 study design — pair with plane equations; ext-ans depth" },
  { slug: "dot-product-scalar-product", tier: "extended-fit",
    evidence: "2019 E1 Q7, 2022 E2 Q3 — angle between vectors / projections" },
  { slug: "forces-and-equilibrium", tier: "modelling-rich",
    evidence: "2018 E2 Q4, 2020 E2 Q5 — Section B force-diagram scenarios" },
  { slug: "friction", tier: "modelling-rich",
    evidence: "2019 E2 Q5 — block-on-incline scenarios" },
  { slug: "inclined-planes", tier: "modelling-rich",
    evidence: "2019 E2 Q5, 2021 E2 Q3 — Section B inclined-plane scenarios" },
  { slug: "momentum-and-impulse", tier: "extended-fit",
    evidence: "2020 E1 Q6 — short impulse-momentum theorem applications" },
  { slug: "newtons-laws-of-motion", tier: "modelling-rich",
    evidence: "2018 E2 Q4, 2022 E2 Q3 — Section B mechanics scenarios" },
  { slug: "vector-calculus", tier: "modelling-rich",
    evidence: "2017 E2 Q6, 2024 E2 Q3 — Section B kinematics-in-vector-form scenarios" },
  { slug: "vector-equations-of-lines-and-planes", tier: "modelling-rich",
    evidence: "2024 E2 Q4 — Section B intersection of lines and planes in 3D" },
  { slug: "vectors-in-2d-and-3d", tier: "modelling-rich",
    evidence: "2023 E2 Q2, 2018 E2 Q3 — Section B vector geometry scenarios" },
];

export const TIER_BY_SLUG: Map<string, Tier> = new Map(
  SPECIALIST_TIER_MATRIX.map((row) => [row.slug, row.tier]),
);
