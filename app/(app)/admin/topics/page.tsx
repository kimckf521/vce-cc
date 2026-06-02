import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import SubjectFilterPills from "@/components/admin/SubjectFilterPills";
import { getDbSubjectSlug, isKnownSubject, SUBJECTS } from "@/lib/subject-context";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const { subject: subjectUrlSlug } = await searchParams;
  const subjectFilter =
    subjectUrlSlug && isKnownSubject(subjectUrlSlug) ? getDbSubjectSlug(subjectUrlSlug) : null;

  const topics = await prisma.topic.findMany({
    where: subjectFilter ? { subject: { slug: subjectFilter } } : undefined,
    orderBy: [{ subject: { slug: "asc" } }, { order: "asc" }],
    include: {
      subtopics: { orderBy: { order: "asc" } },
      subject: { select: { slug: true, name: true } },
      _count: { select: { questions: true } },
    },
  });

  const activeSubject = subjectFilter
    ? SUBJECTS.find((s) => getDbSubjectSlug(s.urlSlug) === subjectFilter)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Topics</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
            {topics.length} {topics.length === 1 ? "topic" : "topics"} with{" "}
            {topics.reduce((s, t) => s + t.subtopics.length, 0)} subtopics
            {activeSubject ? ` in ${activeSubject.shortName}` : ""}
          </p>
        </div>
      </div>

      <SubjectFilterPills />

      {/* Topics */}
      {topics.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          No topics{activeSubject ? ` for ${activeSubject.shortName}` : ""}. Run the canonical seed scripts in <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs">scripts/seed-*-mathematics.ts</code> to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6"
            >
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">{topic.name}</h2>
                    {topic.subject && !activeSubject && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        {topic.subject.name}
                      </span>
                    )}
                  </div>
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
