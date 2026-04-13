import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import type { SubtopicInfo, TopicQuestionFilters } from "@/lib/question-groups";
import { fetchQuestionSetGroupsPaginated } from "@/lib/question-set-groups";
import { canAccessTopic } from "@/lib/subscription";
import InfiniteQuestionList from "@/components/InfiniteQuestionList";
import TopicFilters from "@/components/TopicFilters";
import PaywallScreen from "@/components/PaywallScreen";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const INITIAL_BATCH = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    subtopic?: string;
    exam?: string;
    difficulty?: string;
    frequency?: string;
  }>;
}

export default async function TopicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { subtopic, exam, difficulty, frequency } = await searchParams;

  // Fetch topic metadata + auth (no question rows)
  const [topic, supabaseResult] = await Promise.all([
    prisma.topic.findUnique({
      where: { slug },
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

  if (user && !isAdmin) {
    const access = await canAccessTopic(user.id, slug);
    if (!access.allowed) {
      return (
        <PaywallScreen
          feature="topic"
          name={topic.name}
          backHref="/topics"
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

  const { groups: initialGroups, totalCount, hasMore } = await fetchQuestionSetGroupsPaginated(
    topic.id,
    topic.name,
    filters,
    0,
    INITIAL_BATCH,
    user?.id
  );

  return (
    <div>
      <Link
        href="/topics"
        className="inline-flex items-center gap-1 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" /> All topics
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{topic.name}</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">{totalCount} questions</p>

      {/* Horizontal filter bar */}
      <Suspense>
        <TopicFilters slug={slug} subtopics={subtopicInfos} />
      </Suspense>

      {/* Question list with infinite scroll */}
      <InfiniteQuestionList
        initialGroups={initialGroups}
        initialHasMore={hasMore}
        topicSlug={slug}
        filters={filters}
        isAdmin={isAdmin}
      />
    </div>
  );
}
