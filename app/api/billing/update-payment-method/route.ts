import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/billing/update-payment-method
 * Creates a scoped Stripe Billing Portal session that only shows the
 * payment method update flow. Returns the portal URL.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`billing-update-pm:${ip}`, { maxRequests: 5 });
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
      { error: "No billing account found." },
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
    flow_data: {
      type: "payment_method_update",
    },
  });

  return NextResponse.json({ url: session.url });
}
