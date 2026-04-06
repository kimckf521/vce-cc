import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { fetchQuestionGroupsPaginated, type SubtopicInfo, type TopicQuestionFilters } from "@/lib/question-groups";
import InfiniteQuestionList from "@/components/InfiniteQuestionList";
import TopicFilters from "@/components/TopicFilters";
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

  // Parallel: fetch topic metadata + auth + year counts (no question rows)
  const [topic, supabaseResult, subtopicYearCounts] = await Promise.all([
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
    prisma.$queryRaw<{ subtopicId: string; yearCount: bigint }[]>`
      SELECT s."id" AS "subtopicId", COUNT(DISTINCT e."year") AS "yearCount"
      FROM "Subtopic" s
      JOIN "_QuestionToSubtopic" qs ON qs."B" = s."id"
      JOIN "Question" q ON q."id" = qs."A"
      JOIN "Exam" e ON e."id" = q."examId"
      JOIN "Topic" t ON t."id" = q."topicId"
      WHERE t."slug" = ${slug}
      GROUP BY s."id"
    `,
  ]);
  if (!topic) notFound();

  const user = supabaseResult.data.user;

  const yearCountMap = new Map(subtopicYearCounts.map((r) => [r.subtopicId, Number(r.yearCount)]));
  const subtopicInfos: SubtopicInfo[] = topic.subtopics.map((sub) => {
    const yearCount = yearCountMap.get(sub.id) ?? 0;
    const freq: "rare" | "normal" | "often" =
      yearCount >= 6 ? "often" : yearCount >= 3 ? "normal" : "rare";
    return { id: sub.id, name: sub.name, slug: sub.slug, frequency: freq };
  });

  const filters: TopicQuestionFilters = { subtopic, exam, difficulty, frequency };

  // Parallel: admin check + question groups fetch (paginated — only hydrates first batch)
  const [dbUser, { groups: initialGroups, totalCount, hasMore }] = await Promise.all([
    user
      ? prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
      : null,
    fetchQuestionGroupsPaginated(topic.id, subtopicInfos, filters, user?.id, 0, INITIAL_BATCH),
  ]);
  const isAdmin = isAdminRole(dbUser?.role);

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
