"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandMark from "@/components/BrandMark";

/**
 * Post-auth finisher for OAuth / magic-link sign-ins. The `/auth/callback`
 * route has already exchanged the code (so the Supabase session cookie is set);
 * this page provisions the user via `/api/auth/sync-user` — the same call
 * password signup/login make — then forwards to `next`. Keeping provisioning in
 * one endpoint means every auth method yields an identical first run (FREE
 * enrolments, vce_sid cookie, referral attribution).
 */
function Finisher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const nextParam = searchParams.get("next");
    const next =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : "/dashboard";

    (async () => {
      try {
        await fetch("/api/auth/sync-user", { method: "POST" });
      } catch {
        // Best-effort: the session already exists, so proceed regardless —
        // the destination's own layout will provision/guard as needed.
      }
      router.replace(next);
      router.refresh();
    })();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-brand-50 to-white px-6 text-center dark:from-gray-950 dark:to-gray-900">
      <BrandMark className="h-12 w-auto" />
      <p className="text-base text-gray-600 dark:text-gray-400">
        Setting up your account…
      </p>
      <svg className="h-5 w-5 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export default function AuthFinishPage() {
  return (
    <Suspense fallback={null}>
      <Finisher />
    </Suspense>
  );
}
