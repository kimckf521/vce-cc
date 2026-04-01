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
  // Parallel: fetch topic metadata + auth + year counts (lightweight queries)
  const [topic, supabaseResult, subtopicYearCounts] = await Promise.all([
    prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: {
        id: true,
        subtopics: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    createClient().then((s) => s.auth.getUser()),
    // Use a lightweight count query instead of fetching all question rows
    prisma.$queryRaw<{ subtopicId: string; yearCount: bigint }[]>`
      SELECT s."id" AS "subtopicId", COUNT(DISTINCT e."year") AS "yearCount"
      FROM "Subtopic" s
      JOIN "_QuestionToSubtopic" qs ON qs."B" = s."id"
      JOIN "Question" q ON q."id" = qs."A"
      JOIN "Exam" e ON e."id" = q."examId"
      JOIN "Topic" t ON t."id" = q."topicId"
      WHERE t."slug" = ${topicSlug}
      GROUP BY s."id"
    `,
  ]);

  if (!topic) return { groups: [], hasMore: false };

  const yearCountMap = new Map(subtopicYearCounts.map((r) => [r.subtopicId, Number(r.yearCount)]));

  const subtopicInfos: SubtopicInfo[] = topic.subtopics.map((sub) => {
    const yearCount = yearCountMap.get(sub.id) ?? 0;
    const freq: "rare" | "normal" | "often" =
      yearCount >= 6 ? "often" : yearCount >= 3 ? "normal" : "rare";
    return { id: sub.id, name: sub.name, slug: sub.slug, frequency: freq };
  });

  const user = supabaseResult.data.user;

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
