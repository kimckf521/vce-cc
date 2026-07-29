import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import { addAssessmentItemSchema } from "@/lib/validations";
import {
  getOwnedAssessmentDetail,
  getOwnedAssessmentWithItemIds,
} from "@/lib/teacher-assessments";
import { getGeneratedQuestionSetId } from "@/lib/question-set-groups";

/**
 * POST /api/teacher/assessments/[id]/items — add one generated-bank question
 * to the paper, optionally at a specific position (default: end). Validates
 * APPROVED status, same subject, generated-bank membership (T1 pool rule)
 * and no duplicate before writing.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-items:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;
  const owned = await getOwnedAssessmentWithItemIds(id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = addAssessmentItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { questionSetItemId, position } = parsed.data;

  const qsi = await prisma.questionSetItem.findUnique({
    where: { id: questionSetItemId },
    select: {
      id: true,
      status: true,
      questionSet: { select: { id: true, subjectId: true } },
    },
  });
  if (!qsi) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  if (qsi.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Only approved questions can be added" },
      { status: 400 }
    );
  }
  if (qsi.questionSet.subjectId !== owned.subjectId) {
    return NextResponse.json(
      { error: "Question belongs to a different subject" },
      { status: 400 }
    );
  }
  // T1 pool rule: only the original generated bank feeds teacher papers.
  const generatedSetId = await getGeneratedQuestionSetId(owned.subjectSlug);
  if (!generatedSetId || qsi.questionSet.id !== generatedSetId) {
    return NextResponse.json(
      { error: "Question is not part of the question pool" },
      { status: 400 }
    );
  }
  if (owned.items.some((it) => it.questionSetItemId === questionSetItemId)) {
    return NextResponse.json(
      { error: "Question is already in this paper" },
      { status: 409 }
    );
  }

  // Clamp the insert position into [0, itemCount]; omitted → append.
  const insertAt = Math.min(position ?? owned.items.length, owned.items.length);

  try {
    await prisma.$transaction([
      // Shift everything at/after the slot down by one, keeping orders dense.
      prisma.assessmentItem.updateMany({
        where: { assessmentId: id, order: { gte: insertAt } },
        data: { order: { increment: 1 } },
      }),
      prisma.assessmentItem.create({
        data: { assessmentId: id, questionSetItemId, order: insertAt },
      }),
      // Item edits should surface in the "newest updatedAt first" list order.
      prisma.assessment.update({
        where: { id },
        data: { updatedAt: new Date() },
      }),
    ]);
  } catch (err) {
    // The @@unique([assessmentId, questionSetItemId]) constraint is the
    // backstop for concurrent adds that both pass the duplicate check above
    // (the check reads outside this transaction). Map it to the same 409.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Question is already in this paper" },
        { status: 409 }
      );
    }
    throw err;
  }

  const assessment = await getOwnedAssessmentDetail(id, user.id);
  return NextResponse.json({ assessment });
}
