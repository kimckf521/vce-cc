import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle, BookmarkIcon, TrendingUp, Users, ArrowLeft, MailCheck, MailWarning } from "lucide-react";
import { isAdminRole, roleLabel } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { isResourceMissing } from "@/lib/stripe-customer";
import CreateAccountForm from "./CreateAccountForm";
import GiveCreditButton from "./GiveCreditButton";
import RoleSelector from "./RoleSelector";

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-400",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400",
];

function avatarColor(id: string) {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Fetch email-confirmation status for all users from Supabase Auth.
 *
 * Returns Map<userId, confirmedAt|null>. A null value means the user has
 * not yet confirmed their email; a Date means they have. Users not present
 * in the map (e.g. deleted from auth) default to null on lookup.
 *
 * Uses the admin API. listUsers() paginates at 1000/page; we currently have
 * a small user base so a single page is enough. If the user count grows
 * past ~900, paginate properly.
 */
async function fetchEmailConfirmedMap(): Promise<Map<string, Date | null>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return new Map();

  try {
    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) {
      console.error("[admin-users] listUsers failed:", error.message);
      return new Map();
    }
    const map = new Map<string, Date | null>();
    for (const u of data.users) {
      map.set(u.id, u.email_confirmed_at ? new Date(u.email_confirmed_at) : null);
    }
    return map;
  } catch (err) {
    console.error("[admin-users] fetchEmailConfirmedMap error:", err);
    return new Map();
  }
}

/**
 * Fetch each user's current Stripe customer balance (signed cents).
 * Returns the RAW Stripe balance:
 *   - Negative → customer has credit (will be applied to next invoice)
 *   - Positive → customer OWES that amount (will be charged on next invoice)
 *   - 0       → no credit, no debt
 *
 * Skips users without a stripeCustomerId, returns 0 for them. Errors per-customer
 * are swallowed so a single bad customer doesn't break the whole list.
 */
async function fetchCreditBalances(
  users: { id: string; stripeCustomerId: string | null }[]
): Promise<Map<string, number>> {
  const stripe = getStripe();
  const entries = await Promise.all(
    users.map(async (u): Promise<[string, number]> => {
      if (!u.stripeCustomerId) return [u.id, 0];
      try {
        const c = await stripe.customers.retrieve(u.stripeCustomerId);
        if (c.deleted) return [u.id, 0];
        return [u.id, typeof c.balance === "number" ? c.balance : 0];
      } catch (err) {
        if (!isResourceMissing(err)) {
          console.error(`[admin-users] balance fetch failed for ${u.id}:`, err);
        }
        return [u.id, 0];
      }
    })
  );
  return new Map(entries);
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");
  const isSuperAdmin = dbUser?.role === "SUPER_ADMIN";

  const [users, totalQuestions, attemptStats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        stripeCustomerId: true,
        enrolments: {
          select: {
            tier: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.question.count(),
    prisma.attempt.groupBy({
      by: ["userId", "status"],
      _count: true,
    }),
  ]);

  // Parallel: Stripe balances (super-admin only) + Supabase email-confirmation
  // status (all admins).
  const [creditBalances, emailConfirmedMap] = await Promise.all([
    isSuperAdmin
      ? fetchCreditBalances(users.map((u) => ({ id: u.id, stripeCustomerId: u.stripeCustomerId })))
      : Promise.resolve(new Map<string, number>()),
    fetchEmailConfirmedMap(),
  ]);

  // Build a map: userId → { CORRECT: n, INCORRECT: n, ... }
  const statsMap = new Map<string, Record<string, number>>();
  for (const row of attemptStats) {
    if (!statsMap.has(row.userId)) statsMap.set(row.userId, {});
    statsMap.get(row.userId)![row.status] = row._count;
  }

  const usersWithStats = users.map((u) => {
    const counts = statsMap.get(u.id) ?? {};
    const correct = counts["CORRECT"] ?? 0;
    const incorrect = counts["INCORRECT"] ?? 0;
    const needsReview = counts["NEEDS_REVIEW"] ?? 0;
    const attempted = counts["ATTEMPTED"] ?? 0;
    const total = correct + incorrect + needsReview + attempted;
    const pct = totalQuestions > 0 ? Math.round((total / totalQuestions) * 100) : 0;
    return { ...u, correct, incorrect, needsReview, attempted, total, pct };
  });

  return (
    <div>
      {/* Back to admin */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Users className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
              {users.length} {users.length === 1 ? "account" : "accounts"} registered
            </p>
          </div>
          <CreateAccountForm isSuperAdmin={dbUser?.role === "SUPER_ADMIN"} />
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-10">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6">
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">Total users</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6">
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {usersWithStats.reduce((s, u) => s + u.total, 0)}
          </p>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">Total attempts</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6">
          <p className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
            {usersWithStats.reduce((s, u) => s + u.correct, 0)}
          </p>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">Correct answers</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6">
          <p className="text-2xl lg:text-3xl font-bold text-brand-600 dark:text-brand-400">
            {totalQuestions}
          </p>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">Questions in bank</p>
        </div>
      </div>

      {/* User cards */}
      {usersWithStats.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          No users yet.
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-5">
          {usersWithStats.map((u) => (
            <div key={u.id} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-7">
              {/* Top row: avatar + info + role badge + super-admin actions */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`flex-shrink-0 h-11 w-11 lg:h-13 lg:w-13 rounded-full flex items-center justify-center font-bold text-base lg:text-lg ${avatarColor(u.id)}`}>
                  {initials(u.name, u.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold lg:text-lg text-gray-900 dark:text-gray-100 truncate">
                      {u.name ?? "—"}
                    </span>
                    <RoleSelector
                      userId={u.id}
                      currentRole={u.role}
                      isSelf={u.id === user!.id}
                      currentUserRole={dbUser!.role}
                    />
                    {u.role === "STUDENT" && (
                      (() => {
                        const hasPaid = u.enrolments.some((e) => e.tier === "PAID");
                        const hasAny = u.enrolments.length > 0;
                        return (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs lg:text-sm font-medium ${
                              hasPaid
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400"
                                : hasAny
                                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {hasPaid ? "Paid" : hasAny ? "Free" : "No subjects"}
                          </span>
                        );
                      })()
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                    {(() => {
                      // Email confirmation badge — pulled from Supabase auth.
                      // emailConfirmedAt is undefined if we couldn't reach Supabase
                      // (e.g. service key missing). In that case show nothing rather
                      // than a misleading "unconfirmed".
                      const confirmedAt = emailConfirmedMap.get(u.id);
                      if (!emailConfirmedMap.has(u.id)) return null;
                      return confirmedAt ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] lg:text-xs font-medium text-emerald-700 dark:text-emerald-400"
                          title={`Confirmed on ${formatDate(confirmedAt)}`}
                        >
                          <MailCheck className="h-3 w-3" />
                          Email confirmed
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] lg:text-xs font-medium text-amber-700 dark:text-amber-400"
                          title="User has not yet clicked the confirmation link in their welcome email"
                        >
                          <MailWarning className="h-3 w-3" />
                          Email unconfirmed
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 mt-0.5">Joined {formatDate(u.createdAt)}</p>
                  {u.role === "STUDENT" && u.enrolments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {u.enrolments.map((e) => (
                        <span
                          key={e.subject.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                            e.tier === "PAID"
                              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              : "bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400"
                          }`}
                        >
                          {e.subject.name}
                          <span className="opacity-70">· {e.tier === "PAID" ? "Paid" : "Free"}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Super-admin: view + adjust credit (Stripe customer balance).
                    Available for STUDENT, TUTOR, INFLUENCER — anyone who could
                    receive a credit/payout. Excludes other admins. */}
                {isSuperAdmin &&
                  (u.role === "STUDENT" || u.role === "TUTOR" || u.role === "INFLUENCER") &&
                  u.id !== user!.id && (() => {
                    // Stripe balance: negative = credit, positive = customer owes
                    const balance = creditBalances.get(u.id) ?? 0;
                    return (
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {balance < 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Credit: ${(Math.abs(balance) / 100).toFixed(2)}
                      </span>
                    ) : balance > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400"
                        title="Stripe customer balance is positive — they owe this on their next invoice. New credits cancel out the debt before showing as available credit."
                      >
                        Owes: ${(balance / 100).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">No credit</span>
                    )}
                    <GiveCreditButton
                      userId={u.id}
                      userEmail={u.email}
                      currentCreditCents={balance < 0 ? Math.abs(balance) : 0}
                      currentDebtCents={balance > 0 ? balance : 0}
                    />
                  </div>
                    );
                  })()}
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm lg:text-base text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">{u.pct}% <span className="text-gray-400 dark:text-gray-500 font-normal">({u.total} / {totalQuestions})</span></span>
                </div>
                <div className="h-2 lg:h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${u.pct}%` }}
                  />
                </div>
              </div>

              {/* Attempt breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-800 p-3 lg:p-4 flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="text-lg lg:text-xl font-bold text-green-700 dark:text-green-400">{u.correct}</p>
                    <p className="text-xs lg:text-sm text-green-600 dark:text-green-400">Correct</p>
                  </div>
                </div>
                <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-800 p-3 lg:p-4 flex items-center gap-2.5">
                  <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-500 dark:text-red-400 shrink-0" />
                  <div>
                    <p className="text-lg lg:text-xl font-bold text-red-600 dark:text-red-400">{u.incorrect}</p>
                    <p className="text-xs lg:text-sm text-red-500 dark:text-red-400">Incorrect</p>
                  </div>
                </div>
                <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-100 dark:border-yellow-800 p-3 lg:p-4 flex items-center gap-2.5">
                  <BookmarkIcon className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-lg lg:text-xl font-bold text-yellow-700 dark:text-yellow-400">{u.needsReview}</p>
                    <p className="text-xs lg:text-sm text-yellow-600 dark:text-yellow-400">Review</p>
                  </div>
                </div>
                <div className="rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-800 p-3 lg:p-4 flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <div>
                    <p className="text-lg lg:text-xl font-bold text-brand-700 dark:text-brand-400">{u.total}</p>
                    <p className="text-xs lg:text-sm text-brand-600 dark:text-brand-400">Total</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
