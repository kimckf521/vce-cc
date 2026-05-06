"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Minus, Plus } from "lucide-react";

/**
 * Super-admin button that adjusts a user's platform credit. Opens an inline
 * form with Add/Deduct toggle, an amount, and an optional reason. Pushes a
 * Stripe customer balance transaction (auto-applies to their next invoice
 * for credits, or charges extra on their next invoice for deductions).
 *
 * Only rendered for SUPER_ADMIN — see the page-level role check.
 */
export default function GiveCreditButton({
  userId,
  userEmail,
  currentCreditCents,
}: {
  userId: string;
  userEmail: string;
  currentCreditCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit() {
    const dollars = parseFloat(amount);
    if (isNaN(dollars) || dollars < 0.5) {
      setError("Amount must be at least $0.50");
      return;
    }

    const signedDollars = mode === "add" ? dollars : -dollars;
    const verb = mode === "add" ? "Give" : "Deduct";
    const detail =
      mode === "add"
        ? "This will apply to their next invoice."
        : "This will reduce their available credit.";

    if (!confirm(`${verb} $${dollars.toFixed(2)} ${mode === "add" ? "to" : "from"} ${userEmail}? ${detail}`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/admin/users/${userId}/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountDollars: signedDollars,
        reason: reason.trim() || undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to update credit");
      return;
    }

    const data = await res.json();
    const newBalance = typeof data.newCreditCents === "number" ? data.newCreditCents : null;
    setSuccess(
      newBalance !== null
        ? `${verb === "Give" ? "Gave" : "Deducted"} $${dollars.toFixed(2)}. New balance: $${(newBalance / 100).toFixed(2)}.`
        : `${verb === "Give" ? "Gave" : "Deducted"} $${dollars.toFixed(2)}.`
    );
    setAmount("");
    setReason("");
    setOpen(false);
    router.refresh();
    setTimeout(() => setSuccess(null), 5000);
  }

  if (!open) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs lg:text-sm font-medium px-3 py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
        >
          <Gift className="h-3.5 w-3.5" />
          {currentCreditCents > 0 ? "Adjust credit" : "Give credit"}
        </button>
        {success && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400">{success}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3 w-full sm:w-auto">
      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
        Adjust credit for {userEmail}
        <span className="ml-2 font-normal text-emerald-700/80 dark:text-emerald-400/80">
          (current: ${(currentCreditCents / 100).toFixed(2)})
        </span>
      </p>
      {error && (
        <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add / Deduct toggle */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setMode("add")}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            mode === "add"
              ? "bg-emerald-600 text-white"
              : "bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
          }`}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
        <button
          onClick={() => setMode("deduct")}
          disabled={currentCreditCents === 0}
          title={currentCreditCents === 0 ? "User has no credit to deduct" : undefined}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === "deduct"
              ? "bg-red-600 text-white"
              : "bg-white dark:bg-gray-900 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          <Minus className="h-3 w-3" /> Deduct
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0.5"
            max="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5.00"
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-5 pr-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="flex-1 min-w-[150px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={submit}
          disabled={loading || !amount}
          className={`rounded-lg text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-50 ${
            mode === "add"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Saving…" : mode === "add" ? "Add" : "Deduct"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setError(null);
            setAmount("");
            setReason("");
            setMode("add");
          }}
          disabled={loading}
          className="rounded-lg text-xs text-gray-600 dark:text-gray-400 px-2 py-1.5 hover:underline disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
