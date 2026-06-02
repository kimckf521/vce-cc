"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { TopicQuestionFilters, QuestionGroupData } from "@/lib/question-groups";
import { fetchQuestionSetGroupsPaginated } from "@/lib/question-set-groups";

const BATCH_SIZE = 10;

export async function loadMoreGroups(
  topicSlug: string,
  filters: TopicQuestionFilters,
  offset: number,
  subjectSlug?: string
): Promise<{ groups: QuestionGroupData[]; hasMore: boolean }> {
  // Topic.slug is NOT globally unique — every subject has its own
  // "algebra-number-and-structure", "calculus", etc. The lookup MUST be scoped
  // by subject: an unscoped findFirst resolves to an arbitrary subject's topic
  // (Postgres returns rows in unspecified order), so "load more" would serve a
  // different subject's questions than the page rendered initially.
  const [topic, supabaseResult] = await Promise.all([
    prisma.topic.findFirst({
      where: {
        slug: topicSlug,
        ...(subjectSlug ? { subject: { slug: subjectSlug } } : {}),
      },
      select: { id: true, name: true, subject: { select: { slug: true } } },
    }),
    createClient().then((s) => s.auth.getUser()),
  ]);

  if (!topic) return { groups: [], hasMore: false };

  const { groups, hasMore } = await fetchQuestionSetGroupsPaginated(
    topic.id,
    topic.name,
    filters,
    offset,
    BATCH_SIZE,
    supabaseResult.data.user?.id,
    subjectSlug ?? topic.subject?.slug,
  );

  return { groups, hasMore };
}
