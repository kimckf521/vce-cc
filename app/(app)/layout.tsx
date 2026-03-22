import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth disabled for testing
  // if (!user) redirect("/login");
  // const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const isAdmin = true; // treat as admin during testing

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  );
}
