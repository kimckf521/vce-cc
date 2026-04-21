import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const sessionQuestionSchema = z.object({
  questionSetItemId: z.string().min(1),
  order: z.number().int().min(0),
  section: z.string().max(2).nullish(),
  selectedOption: z.string().max(2).nullish(),
  correct: z.boolean().nullish(),
});

const createSessionSchema = z.object({
  mode: z.string().min(1).max(50),
  totalQuestions: z.number().int().min(1).max(200),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  score: z.number().min(0).max(100),
  elapsedSeconds: z.number().int().min(0).nullish(),
  graded: z.boolean().optional(),
  /** Generated-set question IDs that were practiced (in display order). */
  questions: z.array(sessionQuestionSchema).max(200).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`exam-sessions:${user.id}`, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { questions, ...sessionData } = parsed.data;

  const session = await prisma.examSession.create({
    data: {
      userId: user.id,
      ...sessionData,
      elapsedSeconds: sessionData.elapsedSeconds ?? null,
      graded: sessionData.graded ?? true,
      ...(questions && questions.length > 0
        ? {
            questions: {
              create: questions.map((q) => ({
                questionSetItemId: q.questionSetItemId,
                order: q.order,
                section: q.section ?? null,
                selectedOption: q.selectedOption ?? null,
                correct: q.correct ?? null,
              })),
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ session });
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`exam-sessions-read:${user.id}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const sessions = await prisma.examSession.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ sessions });
}
