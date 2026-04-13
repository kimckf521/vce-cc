import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
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

  // Check if this is a bookmark toggle
  const bm = bookmarkSchema.safeParse(body);
  if (bm.success) {
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
