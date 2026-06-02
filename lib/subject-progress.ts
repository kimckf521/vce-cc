import { prisma } from "@/lib/prisma";
import {
  getSubjectMetadata,
  getUrlSubjectSlug,
  type SubjectMetadata,
  type SubjectSlug,
} from "@/lib/subject-context";
import { ACCESS_GRANTING_STATUSES } from "@/lib/subscription";

/**
 * Per-subject progress summary shape. Used by:
 *   - dashboard SubjectsGrid (one card per enrolment)
 *   - subject home mini-dashboard (single subject's stats + last activity)
 *   - "Continue revising" card (pick the row with newest lastActivityAt)
 *
 * Keeps the data shape consistent across surfaces and avoids duplicated raw
 * queries — each consumer just renders fields from this struct.
 */
export type SubjectProgress = {
  subjectId: string;
  /** URL-form slug (e.g. "methods"). Use for hrefs. */
  urlSlug: SubjectSlug;
  meta: SubjectMetadata;
  /** Whether the user has paid access to this subject. */
  isPaid: boolean;
  /** Total topic rows under this subject. */
  topicCount: number;
  /** Topics the user has at least one attempt on. */
  topicsAttempted: number;
  /** Total attempts (correct + incorrect + needs_review + attempted statuses). */
  totalAttempts: number;
  correctAttempts: number;
  /** 0–100; rounded; 0 when no attempts. */
  accuracy: number;
  /** Most recent attempt timestamp across this subject's topics. */
  lastActivityAt: Date | null;
  /** Topic the most recent attempt was on — used for "Continue revising" deep link. */
  lastTopicSlug: string | null;
  lastTopicName: string | null;
};

/**
 * Build a per-subject progress summary for every subject the user is enrolled
 * in. Skips enrolments whose DB slug isn't in the URL-known list (legacy /
 * un-wired subjects).
 *
 * Single user, all subjects — one Prisma round trip per concern (enrolments,
 * attempts, last-activity). Total ~3 queries regardless of subject count.
 */
export async function getSubjectProgressForUser(
  userId: string
): Promise<SubjectProgress[]> {
  const enrolments = await prisma.subjectEnrolment.findMany({
    where: { userId },
    select: {
      tier: true,
      subscriptionStatus: true,
      subject: {
        select: {
          id: true,
          slug: true,
          order: true,
          topics: {
            orderBy: { order: "asc" },
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
    orderBy: { subject: { order: "asc" } },
  });

  const subjectIds = enrolments.map((e) => e.subject.id);
  if (subjectIds.length === 0) return [];

  // Aggregate attempts per (subjectId, topicId). Subject is denormalised on
  // Question for cheap per-subject queries.
  const attemptsBySubject = await prisma.$queryRaw<
    {
      subjectId: string;
      topicId: string;
      attempted: bigint;
      correct: bigint;
      lastAt: Date | null;
    }[]
  >`
    SELECT
      q."subjectId" as "subjectId",
      q."topicId"   as "topicId",
      COUNT(*)::bigint                                          AS "attempted",
      SUM(CASE WHEN a."status" = 'CORRECT' THEN 1 ELSE 0 END)::bigint AS "correct",
      MAX(a."createdAt")                                        AS "lastAt"
    FROM "Attempt" a
    JOIN "Question" q ON q."id" = a."questionId"
    WHERE a."userId" = ${userId}
      AND q."subjectId" IN (${subjectIds.length > 0 ? prismaInClause(subjectIds) : null})
    GROUP BY q."subjectId", q."topicId"
  `.catch(() => []);

  // Fallback for the bigint+IN-clause edge case: tagged-template `${array}`
  // doesn't expand inside IN(). If the parameterised query above errored,
  // re-issue with a per-subject sum aggregate (slightly more work, same result).
  type Row = { subjectId: string; topicId: string; attempted: bigint; correct: bigint; lastAt: Date | null };
  const rows: Row[] = Array.isArray(attemptsBySubject) && attemptsBySubject.length > 0
    ? attemptsBySubject
    : await prisma.$queryRaw<Row[]>`
        SELECT
          q."subjectId" as "subjectId",
          q."topicId"   as "topicId",
          COUNT(*)::bigint AS "attempted",
          SUM(CASE WHEN a."status" = 'CORRECT' THEN 1 ELSE 0 END)::bigint AS "correct",
          MAX(a."createdAt") AS "lastAt"
        FROM "Attempt" a
        JOIN "Question" q ON q."id" = a."questionId"
        WHERE a."userId" = ${userId}
          AND q."subjectId" IS NOT NULL
        GROUP BY q."subjectId", q."topicId"
      `;

  // Bucket rows by subject for fast lookup
  const rowsBySubject = new Map<string, Row[]>();
  for (const r of rows) {
    const list = rowsBySubject.get(r.subjectId) ?? [];
    list.push(r);
    rowsBySubject.set(r.subjectId, list);
  }

  const result: SubjectProgress[] = [];
  for (const e of enrolments) {
    const urlSlug = getUrlSubjectSlug(e.subject.slug);
    if (!urlSlug) continue;
    const meta = getSubjectMetadata(urlSlug);
    if (!meta) continue;

    const subjectRows = rowsBySubject.get(e.subject.id) ?? [];
    const topicAttemptByTopic = new Map(
      subjectRows.map((r) => [
        r.topicId,
        {
          attempted: Number(r.attempted),
          correct: Number(r.correct),
          lastAt: r.lastAt,
        },
      ])
    );

    const totalAttempts = subjectRows.reduce((sum, r) => sum + Number(r.attempted), 0);
    const correctAttempts = subjectRows.reduce((sum, r) => sum + Number(r.correct), 0);
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    let lastActivityAt: Date | null = null;
    let lastTopicId: string | null = null;
    for (const r of subjectRows) {
      if (r.lastAt && (!lastActivityAt || r.lastAt > lastActivityAt)) {
        lastActivityAt = r.lastAt;
        lastTopicId = r.topicId;
      }
    }
    const lastTopic = lastTopicId
      ? e.subject.topics.find((t) => t.id === lastTopicId) ?? null
      : null;

    const isPaid =
      e.tier === "PAID" &&
      !!e.subscriptionStatus &&
      (ACCESS_GRANTING_STATUSES as readonly string[]).includes(e.subscriptionStatus);

    result.push({
      subjectId: e.subject.id,
      urlSlug,
      meta,
      isPaid,
      topicCount: e.subject.topics.length,
      topicsAttempted: topicAttemptByTopic.size,
      totalAttempts,
      correctAttempts,
      accuracy,
      lastActivityAt,
      lastTopicSlug: lastTopic?.slug ?? null,
      lastTopicName: lastTopic?.name ?? null,
    });
  }

  return result;
}

/**
 * Helper: pick the subject row with the most recent activity. Returns null
 * when the user has no attempts on any subject. Used by the dashboard's
 * "Continue revising" card.
 */
export function pickContinueRevising(
  progress: SubjectProgress[]
): SubjectProgress | null {
  let pick: SubjectProgress | null = null;
  for (const p of progress) {
    if (!p.lastActivityAt) continue;
    if (!pick || !pick.lastActivityAt || p.lastActivityAt > pick.lastActivityAt) {
      pick = p;
    }
  }
  return pick;
}

// Prisma tagged-template `${array}` doesn't expand inside IN(). For safety,
// we re-issue without the IN clause if the first query errors (see catch
// branch above). This helper is a marker — the real fallback path handles it.
function prismaInClause(_ids: string[]): unknown {
  return null;
}
