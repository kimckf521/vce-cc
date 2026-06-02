/**
 * Curriculum context — single source of truth for "which curriculum slugs are
 * valid in `/[curriculum]/[subject]/...` URLs".
 *
 * Today: VCE only. HSC, QCE, WACE, SACE, TCE etc. land as additional entries
 * here once their content is seeded. Adding a curriculum is:
 *   1. Add its slug to KNOWN_CURRICULUM_SLUGS
 *   2. Insert a Curriculum row in the DB (slug must match)
 *   3. Add metadata to CURRICULA
 *   4. Seed subjects + content for that curriculum
 *
 * No code changes outside this file are required for routing — the
 * `[curriculum]/layout.tsx` reads from KNOWN_CURRICULUM_SLUGS.
 */

export const KNOWN_CURRICULUM_SLUGS = ["vce"] as const;

export const DEFAULT_CURRICULUM_SLUG: CurriculumSlug = "vce";

export type CurriculumSlug = (typeof KNOWN_CURRICULUM_SLUGS)[number];

export function isKnownCurriculum(slug: string): slug is CurriculumSlug {
  return (KNOWN_CURRICULUM_SLUGS as readonly string[]).includes(slug);
}

/**
 * UI metadata for each curriculum — display names + availability flag for
 * coming-soon greyed-out states in the curriculum picker.
 */
export interface CurriculumMetadata {
  slug: CurriculumSlug;
  displayName: string;
  shortName: string;
  /** Whether the curriculum is live (has seeded content + active subjects). */
  available: boolean;
}

export const CURRICULA: CurriculumMetadata[] = [
  {
    slug: "vce",
    displayName: "Victorian Certificate of Education",
    shortName: "VCE",
    available: true,
  },
];

/**
 * Coming-soon curricula shown greyed in the picker. Kept separate from
 * CURRICULA so KNOWN_CURRICULUM_SLUGS doesn't accidentally accept routes
 * for unlaunched curricula.
 */
export const COMING_SOON_CURRICULA: Pick<
  CurriculumMetadata,
  "displayName" | "shortName"
>[] = [
  { displayName: "Higher School Certificate", shortName: "HSC" },
  { displayName: "Queensland Certificate of Education", shortName: "QCE" },
  { displayName: "Western Australian Certificate of Education", shortName: "WACE" },
];

export function getCurriculumMetadata(
  slug: string
): CurriculumMetadata | undefined {
  return CURRICULA.find((c) => c.slug === slug);
}

/**
 * Cookie name where the user's last-chosen curriculum persists. Pages outside
 * the `[curriculum]/...` tree (Dashboard, Profile, etc.) read this cookie to
 * decide which curriculum-prefix to use for sidebar/Navbar links.
 *
 * Cookie value should always be a slug in KNOWN_CURRICULUM_SLUGS. Invalid or
 * missing → DEFAULT_CURRICULUM_SLUG.
 */
export const CURRICULUM_COOKIE = "vce_curriculum";

/**
 * Resolve the active curriculum for code paths outside the
 * `[curriculum]/...` route tree.
 *
 * Resolution order:
 *   1. Explicit `urlCurriculum` arg (e.g. extracted from a referer)
 *   2. (Future) `vce_curriculum` cookie set by the curriculum pill
 *   3. DEFAULT_CURRICULUM_SLUG
 */
export function getCurrentCurriculumSlug(
  urlCurriculum?: string
): CurriculumSlug {
  if (urlCurriculum && isKnownCurriculum(urlCurriculum)) return urlCurriculum;
  // TODO: read `vce_curriculum` cookie via next/headers and prefer it over
  // the default. Requires the curriculum-pill UI to be in place first.
  return DEFAULT_CURRICULUM_SLUG;
}
