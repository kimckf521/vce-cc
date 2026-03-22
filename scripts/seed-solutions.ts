/**
 * VCE Mathematical Methods — Solution Seeder
 *
 * Reads extracted solution JSON files and seeds them into the database,
 * matching each solution to its question by year + examType + questionNumber + part.
 *
 * Usage:
 *   npm run seed-solutions                                  ← all solution JSON files
 *   npm run seed-solutions -- --file 2016-EXAM_1-solutions ← single file
 *   npm run seed-solutions -- --dry-run                    ← preview only
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface ExtractedSolution {
  questionNumber: number;
  part: string | null;
  content: string;
}

interface ExtractedSolutions {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  solutions: ExtractedSolution[];
}

// Normalise "ai" → "a.i", "bii" → "b.ii", etc.
function normalizePart(part: string | null): string | null {
  if (!part) return null;
  return part.replace(/^([a-z])([ivx]+)$/i, "$1.$2").toLowerCase();
}

async function seedSolutions(data: ExtractedSolutions, dryRun: boolean) {
  console.log(`\n📚 Seeding solutions: ${data.year} ${data.examType} (${data.solutions.length} solutions)`);
  if (dryRun) console.log("   [DRY RUN — nothing will be written]");

  // Find the exam
  const exam = await prisma.exam.findUnique({
    where: { year_examType: { year: data.year, examType: data.examType as any } },
  });

  if (!exam) {
    console.error(`   ❌ No exam found for ${data.year} ${data.examType} — run seed first`);
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
      .filter((f) => f.endsWith("-solutions.json"))
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
