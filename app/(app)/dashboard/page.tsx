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
import { getStudyStreak } from "@/lib/streak";
import { EXAM_CONFIG } from "@/lib/exam-config";
import DashboardEmptyState from "@/components/DashboardEmptyState";
import UpsellBanner from "@/components/UpsellBanner";
import SubjectsGrid from "@/components/SubjectsGrid";
import StreakBanner from "@/components/StreakBanner";
import ExamCountdown from "@/components/ExamCountdown";
import {
  DEFAULT_SUBJECT_SLUG,
  getUrlSubjectSlug,
  getSubjectMetadata,
  visibleSwitcherSubjects,
  type SubjectMetadata,
} from "@/lib/subject-context";
import { DEFAULT_CURRICULUM_SLUG } from "@/lib/curriculum-context";
import {
  getSubjectProgressForUser,
  pickContinueRevising,
} from "@/lib/subject-progress";

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

  const [dbUser, attempts, enrolments, topicAttemptCounts, streak, questionSetAttemptCount, examSessionAgg] =
    await Promise.all([
      userId
        ? prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true, studyingSubjects: true } })
        : null,
      userId
        ? prisma.attempt.groupBy({ by: ["status"], where: { userId }, _count: true })
        : [],
      userId
        ? prisma.subjectEnrolment.findMany({
            where: { userId },
            select: {
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
          })
        : [],
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
      userId ? getStudyStreak(userId) : 0,
      // Every practice surface writes QuestionSetAttempt (topic drills) or
      // ExamSession (timed practice papers) — NOT the legacy Attempt table
      // above (real past-paper self-marking only). Without these, a student
      // who sits a full Exam 1 and self-marks it still sees `isFirstRun`
      // stuck true and the dashboard telling them to "start revising".
      userId ? prisma.questionSetAttempt.count({ where: { userId } }) : 0,
      userId
        ? prisma.examSession.aggregate({ where: { userId }, _sum: { totalQuestions: true }, _count: true })
        : null,
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

  // Broad "has this account done ANY practice" signal — spans all three
  // practice surfaces (real-past-paper Attempt, generated-drill
  // QuestionSetAttempt, timed-session ExamSession), not just the first.
  // Deliberately scoped: only drives first-run gating + the welcome copy
  // below. The Accuracy/Correct/Incorrect stat strip and topic-progress
  // rings further down stay Attempt-only — they measure self-marked
  // real-past-paper accuracy specifically, a different, narrower metric
  // that blending in ungraded/drill data would silently redefine.
  const examSessionQuestionTotal = examSessionAgg?._sum.totalQuestions ?? 0;
  const totalActivityCount = totalAttempted + questionSetAttemptCount + examSessionQuestionTotal;
  const hasAnyActivity = totalActivityCount > 0;

  /* ── per-subject sections ── */
  // Resolve each enrolment to (subject metadata + url slug + topics). Drop
  // enrolments whose DB subject slug isn't in the known list (defensive — would
  // only happen for legacy data or a not-yet-wired subject).
  type SubjectSection = {
    meta: SubjectMetadata;
    urlSlug: string;
    topics: { id: string; name: string; slug: string }[];
  };
  // Subjects the student has registered (empty registration → all subjects).
  // Same source of truth as the nav switcher, so the dashboard only surfaces
  // the maths they actually study.
  const registeredSlugs = new Set<string>(
    visibleSwitcherSubjects(dbUser?.studyingSubjects).map((s) => s.urlSlug),
  );
  const subjectSections: SubjectSection[] = [];
  for (const e of enrolments) {
    const urlSlug = getUrlSubjectSlug(e.subject.slug);
    if (!urlSlug) continue;
    const meta = getSubjectMetadata(urlSlug);
    if (!meta) continue;
    if (!registeredSlugs.has(urlSlug)) continue;
    subjectSections.push({ meta, urlSlug, topics: e.subject.topics });
  }
  // Fallback for users with no enrolments yet (e.g. mid-signup) — show Methods
  // so the page never renders blank.
  if (subjectSections.length === 0) {
    const fallback = getSubjectMetadata(DEFAULT_SUBJECT_SLUG);
    if (fallback) {
      subjectSections.push({ meta: fallback, urlSlug: DEFAULT_SUBJECT_SLUG, topics: [] });
    }
  }

  // Find weakest topic across all enrolled subjects (lowest correct rate, ≥2 attempts).
  let weakestTopic: { name: string; slug: string; rate: number; subjectUrlSlug: string } | null = null;
  for (const section of subjectSections) {
    for (const t of section.topics) {
      const ta = attemptByTopic.get(t.id);
      if (!ta || ta.attempted < 2) continue;
      const rate = Math.round((ta.correct / ta.attempted) * 100);
      if (!weakestTopic || rate < weakestTopic.rate) {
        weakestTopic = { name: t.name, slug: t.slug, rate, subjectUrlSlug: section.urlSlug };
      }
    }
  }
  const primarySubjectUrlSlug = subjectSections[0]?.urlSlug ?? DEFAULT_SUBJECT_SLUG;

  const isAdmin = isAdminRole(dbUser?.role);
  const isPaid = !!userId && (isAdmin || (await hasActiveSubscription(userId)));
  const showUpgradeCard = !!userId && !isAdmin && !isPaid;

  const firstName = dbUser?.name?.split(" ")[0] ?? "";
  // Brand-new users (auto-enrolled in all 4 subjects, zero attempts) get a
  // first-run screen: a real welcome (not "back"), the "pick a starting point"
  // guide, and NO zero-filled stat strip / 0% rings that read as broken.
  const isFirstRun = !hasAnyActivity;

  // Per-subject progress for the new "My subjects" grid + Continue revising card
  // — filtered to the student's registered subjects (empty registration = all).
  const subjectProgress = (
    userId ? await getSubjectProgressForUser(userId) : []
  ).filter((p) => registeredSlugs.has(p.urlSlug));
  const continueRevising = pickContinueRevising(subjectProgress);
  const curriculum = DEFAULT_CURRICULUM_SLUG;

  // Countdown subjects. With no explicit registration, registeredSlugs falls
  // back to ALL subjects (nav-switcher semantics) — which would headline the
  // soonest exam of a subject the student never touches (e.g. "General Exam 1
  // · 3 days" for a legacy Methods-only account). Narrow to subjects with
  // actual attempt activity when there is any; all-subjects only as the
  // final fallback for accounts with no signal at all.
  const hasRegistration = (dbUser?.studyingSubjects ?? []).length > 0;
  const activeSlugs = subjectProgress
    .filter((p) => p.totalAttempts > 0)
    .map((p) => p.urlSlug);
  const countdownSubjects =
    !hasRegistration && activeSlugs.length > 0
      ? activeSlugs
      : Array.from(registeredSlugs);

  // Deep link for the "Practice these now" CTA — a weak-areas Freedom session
  // in the weakest topic's subject. mode=exam1 keeps it on the free practice
  // path (never paywalled mid-flow); version=freedom because weak-area focus
  // is a Freedom-version feature (see PracticeSetupForm's
  // effectiveFocusWeakAreas); weak=1 flips the session picker into its 3×
  // boost of previously incorrect / needs-review items. `dist` must carry one
  // weight per topic in the subject — the session page falls back to a 4-way
  // split when it's missing, which would zero out Specialist's 5th and 6th
  // topics. The card promises focus on the NAMED topic, so weight its index
  // heavily (70 vs 10 each for the rest — distributeToCounts normalises by
  // sum, so exact percentages aren't required). Topics here and in the
  // session page are both ordered by `order: asc`, so indices align.
  let weakPracticeUrl: string | null = null;
  if (weakestTopic) {
    const wt = weakestTopic;
    const sectionTopics =
      subjectSections.find((s) => s.urlSlug === wt.subjectUrlSlug)?.topics ??
      [];
    const topicCount = sectionTopics.length || 4;
    const weakIdx = sectionTopics.findIndex((t) => t.slug === wt.slug);
    // weakIdx can't be -1 (weakestTopic was picked from these topics), but
    // an all-equal fallback keeps the URL sane if that ever changes.
    const dist = Array.from({ length: topicCount }, (_, i) =>
      i === weakIdx ? 70 : 10,
    );
    weakPracticeUrl = `/${curriculum}/${wt.subjectUrlSlug}/practice/session?mode=exam1&version=freedom&count=${EXAM_CONFIG.exam1.freedomDefault}&dist=${dist.join(",")}&solutions=1&weak=1`;
  }


  /* ────────────────────────────── JSX ────────────────────────────── */

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Free-user upsell — per-session dismissible, brand-tinted */}
      {showUpgradeCard && <UpsellBanner variant="default" />}

      {/* ─── Hero: Welcome + CTA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isFirstRun
              ? firstName
                ? `Welcome, ${firstName} 👋`
                : "Welcome 👋"
              : firstName
                ? `Welcome back, ${firstName}`
                : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm lg:text-base text-gray-500 dark:text-gray-400">
            {!hasAnyActivity
              ? "Ready to start revising?"
              : `${totalActivityCount} questions attempted`}
          </p>
        </div>
        <Link
          href={`/${curriculum}/${primarySubjectUrlSlug}/topics`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-semibold text-white transition-colors shrink-0"
        >
          <Play className="h-4 w-4" />
          {!hasAnyActivity ? "Start studying" : "Practice now"}
        </Link>
      </div>

      {/* ─── Study streak — hides itself at streak 0 ─── */}
      <StreakBanner streak={streak} />

      {/* ─── Exam countdown strip — registered subjects, or (for accounts
              with no registration) the subjects they actually practise.
              Hides itself when no dates are published or all have passed. ─── */}
      <ExamCountdown subjects={countdownSubjects} />

      {/* ─── Continue revising — deep link to last topic touched ─── */}
      {continueRevising?.lastTopicSlug && continueRevising.lastTopicName && (
        <Link
          href={`/${curriculum}/${continueRevising.urlSlug}/topics/${continueRevising.lastTopicSlug}`}
          className="group block rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-gray-900 p-5 lg:p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900 flex-shrink-0">
              <Target className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Continue revising · {continueRevising.meta.shortName}
              </p>
              <h2 className="mt-0.5 text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {continueRevising.lastTopicName}
              </h2>
            </div>
            <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      )}

      {/* First-run guide — shown whenever the user has zero attempts (signup
          auto-enrols all 4 subjects, so the old `subjectProgress.length === 0`
          guard was never true and this never rendered). Gives new students one
          obvious "answer your first question" path. */}
      {isFirstRun && (
        <DashboardEmptyState curriculum={curriculum} subjectUrlSlug={primarySubjectUrlSlug} />
      )}

      {/* ─── My subjects ─── */}
      <div>
        <h2 className="text-sm lg:text-base font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          My subjects
        </h2>
        <SubjectsGrid curriculum={curriculum} progress={subjectProgress} />
      </div>

      {/* ─── Quick Stats Strip — hidden on first run (all zeros reads as
              broken; DashboardEmptyState above is the first-run surface) ─── */}
      {!isFirstRun && (
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
      )}

      {/* ─── Topic Progress (grouped by subject) — also hidden on first run:
              a wall of 0% rings is noise before the student has attempted
              anything. Reappears with the first attempt. ─── */}
      {!isFirstRun && (
      <div className="space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Topic progress</h2>
          {!isPaid && (
            <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              Track your progress over time with{" "}
              <Link href="/pricing" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Standard
              </Link>
              .
            </p>
          )}
        </div>

        {subjectSections.map((section) => {
          const c = section.meta.colors;
          return (
            <section
              key={section.urlSlug}
              className="space-y-3 lg:space-y-4"
              aria-label={section.meta.displayName}
            >
              {/* Subject header — flat, no tinted surface */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${c.badge}`}
                    aria-hidden="true"
                  >
                    {section.meta.badge}
                  </span>
                  <h3 className={`text-sm lg:text-base font-semibold ${c.text} truncate`}>
                    {section.meta.displayName}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    · {section.topics.length} {section.topics.length === 1 ? "topic" : "topics"}
                  </span>
                </div>
                <Link
                  href={`/${curriculum}/${section.urlSlug}/topics`}
                  className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-0.5 shrink-0"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Topic grid for this subject */}
              {section.topics.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No topics yet — check back soon.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  {section.topics.map((topic) => {
                    const ta = attemptByTopic.get(topic.id) ?? { attempted: 0, correct: 0 };
                    const topicCorrectRate = ta.attempted > 0
                      ? Math.round((ta.correct / ta.attempted) * 100)
                      : 0;

                    return (
                      <Link
                        key={topic.id}
                        href={`/${curriculum}/${section.urlSlug}/topics/${topic.slug}`}
                        className="group flex items-center gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:p-5 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
                      >
                        {/* Ring chart — uses subject colour */}
                        <div className="relative shrink-0">
                          <RingChart pct={topicCorrectRate} size={56} stroke={5} trackClass={c.track} ringClass={c.ring} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-gray-100">
                            {topicCorrectRate}%
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                            {topic.name}
                          </h4>
                          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {ta.attempted === 0 ? "Not started" : `${ta.attempted} attempted`}
                          </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      )}

      {/* ─── Weak-area nudge — primary CTA drops straight into a weak-areas
              practice session; the topic link stays as the secondary path ─── */}
      {weakestTopic && (
        <div className="rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4 lg:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-1">Needs work</p>
          <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">{weakestTopic.name}</p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {weakestTopic.rate}% correct — keep practising to improve
          </p>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {weakPracticeUrl && (
              <Link
                href={weakPracticeUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                <Zap className="h-4 w-4" />
                Practice these now
              </Link>
            )}
            <Link
              href={`/${curriculum}/${weakestTopic.subjectUrlSlug}/topics/${weakestTopic.slug}`}
              className="inline-flex items-center justify-center gap-0.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Browse the topic <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
