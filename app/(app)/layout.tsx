import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { SESSION_COOKIE } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/subscription";
import TopBar from "@/components/TopBar";

// All authenticated routes under (app)/ should never appear in search results.
// This metadata cascades to every page within this layout group.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Single-active-session enforcement + admin check + display name in one lookup.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, activeSessionId: true, name: true, studyingSubjects: true },
  });
  const isAdmin = isAdminRole(dbUser?.role);
  // Teachers get the /teacher assessment-builder entry; admins keep it too so
  // they can reach the tools without a role swap.
  const isTeacher = dbUser?.role === "TEACHER" || isAdmin;
  // If a session ID has been issued for this user in the DB AND either the
  // browser has no cookie or it doesn't match, this browser has been
  // superseded by a newer login. Sign out of Supabase and redirect to login
  // with a reason so the user sees a friendly message.
  //
  // Admins and super admins are exempt — they may log in on multiple devices.
  if (!isAdmin && dbUser?.activeSessionId) {
    const cookieStore = await cookies();
    const cookieSid = cookieStore.get(SESSION_COOKIE)?.value;
    if (dbUser.activeSessionId !== cookieSid) {
      await supabase.auth.signOut();
      redirect("/login?reason=other-device");
    }
  }

  // Paid state — used by TopBar to decide whether to show the mega-menu
  // footer upsell. Admins skip the upsell (they bypass the paywall anyway).
  // Failure-closed: any DB hiccup falls back to "not paid", so the upsell
  // shows unnecessarily — annoying but not broken.
  const isPaid = isAdmin || (await hasActiveSubscription(user.id).catch(() => false));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar
        isAdmin={isAdmin}
        isTeacher={isTeacher}
        isPaid={isPaid}
        displayName={dbUser?.name}
        email={user.email}
        studyingSubjects={dbUser?.studyingSubjects}
      />

      {/* Main content
          - Top padding clears the fixed TopBar (h-14 mobile, h-16 desktop)
            PLUS a bit of breathing room so page headings don't hug the bar
          - Bottom padding clears mobile SubjectBottomTabs (64px) on subject
            pages; harmless extra space on global pages
          - Subject pages add their own lg:ml-60 wrapper to clear the
            SubjectSidebar; global pages use full width
      */}
      <main className="
        pt-20 lg:pt-24
        px-4 pb-24 sm:px-5
        lg:px-10 lg:pb-10
        xl:px-12 xl:pb-12
      ">
        {children}
      </main>
    </div>
  );
}
