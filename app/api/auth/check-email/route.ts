import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Pre-signup email-existence check. Called from the signup form before
 * `supabase.auth.signUp` so the user gets a clear "already registered" error
 * instead of Supabase's silent "Check your email" anti-enumeration response
 * when email confirmation is on.
 *
 * Trade-off: this *does* expose whether an email is registered, which is the
 * exact thing Supabase's silent flow tries to hide. We accept that for UX —
 * the alternative (silent magic link) confuses far more legitimate users than
 * it stops scrapers — but we rate-limit by IP to make bulk enumeration slow.
 */

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const limited = rateLimit(`check-email:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Lowercase for the lookup — Supabase stores emails lowercased and the
  // Prisma User table inherits that via the sync-user upsert. Compare in the
  // same shape so "Foo@x.com" and "foo@x.com" don't both register.
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return NextResponse.json({ exists: !!existing });
}
