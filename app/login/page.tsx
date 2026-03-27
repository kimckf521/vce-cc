"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Ensure User row exists in our DB
      await fetch("/api/auth/sync-user", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col items-center justify-center px-5 sm:px-8 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl lg:text-2xl text-brand-700 mb-10">
        <BookOpen className="h-6 w-6 lg:h-7 lg:w-7" />
        VCE Methods
      </Link>

      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm lg:text-base text-gray-500 mb-8">Log in to continue practising</p>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm lg:text-base text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3 lg:py-3.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm lg:text-base text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
