import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId, status } = await req.json();
  if (!questionId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const attempt = await prisma.attempt.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    update: { status },
    create: { userId: user.id, questionId, status },
  });

  return NextResponse.json({ attempt });
}
