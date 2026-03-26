import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const count = Math.min(parseInt(searchParams.get("count") ?? "10"), 40);
  const difficulty = searchParams.get("difficulty");
  const topicsParam = searchParams.get("topics");
  const topicIds = topicsParam ? topicsParam.split(",") : [];

  const questions = await prisma.question.findMany({
    where: {
      ...(topicIds.length > 0 && { topicId: { in: topicIds } }),
      ...(difficulty && difficulty !== "ALL" && { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" }),
    },
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      subtopics: { select: { name: true } },
      solution: { select: { content: true, videoUrl: true } },
    },
  });

  // Shuffle and take count
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);

  return NextResponse.json({ questions: shuffled });
}
