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

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the target question
  const question = await prisma.question.findUnique({
    where: { id },
    select: {
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
      attempts: user ? { where: { userId: user.id }, select: { status: true } } : false,
    },
  });

  if (!question) notFound();

  // For multi-part questions (part !== null), fetch all sibling parts
  let parts;
  if (question.part !== null) {
    const siblings = await prisma.question.findMany({
      where: { examId: question.examId, questionNumber: question.questionNumber },
      select: {
        id: true,
        questionNumber: true,
        part: true,
        marks: true,
        content: true,
        imageUrl: true,
        difficulty: true,
        exam: { select: { year: true, examType: true } },
        topic: { select: { name: true } },
        subtopics: { select: { name: true } },
        solution: { select: { content: true, imageUrl: true, videoUrl: true } },
        attempts: user ? { where: { userId: user.id }, select: { status: true } } : false,
      },
      orderBy: { part: "asc" },
    });
    parts = siblings;
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
        className="inline-flex items-center gap-1 text-sm lg:text-base text-gray-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" /> Back to Search
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
      <p className="text-gray-500 lg:text-base mb-8">
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
