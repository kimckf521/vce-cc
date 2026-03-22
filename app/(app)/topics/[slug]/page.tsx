import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import QuestionCard from "@/components/QuestionCard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subtopic?: string; difficulty?: string; year?: string }>;
}

export default async function TopicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { subtopic, difficulty, year } = await searchParams;

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: { subtopics: { orderBy: { order: "asc" } } },
  });
  if (!topic) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const questions = await prisma.question.findMany({
    where: {
      topicId: topic.id,
      ...(subtopic ? { subtopic: { slug: subtopic } } : {}),
      ...(difficulty ? { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
      ...(year ? { exam: { year: parseInt(year) } } : {}),
    },
    include: {
      exam: true,
      topic: true,
      subtopic: true,
      solution: true,
      attempts: user ? { where: { userId: user.id } } : false,
    },
    orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }],
  });

  return (
    <div className="max-w-3xl">
      <Link href="/topics" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> All topics
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{topic.name}</h1>
      <p className="text-gray-500 mb-6">{questions.length} questions</p>

      {/* Subtopic filters */}
      {topic.subtopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/topics/${slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !subtopic ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            All
          </Link>
          {topic.subtopics.map((sub) => (
            <Link
              key={sub.id}
              href={`/topics/${slug}?subtopic=${sub.slug}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                subtopic === sub.slug
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            No questions found for this filter.
          </div>
        )}
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            id={q.id}
            questionNumber={q.questionNumber}
            part={q.part}
            marks={q.marks}
            year={q.exam.year}
            examType={q.exam.examType}
            topic={q.topic.name}
            subtopic={q.subtopic?.name}
            content={q.content}
            difficulty={q.difficulty}
            solution={q.solution}
            initialStatus={q.attempts?.[0]?.status ?? null}
          />
        ))}
      </div>
    </div>
  );
}
