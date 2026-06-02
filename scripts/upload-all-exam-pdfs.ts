/**
 * Upload all VCAA exam PDFs (questions + solutions) for all 4 maths subjects
 * to Supabase Storage and wire up Exam.pdfUrl / Exam.answerUrl.
 *
 * Reads from local `exams/vce/math/{subject}/{questions|solutions}/*.pdf`
 * (already uploaded by the user). Uploads to:
 *   - `exams` bucket for question PDFs    → Exam.pdfUrl
 *   - `solutions` bucket for solution PDFs → Exam.answerUrl
 * Bucket path: `{db_subject_slug}/{year}/{filename}`
 *
 * Idempotent + safe:
 *   - Storage uploads use `upsert: true` (overwrite OK, content is canonical)
 *   - Exam URL writes SKIP rows that already have the field set, unless
 *     --overwrite is passed. This preserves Methods's existing VCAA pdfUrls
 *     by default.
 *
 * Default: DRY RUN. Pass --execute to actually upload + write.
 * Pass --overwrite alongside --execute to also replace existing URLs.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/upload-all-exam-pdfs.ts
 *   npx tsx --env-file=.env.local scripts/upload-all-exam-pdfs.ts --execute
 *   npx tsx --env-file=.env.local scripts/upload-all-exam-pdfs.ts --execute --overwrite
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

const execute = process.argv.includes("--execute");
const overwrite = process.argv.includes("--overwrite");
const MODE = execute ? `EXECUTE${overwrite ? " + OVERWRITE" : ""}` : "DRY RUN";

const ROOT = path.join(process.cwd(), "exams", "vce", "math");

// Map local folder name → DB subject slug + filename abbreviation
const SUBJECT_MAP: Record<string, { dbSlug: string; abbr: string }> = {
  mathematical_methods: { dbSlug: "mathematical-methods", abbr: "mm" },
  specialist_mathematics: { dbSlug: "vce-specialist", abbr: "sm" },
  general_mathematics: { dbSlug: "vce-general", abbr: "gm" },
  foundation_mathematics: { dbSlug: "vce-foundation", abbr: "fm" },
};

type UploadPlan = {
  localPath: string;
  filename: string;
  dbSlug: string;
  year: number;
  examType: ExamType;
  kind: "question" | "solution";
  bucket: "exams" | "solutions";
  storagePath: string;
};

function parseFilename(
  filename: string,
  abbr: string,
  kind: "question" | "solution"
): { year: number; examType: ExamType } | null {
  // questions: 2024-mm1.pdf | 2024-mm2.pdf
  // solutions: 2024-mm1-sol.pdf | 2024-mm2-sol.pdf
  const pattern =
    kind === "question"
      ? new RegExp(`^(\\d{4})-${abbr}([12])\\.pdf$`, "i")
      : new RegExp(`^(\\d{4})-${abbr}([12])-sol\\.pdf$`, "i");
  const m = filename.match(pattern);
  if (!m) return null;
  return {
    year: parseInt(m[1], 10),
    examType: m[2] === "1" ? "EXAM_1" : "EXAM_2",
  };
}

function collectPlans(): UploadPlan[] {
  const plans: UploadPlan[] = [];
  for (const [folder, meta] of Object.entries(SUBJECT_MAP)) {
    for (const kind of ["question", "solution"] as const) {
      const dirName = kind === "question" ? "questions" : "solutions";
      const dir = path.join(ROOT, folder, dirName);
      if (!fs.existsSync(dir)) continue;
      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".pdf"));
      for (const filename of files) {
        const parsed = parseFilename(filename, meta.abbr, kind);
        if (!parsed) {
          console.warn(`  ⚠ skipping unparseable: ${folder}/${dirName}/${filename}`);
          continue;
        }
        plans.push({
          localPath: path.join(dir, filename),
          filename,
          dbSlug: meta.dbSlug,
          year: parsed.year,
          examType: parsed.examType,
          kind,
          bucket: kind === "question" ? "exams" : "solutions",
          storagePath: `${meta.dbSlug}/${parsed.year}/${filename}`,
        });
      }
    }
  }
  return plans;
}

async function main() {
  console.log(`\n🦘 Upload VCAA exam PDFs (${MODE})\n`);

  const plans = collectPlans();
  console.log(`Found ${plans.length} local PDF files\n`);

  // Resolve each plan to its Exam row + decide whether to skip
  let toUpload = 0;
  let toSkip = 0;
  let missingExam = 0;
  let uploaded = 0;
  let urlsWritten = 0;
  let urlsSkipped = 0;

  for (const p of plans) {
    const exam = await prisma.exam.findFirst({
      where: {
        subject: { slug: p.dbSlug },
        year: p.year,
        examType: p.examType,
      },
      select: { id: true, pdfUrl: true, answerUrl: true },
    });
    if (!exam) {
      console.warn(
        `  ⚠ no Exam row for ${p.dbSlug} ${p.year} ${p.examType} (${p.filename}) — skipping`
      );
      missingExam++;
      continue;
    }

    const existingUrl = p.kind === "question" ? exam.pdfUrl : exam.answerUrl;
    const skipUrl = !!existingUrl && !overwrite;

    if (skipUrl) {
      urlsSkipped++;
      console.log(
        `  = ${p.dbSlug}/${p.year} ${p.examType} ${p.kind}: URL already set, skipping`
      );
      continue;
    }

    toUpload++;
    console.log(
      `  ↑ ${p.dbSlug}/${p.year} ${p.examType} ${p.kind} → ${p.bucket}/${p.storagePath}`
    );

    if (!execute) continue;

    // Upload to Storage (upsert overwrites existing object harmlessly)
    const fileBuffer = fs.readFileSync(p.localPath);
    const { error: uploadError } = await supabase.storage
      .from(p.bucket)
      .upload(p.storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadError) {
      console.error(`    ❌ upload failed: ${uploadError.message}`);
      continue;
    }
    uploaded++;

    const {
      data: { publicUrl },
    } = supabase.storage.from(p.bucket).getPublicUrl(p.storagePath);

    await prisma.exam.update({
      where: { id: exam.id },
      data: p.kind === "question" ? { pdfUrl: publicUrl } : { answerUrl: publicUrl },
    });
    urlsWritten++;
  }

  console.log(`\n📊 Summary (${MODE})`);
  console.log(`   Local PDFs found:        ${plans.length}`);
  console.log(`   Planned uploads:         ${toUpload}`);
  console.log(`   Skipped (URL set):       ${urlsSkipped}`);
  console.log(`   Skipped (no Exam row):   ${missingExam}`);
  if (execute) {
    console.log(`   Uploaded to Storage:     ${uploaded}`);
    console.log(`   DB URL writes:           ${urlsWritten}`);
  }

  if (!execute) {
    console.log(
      `\nℹ️  DRY RUN — no uploads/writes. Re-run with --execute.`
    );
    console.log(
      `   Add --overwrite to replace existing pdfUrl/answerUrl values (e.g. Methods's VCAA URLs).`
    );
  } else {
    console.log(`\n✅ Done.`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
