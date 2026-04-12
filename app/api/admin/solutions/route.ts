import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";

const updateSolutionSchema = z.object({
  questionId: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().nullish(),
  videoUrl: z.string().nullish(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`admin-solutions:${user.id}`, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
