import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { isResourceMissing } from "@/lib/stripe-customer";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/billing/details
 * Returns the authenticated user's subscription details and payment method
 * from Stripe. Used by the in-app billing page.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`billing-details:${ip}`, { maxRequests: 10 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ subscription: null, paymentMethod: null });
  }

  const stripe = getStripe();

  // Fetch the most recent subscription for this customer, expanding the
  // default payment method so we can show card details.
  // If the stored stripeCustomerId is stale (different Stripe environment,
  // deleted in dashboard, etc.), Stripe returns resource_missing — treat that
  // as "no subscription" so the UI shows the upgrade CTA instead of a 500.
  let subscriptions: Awaited<ReturnType<typeof stripe.subscriptions.list>>;
  try {
    subscriptions = await stripe.subscriptions.list({
      customer: dbUser.stripeCustomerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });
  } catch (err) {
    if (isResourceMissing(err)) {
      console.warn(
        `[billing-details] Stale stripeCustomerId ${dbUser.stripeCustomerId} for user ${user.id}; returning empty billing.`
      );
      return NextResponse.json({ subscription: null, paymentMethod: null });
    }
    throw err;
  }

  const sub = subscriptions.data[0] ?? null;

  let subscription = null;
  let paymentMethod = null;

  if (sub) {
    const firstItem = sub.items.data[0];
    const price = firstItem?.price;

    subscription = {
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelAt: sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toISOString()
        : null,
      planName: "Standard",
      priceAmount: price?.unit_amount ?? 0,
      priceCurrency: price?.currency ?? "aud",
      priceInterval: price?.recurring?.interval ?? "month",
    };

    // Extract payment method from expanded field
    const pm = sub.default_payment_method;
    if (pm && typeof pm === "object" && "card" in pm && pm.card) {
      paymentMethod = {
        brand: pm.card.brand ?? "card",
        last4: pm.card.last4 ?? "****",
        expMonth: pm.card.exp_month ?? 0,
        expYear: pm.card.exp_year ?? 0,
      };
    }
  }

  // Fetch the customer for balance info (and fallback payment method).
  // Stripe customer.balance is in cents:
  //   negative → customer credit (auto-applied to next invoice)
  //   positive → customer owes additional amount
  // We surface only the credit side here.
  let accountCreditCents = 0;
  try {
    const customer = await stripe.customers.retrieve(dbUser.stripeCustomerId, {
      expand: ["invoice_settings.default_payment_method"],
    });
    if (!customer.deleted) {
      if (typeof customer.balance === "number" && customer.balance < 0) {
        accountCreditCents = Math.abs(customer.balance);
      }
      // Fallback payment method from customer if subscription didn't provide one
      if (!paymentMethod) {
        const pm = customer.invoice_settings?.default_payment_method;
        if (pm && typeof pm === "object" && "card" in pm && pm.card) {
          paymentMethod = {
            brand: pm.card.brand ?? "card",
            last4: pm.card.last4 ?? "****",
            expMonth: pm.card.exp_month ?? 0,
            expYear: pm.card.exp_year ?? 0,
          };
        }
      }
    }
  } catch {
    // Non-critical — just won't show payment method or credit
  }

  return NextResponse.json({ subscription, paymentMethod, accountCreditCents });
}
