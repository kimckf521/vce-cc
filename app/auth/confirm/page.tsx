"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import BrandMark from "@/components/BrandMark";
import { createClient } from "@/lib/supabase/client";

/**
 * Click-gated magic-link confirmation.
 *
 * Magic-link / OTP tokens are SINGLE-USE. Email link-scanners (Outlook/Hotmail
 * "Safe Links", antivirus, some clients) prefetch links with a GET, which — if
 * the link hit Supabase's /verify endpoint directly — consumes the token before
 * the real user clicks ("Email link is invalid or has expired").
 *
 * So the email link points here instead, carrying `token_hash`. This page does
 * NOTHING on load; the token is only spent when the user taps the button
 * (`verifyOtp`). Scanners load the page but can't click, so the token survives
 * for the real user. On success we hand off to /auth/finish (provisioning),
 * exactly like the OAuth path.
 */
function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<"idle" | "verifying" | "error">("idle");

  const tokenHash = params.get("token_hash");
  const type = (params.get("type") as EmailOtpType | null) ?? "email";
  const nextParam = params.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  async function confirm() {
    if (!tokenHash) {
      setState("error");
      return;
    }
    setState("verifying");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      setState("error");
      return;
    }
    if (type === "recovery") {
      router.replace("/reset-password");
      return;
    }
    router.replace(`/auth/finish?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-brand-50 to-white px-6 text-center dark:from-gray-950 dark:to-gray-900">
      <BrandMark className="h-12 w-auto" />
      {state === "error" ? (
        <>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            This sign-in link didn&apos;t work
          </h1>
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            It may have expired or already been used. Request a fresh link and
            open it straight away.
          </p>
          <a
            href="/login"
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Back to sign in
          </a>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to ATAR Hero
          </h1>
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Tap the button below to finish signing in.
          </p>
          <button
            type="button"
            onClick={confirm}
            disabled={state === "verifying"}
            className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {state === "verifying" ? "Signing you in…" : "Sign in"}
          </button>
        </>
      )}
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmInner />
    </Suspense>
  );
}
