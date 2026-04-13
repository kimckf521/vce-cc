export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  MCQ: "Multiple Choice",
  SHORT_ANSWER: "Short Answer",
  EXTENDED_RESPONSE: "Extended Response",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionSetItemPage({ params }: PageProps) {
  const { id } = await params;

  const [item, supabaseResult] = await Promise.all([
    prisma.questionSetItem.findUnique({
      where: { id },
      include: {
        topic: { select: { name: true } },
        subtopics: { select: { name: true } },
        questionSet: { select: { name: true } },
      },
    }),
    createClient().then((s) => s.auth.getUser()),
  ]);

  if (!item) notFound();

  const user = supabaseResult.data.user;

  const attempt = user
    ? await prisma.questionSetAttempt.findUnique({
        where: { userId_questionSetItemId: { userId: user.id, questionSetItemId: id } },
        select: { status: true, bookmarked: true },
      })
    : null;

  // Stitch MCQ options into content
  const contentWithOptions =
    item.type === "MCQ" && item.optionA
      ? `${item.content}\n\n**A.** ${item.optionA}\n\n**B.** ${item.optionB ?? ""}\n\n**C.** ${item.optionC ?? ""}\n\n**D.** ${item.optionD ?? ""}`
      : item.content;

  // Embed MCQ answer in solution
  const solutionContent =
    item.type === "MCQ" && item.correctOption && item.solutionContent
      ? `**Answer: ${item.correctOption}**\n\n${item.solutionContent}`
      : item.solutionContent ?? "";

  const sectionLabel = TYPE_LABEL[item.type] ?? item.type;

  return (
    <div>
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" /> Back to History
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        {item.topic.name}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        {item.subtopics.length > 0 ? item.subtopics.map((s) => s.name).join(", ") : item.questionSet.name}
      </p>

      <QuestionGroup
        year={0}
        examType="EXAM_1"
        sectionLabel={sectionLabel}
        topic={item.topic.name}
        subtopics={item.subtopics.map((s) => s.name)}
        parts={[
          {
            id: item.id,
            questionNumber: item.order + 1,
            part: null,
            marks: item.marks,
            content: contentWithOptions,
            imageUrl: null,
            difficulty: item.difficulty,
            solution: solutionContent
              ? { content: solutionContent, imageUrl: null, videoUrl: null }
              : null,
            initialStatus: (attempt?.status as "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW") ?? null,
            initialBookmarked: attempt?.bookmarked ?? false,
          },
        ]}
      />
    </div>
  );
}
