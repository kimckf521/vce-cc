import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/utils";
import ProfileTabs from "@/components/ProfileTabs";
import { STANDARD_SUBJECT_SLUG } from "@/lib/stripe";

// ── page ──────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "__no_user__";

  const [dbUser, enrolment] = await Promise.all([
    user ? prisma.user.findUnique({ where: { id: userId } }) : null,
    user
      ? prisma.subjectEnrolment.findFirst({
          where: { userId, subject: { slug: STANDARD_SUBJECT_SLUG } },
          include: { subject: { select: { name: true } } },
        })
      : null,
  ]);

  // ── identity ──────────────────────────────────────────────────────────────
  const email       = user?.email ?? "student@example.com";
  const displayName = dbUser?.name ?? email.split("@")[0];
  const initials    = displayName
    .split(/\s+/)
    .map((w: string) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" })
    : null;

  const role = roleLabel(dbUser?.role);

  return (
    <div className="space-y-5 lg:space-y-6">

      {/* ── Compact profile header ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 lg:p-6">
        <div className="flex items-center gap-4 lg:gap-5">
          {/* Avatar */}
          <div className="flex h-14 w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 font-bold text-xl lg:text-2xl select-none">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {displayName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 px-2.5 py-0.5 text-xs font-semibold">
                {role}
              </span>
              {memberSince && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabbed content ─────────────────────────────────────────────── */}
      <ProfileTabs
        displayName={displayName}
        email={email}
        role={role}
        memberSince={memberSince}
        billing={{
          hasSubscription:
            enrolment?.tier === "PAID" &&
            (enrolment?.subscriptionStatus === "active" ||
              enrolment?.subscriptionStatus === "trialing"),
          planName: enrolment?.subject?.name ?? null,
          status: enrolment?.subscriptionStatus ?? null,
          currentPeriodEnd: enrolment?.currentPeriodEnd ? enrolment.currentPeriodEnd.toISOString() : null,
          cancelAtPeriodEnd: enrolment?.cancelAtPeriodEnd ?? false,
        }}
      />
    </div>
  );
}
