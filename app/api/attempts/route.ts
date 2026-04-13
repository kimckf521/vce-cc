import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { createAttemptSchema, deleteAttemptSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`attempts:${user.id}`, { maxRequests: 60, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = createAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { questionId, status, bookmarked } = parsed.data;

  const attempt = await prisma.attempt.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    update: {
      ...(status !== undefined && { status }),
      ...(bookmarked !== undefined && { bookmarked }),
    },
    create: {
      userId: user.id,
      questionId,
      ...(status !== undefined && { status }),
      ...(bookmarked !== undefined && { bookmarked }),
    },
  });

  return NextResponse.json({ attempt });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`attempts:${user.id}`, { maxRequests: 60, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = deleteAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { questionId } = parsed.data;

  await prisma.attempt.deleteMany({
    where: { userId: user.id, questionId },
  });

  return NextResponse.json({ ok: true });
}
