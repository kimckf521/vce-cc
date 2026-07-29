import { prisma } from "@/lib/prisma";

/**
 * Compute the current study streak for a user. A streak is the number of
 * consecutive days (ending today or yesterday) that count as "study days".
 *
 * A day counts when the user either:
 *   - completed an ExamSession, OR
 *   - made >= 3 attempts that day across Attempt (past-paper questions) and
 *     QuestionSetAttempt (topic drills) combined.
 *
 * The 3-attempt threshold stops a single stray click from farming a streak,
 * while still crediting a genuine drill session — previously only completed
 * exam sessions counted, so a student who drilled 50 questions had a 0-day
 * streak. Days are bucketed in Australia/Melbourne local time throughout.
 */
export async function getStudyStreak(userId: string): Promise<number> {
  // Timestamps are stored as naive UTC (Prisma timestamp(3)), so they must
  // be tagged as UTC first (AT TIME ZONE 'UTC') and THEN converted to
  // Melbourne local. A single AT TIME ZONE on a naive column interprets the
  // UTC value AS Melbourne local, shifting days ~20h the wrong way.
  const rows = await prisma.$queryRaw<{ d: Date }[]>`
    SELECT DISTINCT d FROM (
      SELECT DATE(("completedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Australia/Melbourne') AS d
      FROM "ExamSession"
      WHERE "userId" = ${userId}
      UNION ALL
      SELECT d FROM (
        SELECT DATE(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Australia/Melbourne') AS d
        FROM (
          SELECT "createdAt" FROM "Attempt" WHERE "userId" = ${userId}
          UNION ALL
          SELECT "createdAt" FROM "QuestionSetAttempt" WHERE "userId" = ${userId}
        ) AS all_attempts
        GROUP BY 1
        HAVING COUNT(*) >= 3
      ) AS attempt_days
    ) AS study_days
    ORDER BY d DESC
  `;
  if (rows.length === 0) return 0;

  // "Today" must be the Melbourne-local date to match the SQL buckets —
  // new Date() alone reflects the server timezone (UTC in prod), which is
  // up to a day behind Melbourne.
  const melbTodayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
  }).format(new Date());
  const today = new Date(`${melbTodayStr}T00:00:00Z`);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDay = new Date(rows[0].d);
  firstDay.setHours(0, 0, 0, 0);

  // Streak must include today or yesterday
  if (
    firstDay.getTime() !== today.getTime() &&
    firstDay.getTime() !== yesterday.getTime()
  )
    return 0;

  let streak = 1;
  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1].d);
    const curr = new Date(rows[i].d);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
