import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createExamSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

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

  const exam = await prisma.exam.upsert({
    where: { year_examType: { year, examType } },
    update: { pdfUrl: pdfUrl ?? null, answerUrl: answerUrl ?? null },
    create: { year, examType, pdfUrl: pdfUrl ?? null, answerUrl: answerUrl ?? null },
  });

  return NextResponse.json({ exam });
}

export async function GET() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ year: "desc" }, { examType: "asc" }],
    include: { _count: { select: { questions: true } } },
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

  // Delete all related data: attempts -> solutions -> questions -> exam
  const questions = await prisma.question.findMany({ where: { examId: id }, select: { id: true } });
  const qIds = questions.map((q) => q.id);

  if (qIds.length > 0) {
    await prisma.attempt.deleteMany({ where: { questionId: { in: qIds } } });
    await prisma.solution.deleteMany({ where: { questionId: { in: qIds } } });
    await prisma.question.deleteMany({ where: { examId: id } });
  }

  await prisma.exam.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
