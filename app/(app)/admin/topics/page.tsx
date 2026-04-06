import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

export default async function AdminTopicsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      subtopics: { orderBy: { order: "asc" } },
      _count: { select: { questions: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 lg:mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Topics</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
            {topics.length} {topics.length === 1 ? "topic" : "topics"} with{" "}
            {topics.reduce((s, t) => s + t.subtopics.length, 0)} subtopics
          </p>
        </div>
        <Link
          href="/admin/seed"
          className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Seed topics
        </Link>
      </div>

      {/* Topics */}
      {topics.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          No topics yet.{" "}
          <Link href="/admin/seed" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
            Seed the database
          </Link>{" "}
          to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">{topic.name}</h2>
                  {topic.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{topic.description}</p>
                  )}
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {topic._count.questions} {topic._count.questions === 1 ? "question" : "questions"}
                </span>
              </div>

              {topic.subtopics.length > 0 && (
                <div className="border-t border-gray-50 dark:border-gray-800 pt-3 mt-3">
                  <div className="flex flex-wrap gap-2">
                    {topic.subtopics.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
