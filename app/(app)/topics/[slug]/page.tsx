import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import QuestionGroup from "@/components/QuestionGroup";
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

  // Fetch questions for this topic
  const topicQuestions = await prisma.question.findMany({
    where: {
      topicId: topic.id,
      ...(subtopic ? { subtopic: { slug: subtopic } } : {}),
      ...(difficulty ? { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
      ...(year ? { exam: { year: parseInt(year) } } : {}),
    },
    include: { exam: true, topic: true, subtopic: true, solution: true, attempts: user ? { where: { userId: user.id } } : false },
    orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }],
  });

  // For each question, also fetch sibling parts from the same exam (even if different topic)
  const siblingKeys = topicQuestions.map((q) => ({ examId: q.examId, questionNumber: q.questionNumber }));
  const allSiblings = siblingKeys.length > 0
    ? await prisma.question.findMany({
        where: { OR: siblingKeys },
        include: { exam: true, topic: true, subtopic: true, solution: true, attempts: user ? { where: { userId: user.id } } : false },
        orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }, { part: "asc" }],
      })
    : [];

  // Merge and deduplicate, preserving order
  const seenIds = new Set<string>();
  const questions = allSiblings.filter((q) => {
    if (seenIds.has(q.id)) return false;
    seenIds.add(q.id);
    return true;
  });

  return (
    <div className="max-w-5xl">
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !subtopic ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            All
          </Link>
          {topic.subtopics.map((sub) => (
            <Link
              key={sub.id}
              href={`/topics/${slug}?subtopic=${sub.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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

      {/* Questions — grouped by question number */}
      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            No questions found for this filter.
          </div>
        )}
        {Object.values(
          questions.reduce((acc, q) => {
            const key = `${q.examId}-${q.questionNumber}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(q);
            return acc;
          }, {} as Record<string, typeof questions>)
        ).map((group) => (
          <QuestionGroup
            key={`${group[0].examId}-${group[0].questionNumber}`}
            year={group[0].exam.year}
            examType={group[0].exam.examType}
            topic={group[0].topic.name}
            subtopic={group[0].subtopic?.name}
            parts={group.map((q) => ({
              id: q.id,
              questionNumber: q.questionNumber,
              part: q.part,
              marks: q.marks,
              content: q.content,
              imageUrl: q.imageUrl,
              difficulty: q.difficulty,
              solution: q.solution,
              initialStatus: q.attempts?.[0]?.status ?? null,
            }))}
          />
        ))}
      </div>
    </div>
  );
}
