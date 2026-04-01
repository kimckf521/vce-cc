import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { practiceQuerySchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`practice:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const parsed = practiceQuerySchema.safeParse({
    count: searchParams.get("count") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    topics: searchParams.get("topics") ?? undefined,
    weak: searchParams.get("weak") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { count, difficulty, topics, weak } = parsed.data;
  const topicIds = topics ? topics.split(",").filter(Boolean) : [];

  const where = {
    ...(topicIds.length > 0 && { topicId: { in: topicIds } }),
    ...(difficulty && difficulty !== "ALL" && { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" }),
  };

  // Get all candidate IDs (lightweight)
  const randomIds = await prisma.question.findMany({
    where,
    select: { id: true },
  });

  // When weak areas mode is enabled, fetch user's incorrect/needs_review question IDs
  // and give them 3x weight in the random sampling
  let weakQuestionIds = new Set<string>();
  if (weak === "1") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const weakAttempts = await prisma.attempt.findMany({
        where: {
          userId: user.id,
          status: { in: ["INCORRECT", "NEEDS_REVIEW"] },
        },
        select: { questionId: true },
      });
      weakQuestionIds = new Set(weakAttempts.map((a) => a.questionId));
    }
  }

  // Sample with weighted randomness: weak questions get 3x weight
  const sampled = randomIds
    .map((q) => ({
      id: q.id,
      sort: Math.random() / (weakQuestionIds.has(q.id) ? 3 : 1),
    }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, count)
    .map((q) => q.id);

  // Fetch full data only for the sampled questions
  const questions = await prisma.question.findMany({
    where: { id: { in: sampled } },
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      subtopics: { select: { name: true } },
      solution: { select: { content: true, videoUrl: true } },
    },
  });

  return NextResponse.json({ questions });
}
