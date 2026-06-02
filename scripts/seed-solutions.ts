/**
 * Solution seeder — reads extracted solution JSON files into the database.
 *
 * Matches each solution to its question via (subjectId, year, examType,
 * questionNumber, part). Picks the subject from the JSON's `subjectSlug`
 * (defaults to "vce-methods" for legacy files pre-Phase 2).
 *
 * Usage:
 *   npm run seed-solutions                                       ← every solution JSON
 *   npm run seed-solutions -- --file 2024-EXAM_1-solutions       ← single Methods file
 *   npm run seed-solutions -- --file 2024-EXAM_1-solutions-vce-specialist
 *   npm run seed-solutions -- --dry-run                          ← preview only
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getSubjectConfig } from "./subject-extraction-config";

const prisma = new PrismaClient();

interface ExtractedSolution {
  questionNumber: number;
  part: string | null;
  content: string;
}

interface ExtractedSolutions {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  subjectSlug?: string; // optional for legacy JSON
  solutions: ExtractedSolution[];
}

// Normalise "ai" → "a.i", "bii" → "b.ii", etc.
function normalizePart(part: string | null): string | null {
  if (!part) return null;
  return part.replace(/^([a-z])([ivx]+)$/i, "$1.$2").toLowerCase();
}

async function resolveSubject(urlSlug: string): Promise<{ id: string; slug: string; name: string }> {
  const cfg = getSubjectConfig(urlSlug);
  const row = await prisma.subject.findUnique({
    where: { slug: cfg.dbSlug },
    select: { id: true, slug: true, name: true },
  });
  if (!row) {
    throw new Error(
      `Subject "${cfg.displayName}" (db slug "${cfg.dbSlug}") not found.`
    );
  }
  return row;
}

async function seedSolutions(data: ExtractedSolutions, dryRun: boolean) {
  const urlSlug = data.subjectSlug ?? "vce-methods";
  const subject = await resolveSubject(urlSlug);

  console.log(`\n📚 Seeding solutions: ${data.year} ${data.examType} → ${subject.name} (${data.solutions.length} solutions)`);
  if (dryRun) console.log("   [DRY RUN — nothing will be written]");

  // Find the exam scoped to this subject. Phase 1 changed the compound key
  // from (year, examType) to (subjectId, year, examType) — old `year_examType`
  // calls used to silently work because Methods was the only subject.
  const exam = await prisma.exam.findUnique({
    where: {
      subjectId_year_examType: {
        subjectId: subject.id,
        year: data.year,
        examType: data.examType as any,
      },
    },
  });

  if (!exam) {
    console.error(`   ❌ No ${subject.name} exam found for ${data.year} ${data.examType} — run seed-questions first`);
    return;
  }

  let created = 0, updated = 0, skipped = 0;

  for (const sol of data.solutions) {
    const question = await prisma.question.findFirst({
      where: { examId: exam.id, questionNumber: sol.questionNumber, part: normalizePart(sol.part) },
    });

    if (!question) {
      console.warn(`   ⚠️  No question found: Q${sol.questionNumber}${sol.part ?? ""}`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`   [DRY] Q${sol.questionNumber}${sol.part ?? ""} → ${sol.content.slice(0, 60)}...`);
      created++;
      continue;
    }

    const existing = await prisma.solution.findUnique({ where: { questionId: question.id } });

    if (existing) {
      await prisma.solution.update({ where: { questionId: question.id }, data: { content: sol.content } });
      updated++;
    } else {
      await prisma.solution.create({ data: { questionId: question.id, content: sol.content } });
      created++;
    }
  }

  if (!dryRun) {
    console.log(`   ✅ Created: ${created}, Updated: ${updated}, Skipped (no matching question): ${skipped}`);
  } else {
    console.log(`   [DRY] Would create/update ${created} solutions`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const outputDir = path.join(path.dirname(__filename), "output");

  if (args.includes("--file")) {
    let filename = args[args.indexOf("--file") + 1];
    if (!filename.endsWith(".json")) filename += ".json";
    const filePath = path.join(outputDir, filename);
    if (!fs.existsSync(filePath)) { console.error(`❌ Not found: ${filePath}`); process.exit(1); }
    await seedSolutions(JSON.parse(fs.readFileSync(filePath, "utf-8")), dryRun);
  } else {
    const files = fs.readdirSync(outputDir)
      .filter((f) => f.endsWith("-solutions.json") || /-solutions-[\w-]+\.json$/.test(f))
      .sort();
    if (files.length === 0) { console.error("❌ No solution JSON files found. Run extract-solutions first."); process.exit(1); }
    console.log(`\n📁 Found ${files.length} solution file(s)`);
    for (const file of files) {
      await seedSolutions(JSON.parse(fs.readFileSync(path.join(outputDir, file), "utf-8")), dryRun);
    }
  }

  if (!dryRun) {
    const count = await prisma.solution.count();
    console.log(`\n📊 Total solutions in DB: ${count}`);
  }
  console.log("\n✅ Done!\n");
}

main()
  .catch((err) => { console.error("\n❌", err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
