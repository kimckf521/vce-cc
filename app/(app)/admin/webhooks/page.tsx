import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { ArrowLeft, Webhook, Check, AlertTriangle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  SUCCESS: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  FAILED: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  RECEIVED: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
} as const;

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
 * Recent inbound webhook deliveries. Sourced from WebhookEvent which is
 * populated by /api/webhooks/stripe (and any other future webhook handlers).
 */
export default async function AdminWebhooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const [events, totalCount, failedCount, last24hCount] = await Promise.all([
    prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.webhookEvent.count(),
    prisma.webhookEvent.count({ where: { status: "FAILED" } }),
    prisma.webhookEvent.count({
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
          <Webhook className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Webhooks</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          Most recent {events.length} inbound webhook deliveries.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total logged" value={totalCount} />
        <StatCard label="Last 24 hours" value={last24hCount} />
        <StatCard label="Failed" value={failedCount} tone={failedCount > 0 ? "warn" : "ok"} />
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500">
          No webhook events recorded yet. Stripe deliveries will appear here once received.
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Event ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {events.map((e) => (
                <tr key={e.id} className={e.status === "FAILED" ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatTs(e.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{e.source}</td>
                  <td className="px-5 py-3">
                    <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-300">
                      {e.type}
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[e.status]}`}
                    >
                      {e.status === "SUCCESS" && <Check className="h-3 w-3" />}
                      {e.status === "FAILED" && <AlertTriangle className="h-3 w-3" />}
                      {e.status === "RECEIVED" && <Clock className="h-3 w-3" />}
                      {e.status}
                    </span>
                    {e.status === "FAILED" && e.error && (
                      <p className="text-xs text-red-700 dark:text-red-400 mt-1 max-w-md truncate" title={e.error}>
                        {e.error}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                      {e.externalId}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "ok" | "warn";
}) {
  const styles =
    tone === "warn"
      ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950"
      : tone === "ok"
        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950"
        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900";
  return (
    <div className={`rounded-2xl border ${styles} p-5`}>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
