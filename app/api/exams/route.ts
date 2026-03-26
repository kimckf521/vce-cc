import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ year: "desc" }, { examType: "asc" }],
    include: { questions: { select: { questionNumber: true, part: true } } },
  });

  return NextResponse.json({
    exams: exams.map((e) => ({
      id: e.id,
      year: e.year,
      examType: e.examType,
      questionCount:
        e.questions.filter((q) => q.part === null).length +
        new Set(e.questions.filter((q) => q.part !== null).map((q) => q.questionNumber)).size,
    })),
  });
}
