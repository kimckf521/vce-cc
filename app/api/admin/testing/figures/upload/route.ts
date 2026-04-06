import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import { join } from "path";

const ARTIFACTS_DIR = join(process.cwd(), ".figure-artifacts");
const BUCKET = "extraction";

/**
 * Parse a PDF filename to determine exam year, number, and whether it's a solution.
 *
 * Exam papers:   {YEAR}-mm{N}.pdf       → { year, examNum, isSolution: false }
 * Exam solutions: {YEAR}-mm{N}-sol.pdf  → { year, examNum, isSolution: true }
 */
function parsePdfName(name: string) {
  const m = name.match(/^(\d{4})-mm([12])(-sol)?\.pdf$/i);
  if (!m) return null;
  return {
    year: parseInt(m[1]),
    examNum: parseInt(m[2]),
    isSolution: !!m[3],
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-figures-upload:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase storage not configured (missing service role key)" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { imageUrl, examId, questionNumber, part, target, label, pdfName } =
      body;

    // --- Resolve exam & target from either explicit params or pdfName ---
    let resolvedExamId = examId as string | undefined;
    let resolvedTarget = target as "question" | "solution" | undefined;
    let resolvedQNum = questionNumber as number | undefined;
    let resolvedPart = (part as string) || null;

    // Auto-detect from PDF name if examId not provided
    if (!resolvedExamId && pdfName) {
      const parsed = parsePdfName(pdfName);
      if (!parsed) {
        return NextResponse.json(
          {
            error: `Cannot parse exam from filename "${pdfName}". Expected format: YYYY-mmN.pdf or YYYY-mmN-sol.pdf`,
          },
          { status: 400 }
        );
      }

      const examType = parsed.examNum === 1 ? "EXAM_1" : "EXAM_2";
      const exam = await prisma.exam.findUnique({
        where: { year_examType: { year: parsed.year, examType } },
      });

      if (!exam) {
        return NextResponse.json(
          {
            error: `No exam found for ${parsed.year} ${examType}`,
          },
          { status: 404 }
        );
      }

      resolvedExamId = exam.id;
      if (!resolvedTarget) {
        resolvedTarget = parsed.isSolution ? "solution" : "question";
      }
    }

    if (!imageUrl || !resolvedExamId || resolvedQNum === undefined) {
      return NextResponse.json(
        {
          error:
            "imageUrl and questionNumber are required. Provide examId or pdfName to identify the exam.",
        },
        { status: 400 }
      );
    }

    if (resolvedTarget !== "question" && resolvedTarget !== "solution") {
      return NextResponse.json(
        { error: "target must be 'question' or 'solution'" },
        { status: 400 }
      );
    }

    // Read the image file from local artifacts
    const artifactMatch = imageUrl.match(
      /\/api\/admin\/testing\/figures\/artifacts\/(.+)$/
    );
    if (!artifactMatch) {
      return NextResponse.json(
        { error: "Invalid artifact URL" },
        { status: 400 }
      );
    }

    const relativePath = artifactMatch[1];
    const filePath = join(ARTIFACTS_DIR, relativePath);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePath);
    } catch {
      return NextResponse.json(
        { error: "Artifact file not found on disk" },
        { status: 404 }
      );
    }

    // Find the exam
    const exam = await prisma.exam.findUnique({
      where: { id: resolvedExamId },
    });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Find the question
    const questions = await prisma.question.findMany({
      where: {
        examId: resolvedExamId,
        questionNumber: Number(resolvedQNum),
        ...(resolvedPart ? { part: String(resolvedPart) } : {}),
      },
      include: { solution: true },
    });

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: `No question found for Q${resolvedQNum}${resolvedPart || ""}`,
        },
        { status: 404 }
      );
    }

    const targetQuestion = resolvedPart
      ? questions[0]
      : questions.find((q) => q.part === null) || questions[0];

    // Upload to Supabase Storage — extraction bucket
    const examFolder = `${exam.year}-mm${exam.examType === "EXAM_1" ? "1" : "2"}`;
    const subFolder = resolvedTarget === "solution" ? "solutions" : "questions";
    const safeLabel = (label || `Q${resolvedQNum}${resolvedPart || ""}`)
      .replace(/[^a-zA-Z0-9_-]/g, "");
    const storagePath = `${examFolder}/${subFolder}/${safeLabel}.png`;

    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey);

    // Ensure bucket exists (auto-create if missing)
    const { error: bucketError } = await adminClient.storage.createBucket(
      BUCKET,
      { public: true }
    );
    if (bucketError && !bucketError.message.includes("already exists")) {
      console.warn("[figure-upload] Bucket create warning:", bucketError.message);
    }

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from(BUCKET).getPublicUrl(storagePath);

    // Update the database
    if (resolvedTarget === "question") {
      await prisma.question.update({
        where: { id: targetQuestion.id },
        data: { imageUrl: publicUrl },
      });
    } else {
      if (!targetQuestion.solution) {
        return NextResponse.json(
          { error: "Question has no solution record to update" },
          { status: 404 }
        );
      }
      await prisma.solution.update({
        where: { id: targetQuestion.solution.id },
        data: { imageUrl: publicUrl },
      });
    }

    return NextResponse.json({
      publicUrl,
      questionId: targetQuestion.id,
      storagePath,
      target: resolvedTarget,
    });
  } catch (err) {
    console.error("[figure-upload] Error:", err);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
