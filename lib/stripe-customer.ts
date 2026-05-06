import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type DbUser = {
  id: string;
  email: string;
  name?: string | null;
  stripeCustomerId: string | null;
};

/**
 * Resolve a usable Stripe customer ID for the given user, creating one if
 * necessary. Self-healing — if `dbUser.stripeCustomerId` is set but Stripe
 * doesn't recognise it (deleted, or from a different Stripe environment),
 * the stale ID is replaced with a freshly created one.
 *
 * Always returns a valid customer ID that exists in the currently-configured
 * Stripe account, and persists the ID to the User row before returning.
 *
 * Throws on non-recoverable Stripe errors (network, auth, etc.) so callers
 * don't silently swallow real outages.
 */
export async function getOrCreateStripeCustomer(dbUser: DbUser): Promise<string> {
  const stripe = getStripe();

  if (dbUser.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(dbUser.stripeCustomerId);
      if (!existing.deleted) {
        return existing.id;
      }
      // Customer was deleted in Stripe — fall through to create a new one
    } catch (err) {
      if (!isResourceMissing(err)) {
        throw err;
      }
      // resource_missing → stale ID (e.g. from a previous Stripe environment).
      // Fall through and create a fresh customer.
      console.warn(
        `[stripe-customer] Stale stripeCustomerId ${dbUser.stripeCustomerId} for user ${dbUser.id}; creating fresh customer.`
      );
    }
  }

  const customer = await stripe.customers.create({
    email: dbUser.email,
    name: dbUser.name ?? undefined,
    metadata: { userId: dbUser.id },
  });

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Type guard for Stripe's `resource_missing` error code, which Stripe returns
 * when a referenced object (customer, subscription, etc.) doesn't exist in
 * the current account.
 */
export function isResourceMissing(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "resource_missing"
  );
}

// Re-exported for convenience so callers don't need a separate import.
export type { Stripe };
