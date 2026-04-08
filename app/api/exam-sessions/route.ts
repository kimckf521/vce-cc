import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createSessionSchema = z.object({
  mode: z.string().min(1).max(50),
  totalQuestions: z.number().int().min(1).max(200),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  score: z.number().min(0).max(100),
  elapsedSeconds: z.number().int().min(0).nullish(),
  graded: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`exam-sessions:${user.id}`, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const session = await prisma.examSession.create({
    data: {
      userId: user.id,
      ...parsed.data,
      elapsedSeconds: parsed.data.elapsedSeconds ?? null,
      graded: parsed.data.graded ?? true,
    },
  });

  return NextResponse.json({ session });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
