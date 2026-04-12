import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { practiceQuerySchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { canAccessFeature } from "@/lib/subscription";
import { isAdminRole } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`practice:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  // Auth + paid-feature gate. Defence in depth — page-level layout already
  // shows a paywall, but a free user calling this endpoint directly should
  // also be rejected.
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;
  if (!isAdminRole(auth.dbUser.role)) {
    const access = await canAccessFeature(user.id, "practice");
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Practice mode requires a paid subscription." },
        { status: 403 }
      );
    }
  }

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
    exam: { year: { not: 9999 } },
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
    const weakAttempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        status: { in: ["INCORRECT", "NEEDS_REVIEW"] },
      },
      select: { questionId: true },
    });
    weakQuestionIds = new Set(weakAttempts.map((a) => a.questionId));
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
