import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { isKnownSubject } from "@/lib/subject-context";
import { hasActiveSubscription } from "@/lib/subscription";
import { getDbSubjectSlug } from "@/lib/subject-context";
import SubjectSidebar from "@/components/SubjectSidebar";
import SubjectBottomTabs from "@/components/SubjectBottomTabs";

/**
 * Subject route guard + chrome.
 *
 * Wraps every `/[curriculum]/[subject]/...` page:
 *   - Validates the :subject segment is a known short slug (`methods`,
 *     `specialist`, `foundation`, `general`). Unknown → 404.
 *   - Mounts the desktop SubjectSidebar (left, fixed, lg+ only).
 *   - Mounts the mobile SubjectBottomTabs (bottom, fixed, mobile only).
 *   - Resolves the user's paid/free access for the status block.
 *
 * The parent `[curriculum]/layout.tsx` has already validated curriculum.
 */
export default async function SubjectLayout({
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

  // Resolve the user's paid access — drives the sidebar/drawer status block.
  // Admin role bypasses the upsell (they get unlocked access without a sub).
  // Failing closed (treat as free) on any error keeps the UI rendering
  // rather than 500-ing on a sidebar fetch issue.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isPaid = false;
  let studyingSubjects: string[] = [];
  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, studyingSubjects: true },
      });
      studyingSubjects = dbUser?.studyingSubjects ?? [];
      if (isAdminRole(dbUser?.role)) {
        isPaid = true;
      } else {
        isPaid = await hasActiveSubscription(user.id, getDbSubjectSlug(subject));
      }
    } catch {
      isPaid = false;
    }
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
