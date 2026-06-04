import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import type { SubtopicInfo, TopicQuestionFilters } from "@/lib/question-groups";
import { fetchQuestionSetGroupsPaginated } from "@/lib/question-set-groups";
import { canAccessTopic } from "@/lib/subscription";
import { getDbSubjectSlug } from "@/lib/subject-context";
import InfiniteQuestionList from "@/components/InfiniteQuestionList";
import TopicFilters from "@/components/TopicFilters";
import TopicGuidanceChips from "@/components/TopicGuidanceChips";
import PaywallScreen from "@/components/PaywallScreen";
import BackToTopButton from "@/components/BackToTopButton";
import BackLink from "@/components/BackLink";

const INITIAL_BATCH = 10;

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; slug: string }>;
  searchParams: Promise<{
    subtopic?: string;
    exam?: string;
    difficulty?: string;
    frequency?: string;
  }>;
}

export default async function TopicPage({ params, searchParams }: PageProps) {
  const { curriculum, subject: subjectSlug, slug } = await params;
  const subjectTopicsHref = `/${curriculum}/${subjectSlug}/topics`;
  const { subtopic, exam, difficulty, frequency } = await searchParams;

  // Fetch topic metadata + auth (no question rows). Scope by subject so the
  // same topic slug (e.g. "calculus") works across both `methods` and
  // `specialist` — they share the slug but resolve to different Topic rows
  // via the `@@unique([subjectId, slug])` compound key. `getDbSubjectSlug`
  // translates the URL's short `methods` to the DB's legacy `mathematical-methods`.
  const dbSubjectSlug = getDbSubjectSlug(subjectSlug);
  const [topic, supabaseResult] = await Promise.all([
    prisma.topic.findFirst({
      where: { slug, subject: { slug: dbSubjectSlug } },
      select: {
        id: true,
        name: true,
        slug: true,
        subtopics: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    createClient().then((s) => s.auth.getUser()),
  ]);
  if (!topic) notFound();

  const user = supabaseResult.data.user;

  // Fetch role + subscription status in parallel for the gate check.
  // Admins bypass the paywall entirely.
  const dbUser = user
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
    : null;
  const isAdmin = isAdminRole(dbUser?.role);

  // Topic access — computed once and reused below for canTrackProgress. Admins
  // bypass; everyone else gets the free Algebra preview topic or a paid subject.
  let access: { allowed: boolean } = { allowed: true };
  if (user && !isAdmin) {
    access = await canAccessTopic(user.id, slug, dbSubjectSlug);
    if (!access.allowed) {
      return (
        <PaywallScreen
          feature="topic"
          name={topic.name}
          backHref={subjectTopicsHref}
          backLabel="Back to topics"
        />
      );
    }
  }

  // Frequency is no longer meaningful for generated items — all subtopics flagged "normal"
  const subtopicInfos: SubtopicInfo[] = topic.subtopics.map((sub) => ({
    id: sub.id,
    name: sub.name,
    slug: sub.slug,
    frequency: "normal" as const,
  }));

  const filters: TopicQuestionFilters = { subtopic, exam, difficulty, frequency };

  const { groups: initialGroups, hasMore } = await fetchQuestionSetGroupsPaginated(
    topic.id,
    topic.name,
    filters,
    0,
    INITIAL_BATCH,
    user?.id,
    dbSubjectSlug,
  );

  // Mark/bookmark is unlocked wherever the user can access the topic ("save what
  // you can access") — so free users get live buttons on the free Algebra topic,
  // and locked icons on paid topics (which they can't open anyway).
  const canTrackProgress = isAdmin || (!!user && access.allowed);

  return (
    <div>
      <BackLink href={subjectTopicsHref} label="All topics" className="mb-3 lg:mb-6" />

      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-8">{topic.name}</h1>

      {/* Suggested-start chip strip */}
      <TopicGuidanceChips
        slug={slug}
        subjectBase={`/${curriculum}/${subjectSlug}`}
        subjectSlug={dbSubjectSlug}
        firstSubtopicSlug={topic.subtopics[0]?.slug}
        currentSubtopic={subtopic}
        currentExam={exam}
      />

      {/* Horizontal filter bar */}
      <Suspense>
        <TopicFilters slug={slug} subjectSlug={dbSubjectSlug} subtopics={subtopicInfos} />
      </Suspense>

      {/* Question list with infinite scroll */}
      <InfiniteQuestionList
        initialGroups={initialGroups}
        initialHasMore={hasMore}
        topicSlug={slug}
        subjectSlug={dbSubjectSlug}
        filters={filters}
        isAdmin={isAdmin}
        canTrackProgress={canTrackProgress}
      />

      <BackToTopButton />
    </div>
  );
}
