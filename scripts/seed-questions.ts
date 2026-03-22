/**
 * VCE Mathematical Methods — Database Seeder
 *
 * Reads extracted JSON files and seeds them into the database.
 *
 * Usage:
 *   npm run seed                          ← seeds all files in scripts/output/
 *   npm run seed -- --file 2016-EXAM_1   ← seeds a single file
 *   npm run seed -- --dry-run            ← preview without writing to DB
 */

import { PrismaClient, Difficulty, ExamType } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ─── Types (matches extract-questions.ts output) ──────────────────────────────

interface ExtractedQuestion {
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  topic: string;
  subtopic: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageDescription: string | null;
}

interface ExtractedExam {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  questions: ExtractedQuestion[];
}

// ─── Topic ordering ───────────────────────────────────────────────────────────

const TOPIC_ORDER: Record<string, number> = {
  "Functions and Graphs": 1,
  "Algebra": 2,
  "Calculus": 3,
  "Probability": 4,
  "Statistics": 5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Core seed function ───────────────────────────────────────────────────────

async function seedExam(exam: ExtractedExam, dryRun: boolean): Promise<void> {
  console.log(`\n📚 Seeding ${exam.year} ${exam.examType} (${exam.questions.length} questions)`);

  if (dryRun) {
    console.log("   [DRY RUN — nothing will be written to the database]");
  }

  // ── 1. Upsert Exam ──
  let examRecord: { id: string } | null = null;

  if (!dryRun) {
    examRecord = await prisma.exam.upsert({
      where: { year_examType: { year: exam.year, examType: exam.examType as ExamType } },
      update: {},
      create: {
        year: exam.year,
        examType: exam.examType as ExamType,
      },
      select: { id: true },
    });
    console.log(`   ✅ Exam record: ${examRecord.id}`);
  } else {
    console.log(`   [DRY] Would upsert Exam: ${exam.year} ${exam.examType}`);
  }

  // ── 2. Collect unique topics & subtopics from this exam ──
  const topicNames = [...new Set(exam.questions.map((q) => q.topic))];

  const topicMap: Record<string, string> = {}; // name → id
  const subtopicMap: Record<string, string> = {}; // "topicName|subtopicName" → id

  for (const topicName of topicNames) {
    const slug = slugify(topicName);
    const order = TOPIC_ORDER[topicName] ?? 99;

    if (!dryRun) {
      const topic = await prisma.topic.upsert({
        where: { slug },
        update: {},
        create: { name: topicName, slug, order },
        select: { id: true },
      });
      topicMap[topicName] = topic.id;
    } else {
      console.log(`   [DRY] Would upsert Topic: ${topicName}`);
      topicMap[topicName] = `dry-run-topic-${slug}`;
    }

    // Upsert subtopics for this topic
    const subtopicNames = [
      ...new Set(
        exam.questions
          .filter((q) => q.topic === topicName && q.subtopic)
          .map((q) => q.subtopic!)
      ),
    ];

    for (const subtopicName of subtopicNames) {
      const subtopicSlug = slugify(subtopicName);
      const key = `${topicName}|${subtopicName}`;

      if (!dryRun) {
        const subtopic = await prisma.subtopic.upsert({
          where: {
            topicId_slug: {
              topicId: topicMap[topicName],
              slug: subtopicSlug,
            },
          },
          update: {},
          create: {
            name: subtopicName,
            slug: subtopicSlug,
            topicId: topicMap[topicName],
          },
          select: { id: true },
        });
        subtopicMap[key] = subtopic.id;
      } else {
        console.log(`   [DRY] Would upsert Subtopic: ${topicName} → ${subtopicName}`);
        subtopicMap[key] = `dry-run-subtopic-${subtopicSlug}`;
      }
    }
  }

  // ── 3. Seed Questions ──
  let created = 0;
  let skipped = 0;

  for (const q of exam.questions) {
    const topicId = topicMap[q.topic];
    const subtopicKey = q.subtopic ? `${q.topic}|${q.subtopic}` : null;
    const subtopicId = subtopicKey ? subtopicMap[subtopicKey] : null;

    if (dryRun) {
      console.log(
        `   [DRY] Q${q.questionNumber}${q.part ? q.part : ""} (${q.marks}m) — ${q.topic}${q.subtopic ? " / " + q.subtopic : ""} [${q.difficulty}]`
      );
      created++;
      continue;
    }

    // Check if this question already exists (idempotent)
    const existing = await prisma.question.findFirst({
      where: {
        examId: examRecord!.id,
        questionNumber: q.questionNumber,
        part: q.part,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.question.create({
      data: {
        examId: examRecord!.id,
        topicId,
        subtopicId,
        questionNumber: q.questionNumber,
        part: q.part,
        marks: q.marks,
        content: q.content,
        difficulty: q.difficulty as Difficulty,
      },
    });
    created++;
  }

  if (dryRun) {
    console.log(`   [DRY] Would create ${created} questions`);
  } else {
    console.log(`   ✅ Created: ${created} questions, Skipped (already exist): ${skipped}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const outputDir = path.join(path.dirname(__filename), "output");

  if (dryRun) {
    console.log("\n🔍 DRY RUN MODE — no changes will be made to the database\n");
  }

  // ── Single file mode ──
  if (args.includes("--file")) {
    const fileIndex = args.indexOf("--file");
    let filename = args[fileIndex + 1];
    if (!filename.endsWith(".json")) filename += ".json";

    const filePath = path.join(outputDir, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const exam: ExtractedExam = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    await seedExam(exam, dryRun);
  } else {
    // ── All files mode ──
    if (!fs.existsSync(outputDir)) {
      console.error(`❌ Output directory not found: ${outputDir}`);
      console.error("   Run npm run extract first to generate JSON files.");
      process.exit(1);
    }

    const files = fs
      .readdirSync(outputDir)
      .filter((f) => f.endsWith(".json") && f !== "all-questions.json")
      .sort();

    if (files.length === 0) {
      console.error("❌ No JSON files found in scripts/output/");
      console.error("   Run npm run extract first.");
      process.exit(1);
    }

    console.log(`\n📁 Found ${files.length} exam file(s) to seed:`);
    files.forEach((f) => console.log(`   • ${f}`));

    for (const file of files) {
      const exam: ExtractedExam = JSON.parse(
        fs.readFileSync(path.join(outputDir, file), "utf-8")
      );
      await seedExam(exam, dryRun);
    }
  }

  // ── Final summary ──
  if (!dryRun) {
    const counts = await Promise.all([
      prisma.topic.count(),
      prisma.subtopic.count(),
      prisma.exam.count(),
      prisma.question.count(),
    ]);
    console.log("\n─────────────────────────────────");
    console.log("📊 Database totals:");
    console.log(`   Topics:    ${counts[0]}`);
    console.log(`   Subtopics: ${counts[1]}`);
    console.log(`   Exams:     ${counts[2]}`);
    console.log(`   Questions: ${counts[3]}`);
    console.log("─────────────────────────────────");
  }

  console.log("\n✅ Done!\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Fatal error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
