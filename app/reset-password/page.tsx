"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
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

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Set new password</h1>
        <p className="text-sm lg:text-base text-gray-500 mb-8">
          Choose a strong password for your account.
        </p>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm lg:text-base text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 lg:py-3.5 pr-12 text-sm lg:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1.5">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 lg:py-3.5 pr-12 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="Re-enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1.5 text-xs lg:text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3 lg:py-3.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
