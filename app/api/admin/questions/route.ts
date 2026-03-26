import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const {
    examId, topicId, subtopicIds,
    questionNumber, part, marks,
    content, imageUrl, difficulty,
    solution,
  } = await req.json();

  if (!examId || !topicId || !questionNumber || !marks || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      examId, topicId,
      ...(subtopicIds?.length && { subtopics: { connect: subtopicIds.map((id: string) => ({ id })) } }),
      questionNumber: parseInt(questionNumber),
      part: part || null,
      marks: parseInt(marks),
      content,
      imageUrl: imageUrl || null,
      difficulty: difficulty || "MEDIUM",
      ...(solution?.content && {
        solution: {
          create: {
            content: solution.content,
            imageUrl: solution.imageUrl || null,
            videoUrl: solution.videoUrl || null,
          },
        },
      }),
    },
    include: { solution: true },
  });

  return NextResponse.json({ question });
}
