import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { getDbSubjectSlug } from "@/lib/subject-context";
import { getOwnedAssessmentDetail } from "@/lib/teacher-assessments";
import AssessmentEditor from "./AssessmentEditor";

export const dynamic = "force-dynamic";

/**
 * Assessment editor — review, reorder, shuffle, and hand-pick questions for
 * one teacher-authored paper. The heavy lifting is client-side
 * (AssessmentEditor); this page authenticates, ownership-checks, and hands
 * over the serialized AssessmentDetail.
 */
export default async function TeacherAssessmentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Teacher tools are open to TEACHER plus the admin roles (lib/utils.ts).
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "TEACHER" && !isAdminRole(dbUser?.role)) {
    redirect("/dashboard");
  }

  // Ownership-checked load via the shared serializer (lib/teacher-assessments
  // is the single source of the AssessmentDetail shape). In T1 everyone —
  // admins included — only sees their own papers, so the teacher filter is
  // unconditional. Null covers both "doesn't exist" and "not yours".
  const assessment = await getOwnedAssessmentDetail(id, user.id);
  if (!assessment) notFound();

  // Topic list for the pool browser's filter dropdown, scoped to this
  // assessment's subject. The detail's subjectSlug is the URL form
  // (wire convention) — translate back to the DB slug for the query.
  const topics = await prisma.topic.findMany({
    where: { subject: { slug: getDbSubjectSlug(assessment.subjectSlug) } },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return <AssessmentEditor initial={assessment} topics={topics} />;
}
