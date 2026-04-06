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

export default async function ExamPage({ params }: PageProps) {
  const { id } = await params;

  // Parallel: fetch exam metadata + auth at the same time
  const [exam, supabaseResult] = await Promise.all([
    prisma.exam.findUnique({ where: { id } }),
    createClient().then((s) => s.auth.getUser()),
  ]);
  if (!exam) notFound();

  const user = supabaseResult.data.user;

  // Fetch all questions for this exam ordered by question number then part
  const questions = await prisma.question.findMany({
    where: { examId: id },
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
    orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
  });

  // Section A: standalone MCQs (part === null)
  const sectionA = questions.filter((q) => q.part === null);

  // Section B: multi-part questions (part !== null), grouped by questionNumber
  const sectionBMap = questions
    .filter((q) => q.part !== null)
    .reduce((acc, q) => {
      const key = q.questionNumber;
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    }, {} as Record<number, typeof questions>);
  const sectionBGroups = Object.values(sectionBMap);

  const isTwoSection = exam.examType === "EXAM_2" && sectionA.length > 0 && sectionBGroups.length > 0;
  const title = `${exam.year} Mathematical Methods — Exam ${exam.examType === "EXAM_1" ? "1" : "2"}`;

  function toGroupParts(group: typeof questions) {
    return group.map((q) => ({
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
        href="/exams"
        className="inline-flex items-center gap-1 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" /> Past Papers
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        {isTwoSection
          ? `Section A: ${sectionA.length} questions · Section B: ${sectionBGroups.length} questions`
          : `${sectionA.length + sectionBGroups.length} questions`}
      </p>

      {/* Section A — Multiple Choice */}
      {sectionA.length > 0 && (
        <div className="mb-10 lg:mb-12">
          {isTwoSection && (
            <div className="mb-4 lg:mb-5">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">Section A — Multiple Choice</h2>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{sectionA.length} questions · 1 mark each</p>
            </div>
          )}
          <div className="space-y-4 lg:space-y-5">
            {sectionA.map((q) => (
              <QuestionGroup
                key={q.id}
                year={exam.year}
                examType={exam.examType}
                sectionLabel={exam.examType === "EXAM_2" ? "Exam 2A" : "Exam 1"}
                questionIndex={q.questionNumber}
                topic={q.topic.name}
                subtopics={q.subtopics.map((s) => s.name)}
                parts={toGroupParts([q])}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section B — Extended Response */}
      {sectionBGroups.length > 0 && (
        <div>
          {isTwoSection && (
            <div className="mb-4 lg:mb-5">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">Section B — Extended Response</h2>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{sectionBGroups.length} questions</p>
            </div>
          )}
          <div className="space-y-4 lg:space-y-5">
            {sectionBGroups.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
                No questions found for this exam.
              </div>
            )}
            {sectionBGroups.map((group) => (
              <QuestionGroup
                key={group[0].questionNumber}
                year={exam.year}
                examType={exam.examType}
                sectionLabel={exam.examType === "EXAM_2" ? "Exam 2B" : "Exam 1"}
                questionIndex={group[0].questionNumber}
                topic={group[0].topic.name}
                subtopics={group[0].subtopics.map((s) => s.name)}
                parts={toGroupParts(group)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback if no sections */}
      {sectionA.length === 0 && sectionBGroups.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
          No questions found for this exam.
        </div>
      )}
    </div>
  );
}
