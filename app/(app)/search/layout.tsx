import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { canAccessFeature } from "@/lib/subscription";
import PaywallScreen from "@/components/PaywallScreen";

// Gate /search behind a paid subscription. Admins bypass.
export default async function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <>{children}</>;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (isAdminRole(dbUser?.role)) {
    return <>{children}</>;
  }

  const access = await canAccessFeature(user.id, "search");
  if (!access.allowed) {
    return <PaywallScreen feature="search" />;
  }

  return <>{children}</>;
}
