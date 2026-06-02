/**
 * Subject context — single source of truth for "which subject slugs are valid
 * inside the `[curriculum]/[subject]/...` route tree".
 *
 * B2 (current): URLs are curriculum-prefixed — `/vce/methods/topics/...`
 * resolves to params.curriculum = "vce" and params.subject = "methods".
 * Curriculum validation lives in `lib/curriculum-context.ts`; this file
 * owns the subject side.
 *
 * Pages outside the `[curriculum]/[subject]/...` tree (Dashboard, Navbar)
 * hardcode `DEFAULT_SUBJECT_SLUG` for now — a future batch will add a
 * cookie-backed subject picker so the user can switch contexts.
 *
 * Adding a new subject:
 *   1. Add its short URL slug here (e.g. "specialist")
 *   2. Insert a Subject row in the DB (DB slug may differ from URL slug; see
 *      URL_TO_DB_SUBJECT_SLUG below)
 *   3. Seed its content (topics/exams/questions)
 *
 * No code changes outside this file + curriculum-context.ts are required
 * for a new subject to start routing.
 */

export const KNOWN_SUBJECT_SLUGS = [
  "foundation",
  "general",
  "methods",
  "specialist",
] as const;

export const DEFAULT_SUBJECT_SLUG: SubjectSlug = "methods";

export type SubjectSlug = (typeof KNOWN_SUBJECT_SLUGS)[number];

export function isKnownSubject(slug: string): slug is SubjectSlug {
  return (KNOWN_SUBJECT_SLUGS as readonly string[]).includes(slug);
}

/**
 * URL slug → DB slug translation.
 *
 * URL slugs are short (`methods`, `specialist`, `foundation`, `general`) and
 * scoped per curriculum (the URL carries the curriculum prefix). DB slugs
 * are the legacy seeded values from when the system was single-curriculum.
 * Renaming DB slugs would desync existing Stripe subscriptions, the migration
 * script, and the PRICE_CATALOG — so we keep DB slugs stable and translate
 * at the routing edge.
 *
 * When HSC/QCE/WACE land, they'll need their own URL_TO_DB maps keyed by
 * curriculum, or we'll generalise to a (curriculumSlug, urlSlug) → dbSlug
 * lookup. For VCE-only today, a flat map is enough.
 */
const URL_TO_DB_SUBJECT_SLUG: Record<string, string> = {
  "methods": "mathematical-methods",
  "specialist": "vce-specialist",
  "foundation": "vce-foundation",
  "general": "vce-general",
};

const DB_TO_URL_SUBJECT_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(URL_TO_DB_SUBJECT_SLUG).map(([url, db]) => [db, url]),
);

export function getDbSubjectSlug(urlSlug: string): string {
  return URL_TO_DB_SUBJECT_SLUG[urlSlug] ?? urlSlug;
}

/**
 * Reverse of getDbSubjectSlug — turns a Subject.slug from the DB into the
 * URL slug used by the `[subject]/...` route tree. Returns null when the DB
 * slug doesn't correspond to a known subject (e.g. legacy or unconfigured).
 */
export function getUrlSubjectSlug(dbSlug: string): SubjectSlug | null {
  const candidate = DB_TO_URL_SUBJECT_SLUG[dbSlug] ?? dbSlug;
  return isKnownSubject(candidate) ? candidate : null;
}

/**
 * Cookie name where the user's last-chosen subject persists. Pages outside
 * the `[subject]/...` tree (Dashboard, History, Profile, etc.) read this
 * cookie to decide which subject-prefix to use for sidebar/Navbar links.
 *
 * Cookie value should always be a slug in KNOWN_SUBJECT_SLUGS. Invalid or
 * missing → DEFAULT_SUBJECT_SLUG.
 */
export const SUBJECT_COOKIE = "vce_subject";

/**
 * UI metadata for each subject — display names, picker labels, availability,
 * and a colour palette that gives each subject a distinct visual identity
 * across the app (progress rings, badges, section headers).
 *
 * Keep the palette small: vivid badge + matching ring is enough to identify a
 * subject without tinting surfaces, which fights the dark theme.
 */
export interface SubjectColors {
  /** Ring/accent stroke for progress charts. */
  ring: string;
  /** Track (background ring) for progress charts. */
  track: string;
  /** Solid-coloured badge chip (used in section headers). */
  badge: string;
  /** Text colour matching the subject hue (used for section heading). */
  text: string;
}

export interface SubjectMetadata {
  urlSlug: SubjectSlug;
  displayName: string;
  shortName: string;
  badge: string;
  available: boolean;
  colors: SubjectColors;
}

// Order shown in the navbar SubjectsMegaMenu and any other UI that renders
// SUBJECTS top-to-bottom. We use the VCAA Maths pathway order (Foundation →
// General → Methods → Specialist), which mirrors increasing difficulty / the
// progression students typically follow.
export const SUBJECTS: SubjectMetadata[] = [
  {
    urlSlug: "foundation",
    displayName: "VCE Foundation Mathematics",
    shortName: "Foundation",
    badge: "F",
    available: true,
    colors: {
      ring: "text-amber-500",
      track: "text-amber-100 dark:text-amber-950",
      badge: "bg-amber-500 text-white",
      text: "text-amber-700 dark:text-amber-300",
    },
  },
  {
    urlSlug: "general",
    displayName: "VCE General Mathematics",
    shortName: "General",
    badge: "G",
    available: true,
    colors: {
      ring: "text-emerald-500",
      track: "text-emerald-100 dark:text-emerald-950",
      badge: "bg-emerald-500 text-white",
      text: "text-emerald-700 dark:text-emerald-300",
    },
  },
  {
    urlSlug: "methods",
    displayName: "VCE Mathematical Methods",
    shortName: "Methods",
    badge: "M",
    available: true,
    colors: {
      ring: "text-violet-500",
      track: "text-violet-100 dark:text-violet-950",
      badge: "bg-violet-500 text-white",
      text: "text-violet-700 dark:text-violet-300",
    },
  },
  {
    urlSlug: "specialist",
    displayName: "VCE Specialist Mathematics",
    shortName: "Specialist",
    badge: "S",
    available: true,
    colors: {
      ring: "text-sky-500",
      track: "text-sky-100 dark:text-sky-950",
      badge: "bg-sky-500 text-white",
      text: "text-sky-700 dark:text-sky-300",
    },
  },
];

export function getSubjectMetadata(slug: string): SubjectMetadata | undefined {
  return SUBJECTS.find((s) => s.urlSlug === slug);
}

/**
 * Resolve the active subject for code paths outside the `[subject]/...` route
 * tree (Dashboard, Navbar, server actions called from user-scoped pages).
 *
 * Resolution order:
 *   1. Explicit `urlSubject` arg (e.g. extracted from a referer)
 *   2. (Phase 3) `vce_subject` cookie set by the subject picker
 *   3. DEFAULT_SUBJECT_SLUG
 */
export function getCurrentSubjectSlug(urlSubject?: string): SubjectSlug {
  if (urlSubject && isKnownSubject(urlSubject)) return urlSubject;
  // TODO Phase 3: read `vce_subject` cookie via next/headers and prefer it
  // over the default. Requires the SubjectSwitcher UI to be in place first.
  return DEFAULT_SUBJECT_SLUG;
}

/**
 * Subjects to show in the personal subject switcher (the SubjectSidebar
 * "Subject swap" dropdown and the MobileDrawer subject list) for one student.
 *
 * `studyingSubjects` is the student's registered URL slugs (the
 * `User.studyingSubjects` profile field):
 *   - empty / undefined → no registration set → show ALL available subjects
 *     (legacy users, or anyone who hasn't narrowed their list yet)
 *   - otherwise → only the registered + available subjects, always rendered in
 *     SUBJECTS (VCAA pathway) order rather than selection order
 *
 * `currentSubject` (the subject the student is viewing right now) is always
 * kept in the list even when deregistered, so deep-linking to — or having just
 * deregistered — a subject never yields a switcher missing its own selection.
 *
 * Never returns empty: malformed/unknown input falls back to all available
 * subjects so the switcher is never blank.
 */
export function visibleSwitcherSubjects(
  studyingSubjects: string[] | undefined,
  currentSubject?: string,
): SubjectMetadata[] {
  const available = SUBJECTS.filter((s) => s.available);

  const registered = (studyingSubjects ?? []).filter(isKnownSubject);
  // No registration set → show everything (don't let `currentSubject` alone
  // collapse the switcher to a single item).
  if (registered.length === 0) return available;

  const allowed = new Set<string>(registered);
  if (currentSubject && isKnownSubject(currentSubject)) {
    allowed.add(currentSubject);
  }

  const visible = available.filter((s) => allowed.has(s.urlSlug));
  return visible.length > 0 ? visible : available;
}
