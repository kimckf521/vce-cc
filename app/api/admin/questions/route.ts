import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuestionSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const questions = await prisma.question.findMany({
    orderBy: [{ exam: { year: "desc" } }, { exam: { examType: "asc" } }, { questionNumber: "asc" }, { part: "asc" }],
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      solution: { select: { id: true, content: true } },
    },
  });

  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`admin-questions:${user.id}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

export async function PATCH(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, questionNumber, part, marks, content, difficulty, imageUrl } = body;
  if (!id) return NextResponse.json({ error: "Missing question id" }, { status: 400 });

  const question = await prisma.question.update({
    where: { id },
    data: {
      ...(questionNumber !== undefined && { questionNumber }),
      ...(part !== undefined && { part: part || null }),
      ...(marks !== undefined && { marks }),
      ...(content !== undefined && { content }),
      ...(difficulty !== undefined && { difficulty }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
    },
  });

  return NextResponse.json({ question });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing question id" }, { status: 400 });

  // Delete related data first
  await prisma.attempt.deleteMany({ where: { questionId: id } });
  await prisma.solution.deleteMany({ where: { questionId: id } });
  await prisma.question.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
