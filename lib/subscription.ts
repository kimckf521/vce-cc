import { prisma } from "@/lib/prisma";
import { SUBJECT_DISPLAY_NAMES } from "@/lib/pricing-catalog";

/**
 * Default subject slug for legacy single-subject callers. To be removed
 * in B2 when URL restructure brings explicit per-route subject context
 * to every callsite that currently relies on this default.
 */
const LEGACY_DEFAULT_SUBJECT_SLUG = "mathematical-methods";

/**
 * Subscription status values that grant the user access to paid content.
 *
 * Why `past_due` is included: when a renewal payment fails, Stripe marks the
 * subscription as `past_due` and retries the charge over a 1–3 week dunning
 * window (configurable in Stripe → Billing → Subscriptions → Manage failed
 * payments). Locking the user out on the very first failed attempt would
 * give them no chance to update their card before losing access. Once
 * Stripe gives up retrying, the status flips to `unpaid` (or `canceled`)
 * and access is revoked here.
 *
 * Statuses that DON'T grant access:
 *   - `unpaid` — Stripe gave up retrying
 *   - `canceled` — explicitly cancelled and period ended
 *   - `incomplete` / `incomplete_expired` — initial payment never succeeded
 *   - `paused` — subscription is paused by merchant
 */
export const ACCESS_GRANTING_STATUSES = ["active", "trialing", "past_due"] as const;
export type AccessGrantingStatus = (typeof ACCESS_GRANTING_STATUSES)[number];

/**
 * The single topic per subject that free users can access in full.
 * Keys are DB subject slugs (not URL slugs), values are topic slugs.
 *
 * All 4 VCE maths subjects share the "algebra-number-and-structure" topic
 * slug because they reuse the Methods topic taxonomy (per the seed scripts'
 * "structure first, refine later" decision). When subject taxonomies
 * diverge in the future, pick each subject's most foundational topic.
 */
export const FREE_PREVIEW_TOPIC_BY_SUBJECT: Record<string, string> = {
  [LEGACY_DEFAULT_SUBJECT_SLUG]: "algebra-number-and-structure",
  "vce-specialist": "algebra-number-and-structure",
  "vce-foundation": "algebra-number-and-structure",
  "vce-general": "algebra-number-and-structure",
};

/**
 * Features that are gated behind a paid subscription.
 * Past papers and the dashboard are intentionally NOT in this list — free users
 * see them in full.
 */
export type GatedFeature = "practice" | "search" | "history";

export type AccessResult =
  | { allowed: true }
  | { allowed: false; reason: "paywall" };

/**
 * Check if a user has an active paid enrolment for a subject.
 * Returns true if the user has a subscription that's active or trialing.
 */
export async function hasActiveSubscription(
  userId: string,
  subjectSlug: string = LEGACY_DEFAULT_SUBJECT_SLUG
): Promise<boolean> {
  const enrolment = await prisma.subjectEnrolment.findFirst({
    where: {
      userId,
      tier: "PAID",
      subject: { slug: subjectSlug },
      subscriptionStatus: { in: [...ACCESS_GRANTING_STATUSES] },
    },
    select: { id: true },
  });

  return enrolment !== null;
}

/**
 * Get the full enrolment record for a user + subject.
 * Returns null if no enrolment exists.
 */
export async function getEnrolment(
  userId: string,
  subjectSlug: string = LEGACY_DEFAULT_SUBJECT_SLUG
) {
  return prisma.subjectEnrolment.findFirst({
    where: {
      userId,
      subject: { slug: subjectSlug },
    },
    include: { subject: true },
  });
}

/**
 * Check whether a user can access a specific topic within a subject.
 *
 * Rules:
 *   - PAID enrolment (active/trialing) → full access to every topic.
 *   - FREE enrolment (or no enrolment) → only the free-preview topic for that subject.
 *
 * The reason field tells the caller WHY access was denied so the UI can show the
 * right paywall message. Currently only "paywall" — kept as a discriminated union
 * so future reasons (e.g. "trial-expired") can be added without breaking callers.
 */
export async function canAccessTopic(
  userId: string,
  topicSlug: string,
  subjectSlug: string = LEGACY_DEFAULT_SUBJECT_SLUG
): Promise<AccessResult> {
  const freeTopic = FREE_PREVIEW_TOPIC_BY_SUBJECT[subjectSlug];
  if (freeTopic && topicSlug === freeTopic) {
    return { allowed: true };
  }

  const isPaid = await hasActiveSubscription(userId, subjectSlug);
  if (isPaid) {
    return { allowed: true };
  }

  return { allowed: false, reason: "paywall" };
}

/**
 * Can the user SAVE work (mark progress / bookmark) on a given question?
 *
 * The rule is "save what you can access": a save is allowed iff the user can
 * access the question's topic (`canAccessTopic`) — so free users save on the
 * free Algebra preview topic, and paid users save everywhere. Resolves the
 * question to its topic + subject, then defers to `canAccessTopic`. Returns
 * false if the row is missing. NB: admin bypass is handled by the API-route
 * callers (they already fetch the role), not here.
 */
export async function canAccessQuestionSetItem(
  userId: string,
  questionSetItemId: string
): Promise<boolean> {
  const item = await prisma.questionSetItem.findUnique({
    where: { id: questionSetItemId },
    select: { topic: { select: { slug: true, subject: { select: { slug: true } } } } },
  });
  if (!item?.topic?.subject) return false;
  const access = await canAccessTopic(userId, item.topic.slug, item.topic.subject.slug);
  return access.allowed;
}

/** Same rule for the legacy `Question` model (past-paper questions). */
export async function canAccessQuestion(
  userId: string,
  questionId: string
): Promise<boolean> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      topic: { select: { slug: true } },
      subject: { select: { slug: true } },
    },
  });
  if (!q?.topic || !q?.subject) return false;
  const access = await canAccessTopic(userId, q.topic.slug, q.subject.slug);
  return access.allowed;
}

/**
 * Check whether a user can access a gated feature (practice, search, history).
 * These features are paid-only — free users always hit the paywall.
 */
export async function canAccessFeature(
  userId: string,
  _feature: GatedFeature,
  subjectSlug: string = LEGACY_DEFAULT_SUBJECT_SLUG
): Promise<AccessResult> {
  const isPaid = await hasActiveSubscription(userId, subjectSlug);
  return isPaid ? { allowed: true } : { allowed: false, reason: "paywall" };
}

/**
 * Ensure a FREE enrolment row exists for the given user and subject.
 * Called from /api/auth/sync-user after signup/login so every user has an
 * enrolment record from day one (otherwise gating logic would have nothing
 * to read until checkout).
 *
 * Idempotent: if an enrolment already exists (FREE or PAID) it's left alone.
 */
export async function ensureFreeEnrolment(
  userId: string,
  subjectSlug: string = LEGACY_DEFAULT_SUBJECT_SLUG
): Promise<void> {
  const subject = await prisma.subject.findUnique({
    where: { slug: subjectSlug },
    select: { id: true },
  });
  if (!subject) return; // Subject doesn't exist yet — nothing to enrol into.

  await prisma.subjectEnrolment.upsert({
    where: {
      userId_subjectId: { userId, subjectId: subject.id },
    },
    update: {}, // Don't downgrade an existing PAID enrolment.
    create: {
      userId,
      subjectId: subject.id,
      tier: "FREE",
    },
  });
}

/**
 * Ensure FREE enrolment rows exist for every VCE maths subject the user
 * doesn't already have an enrolment for. Called after signup so every user
 * has a row per subject from day one — fixes the "discovery hole" where
 * users with only a Methods enrolment couldn't see the other 3 subjects
 * in the dashboard SubjectsGrid.
 *
 * Pulls slugs from the VCE Maths catalog so adding a new subject is one
 * pricing-catalog edit, not two.
 *
 * Idempotent: existing rows (FREE or PAID) are left untouched.
 */
export async function ensureFreeEnrolmentsForMathsSubjects(
  userId: string
): Promise<void> {
  const { PRICE_CATALOG } = await import("@/lib/pricing-catalog");
  const slugs = PRICE_CATALOG.vceMaths.subjectSlugs;
  for (const slug of slugs) {
    await ensureFreeEnrolment(userId, slug);
  }
}

/**
 * Ensure a Subject record exists for the given slug.
 * Called from the checkout flow before creating an enrolment.
 * Returns the Subject ID.
 *
 * Phase 2 generalisation of the old `ensureMathMethodsSubject` — accepts any
 * subject slug + display name so Specialist/General/Foundation enrolments can
 * route through the same path when their Stripe prices land.
 */
export async function ensureSubject(slug: string, name: string): Promise<string> {
  const subject = await prisma.subject.upsert({
    where: { slug },
    update: {},
    create: { name, slug, order: 0 },
    select: { id: true },
  });
  return subject.id;
}

/**
 * Ensure multiple Subject rows exist. Used by the webhook + checkout when
 * a single Stripe subscription needs to create/update enrolment rows for
 * a whole plan's subject list (e.g. VCE Maths = 4 subjects). Display names
 * come from the catalog so the slug→name mapping lives in one place.
 *
 * Returns a map of slug → subjectId so callers can build enrolment rows.
 */
export async function ensureSubjects(
  slugs: readonly string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const slug of slugs) {
    const name = SUBJECT_DISPLAY_NAMES[slug] ?? slug;
    result[slug] = await ensureSubject(slug, name);
  }
  return result;
}

/**
 * Backwards-compatible wrapper. Existing checkout/webhook code continues to
 * call this; new code should use `ensureSubject()` directly with an explicit
 * slug+name pair.
 */
export async function ensureMathMethodsSubject(): Promise<string> {
  return ensureSubject(LEGACY_DEFAULT_SUBJECT_SLUG, "VCE Mathematical Methods");
}
