import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`exam-complete:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const body = await req.json();
  const { examId, completed } = body;

  if (!examId || typeof completed !== "boolean") {
    return NextResponse.json({ error: "examId and completed required" }, { status: 400 });
  }

  if (completed) {
    await prisma.examCompletion.upsert({
      where: { userId_examId: { userId: user.id, examId } },
      update: {},
      create: { userId: user.id, examId },
    });
  } else {
    await prisma.examCompletion.deleteMany({
      where: { userId: user.id, examId },
    });
  }

  return NextResponse.json({ ok: true });
}
