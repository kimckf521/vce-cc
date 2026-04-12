import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, BookmarkIcon, TrendingUp } from "lucide-react";
import { cn, roleLabel } from "@/lib/utils";
import EditDisplayName from "@/components/EditDisplayName";
import ThemeToggle from "@/components/ThemeToggle";
import ChangePassword from "@/components/ChangePassword";
import BillingSection from "@/components/BillingSection";
import { STANDARD_SUBJECT_SLUG } from "@/lib/stripe";

// ── topic brand colours (matching topics page) ────────────────────────────────

const TOPIC_COLORS = [
  { bg: "bg-violet-50 dark:bg-violet-950", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-400", bar: "bg-violet-500", ring: "ring-violet-200 dark:ring-violet-800" },
  { bg: "bg-sky-50 dark:bg-sky-950",       border: "border-sky-200 dark:border-sky-800",       text: "text-sky-700 dark:text-sky-400",       bar: "bg-sky-500",    ring: "ring-sky-200 dark:ring-sky-800"       },
  { bg: "bg-amber-50 dark:bg-amber-950",   border: "border-amber-200 dark:border-amber-800",   text: "text-amber-700 dark:text-amber-400",   bar: "bg-amber-500",  ring: "ring-amber-200 dark:ring-amber-800"   },
  { bg: "bg-emerald-50 dark:bg-emerald-950",border: "border-emerald-200 dark:border-emerald-800",text: "text-emerald-700 dark:text-emerald-400",bar: "bg-emerald-500",ring: "ring-emerald-200 dark:ring-emerald-800" },
];

// ── page ──────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Graceful no-auth fallback (auth is disabled in dev, so user may be null)
  const userId = user?.id ?? "__no_user__";

  // Lightweight parallel queries — no full question rows fetched
  const [dbUser, attempts, topics, questionCounts, topicAttemptCounts, enrolment] = await Promise.all([
    user ? prisma.user.findUnique({ where: { id: userId } }) : null,
    prisma.attempt.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.$queryRaw<{ topicId: string; groupCount: bigint }[]>`
      SELECT "topicId",
        COUNT(*) FILTER (WHERE "part" IS NULL)
        + COUNT(DISTINCT CASE WHEN "part" IS NOT NULL THEN "examId" || '-' || "questionNumber" END)
        AS "groupCount"
      FROM "Question"
      GROUP BY "topicId"
    `,
    prisma.$queryRaw<{ topicId: string; attempted: bigint }[]>`
      SELECT q."topicId",
        COUNT(DISTINCT CASE WHEN q."part" IS NULL THEN q."id"
                            ELSE q."examId" || '-' || q."questionNumber" END) AS "attempted"
      FROM "Attempt" a
      JOIN "Question" q ON q."id" = a."questionId"
      WHERE a."userId" = ${userId}
      GROUP BY q."topicId"
    `,
    user
      ? prisma.subjectEnrolment.findFirst({
          where: { userId, subject: { slug: STANDARD_SUBJECT_SLUG } },
          include: { subject: { select: { name: true } } },
        })
      : null,
  ]);

  const countByTopic = new Map(questionCounts.map((r) => [r.topicId, Number(r.groupCount)]));
  const attemptByTopic = new Map(
    (topicAttemptCounts as { topicId: string; attempted: bigint }[]).map((r) => [r.topicId, Number(r.attempted)])
  );

  // ── stats ──────────────────────────────────────────────────────────────────
  const countMap = Object.fromEntries(attempts.map((a) => [a.status, a._count]));
  const correct     = countMap["CORRECT"]      ?? 0;
  const incorrect   = countMap["INCORRECT"]    ?? 0;
  const needsReview = countMap["NEEDS_REVIEW"] ?? 0;
  const attempted   = countMap["ATTEMPTED"]    ?? 0;
  const totalAttempted = correct + incorrect + needsReview + attempted;

  const totalQuestions = topics.reduce((s, t) => s + (countByTopic.get(t.id) ?? 0), 0);
  const progressPct    = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;

  // ── identity ──────────────────────────────────────────────────────────────
  const email       = user?.email ?? "student@example.com";
  const displayName = dbUser?.name ?? email.split("@")[0];
  const initials    = displayName
    .split(/\s+/)
    .map((w: string) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" })
    : null;

  const role = roleLabel(dbUser?.role);

  const statCards = [
    { label: "Correct",        value: correct,        icon: CheckCircle,  iconBg: "bg-green-50 dark:bg-green-950",  iconColor: "text-green-600 dark:text-green-400"  },
    { label: "Incorrect",      value: incorrect,      icon: XCircle,      iconBg: "bg-red-50 dark:bg-red-950",      iconColor: "text-red-600 dark:text-red-400"    },
    { label: "Needs Review",   value: needsReview,    icon: BookmarkIcon, iconBg: "bg-yellow-50 dark:bg-yellow-950", iconColor: "text-yellow-600 dark:text-yellow-400" },
    { label: "Total Attempted",value: totalAttempted, icon: TrendingUp,   iconBg: "bg-brand-50 dark:bg-brand-950",  iconColor: "text-brand-600 dark:text-brand-400"  },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Profile header card ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-7">

          {/* Avatar */}
          <div className="flex h-16 w-16 lg:h-24 lg:w-24 shrink-0 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 font-bold text-2xl lg:text-4xl select-none">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">{displayName}</h1>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-0.5 truncate">{email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 px-3 py-1 text-xs lg:text-sm font-semibold">
                {role}
              </span>
              {memberSince && (
                <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-500">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>

          {/* Overall progress pill */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-6 py-4 lg:px-8 lg:py-5 shrink-0">
            <span className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">{progressPct}%</span>
            <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 mt-0.5">completed</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 lg:mt-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">Overall progress</span>
            <span className="text-sm lg:text-base text-gray-400 dark:text-gray-500">
              {totalAttempted} / {totalQuestions} questions
            </span>
          </div>
          <div className="h-3 lg:h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 lg:p-7">
            <div className={cn("inline-flex rounded-xl p-2.5 lg:p-3 mb-3", iconBg)}>
              <Icon className={cn("h-5 w-5 lg:h-6 lg:w-6", iconColor)} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Topic breakdown ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-5">Progress by Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {topics.map((topic, i) => {
            const c        = TOPIC_COLORS[i % TOPIC_COLORS.length];
            const total    = countByTopic.get(topic.id) ?? 0;
            const done     = attemptByTopic.get(topic.id) ?? 0;
            const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={topic.id}
                className={cn("rounded-2xl border p-5 lg:p-6", c.bg, c.border)}
              >
                <p className={cn("text-sm lg:text-base font-semibold mb-1", c.text)}>
                  {topic.name}
                </p>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {done} of {total} questions
                </p>

                {/* Bar */}
                <div className="h-2 lg:h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-2">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", c.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className={cn("text-right text-xs lg:text-sm font-bold", c.text)}>
                  {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Billing ──────────────────────────────────────────────────────── */}
      <BillingSection
        hasSubscription={
          enrolment?.tier === "PAID" &&
          (enrolment?.subscriptionStatus === "active" ||
            enrolment?.subscriptionStatus === "trialing")
        }
        planName={enrolment?.subject?.name ?? null}
        status={enrolment?.subscriptionStatus ?? null}
        currentPeriodEnd={
          enrolment?.currentPeriodEnd ? enrolment.currentPeriodEnd.toISOString() : null
        }
        cancelAtPeriodEnd={enrolment?.cancelAtPeriodEnd ?? false}
      />

      {/* ── Account info ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-5">Account</h2>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">

          {/* Name row */}
          <div className="flex items-center px-5 lg:px-7 py-4 lg:py-5">
            <EditDisplayName initialName={displayName} />
          </div>

          {/* Email row */}
          <div className="flex items-center justify-between px-5 lg:px-7 py-4 lg:py-5">
            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">{email}</p>
            </div>
          </div>

          {/* Role row */}
          <div className="flex items-center justify-between px-5 lg:px-7 py-4 lg:py-5">
            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Role</p>
              <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">{role}</p>
            </div>
          </div>

          {/* Password row */}
          <div className="px-5 lg:px-7 py-4 lg:py-5">
            <ChangePassword />
          </div>

          {/* Theme row */}
          <div className="flex items-center justify-between px-5 lg:px-7 py-4 lg:py-5">
            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Theme</p>
              <ThemeToggle />
            </div>
          </div>

          {/* Member since row */}
          {memberSince && (
            <div className="flex items-center justify-between px-5 lg:px-7 py-4 lg:py-5">
              <div>
                <p className="text-xs lg:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Member since</p>
                <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">{memberSince}</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
