import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { PRICE_CATALOG, SUBJECT_DISPLAY_NAMES, type PlanKey } from "@/lib/pricing-catalog";
import { ArrowLeft, CreditCard, Check, X } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Read-only view of PRICE_CATALOG. Surfaces which plans exist, what they
 * cost, which subjects they unlock, and whether the Stripe Price ID env var
 * is actually set in this environment. Saves having to grep source when
 * debugging "why doesn't this user have access".
 */
export default async function AdminPlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const entries = (Object.entries(PRICE_CATALOG) as [PlanKey, typeof PRICE_CATALOG[PlanKey]][]).map(
    ([key, entry]) => ({
      key,
      entry,
      priceIdValue: process.env[entry.envKey] ?? null,
    })
  );

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Plans</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          Read-only view of <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs">PRICE_CATALOG</code> — single source of truth for billing plans.
        </p>
      </div>

      <div className="space-y-4">
        {entries.map(({ key, entry, priceIdValue }) => {
          const priceConfigured = Boolean(priceIdValue);
          return (
            <div
              key={key}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{entry.displayName}</h2>
                    <code className="rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 px-2 py-0.5 text-xs font-mono">
                      {key}
                    </code>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${(entry.amountCents / 100).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month AUD</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {priceConfigured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
                      <Check className="h-3.5 w-3.5" />
                      Stripe price configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 text-xs font-semibold">
                      <X className="h-3.5 w-3.5" />
                      Env var missing
                    </span>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Env var</dt>
                  <dd>
                    <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-300">
                      {entry.envKey}
                    </code>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Stripe price ID</dt>
                  <dd>
                    {priceIdValue ? (
                      <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {priceIdValue}
                      </code>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">(not set)</span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                    Subjects unlocked ({entry.subjectSlugs.length})
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {entry.subjectSlugs.map((slug) => (
                      <span
                        key={slug}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 text-xs"
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {SUBJECT_DISPLAY_NAMES[slug] ?? slug}
                        </span>
                        <code className="text-gray-400 dark:text-gray-500 font-mono">{slug}</code>
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Edit <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs">lib/pricing-catalog.ts</code> to add or modify plans.
      </p>
    </div>
  );
}
