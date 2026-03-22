import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle, BookmarkIcon, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [dbUser, attempts, totalQuestions] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.attempt.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.question.count(),
  ]);

  const countMap = Object.fromEntries(attempts.map((a) => [a.status, a._count]));
  const correct = countMap["CORRECT"] ?? 0;
  const incorrect = countMap["INCORRECT"] ?? 0;
  const needsReview = countMap["NEEDS_REVIEW"] ?? 0;
  const attempted = countMap["ATTEMPTED"] ?? 0;
  const totalAttempted = correct + incorrect + needsReview + attempted;

  const stats = [
    { label: "Correct", value: correct, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Incorrect", value: incorrect, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Needs Review", value: needsReview, icon: BookmarkIcon, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Total Attempted", value: totalAttempted, icon: TrendingUp, color: "text-brand-600", bg: "bg-brand-50" },
  ];

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{dbUser?.name ? `, ${dbUser.name}` : ""}
        </h1>
        <p className="mt-1 text-gray-500">
          {totalAttempted} of {totalQuestions} questions attempted
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Overall progress</span>
          <span className="text-sm text-gray-400">
            {totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${totalQuestions > 0 ? (totalAttempted / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div className={`inline-flex rounded-xl ${bg} p-2.5 mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {topic.name}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {topic._count.questions} questions
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
