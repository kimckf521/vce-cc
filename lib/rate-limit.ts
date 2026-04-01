import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter.
 * Returns null if allowed, or a NextResponse 429 if rate-limited.
 */
export function rateLimit(
  identifier: string,
  { maxRequests = 30, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null;
}
