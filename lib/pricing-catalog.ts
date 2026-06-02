/**
 * Single source of truth for billing plans.
 *
 * Each plan key maps a Stripe Price ID to the list of subject slugs it
 * unlocks. The webhook reads `subscription.metadata.subjectSlugs` to know
 * which enrolment rows to grant; the checkout route writes that metadata
 * when creating a Subscription.
 *
 * Adding a new plan (e.g. when VCE Sciences ships) is one entry here +
 * one Stripe Price in the dashboard + one env var. No code path changes.
 *
 * Slug strings must match the `Subject.slug` values seeded in the DB
 * (see scripts/seed-*.ts).
 */

export type PlanKey = "vceMaths";

export type PlanCatalogEntry = {
  /** Env var name holding the Stripe Price ID for this plan. */
  envKey: string;
  /** Subject slugs unlocked by this plan. */
  subjectSlugs: readonly string[];
  /** User-facing display name (pricing page, receipts, emails). */
  displayName: string;
  /** Monthly price in cents — display only; Stripe is the source of truth. */
  amountCents: number;
};

export const PRICE_CATALOG: Record<PlanKey, PlanCatalogEntry> = {
  vceMaths: {
    envKey: "STRIPE_PRICE_VCE_MATHS",
    subjectSlugs: [
      "mathematical-methods",
      "vce-specialist",
      "vce-foundation",
      "vce-general",
    ],
    displayName: "VCE Maths",
    amountCents: 999,
  },
};

/**
 * Resolve a plan's Stripe Price ID from its env var.
 * Throws if the env var is unset — fail fast at use, not at module import.
 */
export function getPlanPriceId(planKey: PlanKey): string {
  const entry = PRICE_CATALOG[planKey];
  const priceId = process.env[entry.envKey];
  if (!priceId) {
    throw new Error(
      `${entry.envKey} is not set. Add it to .env.local (Stripe price ID for "${entry.displayName}").`
    );
  }
  return priceId;
}

/**
 * Reverse lookup: given a Stripe Price ID (from a webhook event), find the
 * catalog entry it corresponds to. Used by the webhook as a fallback when
 * subscription.metadata.subjectSlugs is missing — derive the slugs from
 * the priceId so older subs without the new metadata still resolve.
 */
export function getPlanByPriceId(
  priceId: string
): { key: PlanKey; entry: PlanCatalogEntry } | null {
  for (const [key, entry] of Object.entries(PRICE_CATALOG) as [
    PlanKey,
    PlanCatalogEntry,
  ][]) {
    if (process.env[entry.envKey] === priceId) {
      return { key, entry };
    }
  }
  return null;
}

/**
 * Map from subject slug to display name. Used by the webhook's ensureSubject
 * loop when creating Subject rows defensively — keeps slugs and display
 * names colocated so the catalog file is the only place to touch when adding
 * a subject.
 *
 * Keep in sync with scripts/seed-{methods,specialist,foundation,general}.ts.
 */
export const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  "mathematical-methods": "VCE Mathematical Methods",
  "vce-specialist": "VCE Specialist Mathematics",
  "vce-foundation": "VCE Foundation Mathematics",
  "vce-general": "VCE General Mathematics",
};
