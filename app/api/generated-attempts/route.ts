import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { hasActiveSubscription } from "@/lib/subscription";
import { isAdminRole } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  questionSetItemId: z.string().min(1),
  status: z.enum(["ATTEMPTED", "CORRECT", "INCORRECT", "NEEDS_REVIEW"]),
});

const deleteSchema = z.object({
  questionSetItemId: z.string().min(1),
});

const bookmarkSchema = z.object({
  questionSetItemId: z.string().min(1),
  bookmarked: z.boolean(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`gen-attempts:${user.id}`, { maxRequests: 60, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();

  // Self-marking and bookmarking are paid-only. Admins and active subscribers
  // pass; everyone else gets a 403 — the client UI suppresses the call already
  // for free users, this is the server-side belt-and-braces.
  async function ensurePaid() {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = isAdminRole(dbUser?.role);
    if (isAdmin) return null;
    if (await hasActiveSubscription(user.id)) return null;
    return NextResponse.json(
      { error: "Progress tracking is part of the paid plan", code: "PAYWALL" },
      { status: 403 },
    );
  }

  // Bookmark toggle.
  const bm = bookmarkSchema.safeParse(body);
  if (bm.success) {
    const denied = await ensurePaid();
    if (denied) return denied;
    const { questionSetItemId, bookmarked } = bm.data;
    const attempt = await prisma.questionSetAttempt.upsert({
      where: { userId_questionSetItemId: { userId: user.id, questionSetItemId } },
      update: { bookmarked },
      create: { userId: user.id, questionSetItemId, bookmarked },
    });
    return NextResponse.json({ attempt });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const denied = await ensurePaid();
  if (denied) return denied;

  const { questionSetItemId, status } = parsed.data;

  const attempt = await prisma.questionSetAttempt.upsert({
    where: { userId_questionSetItemId: { userId: user.id, questionSetItemId } },
    update: { status },
    create: { userId: user.id, questionSetItemId, status },
  });

  return NextResponse.json({ attempt });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`gen-attempts:${user.id}`, { maxRequests: 60, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { questionSetItemId } = parsed.data;

  await prisma.questionSetAttempt.deleteMany({
    where: { userId: user.id, questionSetItemId },
  });

  return NextResponse.json({ ok: true });
}
