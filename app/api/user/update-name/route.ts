import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateNameSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;
  // Still need raw supabase client to update auth user metadata below
  const supabase = await createClient();

  const limited = rateLimit(`update-name:${user.id}`, { maxRequests: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = updateNameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input" }, { status: 400 });
  }

  const { name } = parsed.data;

  // Update Prisma User table
  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  // Also update Supabase auth metadata
  await supabase.auth.updateUser({ data: { name } });

  return NextResponse.json({ ok: true, name });
}
