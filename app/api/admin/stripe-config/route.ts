import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";

/**
 * GET /api/admin/stripe-config
 *
 * Admin-only diagnostic. Reports the *mode* (test vs live) of every
 * Stripe-related env var without exposing the secrets, and verifies the
 * configured price ID actually exists in the keyset.
 *
 * Use this to sanity-check the production env after switching from
 * sandbox to live, or whenever billing breaks unexpectedly.
 */
export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const priceId = process.env.STRIPE_PRICE_VCE_MATHS ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  function modeOf(key: string): "live" | "test" | "missing" | "unknown" {
    if (!key) return "missing";
    if (key.includes("_live_")) return "live";
    if (key.includes("_test_")) return "test";
    return "unknown";
  }

  const config = {
    STRIPE_SECRET_KEY: {
      mode: modeOf(secretKey),
      prefix: secretKey ? secretKey.slice(0, 8) + "…" : null,
    },
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      mode: modeOf(publishableKey),
      prefix: publishableKey ? publishableKey.slice(0, 8) + "…" : null,
    },
    STRIPE_PRICE_VCE_MATHS: {
      // Price IDs don't carry a test/live marker — verified by API call below.
      value: priceId || null,
      verified: false as boolean,
      verifyError: null as string | null,
    },
    STRIPE_WEBHOOK_SECRET: {
      // whsec_ for both modes; we just check it's set and starts with whsec_.
      set: Boolean(webhookSecret),
      validShape: webhookSecret.startsWith("whsec_"),
    },
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };

  // Try to retrieve the price using the configured secret key. If the
  // price is from a different mode than the secret key, this throws.
  if (priceId && secretKey) {
    try {
      const stripe = getStripe();
      const price = await stripe.prices.retrieve(priceId);
      config.STRIPE_PRICE_VCE_MATHS.verified = true;
      (config.STRIPE_PRICE_VCE_MATHS as Record<string, unknown>).priceMode =
        price.livemode ? "live" : "test";
      (config.STRIPE_PRICE_VCE_MATHS as Record<string, unknown>).active =
        price.active;
      (config.STRIPE_PRICE_VCE_MATHS as Record<string, unknown>).currency =
        price.currency;
      (config.STRIPE_PRICE_VCE_MATHS as Record<string, unknown>).amount =
        price.unit_amount;
    } catch (err) {
      config.STRIPE_PRICE_VCE_MATHS.verifyError =
        err instanceof Error ? err.message : "Unknown error";
    }
  }

  // Mismatch detection: secret + publishable + price should all be in the
  // same mode. If any disagree, billing will fail at checkout time.
  const modes = [
    config.STRIPE_SECRET_KEY.mode,
    config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.mode,
  ].filter((m) => m === "live" || m === "test");
  const allSameMode = modes.length > 0 && modes.every((m) => m === modes[0]);

  return NextResponse.json({
    config,
    summary: {
      allKeysInSameMode: allSameMode,
      mode: allSameMode ? modes[0] : "MISMATCH",
      priceMatchesKeys:
        config.STRIPE_PRICE_VCE_MATHS.verified === true &&
        allSameMode &&
        (config.STRIPE_PRICE_VCE_MATHS as Record<string, unknown>)
          .priceMode === modes[0],
    },
  });
}
