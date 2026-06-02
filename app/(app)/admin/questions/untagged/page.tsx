import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole, stripLatex } from "@/lib/utils";
import { ArrowLeft, AlertTriangle, ExternalLink } from "lucide-react";
import SubjectFilterPills from "@/components/admin/SubjectFilterPills";
import { getDbSubjectSlug, isKnownSubject, SUBJECTS } from "@/lib/subject-context";

export const dynamic = "force-dynamic";

/**
 * Lists exam questions where no Subtopic is attached. The default seed assigns
 * a topic but leaves subtopics empty until someone reviews and tags them;
 * this view exposes that backlog so admins can chip away at it.
 *
 * Each row links to /admin/questions/[id]/edit where subtopics can be attached
 * via the existing edit flow.
 */
export default async function UntaggedQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const { subject: subjectUrlSlug } = await searchParams;
  const subjectFilter =
    subjectUrlSlug && isKnownSubject(subjectUrlSlug) ? getDbSubjectSlug(subjectUrlSlug) : null;
  const activeSubject = subjectFilter
    ? SUBJECTS.find((s) => getDbSubjectSlug(s.urlSlug) === subjectFilter)
    : null;

  const [totalCount, perSubjectGroups, questions, subjects] = await Promise.all([
    prisma.question.count({ where: { subtopics: { none: {} } } }),
    prisma.question.groupBy({
      by: ["subjectId"],
      where: { subtopics: { none: {} } },
      _count: true,
    }),
    prisma.question.findMany({
      where: {
        subtopics: { none: {} },
        ...(subjectFilter ? { subject: { slug: subjectFilter } } : {}),
      },
      orderBy: [{ exam: { year: "desc" } }, { questionNumber: "asc" }],
      take: 200,
      include: {
        exam: { select: { year: true, examType: true } },
        topic: { select: { name: true } },
        subject: { select: { slug: true, name: true } },
      },
    }),
    prisma.subject.findMany({ select: { id: true, slug: true } }),
  ]);

  const subjectIdToSlug = new Map(subjects.map((s) => [s.id, s.slug]));
  const perSubject = new Map<string, number>();
  for (const row of perSubjectGroups) {
    const slug = row.subjectId ? subjectIdToSlug.get(row.subjectId) : null;
    if (slug) perSubject.set(slug, row._count);
  }

  return (
    <div>
      <Link
        href="/admin/questions"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to questions
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <AlertTriangle className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Untagged subtopics</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          {totalCount.toLocaleString()} exam questions across all subjects have no subtopic assigned.
        </p>
      </div>

      <SubjectFilterPills />

      {/* Per-subject overview — gives a sense of where the backlog lives */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {SUBJECTS.map((s) => {
          const count = perSubject.get(getDbSubjectSlug(s.urlSlug)) ?? 0;
          const isActive = activeSubject?.urlSlug === s.urlSlug;
          return (
            <Link
              key={s.urlSlug}
              href={`/admin/questions/untagged?subject=${s.urlSlug}`}
              className={`rounded-xl border px-4 py-3 transition-colors ${
                isActive
                  ? "border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-950"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <p className={`text-xs font-medium ${s.colors.text}`}>{s.shortName}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {count.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">untagged</p>
            </Link>
          );
        })}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          {activeSubject
            ? `No untagged questions in ${activeSubject.shortName}.`
            : "Nothing to retag — all exam questions have subtopics assigned."}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Showing the first {questions.length} of {activeSubject ? (perSubject.get(getDbSubjectSlug(activeSubject.urlSlug)) ?? questions.length) : totalCount}.
            Click a row to edit and attach subtopics.
          </p>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3">Question</th>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Exam</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Q{q.questionNumber}
                        {q.part ? q.part : ""}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xl">
                        {stripLatex(q.content).slice(0, 100)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      <p>{q.topic.name}</p>
                      {q.subject && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{q.subject.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {q.exam.year} · {q.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/questions/${q.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-3 py-1.5 text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                      >
                        Tag subtopics
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
