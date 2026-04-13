import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  Play,
  ChevronRight,
} from "lucide-react";
import { hasActiveSubscription } from "@/lib/subscription";
import { isAdminRole } from "@/lib/utils";

/* ────────────────────────── colour tokens ────────────────────────── */

const TOPIC_COLORS = [
  { ring: "text-violet-500", bg: "bg-violet-500", bgLight: "bg-violet-50 dark:bg-violet-950", text: "text-violet-600 dark:text-violet-400", track: "text-violet-100 dark:text-violet-900" },
  { ring: "text-sky-500", bg: "bg-sky-500", bgLight: "bg-sky-50 dark:bg-sky-950", text: "text-sky-600 dark:text-sky-400", track: "text-sky-100 dark:text-sky-900" },
  { ring: "text-amber-500", bg: "bg-amber-500", bgLight: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400", track: "text-amber-100 dark:text-amber-900" },
  { ring: "text-emerald-500", bg: "bg-emerald-500", bgLight: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", track: "text-emerald-100 dark:text-emerald-900" },
];

/* ────────────────────────── SVG ring chart ───────────────────────── */

function RingChart({ pct, size = 64, stroke = 6, trackClass = "text-gray-100 dark:text-gray-800", ringClass = "text-brand-500" }: {
  pct: number; size?: number; stroke?: number; trackClass?: string; ringClass?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={`stroke-current ${trackClass}`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className={`stroke-current ${ringClass} transition-all duration-500`} />
    </svg>
  );
}

/* ════════════════════════════ PAGE ════════════════════════════════ */

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const [dbUser, attempts, topics, topicAttemptCounts] =
    await Promise.all([
      userId
        ? prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } })
        : null,
      userId
        ? prisma.attempt.groupBy({ by: ["status"], where: { userId }, _count: true })
        : [],
      prisma.topic.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true },
      }),
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

  /* ── derived values ── */
  const attemptByTopic = new Map(
    (topicAttemptCounts as { topicId: string; attempted: bigint; correct: bigint }[]).map((r) => [
      r.topicId,
      { attempted: Number(r.attempted), correct: Number(r.correct) },
    ]),
  );

  const countMap = Object.fromEntries(attempts.map((a: { status: string; _count: number }) => [a.status, a._count]));
  const correct = countMap["CORRECT"] ?? 0;
  const incorrect = countMap["INCORRECT"] ?? 0;
  const needsReview = countMap["NEEDS_REVIEW"] ?? 0;
  const attempted = countMap["ATTEMPTED"] ?? 0;
  const totalAttempted = correct + incorrect + needsReview + attempted;
  const correctRate = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

  // Find weakest topic (lowest correct rate, at least 2 attempts)
  let weakestTopic: { name: string; slug: string; rate: number } | null = null;
  for (const t of topics) {
    const ta = attemptByTopic.get(t.id);
    if (!ta || ta.attempted < 2) continue;
    const rate = Math.round((ta.correct / ta.attempted) * 100);
    if (!weakestTopic || rate < weakestTopic.rate) {
      weakestTopic = { name: t.name, slug: t.slug, rate };
    }
  }

  const showUpgradeCard =
    !!userId && !isAdminRole(dbUser?.role) && !(await hasActiveSubscription(userId));

  const firstName = dbUser?.name?.split(" ")[0] ?? "";


  /* ────────────────────────────── JSX ────────────────────────────── */

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ─── Hero: Welcome + CTA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm lg:text-base text-gray-500 dark:text-gray-400">
            {totalAttempted === 0
              ? "Ready to start revising?"
              : `${totalAttempted} questions attempted`}
          </p>
        </div>
        <Link
          href="/topics"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-semibold text-white transition-colors shrink-0"
        >
          <Play className="h-4 w-4" />
          {totalAttempted === 0 ? "Start studying" : "Practice now"}
        </Link>
      </div>

      {/* ─── Upgrade CTA (free users only) ─── */}
      {showUpgradeCard && (
        <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-gray-900 p-5 lg:p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900">
              <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                Unlock the full Methods experience
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Upgrade to access all four topics, practice exams, search, and history.
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                See plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Quick Stats Strip ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{correctRate}%</p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
            <Target className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{correct}</p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Correct</p>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{incorrect}</p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Incorrect</p>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAttempted}</p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Attempted</p>
          </div>
        </div>
      </div>

      {/* ─── Topic Progress ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Topic progress</h2>
          <Link href="/topics" className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          {topics.map((topic, i) => {
            const c = TOPIC_COLORS[i % TOPIC_COLORS.length];
            const ta = attemptByTopic.get(topic.id) ?? { attempted: 0, correct: 0 };
            const topicCorrectRate = ta.attempted > 0 ? Math.round((ta.correct / ta.attempted) * 100) : 0;

            return (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="group flex items-center gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:p-5 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              >
                {/* Ring chart — shows accuracy rate */}
                <div className="relative shrink-0">
                  <RingChart pct={topicCorrectRate} size={56} stroke={5} trackClass={c.track} ringClass={c.ring} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-gray-100">
                    {topicCorrectRate}%
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    {topic.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {ta.attempted === 0
                      ? "Not started"
                      : `${ta.attempted} attempted`}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── Weak-area nudge ─── */}
      {weakestTopic && (
        <Link
          href={`/topics/${weakestTopic.slug}`}
          className="block rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4 lg:p-5 hover:border-red-200 dark:hover:border-red-800 transition-all"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-1">Needs work</p>
          <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">{weakestTopic.name}</p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {weakestTopic.rate}% correct — keep practising to improve
          </p>
        </Link>
      )}
    </div>
  );
}
