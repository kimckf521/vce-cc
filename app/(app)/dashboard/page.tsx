import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle, BookmarkIcon, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { hasActiveSubscription } from "@/lib/subscription";
import { isAdminRole } from "@/lib/utils";

const TOPIC_COLORS = [
  { bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950", border: "border-violet-200 dark:border-violet-800" },
  { bar: "bg-sky-500",    text: "text-sky-600 dark:text-sky-400",    bg: "bg-sky-50 dark:bg-sky-950",    border: "border-sky-200 dark:border-sky-800"    },
  { bar: "bg-amber-500",  text: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950",  border: "border-amber-200 dark:border-amber-800"  },
  { bar: "bg-emerald-500",text: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950",border: "border-emerald-200 dark:border-emerald-800"},
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Lightweight parallel queries — no full question rows fetched
  const [dbUser, attempts, topics, questionCounts, topicAttemptCounts] = await Promise.all([
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } }) : null,
    userId
      ? prisma.attempt.groupBy({ by: ["status"], where: { userId }, _count: true })
      : [],
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    // Count MCQs (part=null) and distinct Section B groups per topic in raw SQL
    prisma.$queryRaw<{ topicId: string; groupCount: bigint }[]>`
      SELECT q."topicId",
        COUNT(*) FILTER (WHERE q."part" IS NULL)
        + COUNT(DISTINCT CASE WHEN q."part" IS NOT NULL THEN q."examId" || '-' || q."questionNumber" END)
        AS "groupCount"
      FROM "Question" q
      JOIN "Exam" e ON e."id" = q."examId"
      WHERE e."year" != 9999
      GROUP BY q."topicId"
    `,
    // Count attempted + correct groups per topic for this user
    userId
      ? prisma.$queryRaw<{ topicId: string; attempted: bigint; correct: bigint }[]>`
          SELECT q."topicId",
            COUNT(DISTINCT CASE WHEN q."part" IS NULL THEN q."id"
                                ELSE q."examId" || '-' || q."questionNumber" END) AS "attempted",
            COUNT(DISTINCT CASE WHEN a."status" = 'CORRECT' THEN
                                CASE WHEN q."part" IS NULL THEN q."id"
                                     ELSE q."examId" || '-' || q."questionNumber" END END) AS "correct"
          FROM "Attempt" a
          JOIN "Question" q ON q."id" = a."questionId"
          WHERE a."userId" = ${userId}
          GROUP BY q."topicId"
        `
      : [],
  ]);

  // Build lookup maps
  const countByTopic = new Map(questionCounts.map((r) => [r.topicId, Number(r.groupCount)]));
  const attemptByTopic = new Map(
    (topicAttemptCounts as { topicId: string; attempted: bigint; correct: bigint }[]).map((r) => [
      r.topicId,
      { attempted: Number(r.attempted), correct: Number(r.correct) },
    ])
  );

  const countMap = Object.fromEntries(attempts.map((a) => [a.status, a._count]));
  const correct      = countMap["CORRECT"]      ?? 0;
  const incorrect    = countMap["INCORRECT"]    ?? 0;
  const needsReview  = countMap["NEEDS_REVIEW"] ?? 0;
  const attempted    = countMap["ATTEMPTED"]    ?? 0;
  const totalAttempted = correct + incorrect + needsReview + attempted;
  const totalQuestions = topics.reduce((sum, t) => sum + (countByTopic.get(t.id) ?? 0), 0);
  const overallPct = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;

  // Show the upgrade CTA only to authenticated free non-admin users.
  const showUpgradeCard =
    !!userId &&
    !isAdminRole(dbUser?.role) &&
    !(await hasActiveSubscription(userId));

  const stats = [
    { label: "Correct",        value: correct,        icon: CheckCircle,  color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950"  },
    { label: "Incorrect",      value: incorrect,       icon: XCircle,      color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-950"    },
    { label: "Needs Review",   value: needsReview,     icon: BookmarkIcon, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950" },
    { label: "Total Attempted",value: totalAttempted,  icon: TrendingUp,   color: "text-brand-600 dark:text-brand-400",  bg: "bg-brand-50 dark:bg-brand-950"  },
  ];

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back{dbUser?.name ? `, ${dbUser.name}` : "!"}
        </h1>
        <p className="mt-1 text-sm lg:text-base text-gray-500 dark:text-gray-400">
          {totalAttempted} of {totalQuestions} questions attempted
        </p>
      </div>

      {/* Upgrade CTA — free users only */}
      {showUpgradeCard && (
        <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-gray-900 p-6 lg:p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900">
              <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                Unlock the full Methods experience
              </h2>
              <p className="mt-1 text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                You&apos;re on the free plan. Upgrade to access all four topics, practice mode, search, and history.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 lg:px-5 lg:py-2.5 text-sm lg:text-base font-semibold text-white transition-colors"
              >
                See plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Overall progress bar */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">Overall progress</span>
          <span className="text-sm lg:text-base text-gray-400 dark:text-gray-500">{overallPct}%</span>
        </div>
        <div className="h-3 lg:h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-7">
            <div className={`inline-flex rounded-xl ${bg} p-2.5 lg:p-3 mb-3`}>
              <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Topic cards */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 lg:mb-5">Browse by topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {topics.map((topic, i) => {
            const c = TOPIC_COLORS[i % TOPIC_COLORS.length];
            const total = countByTopic.get(topic.id) ?? 0;
            const topicAttempts = attemptByTopic.get(topic.id) ?? { attempted: 0, correct: 0 };
            const done = topicAttempts.attempted;
            const topicCorrect = topicAttempts.correct;
            const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
            const correctRate = done > 0 ? Math.round((topicCorrect / done) * 100) : null;

            return (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="group rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6 hover:border-brand-300 hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Top row: title + correct rate badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold lg:text-lg text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors leading-snug">
                    {topic.name}
                  </h3>
                  {correctRate !== null ? (
                    <span className={`shrink-0 text-xs lg:text-sm font-bold px-2 py-0.5 rounded-lg ${c.bg} ${c.text}`}>
                      {correctRate}% correct
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs lg:text-sm text-gray-300 dark:text-gray-600 font-medium">—</span>
                  )}
                </div>

                {/* Question count */}
                <p className="text-sm lg:text-base text-gray-400 dark:text-gray-500 -mt-1">
                  {done} / {total} questions
                </p>

                {/* Progress bar */}
                <div className="mt-auto">
                  <div className="h-2 lg:h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${c.bar}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className={`text-right text-xs lg:text-sm font-semibold mt-1 ${c.text}`}>
                    {progressPct}%
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
