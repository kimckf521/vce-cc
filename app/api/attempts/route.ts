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

  const update: Record<string, unknown> = {};
  const create: Record<string, unknown> = { userId: user.id, questionId };

  if (status !== undefined) {
    update.status = status;
    create.status = status;
  }
  if (bookmarked !== undefined) {
    update.bookmarked = bookmarked;
    create.bookmarked = bookmarked;
  }

  const attempt = await prisma.attempt.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    update,
    create,
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
