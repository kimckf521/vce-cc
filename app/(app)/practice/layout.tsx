import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { canAccessFeature } from "@/lib/subscription";
import PaywallScreen from "@/components/PaywallScreen";

// Gate every /practice/* route behind a paid subscription.
// Admins bypass the paywall.
export default async function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <>{children}</>; // Auth is handled by the outer (app) layout.

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (isAdminRole(dbUser?.role)) {
    return <>{children}</>;
  }

  const access = await canAccessFeature(user.id, "practice");
  if (!access.allowed) {
    return <PaywallScreen feature="practice" />;
  }

  return <>{children}</>;
}
