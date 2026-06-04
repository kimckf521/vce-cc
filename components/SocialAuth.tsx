"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * One-click / passwordless auth options shared by /login and /signup, shown
 * above the email+password form.
 *
 *  - "Continue with Google" → Supabase OAuth (needs the Google provider enabled
 *    in Supabase + a Google Cloud OAuth client; until then it returns a clear
 *    "provider not enabled" error rather than crashing).
 *  - "Email me a magic link" → Supabase passwordless OTP (works with no extra
 *    config).
 *
 * Both redirect to /auth/callback?next=…, which exchanges the code and hands
 * off to /auth/finish → /api/auth/sync-user so the new user gets the exact same
 * provisioning (FREE enrolments, vce_sid session cookie, referral attribution)
 * as a password signup. Referral codes ride along automatically via the
 * `ref_code` cookie set by /signup?ref=.
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

export default function SocialAuth({ next = "/dashboard" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [magicMode, setMagicMode] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState<"google" | "magic" | null>(null);
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
    // On success the browser redirects to Google — nothing more to do here.
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("magic");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(), shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    } else {
      setSent(true);
      setLoading(null);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
        📬 Check your email — we sent a one-tap sign-in link to{" "}
        <strong>{email}</strong>.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
      >
        <GoogleIcon />
        {loading === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      {!magicMode ? (
        <button
          type="button"
          onClick={() => setMagicMode(true)}
          className="w-full text-center text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          or email me a magic link — no password
        </button>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full rounded-xl bg-brand-600 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {loading === "magic" ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}
