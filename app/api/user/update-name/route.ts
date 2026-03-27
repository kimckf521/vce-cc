import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name } = await request.json();
  const trimmed = (name ?? "").trim();

  if (!trimmed) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  // Update Prisma User table
  await prisma.user.update({
    where: { id: user.id },
    data: { name: trimmed },
  });

  // Also update Supabase auth metadata
  await supabase.auth.updateUser({ data: { name: trimmed } });

  return NextResponse.json({ ok: true, name: trimmed });
}
