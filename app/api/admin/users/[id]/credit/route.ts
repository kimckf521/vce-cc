import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { giveCreditSchema } from "@/lib/validations";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";

/**
 * POST /api/admin/users/[id]/credit
 * Super-admin only. Gifts platform credit to a user by pushing a negative
 * customer-balance transaction to Stripe. Stripe automatically applies the
 * credit to the user's next invoice (or stores it for future invoices if
 * they're not currently subscribed).
 *
 * If the user doesn't have a Stripe customer yet, one is created.
 *
 * Why super-admin only: this is a money-out operation; admins should not be
 * able to issue arbitrary credit unilaterally.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-credit:${ip}`, { maxRequests: 30 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  // Restrict to SUPER_ADMIN — credit issuance bypasses revenue controls.
  if (auth.dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Only super admins can issue credit" },
      { status: 403 }
    );
  }

  const { id: userId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = giveCreditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Convert dollars → cents. Positive input = add credit, negative = deduct.
  // Stripe convention: customer.balance is negative when they have credit, so
  // we flip the sign when creating the balance transaction.
  const amountCents = Math.round(parsed.data.amountDollars * 100);
  const isCredit = amountCents > 0;
  const action = isCredit ? "credit" : "deduction";

  const reason = parsed.data.reason?.trim();
  const description = reason
    ? `Admin ${action} — ${reason}`
    : `Admin ${action}`;

  // Resolve (or create) Stripe customer for this user
  const customerId = await getOrCreateStripeCustomer(targetUser);

  const stripe = getStripe();
  await stripe.customers.createBalanceTransaction(customerId, {
    amount: -amountCents,
    currency: "aud",
    description,
    metadata: {
      userId: targetUser.id,
      issuedBy: auth.dbUser.id,
      type: isCredit ? "ADMIN_GIFT" : "ADMIN_CLAWBACK",
    },
  });

  // Read the resulting balance so the UI can show the new total
  const updated = await stripe.customers.retrieve(customerId);
  const newBalance =
    !updated.deleted && typeof updated.balance === "number" ? updated.balance : 0;
  const newCreditCents = newBalance < 0 ? Math.abs(newBalance) : 0;

  console.log(
    `[admin-credit] Super admin ${auth.dbUser.id} ${action} ${Math.abs(amountCents)}c on user ${targetUser.email}; new credit=${newCreditCents}c`
  );

  return NextResponse.json({ ok: true, amountCents, newCreditCents });
}
