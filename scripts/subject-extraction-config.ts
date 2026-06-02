/**
 * Per-subject configuration for the extraction + seeding pipeline.
 *
 * Adding a new subject is a data change here, not a script change:
 *   1. Add an entry to SUBJECT_EXTRACTION_CONFIG keyed by URL slug
 *   2. Drop PDFs into `exams/vce/math/{folderName}/{questions,solutions}/`
 *   3. Run `npm run extract -- --subject {slug} --folder ...`
 *
 * The four pipeline scripts (extract-questions, seed-questions,
 * extract-solutions, seed-solutions) all read from this file.
 */

import path from "path";

export interface SubjectExtractionConfig {
  /** URL slug — matches KNOWN_SUBJECT_SLUGS in lib/subject-context.ts. */
  urlSlug: string;
  /** DB slug — what's stored in Subject.slug. May differ from urlSlug for
   * legacy reasons (Methods uses "mathematical-methods" in the DB, but
   * "vce-methods" in URLs to keep Stripe metadata stable). */
  dbSlug: string;
  /** Display name, used in extraction prompts. */
  displayName: string;
  /** Sub-folder under `exams/vce/math/` where PDFs live. */
  folderName: string;
  /** Filename prefix used to detect paper files. "mm" → 2024-mm1.pdf,
   * "sm" → 2024-sm1.pdf. The parser also accepts "exam" as a Methods
   * synonym for backwards compatibility with older filenames. */
  examPrefix: string;
  /** Block of text injected into the Claude prompt listing valid topics
   * and subtopics for THIS subject. Must match the VCAA Study Design. */
  topicTaxonomyPrompt: string;
  /** Topic display order: maps topic name → integer order. Topics not
   * listed here get order 99 (sorted last). */
  topicOrder: Record<string, number>;
}

// ─── VCE Mathematical Methods ───────────────────────────────────────────────

const METHODS_CONFIG: SubjectExtractionConfig = {
  urlSlug: "vce-methods",
  dbSlug: "mathematical-methods",
  displayName: "VCE Mathematical Methods",
  folderName: "mathematical_methods",
  examPrefix: "mm",
  topicTaxonomyPrompt: `
Valid topics and their subtopics:
- Algebra, Number, and Structure → Polynomial Equations, Exponential Equations, Logarithmic Equations, Trigonometric Equations, Simultaneous Equations, Exponent and Logarithm Laws
- Functions, Relations, and Graphs → Polynomial Functions, Exponential Functions, Logarithmic Functions, Trigonometric Functions, Rational Functions, Domain and Range, Transformations, Inverse Functions, Composite Functions
- Calculus → Differentiation, Chain Rule, Product Rule, Quotient Rule, Tangents and Normals, Rates of Change, Stationary Points and Curve Sketching, Optimisation, Antidifferentiation, Definite Integrals, Area Under Curves, Fundamental Theorem of Calculus
- Data Analysis, Probability, and Statistics → Probability Rules, Conditional Probability, Discrete Random Variables, Binomial Distribution, Continuous Random Variables, Normal Distribution, Confidence Intervals, Sample Proportions and Sampling
`,
  topicOrder: {
    "Algebra, Number, and Structure": 0,
    "Functions, Relations, and Graphs": 1,
    "Calculus": 2,
    "Data Analysis, Probability, and Statistics": 3,
  },
};

// ─── VCE Specialist Mathematics ──────────────────────────────────────────────
//
// Subtopic list drawn from the current VCAA Specialist Maths Study Design
// (Units 3 & 4). The 6 areas of study correspond 1:1 with the Topic rows
// seeded by scripts/seed-specialist-mathematics.ts.

const SPECIALIST_CONFIG: SubjectExtractionConfig = {
  urlSlug: "vce-specialist",
  dbSlug: "vce-specialist",
  displayName: "VCE Specialist Mathematics",
  folderName: "specialist_mathematics",
  examPrefix: "sm",
  topicTaxonomyPrompt: `
Valid topics and their subtopics:
- Algebra, Number, and Structure → Complex Numbers, Polar Form, De Moivre's Theorem, Complex Roots, Vector Arithmetic, Vector Geometry, Vector Equations of Lines and Planes, Linear Dependence and Independence
- Calculus → Differentiation of Inverse Circular Functions, Implicit Differentiation, Integration by Substitution, Integration by Parts, Integration of Partial Fractions, First-Order Differential Equations, Second-Order Differential Equations, Slope Fields, Kinematics (Calculus)
- Data Analysis, Probability, and Statistics → Statistical Inference, Sample Mean Distributions, Confidence Intervals for Population Mean, Hypothesis Testing (One-Sample t-Test), Hypothesis Testing (One-Sample z-Test), Type I and Type II Errors
- Discrete Mathematics → Mathematical Induction, Sequences and Series, Arithmetic and Geometric Sequences, Difference Equations, Recursion, Number Theory Basics
- Functions, Relations, and Graphs → Reciprocal Circular Functions, Inverse Circular Functions, Compound Angle Formulas, Double Angle Formulas, Function Inverses, Rational Functions, Asymptotic Behaviour, Loci
- Space and Measurement → Vector Kinematics, Forces and Equilibrium, Newton's Laws of Motion, Resultant Forces, Mass and Weight, 3D Geometry with Vectors, Cross Product (Vector Product), Projectile Motion
`,
  topicOrder: {
    "Algebra, Number, and Structure": 0,
    "Calculus": 1,
    "Data Analysis, Probability, and Statistics": 2,
    "Discrete Mathematics": 3,
    "Functions, Relations, and Graphs": 4,
    "Space and Measurement": 5,
  },
};

// ─── VCE Foundation Mathematics ─────────────────────────────────────────────
//
// Reuses the Methods topic taxonomy as a starting point (user-approved
// "structure first, refine later" trade-off). The Foundation Study Design
// actually centres on numeracy / financial maths / measurement, but mapping
// those onto the Methods taxonomy lets us reuse the existing extraction
// prompts and seed pipeline without diverging. Topic accuracy can be
// revisited later by editing this block + re-running extraction.

const FOUNDATION_CONFIG: SubjectExtractionConfig = {
  urlSlug: "vce-foundation",
  dbSlug: "vce-foundation",
  displayName: "VCE Foundation Mathematics",
  folderName: "foundation_mathematics",
  examPrefix: "fm",
  topicTaxonomyPrompt: METHODS_CONFIG.topicTaxonomyPrompt,
  topicOrder: { ...METHODS_CONFIG.topicOrder },
};

// ─── VCE General Mathematics ────────────────────────────────────────────────
//
// Same reuse-Methods-taxonomy trade-off as Foundation. General Maths in the
// VCAA Study Design covers Data Analysis, Recursion/Financial Modelling,
// Matrices, and Networks — not a clean overlap with Methods. Listed here so
// the pipeline accepts the subject and content can be seeded; topic mapping
// can be tightened later without breaking the JSON files already extracted.

const GENERAL_CONFIG: SubjectExtractionConfig = {
  urlSlug: "vce-general",
  dbSlug: "vce-general",
  displayName: "VCE General Mathematics",
  folderName: "general_mathematics",
  examPrefix: "gm",
  topicTaxonomyPrompt: METHODS_CONFIG.topicTaxonomyPrompt,
  topicOrder: { ...METHODS_CONFIG.topicOrder },
};

// ─── Registry ────────────────────────────────────────────────────────────────

export const SUBJECT_EXTRACTION_CONFIG: Record<string, SubjectExtractionConfig> = {
  "vce-methods": METHODS_CONFIG,
  "vce-specialist": SPECIALIST_CONFIG,
  "vce-foundation": FOUNDATION_CONFIG,
  "vce-general": GENERAL_CONFIG,
};

/**
 * Resolve a subject config by its URL slug. Throws if unknown so callers
 * fail fast instead of silently extracting into the wrong subject.
 */
export function getSubjectConfig(urlSlug: string): SubjectExtractionConfig {
  const config = SUBJECT_EXTRACTION_CONFIG[urlSlug];
  if (!config) {
    const known = Object.keys(SUBJECT_EXTRACTION_CONFIG).join(", ");
    throw new Error(
      `Unknown subject "${urlSlug}". Known subjects: ${known}.\n` +
        `Add the new subject to scripts/subject-extraction-config.ts first.`
    );
  }
  return config;
}

/**
 * Resolve the absolute filesystem path to a subject's `questions/` or
 * `solutions/` folder, relative to the project root (cwd when scripts run).
 */
export function getSubjectFolder(
  urlSlug: string,
  kind: "questions" | "solutions"
): string {
  const cfg = getSubjectConfig(urlSlug);
  return path.join(
    process.cwd(),
    "exams",
    "vce",
    "math",
    cfg.folderName,
    kind
  );
}

/**
 * Parse a paper PDF filename, supporting both per-subject prefixes
 * (`mm` for Methods, `sm` for Specialist) and the legacy `exam` synonym
 * (Methods only — older filenames). Returns null if the filename doesn't
 * match the expected pattern for the given subject.
 *
 * Accepted formats:
 *   - 2024-mm1.pdf, 2024-mm2.pdf
 *   - 2024-sm1.pdf, 2024-sm2.pdf
 *   - 2024-exam1.pdf, 2024-exam2.pdf  (Methods legacy)
 */
export function parsePaperFilename(
  filename: string,
  urlSlug: string
): { year: number; examType: "EXAM_1" | "EXAM_2" } | null {
  const cfg = getSubjectConfig(urlSlug);
  // Build an alternation of accepted prefixes for this subject.
  const prefixes = [cfg.examPrefix];
  if (cfg.urlSlug === "vce-methods") prefixes.push("exam"); // legacy support
  const prefixAlt = prefixes.join("|");
  const re = new RegExp(`^(\\d{4})[-_]?(?:${prefixAlt})[-_]?([12])\\.pdf$`, "i");
  const m = filename.match(re);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const num = parseInt(m[2], 10);
  if (isNaN(year) || isNaN(num)) return null;
  return { year, examType: num === 1 ? "EXAM_1" : "EXAM_2" };
}

/**
 * Parse a solution PDF filename. Mirrors `parsePaperFilename` but with
 * a `-sol` suffix.
 *
 * Accepted formats:
 *   - 2024-mm1-sol.pdf, 2024-sm1-sol.pdf
 */
export function parseSolutionFilename(
  filename: string,
  urlSlug: string
): { year: number; examType: "EXAM_1" | "EXAM_2" } | null {
  const cfg = getSubjectConfig(urlSlug);
  const prefixes = [cfg.examPrefix];
  if (cfg.urlSlug === "vce-methods") prefixes.push("exam");
  const prefixAlt = prefixes.join("|");
  const re = new RegExp(`^(\\d{4})[-_]?(?:${prefixAlt})[-_]?([12])[-_]sol\\.pdf$`, "i");
  const m = filename.match(re);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const num = parseInt(m[2], 10);
  if (isNaN(year) || isNaN(num)) return null;
  return { year, examType: num === 1 ? "EXAM_1" : "EXAM_2" };
}
