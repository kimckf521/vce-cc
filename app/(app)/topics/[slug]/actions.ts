"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  fetchQuestionGroups,
  type SubtopicInfo,
  type TopicQuestionFilters,
  type QuestionGroupData,
} from "@/lib/question-groups";

const BATCH_SIZE = 10;

export async function loadMoreGroups(
  topicSlug: string,
  filters: TopicQuestionFilters,
  offset: number
): Promise<{ groups: QuestionGroupData[]; hasMore: boolean }> {
  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: {
      subtopics: {
        orderBy: { order: "asc" },
        include: {
          questions: { select: { exam: { select: { year: true } } } },
        },
      },
    },
  });

  if (!topic) return { groups: [], hasMore: false };

  const subtopicInfos: SubtopicInfo[] = topic.subtopics.map((sub) => {
    const yearCount = new Set(sub.questions.map((q) => q.exam.year)).size;
    const freq: "rare" | "normal" | "often" =
      yearCount >= 6 ? "often" : yearCount >= 3 ? "normal" : "rare";
    return { id: sub.id, name: sub.name, slug: sub.slug, frequency: freq };
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allGroups = await fetchQuestionGroups(
    topic.id,
    subtopicInfos,
    filters,
    user?.id
  );

  const batch = allGroups.slice(offset, offset + BATCH_SIZE);
  const hasMore = offset + BATCH_SIZE < allGroups.length;

  return { groups: batch, hasMore };
}
