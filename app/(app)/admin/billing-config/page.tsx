import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { ArrowLeft, Settings2, Check, X, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

type Mode = "live" | "test" | "missing" | "unknown";

function modeOf(key: string): Mode {
  if (!key) return "missing";
  if (key.includes("_live_")) return "live";
  if (key.includes("_test_")) return "test";
  return "unknown";
}

/**
 * Surfaces what /api/admin/stripe-config returns: the mode (test/live) of
 * every Stripe env var, plus a live verification that the configured price
 * actually exists in the keyset. Use after rotating keys or when billing
 * breaks unexpectedly — no need to SSH into Vercel to check env vars.
 */
export default async function AdminBillingConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const priceId = process.env.STRIPE_PRICE_VCE_MATHS ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const secretMode = modeOf(secretKey);
  const publishableMode = modeOf(publishableKey);

  let priceVerified = false;
  let priceVerifyError: string | null = null;
  let priceMode: "live" | "test" | null = null;
  let priceActive: boolean | null = null;
  let priceAmount: number | null = null;
  let priceCurrency: string | null = null;

  if (priceId && secretKey) {
    try {
      const stripe = getStripe();
      const price = await stripe.prices.retrieve(priceId);
      priceVerified = true;
      priceMode = price.livemode ? "live" : "test";
      priceActive = price.active;
      priceAmount = price.unit_amount;
      priceCurrency = price.currency;
    } catch (err) {
      priceVerifyError = err instanceof Error ? err.message : "Unknown error";
    }
  }

  const knownModes = [secretMode, publishableMode].filter((m) => m === "live" || m === "test");
  const allSameMode = knownModes.length > 0 && knownModes.every((m) => m === knownModes[0]);
  const overallMode: Mode | "MISMATCH" = allSameMode ? knownModes[0] : "MISMATCH";
  const priceMatchesKeys = priceVerified && allSameMode && priceMode === knownModes[0];

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
          <Settings2 className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Billing config</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          Live diagnostic of Stripe env vars in this environment.
        </p>
      </div>

      {/* Summary banner */}
      <SummaryBanner overallMode={overallMode} priceMatchesKeys={priceMatchesKeys} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ConfigCard
          label="STRIPE_SECRET_KEY"
          mode={secretMode}
          value={secretKey ? `${secretKey.slice(0, 8)}…` : null}
        />
        <ConfigCard
          label="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
          mode={publishableMode}
          value={publishableKey ? `${publishableKey.slice(0, 8)}…` : null}
        />
        <ConfigCard
          label="STRIPE_WEBHOOK_SECRET"
          mode={webhookSecret ? (webhookSecret.startsWith("whsec_") ? "unknown" : "unknown") : "missing"}
          value={webhookSecret ? `${webhookSecret.slice(0, 6)}…` : null}
          note={
            webhookSecret && !webhookSecret.startsWith("whsec_")
              ? "Does not start with whsec_ — invalid shape"
              : null
          }
        />
        <ConfigCard
          label="NEXT_PUBLIC_SITE_URL"
          mode={siteUrl ? "unknown" : "missing"}
          value={siteUrl || null}
        />
      </div>

      {/* Price verification card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              STRIPE_PRICE_VCE_MATHS
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Live verification against the Stripe API.
            </p>
          </div>
          {priceVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
              <Check className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : priceVerifyError ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 text-xs font-semibold">
              <X className="h-3.5 w-3.5" />
              Verification failed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 text-xs font-semibold">
              Not verified
            </span>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Price ID</dt>
            <dd>
              {priceId ? (
                <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {priceId}
                </code>
              ) : (
                <span className="text-red-600 dark:text-red-400">(not set)</span>
              )}
            </dd>
          </div>
          {priceMode && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Price mode</dt>
              <dd>
                <ModeBadge mode={priceMode} />
              </dd>
            </div>
          )}
          {priceActive !== null && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Active</dt>
              <dd className="font-medium text-gray-700 dark:text-gray-300">
                {priceActive ? "Yes" : "No"}
              </dd>
            </div>
          )}
          {priceAmount !== null && priceCurrency && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Amount</dt>
              <dd className="font-medium text-gray-700 dark:text-gray-300">
                {(priceAmount / 100).toFixed(2)} {priceCurrency.toUpperCase()}
              </dd>
            </div>
          )}
        </dl>

        {priceVerifyError && (
          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {priceVerifyError}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryBanner({
  overallMode,
  priceMatchesKeys,
}: {
  overallMode: Mode | "MISMATCH";
  priceMatchesKeys: boolean;
}) {
  if (overallMode === "MISMATCH") {
    return (
      <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">
              Stripe keys are in different modes
            </h2>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              Secret + publishable keys must both be live or both be test. Checkout will fail until they match.
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (overallMode === "live" || overallMode === "test") {
    const tone = priceMatchesKeys ? "ok" : "warn";
    const styles =
      tone === "ok"
        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
        : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
    return (
      <div className={`mb-6 rounded-2xl border ${styles} p-5`}>
        <div className="flex items-start gap-3">
          {tone === "ok" ? (
            <Check className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <div>
            <h2 className="text-sm font-semibold">
              {tone === "ok"
                ? `All Stripe keys in ${overallMode.toUpperCase()} mode`
                : `Keys in ${overallMode.toUpperCase()} mode, but price not yet matched`}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {tone === "ok"
                ? "Keys + price mode + price retrieval all consistent."
                : "The configured price did not verify against the secret key. Check the env var and price mode."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 text-sm text-gray-600 dark:text-gray-400">
      Stripe keys are missing. Set <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs">STRIPE_SECRET_KEY</code> and{" "}
      <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable billing.
    </div>
  );
}

function ConfigCard({
  label,
  mode,
  value,
  note,
}: {
  label: string;
  mode: Mode;
  value: string | null;
  note?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{label}</code>
        <ModeBadge mode={mode} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">
        {value ?? "(not set)"}
      </p>
      {note && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{note}</p>
      )}
    </div>
  );
}

function ModeBadge({ mode }: { mode: Mode }) {
  const styles =
    mode === "live"
      ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
      : mode === "test"
        ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
        : mode === "missing"
          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center rounded-full ${styles} px-2.5 py-0.5 text-xs font-semibold uppercase`}>
      {mode}
    </span>
  );
}
