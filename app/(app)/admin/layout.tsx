import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

// Gates every /admin sub-page behind the admin role. Previously only the
// admin index page checked the role, so any logged-in student could render
// the sub-page shells directly. This layout enforces the baseline ADMIN
// requirement for the whole route group; SUPER_ADMIN distinctions stay
// inside the individual pages.
export default async function AdminLayout({
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
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  return <>{children}</>;
}
