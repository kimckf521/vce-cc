import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  isKnownSubject,
  getSubjectMetadata,
  getDbSubjectSlug,
} from "@/lib/subject-context";
import { isKnownCurriculum } from "@/lib/curriculum-context";
import { FREE_PREVIEW_TOPIC_BY_SUBJECT } from "@/lib/subscription";
import { fetchQuestionGroupsPaginated, type SubtopicInfo } from "@/lib/question-groups";
import MarketingNav from "@/components/MarketingNav";
import TryFlow from "@/components/TryFlow";

export const dynamic = "force-dynamic";

// Don't index the taste — it's the gated topic content, surfaced for anon as a
// conversion hook. The real indexable surfaces are the landing + past-paper pages.
export const metadata = { robots: { index: false, follow: false } };

const TRY_LIMIT = 5;

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

/**
 * Anonymous "try before you register" — lets a logged-out visitor practise a
 * few REAL VCAA past-paper questions (not the generated drill bank) from the
 * free Algebra preview topic of a subject, with worked solutions and no
 * saving, then a register wall. Sourced from `fetchQuestionGroupsPaginated`
 * (real `Question` rows) rather than `fetchQuestionSetGroupsPaginated` (the
 * AI-generated bank the signed-in Topics page uses) so the page's own claim
 * of "real VCAA questions" is literally true — the default ordering (see
 * lib/question-groups.ts `fetchGroupKeys`) surfaces standalone Exam 2 MCQ
 * items first, easiest difficulty first, most recent year first, so a
 * first-time visitor gets a short, digestible, genuinely exam-authentic
 * question rather than an arbitrary or over/under-difficult one.
 *
 * This doesn't create a bait-and-switch: the same (and more) real past-paper
 * content is already public with zero signup at /{curriculum}/{subject}/exams,
 * and a free account additionally unlocks the generated drill bank via
 * Topics — so the signed-up free experience is a superset of this trial, not
 * a downgrade from it.
 *
 * Logged-in users are sent straight to the real Algebra topic page (where
 * they can save progress).
 */
export default async function TryPage({ params }: PageProps) {
  const { curriculum, subject } = await params;
  if (!isKnownCurriculum(curriculum) || !isKnownSubject(subject)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbSubjectSlug = getDbSubjectSlug(subject);
  const freeTopicSlug = FREE_PREVIEW_TOPIC_BY_SUBJECT[dbSubjectSlug];

  // Signed-in users get the real thing (the free Algebra topic, with saving).
  if (user) {
    redirect(
      `/${curriculum}/${subject}/topics${freeTopicSlug ? `/${freeTopicSlug}` : ""}`,
    );
  }

  const meta = getSubjectMetadata(subject);
  const subjectName = meta?.shortName ?? subject;

  const topic = freeTopicSlug
    ? await prisma.topic.findFirst({
        where: { slug: freeTopicSlug, subject: { slug: dbSubjectSlug } },
        select: {
          id: true,
          name: true,
          subtopics: { select: { id: true, name: true, slug: true } },
        },
      })
    : null;

  // Frequency badges aren't meaningful without attempt history for an
  // anonymous visitor — same "normal" default the real topic page uses.
  const subtopicInfos: SubtopicInfo[] =
    topic?.subtopics.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      frequency: "normal" as const,
    })) ?? [];

  const { groups } = topic
    ? await fetchQuestionGroupsPaginated(topic.id, subtopicInfos, {}, undefined, 0, TRY_LIMIT)
    : { groups: [] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 lg:mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Free practice — no signup
          </span>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 lg:text-3xl">
            Practise {subjectName}: real VCAA Algebra questions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 lg:text-base">
            Real questions from real VCAA past papers, with worked solutions.
            Have a go — pick an answer, then reveal the solution.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center text-gray-500 dark:text-gray-400">
            Questions are coming soon for this subject.{" "}
            <Link
              href="/signup"
              className="text-brand-600 underline dark:text-brand-400"
            >
              Create a free account
            </Link>{" "}
            to be the first to know.
          </div>
        ) : (
          <TryFlow groups={groups} subjectName={subjectName} />
        )}
      </main>
    </div>
  );
}
