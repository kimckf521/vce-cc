/**
 * VCE Mathematical Methods — Solution PDF Uploader
 *
 * Uploads solution PDFs from exams/solutions/ to Supabase Storage
 * and updates the Exam.answerUrl field in the database.
 *
 * File naming: {year}-mm{1|2}-sol.pdf  e.g. 2016-mm1-sol.pdf
 *
 * Usage:
 *   npm run upload-solutions                        ← uploads all solution PDFs
 *   npm run upload-solutions -- --file 2016-mm1-sol.pdf  ← single file
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient, ExamType } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOLUTIONS_DIR = path.join(process.cwd(), "exams", "solutions");
const BUCKET = "solutions";

// ─── Filename parser ──────────────────────────────────────────────────────────

function parseFilename(filename: string): { year: number; examType: ExamType } | null {
  // Matches: 2016-mm1-sol.pdf, 2016-mm2-sol.pdf
  const match = filename.match(/^(\d{4})-mm([12])-sol\.pdf$/i);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    examType: match[2] === "1" ? "EXAM_1" : "EXAM_2",
  };
}

// ─── Upload single solution ───────────────────────────────────────────────────

async function uploadSolution(filename: string): Promise<void> {
  const parsed = parseFilename(filename);
  if (!parsed) {
    console.warn(`⚠️  Skipping (can't parse filename): ${filename}`);
    console.warn(`   Expected format: 2016-mm1-sol.pdf`);
    return;
  }

  const { year, examType } = parsed;
  const filePath = path.join(SOLUTIONS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  console.log(`\n📄 Uploading: ${filename} (${year} ${examType})`);

  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `${year}/${filename}`;

  // Upload to Supabase Storage (upsert = overwrite if exists)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error(`❌ Upload failed: ${uploadError.message}`);
    return;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  console.log(`   ✅ Uploaded to: ${publicUrl}`);

  // Update Exam.answerUrl in database
  const exam = await prisma.exam.findUnique({
    where: { year_examType: { year, examType } },
  });

  if (!exam) {
    console.warn(`   ⚠️  No exam record found for ${year} ${examType} — run seed first`);
    return;
  }

  await prisma.exam.update({
    where: { id: exam.id },
    data: { answerUrl: publicUrl },
  });

  console.log(`   ✅ Updated Exam.answerUrl in database`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  if (!fs.existsSync(SOLUTIONS_DIR)) {
    console.error(`❌ Solutions folder not found: ${SOLUTIONS_DIR}`);
    process.exit(1);
  }

  const args = process.argv.slice(2);

  // Single file mode
  if (args.includes("--file")) {
    const filename = args[args.indexOf("--file") + 1];
    await uploadSolution(filename);
  } else {
    // All files mode
    const files = fs.readdirSync(SOLUTIONS_DIR)
      .filter((f) => f.toLowerCase().endsWith("-sol.pdf"))
      .sort();

    if (files.length === 0) {
      console.error(`❌ No solution PDFs found in ${SOLUTIONS_DIR}`);
      console.error(`   Files should be named: 2016-mm1-sol.pdf`);
      process.exit(1);
    }

    console.log(`\n📁 Found ${files.length} solution PDF(s)`);
    for (const file of files) {
      await uploadSolution(file);
    }
  }

  console.log("\n✅ Done!\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Fatal error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
