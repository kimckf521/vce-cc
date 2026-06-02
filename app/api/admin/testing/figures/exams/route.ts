import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const exams = await prisma.exam.findMany({
    orderBy: [{ year: "desc" }, { examType: "asc" }],
    include: {
      questions: {
        select: {
          id: true,
          questionNumber: true,
          part: true,
          imageUrl: true,
        },
        orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
      },
    },
  });

  return NextResponse.json({
    exams: exams.map((e) => ({
      id: e.id,
      year: e.year,
      examType: e.examType,
      label: `${e.year} ${e.examType === "EXAM_1" ? "Exam 1" : "Exam 2"}`,
      questions: e.questions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        part: q.part,
        hasImage: !!q.imageUrl,
      })),
    })),
  });
}
