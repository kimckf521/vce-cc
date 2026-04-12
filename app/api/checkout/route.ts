import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, getStandardPriceId } from "@/lib/stripe";
import { ensureMathMethodsSubject } from "@/lib/subscription";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for the Mathematical Methods Standard plan
 * and returns the checkout URL. The frontend redirects the user to this URL.
 *
 * Requires an authenticated user. Creates a Stripe customer on first call
 * and stores the ID on the User record for reuse.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`checkout:${ip}`, { maxRequests: 10 });
  if (limited) return limited;

  // Auth
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  // Make sure the DB user row exists and fetch the Stripe customer ID if any
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? "",
    },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
    },
  });

  // Make sure the Subject row for Mathematical Methods exists
  await ensureMathMethodsSubject();

  const stripe = getStripe();

  // Create or reuse the Stripe customer
  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name ?? undefined,
      metadata: {
        userId: dbUser.id,
      },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Build success/cancel URLs from the request origin
  const origin =
    request.headers.get("origin") ??
    request.nextUrl.origin ??
    "http://localhost:3000";

  // Create the Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: getStandardPriceId(),
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    subscription_data: {
      metadata: {
        userId: dbUser.id,
        subjectSlug: "mathematical-methods",
      },
    },
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
