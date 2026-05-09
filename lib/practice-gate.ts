import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { hasActiveSubscription } from "@/lib/subscription";

/**
 * Returns true when the current user is allowed to access paid practice modes
 * (exam2a, exam2b, exam2ab). Admins and active paid subscribers pass; everyone
 * else is gated. Used by per-page gates so /practice/exam1 stays free.
 */
export async function canAccessPaidPractice(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (isAdminRole(dbUser?.role)) return true;

  return hasActiveSubscription(user.id);
}
