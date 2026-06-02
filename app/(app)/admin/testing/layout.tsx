import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

/**
 * Testing-area gate. The `/admin/testing/*` pages run destructive seed/clear
 * actions and call paid Claude endpoints — accidental clicks in production
 * are expensive. Only NODE_ENV=development OR SUPER_ADMIN gets through;
 * everyone else is bounced back to /admin.
 */
export default async function AdminTestingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const allowed = process.env.NODE_ENV === "development" || dbUser?.role === "SUPER_ADMIN";
  if (!allowed) redirect("/admin");

  return <>{children}</>;
}
