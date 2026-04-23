import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(200),
  message: z.string().trim().min(10, "Please write a longer message").max(5000, "Message is too long"),
  // Honeypot — bots tend to fill every field. We accept any value here
  // and silently drop the submission below if it's non-empty.
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit by IP — anyone (logged-out included) can submit.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon";
  const limited = rateLimit(`contact:${ip}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 }); // 5 / hour / IP
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Silently drop honeypot hits — they're bots.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ ok: true });
}
