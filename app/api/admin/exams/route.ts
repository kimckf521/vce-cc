import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createExamSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { ensureMathMethodsSubject } from "@/lib/subscription";
import { getDbSubjectSlug, isKnownSubject } from "@/lib/subject-context";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-exams:${user.id}`, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createExamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { year, examType, pdfUrl, answerUrl } = parsed.data;

  // Admin "create exam" defaults to the Methods subject — the only subject
  // with active content in Phase 2. Specialist/General/Foundation will get
  // their own admin flow (Phase 3) once their content pipelines come online.
  const subjectId = await ensureMathMethodsSubject();

  const exam = await prisma.exam.upsert({
    where: { subjectId_year_examType: { subjectId, year, examType } },
    update: { pdfUrl: pdfUrl ?? null, answerUrl: answerUrl ?? null },
    create: { subjectId, year, examType, pdfUrl: pdfUrl ?? null, answerUrl: answerUrl ?? null },
  });

  return NextResponse.json({ exam });
}

export async function GET(req: NextRequest) {
  const subjectUrlSlug = req.nextUrl.searchParams.get("subject");
  // Translate the short URL slug (e.g. "methods") into the DB slug
  // (e.g. "mathematical-methods") and scope the query. Unknown slugs are
  // ignored (return all) so admins can't accidentally hide everything by
  // pasting a typo into the URL.
  const subjectSlugFilter =
    subjectUrlSlug && isKnownSubject(subjectUrlSlug) ? getDbSubjectSlug(subjectUrlSlug) : null;
  const exams = await prisma.exam.findMany({
    where: subjectSlugFilter ? { subject: { slug: subjectSlugFilter } } : undefined,
    orderBy: [{ year: "desc" }, { examType: "asc" }],
    include: {
      _count: { select: { questions: true } },
      subject: { select: { slug: true, name: true } },
    },
  });
  return NextResponse.json({ exams });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, year, examType, pdfUrl, answerUrl } = body;
  if (!id) return NextResponse.json({ error: "Missing exam id" }, { status: 400 });

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      ...(year !== undefined && { year }),
      ...(examType !== undefined && { examType }),
      ...(pdfUrl !== undefined && { pdfUrl: pdfUrl || null }),
      ...(answerUrl !== undefined && { answerUrl: answerUrl || null }),
    },
  });

  return NextResponse.json({ exam });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing exam id" }, { status: 400 });

  // Capture the exam for the audit summary before we cascade-delete.
  const existing = await prisma.exam.findUnique({
    where: { id },
    select: { year: true, examType: true, subject: { select: { name: true } } },
  });

  // Delete all related data: attempts -> solutions -> questions -> exam
  const questions = await prisma.question.findMany({ where: { examId: id }, select: { id: true } });
  const qIds = questions.map((q) => q.id);

  if (qIds.length > 0) {
    await prisma.attempt.deleteMany({ where: { questionId: { in: qIds } } });
    await prisma.solution.deleteMany({ where: { questionId: { in: qIds } } });
    await prisma.question.deleteMany({ where: { examId: id } });
  }

  await prisma.exam.delete({ where: { id } });

  if (existing) {
    await logAdminAction({
      actorId: dbUser.id,
      action: "EXAM_DELETE",
      targetType: "Exam",
      targetId: id,
      summary: `Deleted ${existing.subject?.name ?? "exam"} ${existing.year} ${
        existing.examType === "EXAM_1" ? "Exam 1" : "Exam 2"
      } (${qIds.length} questions)`,
      metadata: { year: existing.year, examType: existing.examType, questionCount: qIds.length },
    });
  }

  return NextResponse.json({ success: true });
}
