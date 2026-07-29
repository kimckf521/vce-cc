import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isTeacherRole } from "@/lib/teacher-gate";
import { getOwnedAssessmentDetail } from "@/lib/teacher-assessments";
import PaginatedSheet from "./PaginatedSheet";
import PaperSheet, { type PrintSlot } from "./PaperSheet";
import PrintToolbar from "./PrintToolbar";
import "./print.css";

export const dynamic = "force-dynamic";

/**
 * Printable view of one teacher-authored assessment.
 *
 * Lives OUTSIDE the (app) group on purpose: print pages must not inherit the
 * TopBar/sidebar chrome, so this route renders just the paper inside the root
 * layout and self-guards (Supabase user → teacher-or-admin role → ownership).
 *
 * Two variants share the route: the default is the student paper; ?solutions=1
 * is the marking guide. The teacher prints from the browser (window.print()),
 * so KaTeX renders client-side exactly as it does in the editor.
 */

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ solutions?: string }>;
}

/** Reserved VCAA past-paper row (AssessmentItem.questionId) — order + marks only. */
type GatedRow = { order: number; question: { marks: number } | null };

/**
 * Auth + data for one print request, cached per render pass so the page and
 * generateMetadata share a single round of queries. Null assessment covers
 * "signed out", "not a teacher", "doesn't exist" AND "not yours" — the page
 * tells them apart via user/role.
 */
const loadPrintData = cache(async (id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { user: null, role: null, assessment: null, gatedItems: [] as GatedRow[] };

  // Teacher tools are open to TEACHER plus the admin roles (lib/teacher-gate).
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const role = dbUser?.role ?? null;
  if (!isTeacherRole(role))
    return { user, role, assessment: null, gatedItems: [] as GatedRow[] };

  // Ownership-scoped load — null hides other teachers' assessment ids (404).
  const assessment = await getOwnedAssessmentDetail(id, user.id);
  if (!assessment)
    return { user, role, assessment: null, gatedItems: [] as GatedRow[] };

  // COPYRIGHT GATE (dormant): rows with questionId set are VCAA past-paper
  // questions. T1 never writes them and the AssessmentDetail serializer drops
  // them entirely, so if one ever appears we'd silently skip its number. Fetch
  // order + marks only — never the question content — so the print views can
  // render a reference notice in its place. Ownership was already verified
  // above, so scoping by assessmentId alone is safe.
  // `questionSetItemId: null` keeps this the EXACT complement of the
  // serializer's drop rule (questionSetItem == null): schema exclusivity is
  // comment-only, so a row with BOTH FKs set must not render (and count) twice.
  const gatedItems: GatedRow[] = await prisma.assessmentItem.findMany({
    where: { assessmentId: id, questionId: { not: null }, questionSetItemId: null },
    orderBy: { order: "asc" },
    select: { order: true, question: { select: { marks: true } } },
  });

  return { user, role, assessment, gatedItems };
});

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { solutions } = await searchParams;
  // Teacher-only pages never index; also keeps error/redirect renders out.
  const robots = { index: false, follow: false };
  const { assessment } = await loadPrintData(id);
  if (!assessment) return { robots };
  // Absolute title (skips the " | ATAR Hero" template) so browser
  // print-to-PDF names the file after the paper itself.
  return {
    title: {
      absolute:
        solutions === "1"
          ? `${assessment.title} — Marking guide`
          : assessment.title,
    },
    robots,
  };
}

export default async function PrintAssessmentPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { solutions: solutionsParam } = await searchParams;
  const solutions = solutionsParam === "1";

  const { user, role, assessment, gatedItems } = await loadPrintData(id);
  if (!user) {
    // Same self-guard convention as the (content) question-set page — carry
    // the intended destination (variant included) through the login funnel.
    const dest = `/print/assessments/${id}${solutions ? "?solutions=1" : ""}`;
    redirect(`/login?next=${encodeURIComponent(dest)}`);
  }
  if (!isTeacherRole(role)) redirect("/dashboard");
  if (!assessment) notFound();

  // Merge real items with any gated VCAA rows into one numbered sequence.
  // Numbering is positional (1..M) — `order` only decides the sequence.
  const slots: PrintSlot[] = [
    ...assessment.items.map((item) => ({
      kind: "item" as const,
      order: item.order,
      item,
    })),
    ...gatedItems.map((g) => ({
      kind: "vcaa" as const,
      order: g.order,
      marks: g.question?.marks ?? 0,
    })),
  ].sort((a, b) => a.order - b.order);

  // Detail totalMarks only counts hydrated items; add the gated rows' marks so
  // the header total matches the numbered questions.
  const totalMarks =
    assessment.totalMarks +
    gatedItems.reduce((sum, g) => sum + (g.question?.marks ?? 0), 0);

  return (
    <div className="print-route">
      {/* Paper is white regardless of the user's theme. This inline script
          strips the root `dark` class before first paint (the root layout's
          anti-flash script just added it); PrintToolbar keeps it off while
          the route is mounted and restores the preference on exit. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.remove("dark")`,
        }}
      />
      <PrintToolbar assessmentId={assessment.id} solutions={solutions} />
      {/* PaginatedSheet adds the on-screen page-by-page preview around the
          continuous sheet; both variants get it for free through PaperSheet.
          In print it dissolves and the sheet flows exactly as before. */}
      <PaginatedSheet>
        <PaperSheet
          assessment={assessment}
          slots={slots}
          totalMarks={totalMarks}
          solutions={solutions}
        />
      </PaginatedSheet>
    </div>
  );
}
