export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const questionSelect = (userId?: string) => ({
  id: true,
  questionNumber: true,
  part: true,
  marks: true,
  content: true,
  imageUrl: true,
  difficulty: true,
  examId: true,
  exam: { select: { year: true, examType: true } },
  topic: { select: { name: true } },
  subtopics: { select: { name: true } },
  solution: { select: { content: true, imageUrl: true, videoUrl: true } },
  attempts: userId
    ? ({ where: { userId }, select: { status: true } } as const)
    : (false as const),
} as const);

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;

  // Parallel: fetch question metadata (lightweight) + auth
  const [questionMeta, supabaseResult] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      select: { id: true, questionNumber: true, part: true, examId: true },
    }),
    createClient().then((s) => s.auth.getUser()),
  ]);
  if (!questionMeta) notFound();

  const user = supabaseResult.data.user;
  const select = questionSelect(user?.id);

  // Fetch full question data + sibling parts in parallel if multi-part
  const isSectionB = questionMeta.part !== null;
  const question = isSectionB
    ? await prisma.question.findUnique({ where: { id }, select })
    : await prisma.question.findUnique({ where: { id }, select });

  if (!question) notFound();

  let parts: (typeof question)[];
  if (isSectionB) {
    parts = await prisma.question.findMany({
      where: { examId: questionMeta.examId, questionNumber: questionMeta.questionNumber },
      select,
      orderBy: { part: "asc" },
    });
  } else {
    parts = [question];
  }

  const examLabel = question.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
  const sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B" =
    question.exam.examType === "EXAM_1"
      ? "Exam 1"
      : question.part === null
        ? "Exam 2A"
        : "Exam 2B";

  const title = `${question.exam.year} ${examLabel} — Question ${question.questionNumber}`;

  function toGroupParts(qs: typeof parts) {
    return qs.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      part: q.part,
      marks: q.marks,
      content: q.content,
      imageUrl: q.imageUrl,
      difficulty: q.difficulty,
      solution: q.solution,
      initialStatus: q.attempts?.[0]?.status ?? null,
    }));
  }

  return (
    <div>
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" /> Back to Search
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        {question.topic.name}
        {question.subtopics.length > 0 && ` · ${question.subtopics.map((s) => s.name).join(", ")}`}
      </p>

      <QuestionGroup
        year={question.exam.year}
        examType={question.exam.examType}
        sectionLabel={sectionLabel}
        topic={question.topic.name}
        subtopics={question.subtopics.map((s) => s.name)}
        parts={toGroupParts(parts)}
      />
    </div>
  );
}
