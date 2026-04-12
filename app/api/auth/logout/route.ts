import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Server-side logout: clears the Prisma `activeSessionId`, signs out of
 * Supabase Auth, and deletes the `vce_sid` cookie. The client should call
 * this instead of running `supabase.auth.signOut()` directly so that the
 * DB-side session record is reset at the same time.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { activeSessionId: null },
    }).catch(() => {
      // User row may not exist yet (e.g. signup mid-flight). Safe to ignore.
    });
    await supabase.auth.signOut();
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
