import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
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
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not provisioned." },
      { status: 400 }
    );
  }

  // Resolve a usable Stripe customer ID, self-healing if the stored ID is
  // stale (e.g. from a different Stripe environment).
  const customerId = await getOrCreateStripeCustomer(dbUser);

  const origin =
    request.headers.get("origin") ??
    request.nextUrl.origin ??
    "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
