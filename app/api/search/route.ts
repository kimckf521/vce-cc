import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuthenticatedUser } from "@/lib/auth";
import { canAccessFeature } from "@/lib/subscription";
import { isAdminRole } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limited = rateLimit(`search:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  // Search is a paid feature. Defence in depth — page-level layout already
  // shows a paywall, but a free user calling this endpoint directly should
  // also be rejected.
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;
  if (!isAdminRole(auth.dbUser.role)) {
    const access = await canAccessFeature(user.id, "search");
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Search requires a paid subscription." },
        { status: 403 }
      );
    }
  }

  const { searchParams } = req.nextUrl;
  const parsed = searchSchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
  }

  const { q, limit } = parsed.data;

  // Split query into individual terms for partial matching.
  // "solution 2^x 16" → each term must appear somewhere in the content (any order).
  const terms = q.split(/\s+/).filter((t) => t.length > 0);

  // Build a raw SQL AND clause: every term must match the $-stripped content.
  // This handles both LaTeX delimiters and multi-word partial matching.
  const termConditions = terms.map(
    (term) => Prisma.sql`LOWER(REPLACE(q.content, '$', '')) LIKE LOWER(${`%${term}%`})`
  );
  const contentWhereClause =
    termConditions.length > 0
      ? Prisma.join(termConditions, " AND ")
      : Prisma.sql`TRUE`;

  const contentMatches = await prisma.$queryRaw<{ id: string }[]>`
    SELECT q.id FROM "Question" q
    JOIN "Exam" e ON e.id = q."examId"
    WHERE e.year != 9999
    AND ${contentWhereClause}
  `;
  const contentIds = contentMatches.map((r) => r.id);

  // Build OR conditions: content matches, topic name, subtopic name, year, exam type
  const orConditions: Record<string, unknown>[] = [];
  if (contentIds.length > 0) {
    orConditions.push({ id: { in: contentIds } });
  }
  orConditions.push(
    { topic: { name: { contains: q, mode: "insensitive" } } },
    { subtopics: { some: { name: { contains: q, mode: "insensitive" } } } },
  );

  // If query looks like a year (4 digits), also match exam year
  const yearMatch = q.match(/^(\d{4})$/);
  if (yearMatch) {
    orConditions.push({ exam: { year: parseInt(yearMatch[1]) } });
  }

  // If query matches "exam 1" or "exam 2" pattern, filter by exam type
  const examMatch = q.match(/exam\s*([12])/i);
  if (examMatch) {
    orConditions.push({
      exam: { examType: examMatch[1] === "1" ? "EXAM_1" : "EXAM_2" },
    });
  }

  const where = {
    exam: { year: { not: 9999 } },
    OR: orConditions,
  };

  const [questions, totalCount] = await Promise.all([
    prisma.question.findMany({
      where,
      take: limit,
      orderBy: [
        { exam: { year: "desc" } },
        { questionNumber: "asc" },
      ],
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
    }),
    prisma.question.count({ where }),
  ]);

  return NextResponse.json({ questions, total: totalCount });
}
