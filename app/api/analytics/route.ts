import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimited = rateLimit("analytics", { maxRequests: 30, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { event, properties, timestamp } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "Missing event name" }, { status: 400 });
    }

    // Log analytics events to server console
    // In production, forward to analytics service (PostHog, Mixpanel, etc.)
    console.log("[ANALYTICS]", {
      event,
      properties,
      timestamp,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
