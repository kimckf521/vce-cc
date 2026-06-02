/**
 * Question seeder — reads extracted JSON files into the database.
 *
 * Picks the target subject from each JSON's `subjectSlug` field (defaults
 * to "vce-methods" for legacy files that pre-date Phase 2). New rows are
 * tagged with subjectId so multi-subject queries can scope correctly.
 *
 * Usage:
 *   npm run seed                                ← seeds every JSON in scripts/output/
 *   npm run seed -- --file 2024-EXAM_1         ← single Methods file
 *   npm run seed -- --file 2024-EXAM_1-vce-specialist
 *   npm run seed -- --dry-run                  ← preview without writing
 */

import { PrismaClient, Difficulty, ExamType } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getSubjectConfig } from "./subject-extraction-config";

const prisma = new PrismaClient();

// ─── Types (matches extract-questions.ts output) ──────────────────────────────

interface ExtractedQuestion {
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  topic: string;
  subtopics?: string[];       // New: array of 1-3 subtopics
  subtopic?: string | null;   // Legacy: single subtopic (backward compat)
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageDescription: string | null;
}

interface ExtractedExam {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  /** Optional — older files (pre-Phase 2) don't carry this; default to vce-methods. */
  subjectSlug?: string;
  questions: ExtractedQuestion[];
}

/** Normalize both old (subtopic) and new (subtopics) formats into an array. */
function getSubtopics(q: ExtractedQuestion): string[] {
  if (q.subtopics && q.subtopics.length > 0) return q.subtopics;
  if (q.subtopic) return [q.subtopic];
  return [];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Look up the DB Subject row for a given URL slug. Throws if missing —
 * callers should ensure the seed script for the subject has run first
 * (e.g. `npm run seed-specialist` for Specialist).
 */
async function resolveSubject(urlSlug: string): Promise<{ id: string; slug: string; name: string }> {
  const cfg = getSubjectConfig(urlSlug);
  const row = await prisma.subject.findUnique({
    where: { slug: cfg.dbSlug },
    select: { id: true, slug: true, name: true },
  });
  if (!row) {
    throw new Error(
      `Subject "${cfg.displayName}" (db slug "${cfg.dbSlug}") not found.\n` +
        `Run its seed script first — for Specialist: \`npm run seed-specialist\`.`
    );
  }
  return row;
}

// ─── Core seed function ───────────────────────────────────────────────────────

async function seedExam(exam: ExtractedExam, dryRun: boolean): Promise<void> {
  const urlSlug = exam.subjectSlug ?? "vce-methods";
  const cfg = getSubjectConfig(urlSlug);
  const subject = await resolveSubject(urlSlug);

  console.log(
    `\n📚 Seeding ${exam.year} ${exam.examType} → ${subject.name} (${exam.questions.length} questions)`
  );

  if (dryRun) {
    console.log("   [DRY RUN — nothing will be written to the database]");
  }

  // ── 1. Upsert Exam (scoped to the subject) ──
  let examRecord: { id: string } | null = null;

  if (!dryRun) {
    examRecord = await prisma.exam.upsert({
      where: {
        subjectId_year_examType: {
          subjectId: subject.id,
          year: exam.year,
          examType: exam.examType as ExamType,
        },
      },
      update: {},
      create: {
        subjectId: subject.id,
        year: exam.year,
        examType: exam.examType as ExamType,
      },
      select: { id: true },
    });
    console.log(`   ✅ Exam record: ${examRecord.id}`);
  } else {
    console.log(`   [DRY] Would upsert Exam: ${exam.year} ${exam.examType} (subject: ${subject.slug})`);
  }

  // ── 2. Collect unique topics & subtopics from this exam ──
  const topicNames = [...new Set(exam.questions.map((q) => q.topic))];

  const topicMap: Record<string, string> = {}; // name → id
  const subtopicMap: Record<string, string> = {}; // "topicName|subtopicName" → id

  for (const topicName of topicNames) {
    const slug = slugify(topicName);
    const order = cfg.topicOrder[topicName] ?? 99;

    if (!dryRun) {
      // Scoped uniqueness: same slug across different subjects is fine, the
      // compound key disambiguates. This was a Phase 1 bug — used to be
      // findUnique({ where: { slug } }) which fails post-multi-subject.
      const topic = await prisma.topic.upsert({
        where: {
          subjectId_slug: { subjectId: subject.id, slug },
        },
        update: {},
        create: {
          name: topicName,
          slug,
          order,
          subjectId: subject.id,
        },
        select: { id: true },
      });
      topicMap[topicName] = topic.id;
    } else {
      console.log(`   [DRY] Would upsert Topic: ${topicName} (subject: ${subject.slug})`);
      topicMap[topicName] = `dry-run-topic-${slug}`;
    }

    // Upsert subtopics for this topic (scoped by topicId — no subject FK
    // needed because subtopic inherits subject via its parent topic)
    const subtopicNames = [
      ...new Set(
        exam.questions
          .filter((q) => q.topic === topicName)
          .flatMap((q) => getSubtopics(q))
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
    const qSubtopics = getSubtopics(q);
    const subtopicConnect = qSubtopics
      .map((name) => subtopicMap[`${q.topic}|${name}`])
      .filter(Boolean)
      .map((id) => ({ id }));

    if (dryRun) {
      const stLabel = qSubtopics.length ? " / " + qSubtopics.join(", ") : "";
      console.log(
        `   [DRY] Q${q.questionNumber}${q.part ? q.part : ""} (${q.marks}m) — ${q.topic}${stLabel} [${q.difficulty}]`
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
        // Denormalized subjectId on Question for cheap subject-scoped search;
        // Phase 1 added the column + index. Authoritative source is still
        // the topic/exam relations.
        subjectId: subject.id,
        ...(subtopicConnect.length && { subtopics: { connect: subtopicConnect } }),
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
      .filter(
        (f) =>
          f.endsWith(".json") &&
          !f.endsWith("-solutions.json") &&
          f !== "all-questions.json"
      )
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
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.subtopic.count(),
      prisma.exam.count(),
      prisma.question.count(),
    ]);
    console.log("\n─────────────────────────────────");
    console.log("📊 Database totals:");
    console.log(`   Subjects:  ${counts[0]}`);
    console.log(`   Topics:    ${counts[1]}`);
    console.log(`   Subtopics: ${counts[2]}`);
    console.log(`   Exams:     ${counts[3]}`);
    console.log(`   Questions: ${counts[4]}`);
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
