/**
 * backfill-tech-classification.ts
 *
 * Classifies each APPROVED, non-archived QuestionSetItem as TECH_FREE,
 * CAS_ALLOWED, or CAS_REQUIRED. Uses a Claude Code subagent workflow
 * (no ANTHROPIC_API_KEY needed):
 *
 *   1. `npm run backfill-tech -- --export [--subject=<slug>]`
 *        Writes unclassified questions to
 *        scripts/output/tech-chunks/<subjectSlug>/chunk-NNN.json
 *        (CHUNK_SIZE questions per file) + a subject-specific RULES.md.
 *        With no --subject, exports ALL target subjects (foundation, methods,
 *        specialist). General is already fully classified.
 *
 *   2. Spawn general-purpose subagents (5–8 in parallel) — each subagent
 *      reads one chunk file + the RULES.md in the SAME folder, classifies
 *      every question, and writes chunk-NNN-results.json beside the chunk.
 *
 *   3. `npm run backfill-tech -- --import`
 *        Recursively reads every chunk-NNN-results.json under tech-chunks/
 *        and updates QuestionSetItem.tech.
 *
 * Re-running --export only picks up questions where tech IS NULL, so it's
 * safe to re-run after a partial import.
 */
import fs from "fs";
import path from "path";
import { PrismaClient, Tech, QuestionSetItemType } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

// Subjects that still need classifying. General (vce-general) is already done.
const TARGET_SUBJECTS = [
  "vce-foundation",
  "mathematical-methods",
  "vce-specialist",
] as const;

const CHUNK_SIZE = 60;
const CHUNK_ROOT = path.join(__dirname, "output", "tech-chunks");

const SUBJECT_ARG = process.argv
  .find((a) => a.startsWith("--subject="))
  ?.split("=")[1];

const MODE = process.argv.includes("--export")
  ? "export"
  : process.argv.includes("--import")
  ? "import"
  : process.argv.includes("--status")
  ? "status"
  : null;

const OUTPUT_FORMAT = `## Output format
For each question in the input chunk, output exactly one object:
\`\`\`json
{ "id": "<question id>", "tech": "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED", "reason": "<one short clause>" }
\`\`\`
Write ALL results as a single JSON array to a file named the same as the input
chunk but ending \`-results.json\` (e.g. chunk-001.json → chunk-001-results.json),
in the SAME folder. Classify every question; never drop one.`;

const METHODS_RULES = `# Tech Classification Rules — VCE Mathematical Methods

You classify each question by which exam paper it belongs in.

VCE Methods has two papers:
- **Exam 1** (TECH-FREE, 60 min, 40 marks) — no calculator. Students do exact arithmetic by hand.
- **Exam 2** (CAS, 120 min, 80 marks) — CAS (computer algebra system) calculator allowed.

Classify each question into exactly ONE of:

## TECH_FREE
Solvable cleanly by hand. Required signals (any one is enough):
- Asks for exact form, exact value, factorise, expand, show that, prove
- Simple integers / rational coefficients, π, e, surds
- Standard derivatives/integrals/limits on polynomials, exp, log, trig
- Algebra manipulation, simultaneous equations with clean roots
- Truth-table style logic, transformations, simple sketches

## CAS_REQUIRED
Needs CAS to solve in exam time. Signals:
- Decimal answer in the solution, "to N decimal places", "to N significant figures"
- "Approximate", "closest to", numerical solving (e.g. Newton's method)
- Statistics: binomial / normal / hypergeometric probabilities, confidence intervals, sample-proportion problems, P(X > k) numerical values
- Definite integrals with non-elementary bounds requiring numerical methods
- Reading values off a non-trivial graph the student must generate
- Long arithmetic that's impractical by hand (large numbers, awkward fractions)

## CAS_ALLOWED
Could go either way. Doable by hand but tedious; CAS helps but isn't required. **Use this sparingly** — prefer TECH_FREE or CAS_REQUIRED when possible.

## Key rules
- If the SOLUTION contains a decimal answer or "≈" with a non-trivial decimal, it's CAS_REQUIRED.
- If the question is about statistics (Binomial, Normal, sampling, confidence intervals), it's almost always CAS_REQUIRED.
- If the question says "show that" or "prove" or asks for exact form, it's TECH_FREE.
- If any sub-part needs CAS, the WHOLE question is CAS_REQUIRED (because Exam 1 doesn't allow CAS).

${OUTPUT_FORMAT}`;

const SPECIALIST_RULES = `# Tech Classification Rules — VCE Specialist Mathematics

You classify each question by whether a CAS calculator is needed.

VCE Specialist has two papers:
- **Exam 1** (TECH-FREE, 60 min) — no calculator. Exact work by hand.
- **Exam 2** (CAS, 120 min) — CAS calculator allowed.

Classify each question into exactly ONE of:

## TECH_FREE
Solvable cleanly by hand in exact form. Signals:
- "Show that", "prove", "hence show", exact value / exact form
- Complex numbers in exact Cartesian or polar form; exact modulus / argument; De Moivre
- Exact differentiation / antidifferentiation / integration (by parts, substitution, partial fractions) with clean results
- Vectors: exact dot/cross products, projections, proofs, vector equations of lines/planes
- Proof by mathematical induction; contradiction
- Exact solutions of separable / linear differential equations done by hand
- Mechanics with exact / symbolic answers (no decimals)
- Trig with exact values (π, surds), reciprocal & inverse circular functions, identities

## CAS_REQUIRED
Needs CAS in exam time. Signals:
- Decimal answer in the solution / "to N decimal places" / "to N significant figures" / "approximate" / "≈"
- Numerical integration (arc length, volumes of revolution, areas needing numeric evaluation)
- Statistics: confidence intervals for a mean, hypothesis tests, distribution of sample means, P(X > k) numeric values
- Euler's method / numerical solution of a differential equation; slope fields read numerically
- Mechanics with decimal forces / velocities / accelerations
- Equations with no clean closed-form root (numerical solve)

## CAS_ALLOWED
Could go either way; doable by hand but tedious. **Use sparingly** — prefer TECH_FREE or CAS_REQUIRED.

## Key rules
- If the SOLUTION contains a non-trivial decimal answer or "≈", it's CAS_REQUIRED.
- Statistical inference (confidence intervals, hypothesis testing) → CAS_REQUIRED.
- "Show that" / "prove" / exact form → TECH_FREE.
- If any sub-part needs CAS, the WHOLE question is CAS_REQUIRED.

${OUTPUT_FORMAT}`;

const FOUNDATION_RULES = `# Tech Classification Rules — VCE Foundation Mathematics

IMPORTANT: VCE Foundation Mathematics is APPLIED, everyday maths and BOTH exams
allow a calculator — there is NO "tech-free exam". So you are NOT deciding which
exam a question belongs to. You are deciding ONE practical thing:

  "Would a student actually NEED a calculator to answer this, or can they do it
   comfortably by hand or in their head?"

Classify each question into exactly ONE of:

## TECH_FREE  (does NOT need a calculator)
A student can answer by hand or mentally. Signals:
- Reading a value straight off a given table, chart, graph, timetable, map, or label
- Simple whole-number arithmetic; simple money amounts ($5 + $3); counting; ordering
- Recognising / naming a shape, unit, or pattern; reading a scale
- Simple fractions / percentages of round numbers (50% of 80, 1/4 of 100)
- Substituting small whole numbers into a simple formula
- Telling the time; reading a calendar; simple whole-unit conversion (1 m = 100 cm)
- True/false, matching, or interpreting (not computing) a statistic

## CAS_REQUIRED  (DOES need a calculator)
Realistically needs a calculator. Signals:
- Decimal answer / "to the nearest cent" / "to N decimal places" / money with cents
- Financial maths: percentage increase/decrease of awkward numbers, GST, discounts,
  simple/compound interest, loan repayments, wages and tax, unit pricing
- Statistics: computing mean / median / standard deviation / range from a data set; rates
- Multi-step measurement: area / volume / perimeter with decimals; Pythagoras; scale drawings
- Trigonometry; ratios with awkward numbers; large multiplications or divisions

## CAS_ALLOWED
Genuinely borderline only. **Use SPARINGLY** — prefer TECH_FREE or CAS_REQUIRED.

## Key rules
- If the SOLUTION shows a decimal / currency-with-cents answer or a real computation, it's CAS_REQUIRED.
- Any interest / loan / GST / wage / percentage-of-awkward-number question → CAS_REQUIRED.
- Pure "read it off the given table/graph" or simple whole-number work → TECH_FREE.
- If any sub-part needs a calculator, classify the WHOLE question CAS_REQUIRED.

${OUTPUT_FORMAT}`;

const RULES_BY_SUBJECT: Record<string, string> = {
  "mathematical-methods": METHODS_RULES,
  "vce-specialist": SPECIALIST_RULES,
  "vce-foundation": FOUNDATION_RULES,
};

interface ExportedQuestion {
  id: string;
  type: QuestionSetItemType;
  marks: number;
  content: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  solutionContent: string | null;
  parts: unknown;
}

interface ClassificationResult {
  id: string;
  tech: Tech;
  reason: string;
}

async function exportSubject(slug: string) {
  const rules = RULES_BY_SUBJECT[slug];
  if (!rules) {
    console.error(`[SKIP] no rules defined for subject "${slug}"`);
    return;
  }

  const questions: ExportedQuestion[] = await prisma.questionSetItem.findMany({
    where: {
      tech: null,
      status: "APPROVED",
      questionSet: { archived: false, subject: { slug } },
    },
    select: {
      id: true,
      type: true,
      marks: true,
      content: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correctOption: true,
      solutionContent: true,
      parts: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const subjectDir = path.join(CHUNK_ROOT, slug);
  fs.mkdirSync(subjectDir, { recursive: true });
  fs.writeFileSync(path.join(subjectDir, "RULES.md"), rules);

  // Clear stale chunk inputs (leave any *-results.json intact for safety).
  for (const f of fs.readdirSync(subjectDir)) {
    if (/^chunk-\d+\.json$/.test(f)) fs.unlinkSync(path.join(subjectDir, f));
  }

  let chunkIdx = 0;
  for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
    chunkIdx++;
    const chunk = questions.slice(i, i + CHUNK_SIZE);
    fs.writeFileSync(
      path.join(subjectDir, `chunk-${String(chunkIdx).padStart(3, "0")}.json`),
      JSON.stringify(chunk, null, 2),
    );
  }

  console.log(
    `${slug.padEnd(22)} ${String(questions.length).padStart(5)} questions → ${chunkIdx} chunks  (${subjectDir})`,
  );
}

async function doExport() {
  fs.mkdirSync(CHUNK_ROOT, { recursive: true });
  const subjects = SUBJECT_ARG ? [SUBJECT_ARG] : [...TARGET_SUBJECTS];
  console.log(`Exporting unclassified questions for: ${subjects.join(", ")}\n`);
  for (const slug of subjects) await exportSubject(slug);
  console.log(
    `\nNext: spawn subagents — each reads a chunk-NNN.json + the RULES.md in its folder, ` +
      `and writes chunk-NNN-results.json beside it.`,
  );
}

function findResultFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findResultFiles(full));
    else if (/^chunk-\d+-results\.json$/.test(entry.name)) out.push(full);
  }
  return out;
}

async function doImport() {
  const resultFiles = findResultFiles(CHUNK_ROOT).sort();
  if (resultFiles.length === 0) {
    console.log("No -results.json files found. Run subagents first.");
    return;
  }
  console.log(`Found ${resultFiles.length} result files.\n`);

  let total = 0;
  let updated = 0;
  let errors = 0;
  const stats: Record<string, number> = {
    TECH_FREE: 0,
    CAS_ALLOWED: 0,
    CAS_REQUIRED: 0,
  };

  for (const fullPath of resultFiles) {
    let results: ClassificationResult[];
    try {
      results = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch {
      console.error(`[SKIP] ${fullPath}: invalid JSON`);
      errors++;
      continue;
    }
    if (!Array.isArray(results)) {
      console.error(`[SKIP] ${fullPath}: not an array`);
      errors++;
      continue;
    }
    for (const r of results) {
      total++;
      if (!r.id || !["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED"].includes(r.tech)) {
        console.error(`[SKIP] invalid result in ${path.basename(fullPath)}:`, r);
        errors++;
        continue;
      }
      try {
        await prisma.questionSetItem.update({
          where: { id: r.id },
          data: { tech: r.tech as Tech },
        });
        stats[r.tech]++;
        updated++;
      } catch (err) {
        console.error(`[ERR] update ${r.id}:`, err instanceof Error ? err.message : err);
        errors++;
      }
    }
    console.log(`[OK] ${path.relative(CHUNK_ROOT, fullPath)} (${results.length} rows)`);
  }

  console.log(`\n── Summary ──`);
  console.log(`Result files:     ${resultFiles.length}`);
  console.log(`Rows seen:        ${total}`);
  console.log(`Rows updated:     ${updated}`);
  console.log(`Errors/skipped:   ${errors}`);
  console.log(`TECH_FREE:        ${stats.TECH_FREE}`);
  console.log(`CAS_ALLOWED:      ${stats.CAS_ALLOWED}`);
  console.log(`CAS_REQUIRED:     ${stats.CAS_REQUIRED}`);
}

async function doStatus() {
  const subjects = SUBJECT_ARG ? [SUBJECT_ARG] : [...TARGET_SUBJECTS, "vce-general"];
  for (const slug of subjects) {
    const where = {
      status: "APPROVED" as const,
      questionSet: { archived: false, subject: { slug } },
    };
    const total = await prisma.questionSetItem.count({ where });
    if (total === 0) continue;
    const breakdown = await prisma.questionSetItem.groupBy({
      by: ["tech"],
      where,
      _count: { _all: true },
    });
    const get = (t: string | null) =>
      breakdown.find((b) => b.tech === t)?._count._all ?? 0;
    console.log(
      `${slug.padEnd(22)} total ${String(total).padStart(5)} | ` +
        `TECH_FREE ${String(get("TECH_FREE")).padStart(4)} | ` +
        `CAS_ALLOWED ${String(get("CAS_ALLOWED")).padStart(4)} | ` +
        `CAS_REQUIRED ${String(get("CAS_REQUIRED")).padStart(4)} | ` +
        `null ${String(get(null)).padStart(4)}`,
    );
  }
}

async function main() {
  if (!MODE) {
    console.log("Usage:");
    console.log("  npm run backfill-tech -- --export [--subject=<slug>]   # write chunks");
    console.log("  npm run backfill-tech -- --import                      # read results into DB");
    console.log("  npm run backfill-tech -- --status [--subject=<slug>]   # check progress");
    process.exit(1);
  }
  if (MODE === "export") await doExport();
  if (MODE === "import") await doImport();
  if (MODE === "status") await doStatus();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
