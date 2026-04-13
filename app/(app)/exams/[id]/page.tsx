export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import ExamCompleteButton from "@/components/ExamCompleteButton";

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
      attempts: user ? { where: { userId: user.id }, select: { status: true, bookmarked: true } } : false,
    },
    orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
  });

  // Check if user has completed this exam
  const isCompleted = user
    ? !!(await prisma.examCompletion.findUnique({
        where: { userId_examId: { userId: user.id, examId: id } },
      }))
    : false;

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
      initialBookmarked: q.attempts?.[0]?.bookmarked ?? false,
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

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 lg:text-base">
            {isTwoSection
              ? `Section A: ${sectionA.length} questions · Section B: ${sectionBGroups.length} questions`
              : `${sectionA.length + sectionBGroups.length} questions`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {exam.pdfUrl && (
            <a
              href={exam.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/50 px-3 py-2 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Original Exam PDF
            </a>
          )}
          {exam.answerUrl && (
            <a
              href={exam.answerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Examiner Report
            </a>
          )}
        </div>
      </div>

      {/* VCAA Copyright Notice */}
      <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        <span className="font-semibold text-gray-600 dark:text-gray-300">Copyright notice: </span>
        Exam questions on this page are reproduced from past VCAA Mathematical Methods examinations for individual study and research purposes under the fair dealing provisions of the{" "}
        <em>Copyright Act 1968</em> (Cth). This site is not affiliated with, endorsed by, or associated with the Victorian Curriculum and Assessment Authority (VCAA).{" "}
        © Victorian Curriculum and Assessment Authority. For current and official versions of all VCE examinations, visit{" "}
        <a
          href="https://www.vcaa.vic.edu.au"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          www.vcaa.vic.edu.au
        </a>
        .
      </div>

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

      {/* Complete button */}
      {(sectionA.length > 0 || sectionBGroups.length > 0) && (
        <ExamCompleteButton examId={id} initialCompleted={isCompleted} />
      )}
    </div>
  );
}
