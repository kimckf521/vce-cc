import Stripe from "stripe";

// Singleton Stripe client. The secret key is read lazily so that importing this
// module never crashes at build time if env vars are missing — it only throws
// when you actually try to use the client.

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
      name: "VCE Methods",
      version: "1.0.0",
    },
  });

  return _stripe;
}

// The Mathematical Methods Standard plan price ID. Read from env so you can
// swap between test and live prices without code changes.
export function getStandardPriceId(): string {
  const priceId = process.env.STRIPE_STANDARD_PRICE_ID;
  if (!priceId) {
    throw new Error(
      "STRIPE_STANDARD_PRICE_ID is not set. Add it to .env.local."
    );
  }
  return priceId;
}

// Slug for the Mathematical Methods subject — the enrolment row that gets
// created/updated when a user subscribes to the Standard plan.
export const STANDARD_SUBJECT_SLUG = "mathematical-methods";
export const STANDARD_SUBJECT_NAME = "Mathematical Methods";
