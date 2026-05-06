"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

/**
 * Admin form to retroactively attribute a user to this affiliate. Use when
 * the referral link wasn't captured at signup (e.g. user signed up directly,
 * or email confirmation broke the cookie flow).
 *
 * If the user already has an active paid subscription, the referral is
 * created in CONVERTED state and the affiliate is credited immediately.
 * Otherwise it's created PENDING and converts when they next subscribe.
 */
export default function AttributeReferralForm({ affiliateId }: { affiliateId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ converted: boolean; email: string } | null>(null);

  async function attribute() {
    if (!email.trim()) return;
    if (!confirm(`Attribute ${email.trim()} to this affiliate? This cannot be undone.`)) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/admin/affiliates/${affiliateId}/attribute-referral`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to attribute referral");
      return;
    }

    const data = await res.json();
    setSuccess({ converted: Boolean(data.converted), email: data.user.email });
    setEmail("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Manually attribute referral
        </h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Use this if a user&apos;s signup missed the referral link (e.g. they
        signed up directly, or email confirmation lost the cookie). If the user
        already has an active paid subscription, the affiliate is credited
        immediately.
      </p>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {success.converted
            ? `Attributed ${success.email} and converted immediately (already paid).`
            : `Attributed ${success.email} (PENDING — will convert when they subscribe).`}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          disabled={loading}
        />
        <button
          onClick={attribute}
          disabled={loading || !email.trim()}
          className="rounded-xl bg-brand-600 text-white text-sm font-medium px-4 py-2 hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Attributing…" : "Attribute"}
        </button>
      </div>
    </div>
  );
}
