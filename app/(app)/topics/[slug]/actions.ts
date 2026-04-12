"use server";

import { prisma } from "@/lib/prisma";
import type { TopicQuestionFilters, QuestionGroupData } from "@/lib/question-groups";
import { fetchQuestionSetGroupsPaginated } from "@/lib/question-set-groups";

const BATCH_SIZE = 10;

export async function loadMoreGroups(
  topicSlug: string,
  filters: TopicQuestionFilters,
  offset: number
): Promise<{ groups: QuestionGroupData[]; hasMore: boolean }> {
  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    select: { id: true, name: true },
  });

  if (!topic) return { groups: [], hasMore: false };

  const { groups, hasMore } = await fetchQuestionSetGroupsPaginated(
    topic.id,
    topic.name,
    filters,
    offset,
    BATCH_SIZE
  );

  return { groups, hasMore };
}
