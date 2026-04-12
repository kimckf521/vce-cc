import { prisma } from "@/lib/prisma";
import { STANDARD_SUBJECT_SLUG } from "@/lib/stripe";

/**
 * Subscription status values that grant access to paid content.
 * Trialing users also get full access.
 */
const ACTIVE_STATUSES = ["active", "trialing"] as const;

/**
 * The single topic per subject that free users can access in full.
 * Keys are subject slugs, values are topic slugs.
 */
export const FREE_PREVIEW_TOPIC_BY_SUBJECT: Record<string, string> = {
  [STANDARD_SUBJECT_SLUG]: "algebra-number-and-structure",
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
  subjectSlug: string = STANDARD_SUBJECT_SLUG
): Promise<boolean> {
  const enrolment = await prisma.subjectEnrolment.findFirst({
    where: {
      userId,
      tier: "PAID",
      subject: { slug: subjectSlug },
      subscriptionStatus: { in: [...ACTIVE_STATUSES] },
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
  subjectSlug: string = STANDARD_SUBJECT_SLUG
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
  subjectSlug: string = STANDARD_SUBJECT_SLUG
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
 * Check whether a user can access a gated feature (practice, search, history).
 * These features are paid-only — free users always hit the paywall.
 */
export async function canAccessFeature(
  userId: string,
  _feature: GatedFeature,
  subjectSlug: string = STANDARD_SUBJECT_SLUG
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
  subjectSlug: string = STANDARD_SUBJECT_SLUG
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
 * Ensure a Subject record exists for Mathematical Methods.
 * Called from the checkout flow before creating an enrolment.
 * Returns the Subject ID.
 */
export async function ensureMathMethodsSubject(): Promise<string> {
  const subject = await prisma.subject.upsert({
    where: { slug: STANDARD_SUBJECT_SLUG },
    update: {},
    create: {
      name: "Mathematical Methods",
      slug: STANDARD_SUBJECT_SLUG,
      order: 0,
    },
    select: { id: true },
  });
  return subject.id;
}
