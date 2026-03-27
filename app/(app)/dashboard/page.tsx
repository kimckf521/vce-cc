export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle, BookmarkIcon, TrendingUp } from "lucide-react";

// Count question groups (not raw rows): MCQs are standalone, Section B deduped by (examId, questionNumber)
function computeGroupCount(questions: { examId: string; questionNumber: number; part: string | null }[]): number {
  const mcqCount = questions.filter((q) => q.part === null).length;
  const sectionBKeys = new Set(
    questions.filter((q) => q.part !== null).map((q) => `${q.examId}-${q.questionNumber}`)
  );
  return mcqCount + sectionBKeys.size;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [dbUser, attempts, topics] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.attempt.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      include: {
        questions: {
          select: { examId: true, questionNumber: true, part: true },
        },
      },
    }),
  ]);

  const countMap = Object.fromEntries(attempts.map((a) => [a.status, a._count]));
  const correct = countMap["CORRECT"] ?? 0;
  const incorrect = countMap["INCORRECT"] ?? 0;
  const needsReview = countMap["NEEDS_REVIEW"] ?? 0;
  const attempted = countMap["ATTEMPTED"] ?? 0;
  const totalAttempted = correct + incorrect + needsReview + attempted;

  // Total question groups across all topics
  const totalQuestions = topics.reduce((sum, t) => sum + computeGroupCount(t.questions), 0);

  const stats = [
    { label: "Correct", value: correct, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Incorrect", value: incorrect, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Needs Review", value: needsReview, icon: BookmarkIcon, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Total Attempted", value: totalAttempted, icon: TrendingUp, color: "text-brand-600", bg: "bg-brand-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Welcome back{dbUser?.name ? `, ${dbUser.name}` : ""}
        </h1>
        <p className="mt-1 text-gray-500 lg:text-base">
          {totalAttempted} of {totalQuestions} questions attempted
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm lg:text-base font-medium text-gray-700">Overall progress</span>
          <span className="text-sm lg:text-base text-gray-400">
            {totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 lg:h-4 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${totalQuestions > 0 ? (totalAttempted / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:p-7">
            <div className={`inline-flex rounded-xl ${bg} p-2.5 lg:p-3 mb-3`}>
              <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm lg:text-base text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Browse by topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:p-6 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold lg:text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
                {topic.name}
              </h3>
              <p className="mt-1 text-sm lg:text-base text-gray-400">
                {computeGroupCount(topic.questions)} questions
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
