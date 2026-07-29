import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const updateSchema = z.object({
  score: z.number().min(0).max(100),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  /**
   * Explicit finalise flag. Omitted on running (debounced) score updates so
   * a half-marked session is never stamped as graded; "Finish marking"
   * flows that have verified completeness client-side may pass true.
   */
  graded: z.boolean().optional(),
});

/**
 * Returns the session with its per-question manifest. Exam wrappers call
 * this after creating a session to map each QuestionSetItem to its
 * ExamSessionQuestion row id, which the per-question PATCH
 * (/questions/[questionId]) is keyed by.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`exam-session-detail:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;

  const session = await prisma.examSession.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          questionSetItemId: true,
          order: true,
          groupIndex: true,
          section: true,
          marksEarned: true,
          subPartMarks: true,
        },
      },
    },
  });
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`exam-sessions-update:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;

  const session = await prisma.examSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) {
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

  // Derive `graded` instead of forcing it true (a half-marked session must
  // not present as fully graded):
  //   - An explicit body flag wins — sent by "Finish marking" flows that
  //     have verified completeness client-side.
  //   - Sessions WITH a question manifest mirror the per-question route's
  //     completeness rule: graded only once every question carries a mark
  //     (self-marked `marksEarned` or auto-graded MCQ `correct`). An
  //     already-graded session is never downgraded by a score edit.
  //   - Legacy sessions WITHOUT a manifest keep the old behaviour — a
  //     manual score edit is their only grading path, so it finalises.
  let graded: boolean;
  if (parsed.data.graded !== undefined) {
    graded = parsed.data.graded;
  } else {
    const questions = await prisma.examSessionQuestion.findMany({
      where: { examSessionId: id },
      select: { marksEarned: true, correct: true, subPartMarks: true },
    });
    // A self-marked row is complete only when every sub-part is marked —
    // derived marksEarned goes non-null once ANY sub-part is marked, so
    // checking it alone would treat half-marked questions as done.
    const rowComplete = (q: (typeof questions)[number]) => {
      if (q.correct !== null) return true;
      if (q.marksEarned === null) return false;
      const sub = q.subPartMarks as Record<string, number | null> | null;
      return sub == null || Object.values(sub).every((v) => v !== null);
    };
    graded =
      questions.length === 0
        ? true
        : session.graded || questions.every(rowComplete);
  }

  const updated = await prisma.examSession.update({
    where: { id },
    data: {
      score: parsed.data.score,
      correctCount: parsed.data.correctCount,
      incorrectCount: parsed.data.incorrectCount,
      graded,
    },
  });

  return NextResponse.json({ session: updated });
}
