import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { canAccessFeature } from "@/lib/subscription";
import PaywallScreen from "@/components/PaywallScreen";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

// Search is a paid tool: past-paper content stays free elsewhere, but
// instant search across every question is part of the VCE Maths plan.
// Admins always pass. Stays behind login (VCAA content — no anonymous
// search); the (app) layout already redirects unauthenticated users, the
// check here is defence in depth.
export default async function SearchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!isAdminRole(dbUser?.role)) {
    const access = await canAccessFeature(user.id, "search");
    if (!access.allowed) {
      return <PaywallScreen feature="search" />;
    }
  }

  return <SearchClient />;
}
