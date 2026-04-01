import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimited = rateLimit("error-report", { maxRequests: 10, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { message, stack, componentStack, url, timestamp } = body;

    // Log to server console for monitoring/alerting
    console.error("[CLIENT ERROR]", {
      message,
      url,
      timestamp,
      stack: stack?.slice(0, 500),
      componentStack: componentStack?.slice(0, 500),
    });

    // In production, forward to external monitoring service:
    // await fetch("https://sentry.io/api/...", { ... })
    // await fetch("https://api.logflare.app/...", { ... })

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
