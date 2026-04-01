import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { HelpCircle, Plus, CheckCircle } from "lucide-react";

function formatExamType(type: string) {
  return type === "EXAM_1" ? "Exam 1" : "Exam 2";
}

function difficultyBadge(d: string) {
  switch (d) {
    case "EASY":
      return "bg-green-50 text-green-700 border-green-100";
    case "MEDIUM":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    case "HARD":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}

export default async function AdminQuestionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") redirect("/dashboard");

  const [questions, totalSolutions] = await Promise.all([
    prisma.question.findMany({
      orderBy: [{ exam: { year: "desc" } }, { exam: { examType: "asc" } }, { questionNumber: "asc" }, { part: "asc" }],
      include: {
        exam: { select: { year: true, examType: true } },
        topic: { select: { name: true } },
        solution: { select: { id: true } },
      },
    }),
    prisma.solution.count(),
  ]);

  // Group by exam
  const grouped = new Map<string, { label: string; questions: typeof questions }>();
  for (const q of questions) {
    const key = `${q.exam.year}-${q.exam.examType}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        label: `${q.exam.year} ${formatExamType(q.exam.examType)}`,
        questions: [],
      });
    }
    grouped.get(key)!.questions.push(q);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 lg:mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HelpCircle className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Questions</h1>
          </div>
          <p className="text-gray-500 lg:text-base ml-9">
            {questions.length} questions &middot; {totalSolutions} solutions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions/bulk"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Bulk import
          </Link>
          <Link
            href="/admin/questions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add question
          </Link>
        </div>
      </div>

      {/* Questions grouped by exam */}
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          No questions yet. Add your first question to get started.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([key, { label, questions: qs }]) => (
            <div key={key}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{label}</h2>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
                {qs.map((q) => (
                  <div key={q.id} className="px-5 py-3.5 lg:px-6 lg:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        Q{q.questionNumber}{q.part ? q.part : ""}
                      </span>
                      <span className="text-sm text-gray-500 truncate">{q.topic.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${difficultyBadge(q.difficulty)}`}>
                        {q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-gray-400">{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>
                      {q.solution ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
