export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import BackLink from "@/components/BackLink";
import { questionBackLink } from "@/lib/question-back-link";

// The drill bank stays private: it's a paid tool, and mass-publishing
// generated items risks thin-content penalties. This page used to rely on the
// (app) auth gate; now that it lives in the public (content) group it guards
// itself (below) and opts out of indexing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = {
  MCQ: "Multiple Choice",
  SHORT_ANSWER: "Short Answer",
  EXTENDED_RESPONSE: "Extended Response",
};

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function QuestionSetItemPage({ params, searchParams }: PageProps) {
  const { curriculum, subject, id } = await params;
  const { from } = await searchParams;
  const back = questionBackLink(from, curriculum, subject);

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

  // Drill bank is a paid tool — keep it private now that this page lives in the
  // public (content) group (which no longer redirects logged-out visitors).
  if (!user) redirect(`/login?next=/${curriculum}/${subject}/questions/set/${id}`);

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
      <BackLink href={back.href} label={back.label} className="mb-6" />

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
