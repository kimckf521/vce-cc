import Link from "next/link";
import { redirect } from "next/navigation";
import { FilePlus2, FileText, Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { getSubjectMetadata, getUrlSubjectSlug } from "@/lib/subject-context";
import type { AssessmentSummary } from "@/lib/teacher-assessments";

export const dynamic = "force-dynamic";

// Status chip styling — Draft (in progress), Final (locked in), Archived.
// Labels must match the editor's STATUS_META (assessments/[id]/
// AssessmentEditor.tsx): the PUBLISHED status reads "Final" everywhere —
// nothing is shared with students in T1, so "Published" would mislead.
const STATUS_CHIPS: Record<
  AssessmentSummary["status"],
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  },
  PUBLISHED: {
    label: "Final",
    className:
      "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  },
  ARCHIVED: {
    label: "Archived",
    className:
      "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  },
};

/**
 * Teacher home — "Your assessments" list.
 *
 * Server-rendered straight from the DB (same data GET /api/teacher/assessments
 * serves: own assessments only, newest updatedAt first) so the list is fresh
 * on every visit without a client fetch. The layout has already verified the
 * teacher/admin role; we re-resolve the user here only to scope the query.
 */
export default async function TeacherHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await prisma.assessment.findMany({
    where: { teacherId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      subject: { select: { name: true, slug: true } },
      // T1: every item sources from the generated bank (questionSetItem);
      // the reserved past-paper linkage is never populated, so marks come
      // exclusively from questionSetItem.
      items: { select: { questionSetItem: { select: { marks: true } } } },
    },
  });

  const assessments: AssessmentSummary[] = rows.map((a) => ({
    id: a.id,
    title: a.title,
    subjectSlug: getUrlSubjectSlug(a.subject.slug) ?? a.subject.slug,
    subjectName: a.subject.name,
    status: a.status,
    totalMarks: a.items.reduce(
      (sum, item) => sum + (item.questionSetItem?.marks ?? 0),
      0
    ),
    itemCount: a.items.length,
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Your assessments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Papers you build are private to you.
          </p>
        </div>
        <Link
          href="/teacher/assessments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
        >
          <FilePlus2 className="h-4 w-4" />
          New assessment
        </Link>
      </div>

      {/* grid-cols-1 (minmax(0,1fr)) matters: a bare auto column lets the
          nowrap truncated title blow the card past the mobile viewport. */}
      {assessments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {assessments.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentCard({ assessment }: { assessment: AssessmentSummary }) {
  const subjectMeta = getSubjectMetadata(assessment.subjectSlug);
  const statusChip = STATUS_CHIPS[assessment.status] ?? STATUS_CHIPS.DRAFT;
  const updated = new Date(assessment.updatedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Stretched-link card: the title link covers the whole card via its
  // `after` overlay (a nested <a> inside a card-wide <Link> would be invalid
  // HTML), while the quiet Print link sits above it with `relative z-10`.
  return (
    <div className="relative rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/teacher/assessments/${assessment.id}`}
          className="min-w-0 font-semibold text-gray-900 dark:text-gray-100 truncate after:absolute after:inset-0"
        >
          {assessment.title}
        </Link>
        <span
          className={cn(
            "flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            statusChip.className
          )}
        >
          {statusChip.label}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium",
            subjectMeta
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              : "bg-gray-100 dark:bg-gray-800"
          )}
        >
          {subjectMeta && (
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                subjectMeta.colors.badge
              )}
            >
              {subjectMeta.badge}
            </span>
          )}
          {subjectMeta?.shortName ?? assessment.subjectName}
        </span>
        <span className="font-medium tabular-nums">
          {assessment.totalMarks} marks
        </span>
        <span className="tabular-nums">
          {assessment.itemCount}{" "}
          {assessment.itemCount === 1 ? "question" : "questions"}
        </span>
        <span>Updated {updated}</span>
        <Link
          href={`/print/assessments/${assessment.id}`}
          target="_blank"
          rel="noopener"
          aria-label={`Print ${assessment.title}`}
          className="relative z-10 ml-auto inline-flex items-center gap-1 font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
        <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">
        Build a topic test or SAC-style paper in minutes from our original
        question bank
      </h2>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Pick a subject, choose topics and a difficulty mix, and we assemble a
        paper you can fine-tune question by question.
      </p>
      <Link
        href="/teacher/assessments/new"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
      >
        <FilePlus2 className="h-4 w-4" />
        Create your first paper
      </Link>
    </div>
  );
}
