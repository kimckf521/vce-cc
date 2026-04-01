import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Admin check runs after auth — fast single-field lookup
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <Navbar isAdmin={isAdmin} />

      {/* Mobile top bar */}
      <TopBar />

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
      <BottomNav />
    </div>
  );
}
