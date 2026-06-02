import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { ArrowLeft, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_STYLE: Record<string, string> = {
  USER_ROLE_CHANGE: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300",
  USER_DELETE: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  AFFILIATE_APPROVE: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  AFFILIATE_DEACTIVATE: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  AFFILIATE_CREDIT_ADJUST: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300",
  PAYOUT_MARK_PAID: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  QUESTION_DELETE: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  QUESTION_UPDATE: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  EXAM_DELETE: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  EXAM_UPDATE: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  QUESTION_SET_DEFAULT_SET: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
  OTHER: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

function formatTs(d: Date): string {
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Recent admin actions. Populated by lib/admin-audit#logAdminAction —
 * currently wired into role changes (PATCH /admin/users), exam deletes,
 * and question deletes. New mutations should call logAdminAction so they
 * show up here.
 */
export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const [entries, totalCount, last24hCount] = await Promise.all([
    prisma.adminActionLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        actor: { select: { email: true, name: true } },
      },
    }),
    prisma.adminActionLog.count(),
    prisma.adminActionLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ScrollText className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Audit log</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          Most recent {entries.length} admin actions ({totalCount.toLocaleString()} logged in total).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total entries" value={totalCount} />
        <StatCard label="Last 24 hours" value={last24hCount} />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500">
          No admin actions logged yet. Role changes, deletions, and other mutations will appear here.
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatTs(e.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    {e.actor ? (
                      <>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {e.actor.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{e.actor.email}</p>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">(deleted)</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ACTION_STYLE[e.action] ?? ACTION_STYLE.OTHER
                      }`}
                    >
                      {e.action.replace(/_/g, " ")}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {e.targetType}
                      {e.targetId ? ` · ${e.targetId.slice(0, 10)}…` : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{e.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
