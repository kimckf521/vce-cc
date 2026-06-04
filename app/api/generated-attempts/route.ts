import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { canAccessQuestionSetItem } from "@/lib/subscription";
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

  // "Save what you can access": marking/bookmarking is allowed iff the user can
  // access the item's topic (canAccessQuestionSetItem) — so free users save on
  // the free Algebra topic, paid users save everywhere, admins bypass. The
  // client already hides the buttons when locked; this is the server-side guard.
  async function ensureCanSave(questionSetItemId: string) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (isAdminRole(dbUser?.role)) return null;
    if (await canAccessQuestionSetItem(user.id, questionSetItemId)) return null;
    return NextResponse.json(
      { error: "Saving progress on this topic is part of the paid plan", code: "PAYWALL" },
      { status: 403 },
    );
  }

  // Bookmark toggle.
  const bm = bookmarkSchema.safeParse(body);
  if (bm.success) {
    const denied = await ensureCanSave(bm.data.questionSetItemId);
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

  const denied = await ensureCanSave(parsed.data.questionSetItemId);
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
