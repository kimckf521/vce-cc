/**
 * Site-wide constants for SEO / structured data.
 *
 * Single source of truth for the canonical site origin and brand name so that
 * JSON-LD `@id` references (e.g. `${SITE_URL}/#organization`) resolve to the
 * Organization + WebSite nodes declared in `app/layout.tsx` regardless of the
 * deploy environment (prod / preview / local).
 *
 * Previously several pages hardcoded `https://www.atarhero.com.au` inside their
 * JSON-LD `@graph`. That breaks the graph in any environment where
 * `NEXT_PUBLIC_SITE_URL` differs from that exact string (e.g. the production
 * domain is registered without the `www.` host, or on Vercel preview URLs):
 * the `provider` / `isPartOf` / `about` references point at an `@id` that no
 * page actually defines, so Google sees orphaned nodes. Importing SITE_URL
 * from here keeps every reference internally consistent.
 *
 * `metadataBase` in the root layout already derives canonical/OG URLs from the
 * same env var, so page `alternates.canonical` and these JSON-LD URLs stay in
 * lockstep.
 */

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Fail the production build/boot loudly rather than silently emitting
// localhost canonicals, sitemap entries, OG URLs and JSON-LD @ids — a missing
// env var here would de-index the whole public surface.
if (!envSiteUrl && process.env.VERCEL_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set in production. Set it to the canonical origin (e.g. https://www.atarhero.com.au) — sitemap, robots, canonicals and JSON-LD all derive from it."
  );
}

export const SITE_URL = envSiteUrl ?? "http://localhost:3000";

export const SITE_NAME = "ATAR Hero";

/** Default Open Graph / social share image (1200×630). Lives in /public. */
export const OG_IMAGE_PATH = "/og-image.png";

/** Stable JSON-LD @id anchors for the Organization and WebSite nodes that the
 *  root layout (`app/layout.tsx`) declares. Reference these from per-page
 *  schema so the nodes are linked into one graph rather than duplicated. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
