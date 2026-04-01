import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`search:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const parsed = searchSchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
  }

  const { q, limit } = parsed.data;

  const questions = await prisma.question.findMany({
    where: {
      content: { contains: q, mode: "insensitive" },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      questionNumber: true,
      part: true,
      marks: true,
      content: true,
      difficulty: true,
      topic: { select: { name: true, slug: true } },
      exam: { select: { year: true, examType: true } },
      subtopics: { select: { name: true } },
    },
  });

  return NextResponse.json({ questions, total: questions.length });
}
