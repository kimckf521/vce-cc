"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-5 sm:px-8 text-center">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 lg:p-12">
          <div className="text-5xl lg:text-6xl mb-5">📨</div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Check your email</h2>
          <p className="mt-3 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            We sent a password reset link to <strong>{email}</strong>. Click the link to choose a new password.
          </p>
          <p className="mt-3 text-xs lg:text-sm text-gray-400 dark:text-gray-500">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              try again
            </button>.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm lg:text-base text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-5 sm:px-8 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl lg:text-2xl text-brand-700 dark:text-brand-400 mb-10">
        <BookOpen className="h-6 w-6 lg:h-7 lg:w-7" />
        VCE Methods
      </Link>

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 lg:p-12">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
          Back to login
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Forgot password?</h1>
        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm lg:text-base text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 lg:py-3.5 text-sm lg:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3 lg:py-3.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
