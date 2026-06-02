/**
 * backfill-tech-classification.ts
 *
 * Classifies each QuestionSetItem (Mathematical Methods) as TECH_FREE,
 * CAS_ALLOWED, or CAS_REQUIRED. Uses a Claude Code subagent workflow
 * (no ANTHROPIC_API_KEY needed):
 *
 *   1. `npm run backfill-tech -- --export`
 *        Writes unclassified questions to scripts/output/tech-chunks/chunk-NNN.json
 *        (CHUNK_SIZE questions per file).
 *
 *   2. Spawn general-purpose subagents (5–8 in parallel) — each subagent
 *      reads one chunk file, classifies every question, and writes
 *      scripts/output/tech-chunks/chunk-NNN-results.json
 *
 *   3. `npm run backfill-tech -- --import`
 *        Reads every chunk-NNN-results.json and updates QuestionSetItem.tech.
 *
 * The classifier rules live in scripts/output/tech-chunks/RULES.md so each
 * subagent can read them. Re-running --export only picks up questions where
 * tech IS NULL, so it's safe to re-run after partial completion.
 */
import fs from "fs";
import path from "path";
import { PrismaClient, Tech, QuestionSetItemType } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

const SUBJECT_SLUG = "mathematical-methods";
const CHUNK_SIZE = 25;
const CHUNK_DIR = path.join(__dirname, "output", "tech-chunks");

const MODE = process.argv.includes("--export")
  ? "export"
  : process.argv.includes("--import")
  ? "import"
  : process.argv.includes("--status")
  ? "status"
  : null;

const TECH_RULES = `# Tech Classification Rules — VCE Mathematical Methods

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

## Output format
For each question in the input chunk, output:
\`\`\`json
{ "id": "<question id>", "tech": "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED", "reason": "<one short clause>" }
\`\`\`
Write all results as a JSON array to the output file (same name as input but with \`-results.json\`).`;

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

async function doExport() {
  fs.mkdirSync(CHUNK_DIR, { recursive: true });
  fs.writeFileSync(path.join(CHUNK_DIR, "RULES.md"), TECH_RULES);

  const questions = await prisma.questionSetItem.findMany({
    where: {
      tech: null,
      questionSet: { subject: { slug: SUBJECT_SLUG } },
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

  console.log(`Found ${questions.length} un-classified questions.`);

  const existingChunks = fs
    .readdirSync(CHUNK_DIR)
    .filter((f) => f.match(/^chunk-\d+\.json$/));
  for (const f of existingChunks) fs.unlinkSync(path.join(CHUNK_DIR, f));

  let chunkIdx = 0;
  for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
    chunkIdx++;
    const chunk = questions.slice(i, i + CHUNK_SIZE);
    const chunkFile = path.join(
      CHUNK_DIR,
      `chunk-${String(chunkIdx).padStart(3, "0")}.json`,
    );
    fs.writeFileSync(chunkFile, JSON.stringify(chunk, null, 2));
  }

  console.log(`Wrote ${chunkIdx} chunk files to ${CHUNK_DIR}`);
  console.log(`Each chunk has up to ${CHUNK_SIZE} questions.`);
  console.log(`\nNext step: spawn subagents to classify each chunk-NNN.json`);
  console.log(`See RULES.md in the chunk dir for the classification spec.`);
}

async function doImport() {
  const resultFiles = fs
    .readdirSync(CHUNK_DIR)
    .filter((f) => f.match(/^chunk-\d+-results\.json$/))
    .sort();

  if (resultFiles.length === 0) {
    console.log("No -results.json files found. Run subagents first.");
    return;
  }

  console.log(`Found ${resultFiles.length} result files.`);

  let total = 0;
  let updated = 0;
  let errors = 0;
  const stats: Record<string, number> = {
    TECH_FREE: 0,
    CAS_ALLOWED: 0,
    CAS_REQUIRED: 0,
  };

  for (const file of resultFiles) {
    const fullPath = path.join(CHUNK_DIR, file);
    let results: ClassificationResult[];
    try {
      results = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (err) {
      console.error(`[SKIP] ${file}: invalid JSON`);
      errors++;
      continue;
    }
    if (!Array.isArray(results)) {
      console.error(`[SKIP] ${file}: not an array`);
      errors++;
      continue;
    }
    for (const r of results) {
      total++;
      if (!r.id || !["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED"].includes(r.tech)) {
        console.error(`[SKIP] invalid result in ${file}:`, r);
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
    console.log(`[OK] ${file} (${results.length} rows)`);
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
  const where = { questionSet: { subject: { slug: SUBJECT_SLUG } } };
  const total = await prisma.questionSetItem.count({ where });
  const classified = await prisma.questionSetItem.count({
    where: { ...where, tech: { not: null } },
  });
  const breakdown = await prisma.questionSetItem.groupBy({
    by: ["tech"],
    where,
    _count: { _all: true },
  });

  console.log(`Total Methods questions: ${total}`);
  console.log(`Classified:              ${classified} (${((classified / total) * 100).toFixed(1)}%)`);
  console.log(`Remaining:               ${total - classified}`);
  console.log(`\nBreakdown:`);
  for (const row of breakdown) {
    const pct = ((row._count._all / total) * 100).toFixed(1);
    console.log(
      `  ${(row.tech ?? "null").toString().padEnd(13)} ${row._count._all.toString().padStart(5)}  (${pct}%)`,
    );
  }
}

async function main() {
  if (!MODE) {
    console.log("Usage:");
    console.log("  npm run backfill-tech -- --export   # write chunks");
    console.log("  npm run backfill-tech -- --import   # read results into DB");
    console.log("  npm run backfill-tech -- --status   # check progress");
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
