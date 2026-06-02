import Stripe from "stripe";

// Singleton Stripe client. The secret key is read lazily so that importing this
// module never crashes at build time if env vars are missing — it only throws
// when you actually try to use the client.
//
// Pricing config (plan keys, price IDs, subject mappings) lives in
// lib/pricing-catalog.ts. This module only owns the Stripe SDK init.

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local (use sk_test_... for test mode)."
    );
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: "2024-11-20.acacia",
    typescript: true,
    appInfo: {
      name: "ATAR Hero",
      version: "1.0.0",
    },
  });

  return _stripe;
}
