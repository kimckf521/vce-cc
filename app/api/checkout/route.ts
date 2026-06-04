import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { ensureSubjects } from "@/lib/subscription";
import { PRICE_CATALOG, getPlanPriceId, type PlanKey } from "@/lib/pricing-catalog";
import { rateLimit } from "@/lib/rate-limit";
import { ensureReferralCoupon } from "@/lib/affiliate";

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for the VCE Maths plan and returns the
 * checkout URL. The frontend redirects the user to this URL.
 *
 * Requires an authenticated user. Creates a Stripe customer on first call
 * and stores the ID on the User record for reuse.
 *
 * The whole body is wrapped so ANY failure returns a JSON error — never an
 * empty 500. Most common in production: the Stripe env vars
 * (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_VCE_MATHS`) aren't set on the host, so
 * `getStripe()` throws; previously that surfaced to the client as the cryptic
 * "Unexpected end of JSON input".
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

  try {
    // Resolve which plan the user is checking out for. Only "vceMaths" exists
    // today; the body param is optional + future-proof for additional plans.
    const body = (await request.json().catch(() => ({}))) as { planKey?: string };
    const planKey = (body.planKey ?? "vceMaths") as PlanKey;
    const plan = PRICE_CATALOG[planKey];
    if (!plan) {
      return NextResponse.json({ error: `Unknown plan: ${planKey}` }, { status: 400 });
    }

    // Make sure the DB user row exists and fetch the Stripe customer ID if any
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.email ?? "" },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
        referredByCode: true,
      },
    });

    // Make sure every Subject row for this plan exists (defensive).
    await ensureSubjects(plan.subjectSlugs);

    const stripe = getStripe();

    // Resolve a usable Stripe customer ID, self-healing if the stored ID is
    // stale (e.g. from a different Stripe environment after a project switch).
    const customerId = await getOrCreateStripeCustomer(dbUser);

    // Referred users get 50% off their first month.
    const isReferred = Boolean(dbUser.referredByCode);
    if (isReferred) {
      await ensureReferralCoupon();
    }

    // Build success/cancel URLs from the request origin
    const origin =
      request.headers.get("origin") ?? request.nextUrl.origin ?? "http://localhost:3000";

    // Stripe doesn't allow both `discounts` and `allow_promotion_codes`, so
    // referred users get the auto-applied coupon, others can enter promo codes.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: getPlanPriceId(planKey), quantity: 1 }],
      ...(isReferred
        ? { discounts: [{ coupon: "REFERRAL50" }] }
        : { allow_promotion_codes: true }),
      billing_address_collection: "auto",
      subscription_data: {
        metadata: {
          userId: dbUser.id,
          planKey,
          subjectSlugs: plan.subjectSlugs.join(","),
        },
      },
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Any failure (missing Stripe env vars, Stripe API rejection, DB issue)
    // returns JSON with the real message rather than an empty 500.
    const message = err instanceof Error ? err.message : "Unknown error";
    // eslint-disable-next-line no-console
    console.error("[checkout] failed. userId=%s message=%s full=%o", user.id, message, err);
    return NextResponse.json({ error: `Checkout failed: ${message}` }, { status: 500 });
  }
}
