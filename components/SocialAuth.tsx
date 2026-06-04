"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * One-click / passwordless auth shared by /login and /signup.
 *
 *  - "Continue with Google" → Supabase OAuth (PKCE) via /auth/callback.
 *  - Email **code** (not a magic link): we send a 6-digit code and the user
 *    types it. This is deliberately a code, not a clickable link — link-based
 *    magic links are eaten by email scanners (Outlook/Hotmail "Safe Links"
 *    prefetch and consume the single-use token) and the PKCE token only
 *    verifies in the same browser. A typed code has nothing to prefetch and
 *    works on any device.
 *
 * After OTP verification we POST /api/auth/sync-user (same provisioning as
 * password login: FREE enrolments, vce_sid cookie, referral attribution).
 */
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500";
const primaryBtn =
  "w-full rounded-xl bg-brand-600 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60";

export default function SocialAuth({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"buttons" | "code-email" | "code-enter">("buttons");
  const [loading, setLoading] = useState<"google" | "send" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function callbackUrl() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) {
      setError(
        /provider is not enabled/i.test(error.message)
          ? "Google sign-in isn't set up yet. Use email below for now."
          : error.message,
      );
      setLoading(null);
    }
  }

  async function handleSendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading("send");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }
    setCode("");
    setMode("code-enter");
    setLoading(null);
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("verify");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    if (error) {
      setError(
        /expired|invalid|incorrect/i.test(error.message)
          ? "That code is wrong or has expired — check the latest email or resend."
          : error.message,
      );
      setLoading(null);
      return;
    }
    // Provision the user (free enrolments, vce_sid cookie, referral), same as
    // password login, then continue.
    try {
      await fetch("/api/auth/sync-user", { method: "POST" });
    } catch {
      // best-effort — the session exists; the destination layout guards anyway
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {mode !== "code-enter" && (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
        >
          <GoogleIcon />
          {loading === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
      )}

      {mode === "buttons" && (
        <button
          type="button"
          onClick={() => setMode("code-email")}
          className="w-full text-center text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          or sign in with an email code — no password
        </button>
      )}

      {mode === "code-email" && (
        <form onSubmit={handleSendCode} className="space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className={inputClass}
          />
          <button type="submit" disabled={loading !== null} className={primaryBtn}>
            {loading === "send" ? "Sending…" : "Email me a sign-in code"}
          </button>
        </form>
      )}

      {mode === "code-enter" && (
        <form onSubmit={handleVerifyCode} className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code we sent to <strong>{email}</strong>.
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Enter the code"
            maxLength={10}
            autoFocus
            className={`${inputClass} text-center text-2xl font-bold tracking-[0.3em]`}
          />
          <button type="submit" disabled={loading !== null} className={primaryBtn}>
            {loading === "verify" ? "Signing you in…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => handleSendCode()}
            disabled={loading !== null}
            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            Resend code
          </button>
        </form>
      )}
    </div>
  );
}
