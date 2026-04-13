import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const updateSchema = z.object({
  score: z.number().min(0).max(100),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
});

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

  const updated = await prisma.examSession.update({
    where: { id },
    data: {
      score: parsed.data.score,
      correctCount: parsed.data.correctCount,
      incorrectCount: parsed.data.incorrectCount,
      graded: true,
    },
  });

  return NextResponse.json({ session: updated });
}
