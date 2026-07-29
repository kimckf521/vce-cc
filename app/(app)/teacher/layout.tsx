import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

// Gates every /teacher sub-page behind the teacher (or admin) role — mirrors
// app/(app)/admin/layout.tsx. TEACHER unlocks the assessment builder; admins
// keep access so they can support teachers without a role swap. Everyone else
// lands back on the dashboard.
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "TEACHER" && !isAdminRole(dbUser?.role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
