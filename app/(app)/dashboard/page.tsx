import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle, BookmarkIcon, TrendingUp } from "lucide-react";

const TOPIC_COLORS = [
  { bar: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { bar: "bg-sky-500",    text: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-200"    },
  { bar: "bg-amber-500",  text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200"  },
  { bar: "bg-emerald-500",text: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200"},
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Lightweight parallel queries — no full question rows fetched
  const [dbUser, attempts, topics, questionCounts, topicAttemptCounts] = await Promise.all([
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { name: true } }) : null,
    userId
      ? prisma.attempt.groupBy({ by: ["status"], where: { userId }, _count: true })
      : [],
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    // Count MCQs (part=null) and distinct Section B groups per topic in raw SQL
    prisma.$queryRaw<{ topicId: string; groupCount: bigint }[]>`
      SELECT "topicId",
        COUNT(*) FILTER (WHERE "part" IS NULL)
        + COUNT(DISTINCT CASE WHEN "part" IS NOT NULL THEN "examId" || '-' || "questionNumber" END)
        AS "groupCount"
      FROM "Question"
      GROUP BY "topicId"
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

  const stats = [
    { label: "Correct",        value: correct,        icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Incorrect",      value: incorrect,       icon: XCircle,      color: "text-red-600",    bg: "bg-red-50"    },
    { label: "Needs Review",   value: needsReview,     icon: BookmarkIcon, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Total Attempted",value: totalAttempted,  icon: TrendingUp,   color: "text-brand-600",  bg: "bg-brand-50"  },
  ];

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Welcome back{dbUser?.name ? `, ${dbUser.name}` : "!"}
        </h1>
        <p className="mt-1 text-sm lg:text-base text-gray-500">
          {totalAttempted} of {totalQuestions} questions attempted
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm lg:text-base font-medium text-gray-700">Overall progress</span>
          <span className="text-sm lg:text-base text-gray-400">{overallPct}%</span>
        </div>
        <div className="h-3 lg:h-4 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:p-7">
            <div className={`inline-flex rounded-xl ${bg} p-2.5 lg:p-3 mb-3`}>
              <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm lg:text-base text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Topic cards */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-5">Browse by topic</h2>
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
                className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:p-6 hover:border-brand-300 hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Top row: title + correct rate badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold lg:text-lg text-gray-900 group-hover:text-brand-600 transition-colors leading-snug">
                    {topic.name}
                  </h3>
                  {correctRate !== null ? (
                    <span className={`shrink-0 text-xs lg:text-sm font-bold px-2 py-0.5 rounded-lg ${c.bg} ${c.text}`}>
                      {correctRate}% correct
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs lg:text-sm text-gray-300 font-medium">—</span>
                  )}
                </div>

                {/* Question count */}
                <p className="text-sm lg:text-base text-gray-400 -mt-1">
                  {done} / {total} questions
                </p>

                {/* Progress bar */}
                <div className="mt-auto">
                  <div className="h-2 lg:h-2.5 rounded-full bg-gray-100 overflow-hidden">
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
