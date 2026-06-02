import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import MathContent from "@/components/MathContent";
import SubtopicTagger from "./SubtopicTagger";

export const dynamic = "force-dynamic";

/**
 * Minimal per-question edit page used by the untagged-subtopics retag flow.
 * Heavier editing (content + solution) still happens inline on /admin/exams.
 * This page focuses on attaching the right subtopics to one question.
 */
export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      exam: { select: { year: true, examType: true } },
      topic: {
        select: {
          id: true,
          name: true,
          subtopics: { select: { id: true, name: true }, orderBy: { order: "asc" } },
        },
      },
      subject: { select: { name: true } },
      subtopics: { select: { id: true } },
    },
  });

  if (!question) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/questions/untagged"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to untagged
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Q{question.questionNumber}
          {question.part ?? ""}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {question.subject?.name ?? "Unscoped"} · {question.exam.year}{" "}
          {question.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2"} · {question.topic.name}
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 lg:p-6 mb-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Question
        </div>
        <MathContent content={question.content} />
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt={`Q${question.questionNumber}`}
            className="mt-4 max-w-full rounded-lg border border-gray-200 dark:border-gray-800"
          />
        )}
      </div>

      <SubtopicTagger
        questionId={question.id}
        topicName={question.topic.name}
        availableSubtopics={question.topic.subtopics}
        initialSelectedIds={question.subtopics.map((s) => s.id)}
      />
    </div>
  );
}
