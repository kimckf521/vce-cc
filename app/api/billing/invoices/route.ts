import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
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

  const result = await stripe.invoices.list({
    customer: dbUser.stripeCustomerId,
    limit: 10,
  });

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
      productName,
    };
  });

  return NextResponse.json({ invoices, hasMore: result.has_more });
}
