import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Password reset flow — redirect to set new password
      const type = searchParams.get("type");
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Normal signup confirmation — upsert user into our Prisma DB
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {},
        create: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name ?? null,
        },
      });

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
