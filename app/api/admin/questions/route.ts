import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuestionSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";
import { getDbSubjectSlug, isKnownSubject } from "@/lib/subject-context";
import { logAdminAction } from "@/lib/admin-audit";

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const examId = req.nextUrl.searchParams.get("examId");
  const subjectUrlSlug = req.nextUrl.searchParams.get("subject");
  // When ?untaggedSubtopics=1, only return questions that have no subtopics
  // attached. Powers the orphan-question retag workflow.
  const untaggedOnly = req.nextUrl.searchParams.get("untaggedSubtopics") === "1";

  const subjectSlugFilter =
    subjectUrlSlug && isKnownSubject(subjectUrlSlug) ? getDbSubjectSlug(subjectUrlSlug) : null;

  const where: import("@prisma/client").Prisma.QuestionWhereInput = {};
  if (examId) where.examId = examId;
  if (subjectSlugFilter) where.subject = { slug: subjectSlugFilter };
  if (untaggedOnly) where.subtopics = { none: {} };

  const questions = await prisma.question.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: [{ exam: { year: "desc" } }, { exam: { examType: "asc" } }, { questionNumber: "asc" }, { part: "asc" }],
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      subject: { select: { slug: true, name: true } },
      subtopics: { select: { id: true, name: true } },
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
  const { id, questionNumber, part, marks, content, difficulty, imageUrl, subtopicIds } = body;
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
      // `set` replaces the entire subtopic relation — pass [] to clear.
      ...(Array.isArray(subtopicIds) && {
        subtopics: { set: subtopicIds.map((sid: string) => ({ id: sid })) },
      }),
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

  const existing = await prisma.question.findUnique({
    where: { id },
    select: {
      questionNumber: true,
      part: true,
      exam: { select: { year: true, examType: true } },
    },
  });

  // Delete related data first
  await prisma.attempt.deleteMany({ where: { questionId: id } });
  await prisma.solution.deleteMany({ where: { questionId: id } });
  await prisma.question.delete({ where: { id } });

  if (existing) {
    await logAdminAction({
      actorId: auth.dbUser.id,
      action: "QUESTION_DELETE",
      targetType: "Question",
      targetId: id,
      summary: `Deleted Q${existing.questionNumber}${existing.part ?? ""} from ${existing.exam.year} ${
        existing.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2"
      }`,
      metadata: {
        questionNumber: existing.questionNumber,
        part: existing.part,
        examYear: existing.exam.year,
        examType: existing.exam.examType,
      },
    });
  }

  return NextResponse.json({ success: true });
}
