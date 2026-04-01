import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createQuestionSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-questions:${user.id}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const {
    examId, topicId, subtopicIds,
    questionNumber, part, marks,
    content, imageUrl, difficulty,
    solution,
  } = parsed.data;

  const question = await prisma.question.create({
    data: {
      examId, topicId,
      ...(subtopicIds.length > 0 && { subtopics: { connect: subtopicIds.map((id) => ({ id })) } }),
      questionNumber,
      part: part ?? null,
      marks,
      content,
      imageUrl: imageUrl ?? null,
      difficulty,
      ...(solution?.content && {
        solution: {
          create: {
            content: solution.content,
            imageUrl: solution.imageUrl ?? null,
            videoUrl: solution.videoUrl ?? null,
          },
        },
      }),
    },
    include: { solution: true },
  });

  return NextResponse.json({ question });
}
