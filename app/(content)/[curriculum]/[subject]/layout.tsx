import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { isKnownSubject, getDbSubjectSlug } from "@/lib/subject-context";
import { hasActiveSubscription } from "@/lib/subscription";
import SubjectSidebar from "@/components/SubjectSidebar";
import SubjectBottomTabs from "@/components/SubjectBottomTabs";

/**
 * Subject route guard + chrome for the public content group.
 *
 *   - Validates the :subject segment (`methods` / `specialist` / `general` /
 *     `foundation`); unknown → 404. (Curriculum already validated upstream.)
 *   - Logged-in users get the same SubjectSidebar / SubjectBottomTabs chrome
 *     as the `(app)` group, so navigating here from inside the app is seamless.
 *   - Logged-out visitors get the content full-width: the app sidebar links to
 *     gated features (topics / practice), so showing it to a logged-out reader
 *     would just be a wall of links that bounce to /login.
 */
export default async function PublicSubjectLayout({
  params,
  children,
}: {
  params: Promise<{ curriculum: string; subject: string }>;
  children: React.ReactNode;
}) {
  const { curriculum, subject } = await params;
  if (!isKnownSubject(subject)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged-out / crawler: render content full width, no app sidebar.
  if (!user) {
    return <>{children}</>;
  }

  // Logged-in: resolve paid access for the sidebar status block (fail closed
  // to "free" so a sidebar fetch hiccup never 500s the page).
  let isPaid = false;
  let studyingSubjects: string[] = [];
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, studyingSubjects: true },
    });
    studyingSubjects = dbUser?.studyingSubjects ?? [];
    isPaid =
      isAdminRole(dbUser?.role) ||
      (await hasActiveSubscription(user.id, getDbSubjectSlug(subject)));
  } catch {
    isPaid = false;
  }

  return (
    <>
      <SubjectSidebar
        curriculum={curriculum}
        subject={subject}
        isPaid={isPaid}
        studyingSubjects={studyingSubjects}
      />

      {/* Children get offset right of the desktop sidebar; full width on mobile. */}
      <div className="lg:ml-60">{children}</div>

      <SubjectBottomTabs curriculum={curriculum} subject={subject} />
    </>
  );
}
