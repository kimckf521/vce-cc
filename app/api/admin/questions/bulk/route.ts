import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const questionSchema = z.object({
  examId: z.string().min(1),
  topicId: z.string().min(1),
  subtopicIds: z.array(z.string().min(1)).optional().default([]),
  questionNumber: z.coerce.number().int().min(1),
  part: z.string().nullish(),
  marks: z.coerce.number().int().min(1).max(20),
  content: z.string().min(1),
  imageUrl: z.string().nullish(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  solution: z
    .object({
      content: z.string().min(1),
      imageUrl: z.string().nullish(),
      videoUrl: z.string().nullish(),
    })
    .nullish(),
});

const bulkSchema = z.object({
  questions: z.array(questionSchema).min(1).max(200),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-bulk:${user.id}`, { maxRequests: 5, windowMs: 60_000 });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const results: { index: number; id?: string; error?: string }[] = [];

  for (let i = 0; i < parsed.data.questions.length; i++) {
    const q = parsed.data.questions[i];
    try {
      const question = await prisma.question.create({
        data: {
          examId: q.examId,
          topicId: q.topicId,
          ...(q.subtopicIds.length > 0 && { subtopics: { connect: q.subtopicIds.map((id) => ({ id })) } }),
          questionNumber: q.questionNumber,
          part: q.part ?? null,
          marks: q.marks,
          content: q.content,
          imageUrl: q.imageUrl ?? null,
          difficulty: q.difficulty,
          ...(q.solution?.content && {
            solution: {
              create: {
                content: q.solution.content,
                imageUrl: q.solution.imageUrl ?? null,
                videoUrl: q.solution.videoUrl ?? null,
              },
            },
          }),
        },
      });
      results.push({ index: i, id: question.id });
    } catch (err) {
      results.push({ index: i, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  const created = results.filter((r) => r.id).length;
  const failed = results.filter((r) => r.error).length;

  return NextResponse.json({ created, failed, results });
}
