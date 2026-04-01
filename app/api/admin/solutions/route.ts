import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const updateSolutionSchema = z.object({
  questionId: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().nullish(),
  videoUrl: z.string().nullish(),
});

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-solutions:${user.id}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSolutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { questionId, content, imageUrl, videoUrl } = parsed.data;

  const solution = await prisma.solution.upsert({
    where: { questionId },
    update: { content, imageUrl: imageUrl ?? null, videoUrl: videoUrl ?? null },
    create: { questionId, content, imageUrl: imageUrl ?? null, videoUrl: videoUrl ?? null },
  });

  return NextResponse.json({ solution });
}
