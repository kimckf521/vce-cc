import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { redirect } from "next/navigation";

// Search is admin-only while under development.
// Non-admin users are redirected to dashboard.
export default async function SearchLayout({
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

  if (!isAdminRole(dbUser?.role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
