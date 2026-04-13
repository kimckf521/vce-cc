import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { SESSION_COOKIE } from "@/lib/session";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

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

  // Single-active-session enforcement + admin check in one lookup.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, activeSessionId: true },
  });
  const cookieStore = await cookies();
  const cookieSid = cookieStore.get(SESSION_COOKIE)?.value;
  // If a session ID has been issued for this user in the DB AND either the
  // browser has no cookie or it doesn't match, this browser has been
  // superseded by a newer login. Sign out of Supabase and redirect to login
  // with a reason so the user sees a friendly message.
  if (dbUser?.activeSessionId && dbUser.activeSessionId !== cookieSid) {
    await supabase.auth.signOut();
    redirect("/login?reason=other-device");
  }
  const isAdmin = isAdminRole(dbUser?.role);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <Navbar isAdmin={isAdmin} />

      {/* Mobile top bar */}
      <TopBar isAdmin={isAdmin} />

      {/* Main content
          - Mobile:  full width, top padding for TopBar (56px), bottom padding for BottomNav (64px)
          - Desktop: left margin for sidebar, normal padding
      */}
      <main className="
        flex-1 min-w-0
        lg:ml-72
        pt-[72px] px-4 pb-24
        sm:pt-[76px] sm:px-5
        lg:pt-10 lg:px-10 lg:pb-10
        xl:pt-12 xl:px-12 xl:pb-12
      ">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
