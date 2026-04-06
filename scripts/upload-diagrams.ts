/**
 * VCE Methods — Diagram Uploader
 *
 * Uploads extracted diagram PNGs from scripts/diagrams/ to Supabase Storage
 * and updates Question.imageUrl in the database.
 *
 * Reads manifest.json from each exam folder to know which diagrams exist
 * and which questions they belong to.
 *
 * Usage:
 *   npx tsx scripts/upload-diagrams.ts                         # all exams
 *   npx tsx scripts/upload-diagrams.ts --exam 2023-mm1         # single exam
 *   npx tsx scripts/upload-diagrams.ts --exam 2023-mm1 --dry   # dry run
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient, ExamType } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DIAGRAMS_DIR = path.join(process.cwd(), "scripts", "diagrams");
const BUCKET = "exams";

// ── Types ────────────────────────────────────────────────────────────

interface DiagramEntry {
  file: string;
  page: number;
  question: string;       // e.g. "3a", "5", "1"
  type: string;
  description: string;
  bbox_pct: { x: number; y: number; w: number; h: number };
  bbox_pts: { x0: number; y0: number; x1: number; y1: number };
  size: { width: number; height: number };
}

// ── Helpers ──────────────────────────────────────────────────────────

function parseExamFolder(folder: string): { year: number; examType: ExamType } | null {
  const match = folder.match(/^(\d{4})-mm([12])$/);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    examType: match[2] === "1" ? "EXAM_1" : "EXAM_2",
  };
}

function parseQuestion(q: string): { questionNumber: number; part: string | null } {
  // "3a" -> { questionNumber: 3, part: "a" }
  // "5"  -> { questionNumber: 5, part: null }
  // "3"  -> { questionNumber: 3, part: null }
  const match = q.match(/^(\d+)([a-z].*)?$/i);
  if (!match) return { questionNumber: parseInt(q) || 0, part: null };
  return {
    questionNumber: parseInt(match[1]),
    part: match[2] || null,
  };
}

// ── Upload single exam's diagrams ────────────────────────────────────

async function uploadExamDiagrams(folder: string, dryRun: boolean): Promise<number> {
  const parsed = parseExamFolder(folder);
  if (!parsed) {
    console.warn(`  Skipping (can't parse folder): ${folder}`);
    return 0;
  }

  const { year, examType } = parsed;
  const folderPath = path.join(DIAGRAMS_DIR, folder);
  const manifestPath = path.join(folderPath, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    console.warn(`  No manifest.json in ${folder}`);
    return 0;
  }

  const manifest: DiagramEntry[] = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  if (manifest.length === 0) {
    console.log(`  ${folder}: no diagrams in manifest`);
    return 0;
  }

  console.log(`\n📁 ${folder} — ${manifest.length} diagram(s)`);

  // Find the exam in DB
  const exam = await prisma.exam.findUnique({
    where: { year_examType: { year, examType } },
  });

  if (!exam) {
    console.warn(`  WARNING: No exam record for ${year} ${examType}`);
    return 0;
  }

  let uploaded = 0;

  for (const entry of manifest) {
    const filePath = path.join(folderPath, entry.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  File missing: ${entry.file}`);
      continue;
    }

    const storagePath = `diagrams/${year}/${folder}-${entry.file}`;
    const { questionNumber, part } = parseQuestion(entry.question);

    console.log(`  ${entry.file} -> Q${entry.question} (${entry.type})`);

    if (dryRun) {
      console.log(`    [DRY RUN] Would upload to: ${storagePath}`);
      console.log(`    [DRY RUN] Would link to: ${year} ${examType} Q${questionNumber}${part || ""}`);
      uploaded++;
      continue;
    }

    // Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(filePath);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error(`    Upload failed: ${uploadError.message}`);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    console.log(`    Uploaded: ${publicUrl}`);

    // Find the question(s) and update imageUrl
    // For part=null questions, match by questionNumber only
    // For part!=null, match exactly
    const questions = await prisma.question.findMany({
      where: {
        examId: exam.id,
        questionNumber,
        ...(part ? { part } : {}),
      },
    });

    if (questions.length === 0) {
      console.warn(`    No question found for Q${questionNumber}${part || ""}`);
      continue;
    }

    // If no specific part, update the first part (or the only question)
    const targetQuestion = part
      ? questions[0]
      : questions.find(q => q.part === null) || questions[0];

    await prisma.question.update({
      where: { id: targetQuestion.id },
      data: { imageUrl: publicUrl },
    });

    console.log(`    Linked to question: ${targetQuestion.id}`);
    uploaded++;
  }

  return uploaded;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry");
  const examIdx = args.indexOf("--exam");
  const specificExam = examIdx >= 0 ? args[examIdx + 1] : null;

  if (dryRun) console.log("🔍 DRY RUN MODE — no changes will be made\n");

  if (!fs.existsSync(DIAGRAMS_DIR)) {
    console.error(`Diagrams folder not found: ${DIAGRAMS_DIR}`);
    console.error("Run extract-diagrams.py first.");
    process.exit(1);
  }

  let totalUploaded = 0;

  if (specificExam) {
    totalUploaded = await uploadExamDiagrams(specificExam, dryRun);
  } else {
    const folders = fs.readdirSync(DIAGRAMS_DIR)
      .filter(f => fs.statSync(path.join(DIAGRAMS_DIR, f)).isDirectory())
      .sort();

    for (const folder of folders) {
      totalUploaded += await uploadExamDiagrams(folder, dryRun);
    }
  }

  console.log(`\n${dryRun ? "Would upload" : "Uploaded"}: ${totalUploaded} diagram(s)`);
}

main()
  .catch((err) => {
    console.error("\nFatal error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
