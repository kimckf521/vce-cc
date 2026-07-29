import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const updateSchema = z
  .object({
    /** Top-level marks earned for the question (used when no sub-parts). */
    marksEarned: z.number().int().min(0).nullable().optional(),
    /**
     * Per-sub-part marks. When provided, `marksEarned` is derived from
     * the sum of defined values (nulls are treated as "not marked yet").
     * Shape: `{ "a": 2, "b": null, "c": 1 }`.
     */
    subPartMarks: z
      .record(z.string(), z.number().int().min(0).nullable())
      .optional(),
  })
  .refine(
    (v) => v.marksEarned !== undefined || v.subPartMarks !== undefined,
    "Either marksEarned or subPartMarks must be provided"
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`exam-session-question-update:${user.id}`, {
    maxRequests: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id: sessionId, questionId } = await params;

  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const question = await prisma.examSessionQuestion.findUnique({
    where: { id: questionId },
    include: { questionSetItem: { select: { marks: true } } },
  });
  if (!question || question.examSessionId !== sessionId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data: {
    marksEarned?: number | null;
    subPartMarks?: Record<string, number | null>;
  } = {};

  if (parsed.data.subPartMarks !== undefined) {
    data.subPartMarks = parsed.data.subPartMarks;
    // Derive top-level marksEarned from sub-part sum. If ALL sub-parts
    // are null, marksEarned is null (still not marked). Otherwise, sum
    // the non-null values.
    const values = Object.values(parsed.data.subPartMarks);
    const anyDefined = values.some((v) => v !== null);
    data.marksEarned = anyDefined
      ? values.reduce((sum: number, v) => sum + (v ?? 0), 0)
      : null;
  } else if (parsed.data.marksEarned !== undefined) {
    // Cap to the question's max marks
    const v = parsed.data.marksEarned;
    data.marksEarned = v === null ? null : Math.min(v, question.questionSetItem.marks);
    // Clear sub-part marks — user is setting the total directly
    data.subPartMarks = undefined as unknown as Record<string, number | null>;
  }

  await prisma.examSessionQuestion.update({
    where: { id: questionId },
    data: data as never,
  });

  // Recompute session-level stats only when ALL questions have marks
  const allQuestions = await prisma.examSessionQuestion.findMany({
    where: { examSessionId: sessionId },
    include: { questionSetItem: { select: { marks: true } } },
  });

  // A row only counts as fully marked when every sub-part is marked —
  // derived marksEarned goes non-null as soon as ANY sub-part is marked,
  // so checking it alone would stamp graded:true on half-marked questions.
  const allMarked = allQuestions.every((q) => {
    if (q.marksEarned === null) return false;
    const sub = q.subPartMarks as Record<string, number | null> | null;
    return sub == null || Object.values(sub).every((v) => v !== null);
  });
  const totalMarks = allQuestions.reduce(
    (sum, q) => sum + q.questionSetItem.marks,
    0
  );
  const earnedMarks = allQuestions.reduce(
    (sum, q) => sum + (q.marksEarned ?? 0),
    0
  );

  if (allMarked) {
    const score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
    await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        score,
        correctCount: earnedMarks,
        incorrectCount: totalMarks - earnedMarks,
        graded: true,
      },
    });
    return NextResponse.json({
      success: true,
      allMarked: true,
      score,
      earnedMarks,
      totalMarks,
    });
  }

  return NextResponse.json({
    success: true,
    allMarked: false,
    earnedMarks,
    totalMarks,
  });
}
