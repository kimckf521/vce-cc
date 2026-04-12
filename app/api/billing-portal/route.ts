import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/billing-portal
 * Creates a Stripe Billing Portal Session so a user can manage their
 * subscription (update card, view invoices, cancel, etc.).
 * Returns the portal URL — the frontend redirects the user to it.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`billing-portal:${ip}`, { maxRequests: 10 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Subscribe to a plan first." },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get("origin") ??
    request.nextUrl.origin ??
    "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${origin}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
