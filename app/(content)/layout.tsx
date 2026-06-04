import { createClient } from "@/lib/supabase/server";
import SignupNudge from "@/components/SignupNudge";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { hasActiveSubscription } from "@/lib/subscription";
import TopBar from "@/components/TopBar";
import MarketingNav from "@/components/MarketingNav";

/**
 * Public content layout — wraps the past-paper and individual-question pages,
 * which are intentionally crawlable/indexable.
 *
 * This is the deliberate counterpart to `(app)/layout.tsx`: that group sets
 * `noindex` and redirects logged-out visitors to `/login`. This group does
 * NEITHER — the content renders for everyone, including search crawlers.
 *
 * Chrome is audience-aware:
 *   - Logged-in users get the normal app shell (TopBar; the subject layout
 *     adds the SubjectSidebar) so arriving here from inside the app is seamless.
 *   - Logged-out visitors (and crawlers) get the marketing header plus a slim
 *     "create a free account" CTA after the content.
 *
 * Auth is NOT enforced here. Any page that must stay private (the drill-bank
 * `questions/set/[id]`) guards itself with its own redirect.
 */
export default async function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---- Logged-out / crawler view: marketing chrome, no redirect ----
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MarketingNav />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
          {children}

          {/* Conversion CTA — the content is free; a free account adds
              interactive practice. Honest free-tier copy lives in SignupNudge. */}
          <SignupNudge variant="block" className="mt-10" />
        </main>
      </div>
    );
  }

  // ---- Logged-in view: mirror the (app) shell so the experience is seamless ----
  // Single-active-session enforcement intentionally lives only in
  // `(app)/layout.tsx`; this is free public content, so we don't gate it here.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true, studyingSubjects: true },
  });
  const isAdmin = isAdminRole(dbUser?.role);
  const isPaid = isAdmin || (await hasActiveSubscription(user.id).catch(() => false));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar
        isAdmin={isAdmin}
        isPaid={isPaid}
        displayName={dbUser?.name}
        email={user.email}
        studyingSubjects={dbUser?.studyingSubjects}
      />
      <main className="pt-20 lg:pt-24 px-4 pb-24 sm:px-5 lg:px-10 lg:pb-10 xl:px-12 xl:pb-12">
        {children}
      </main>
    </div>
  );
}
