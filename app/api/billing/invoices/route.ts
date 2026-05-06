import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { isResourceMissing } from "@/lib/stripe-customer";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/billing/invoices
 * Returns the authenticated user's invoice history from Stripe.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`billing-invoices:${ip}`, { maxRequests: 10 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ invoices: [], hasMore: false });
  }

  const stripe = getStripe();

  // Same self-healing pattern as /api/billing/details — if the customer ID
  // is stale, return an empty invoice list rather than 500.
  let result: Awaited<ReturnType<typeof stripe.invoices.list>>;
  try {
    result = await stripe.invoices.list({
      customer: dbUser.stripeCustomerId,
      limit: 10,
    });
  } catch (err) {
    if (isResourceMissing(err)) {
      console.warn(
        `[billing-invoices] Stale stripeCustomerId ${dbUser.stripeCustomerId} for user ${user.id}; returning empty list.`
      );
      return NextResponse.json({ invoices: [], hasMore: false });
    }
    throw err;
  }

  const invoices = result.data.map((inv) => {
    // Use the first line item's description as the product name
    const firstLine = inv.lines?.data?.[0];
    const productName = firstLine?.description ?? "Standard";

    return {
      id: inv.id,
      date: inv.created
        ? new Date(inv.created * 1000).toISOString()
        : null,
      amount: inv.amount_paid ?? inv.total ?? 0,
      currency: inv.currency ?? "aud",
      status: inv.status ?? "unknown",
      pdfUrl: inv.invoice_pdf ?? null,
      hostedUrl: inv.hosted_invoice_url ?? null,
      productName,
    };
  });

  return NextResponse.json({ invoices, hasMore: result.has_more });
}
