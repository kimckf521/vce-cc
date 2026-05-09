import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { createAttemptSchema, deleteAttemptSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { hasActiveSubscription } from "@/lib/subscription";
import { isAdminRole } from "@/lib/utils";

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

  // Self-marking and bookmarking are paid-only. Admins and active subscribers
  // pass. Free users get a 403 — the client suppresses the call already, this
  // is the belt-and-braces enforcement.
  if (bookmarked !== undefined || status !== undefined) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = isAdminRole(dbUser?.role);
    if (!isAdmin && !(await hasActiveSubscription(user.id))) {
      return NextResponse.json(
        { error: "Progress tracking is part of the paid plan", code: "PAYWALL" },
        { status: 403 },
      );
    }
  }

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
