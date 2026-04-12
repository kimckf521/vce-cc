"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Client button that calls /api/checkout and redirects to Stripe Checkout.
 * If the user isn't signed in (401), it redirects them to /signup first
 * with a ?plan=standard hint so they return here afterwards.
 */
export default function CheckoutButton({ className, children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        // Not signed in — redirect to signup, they'll come back to /pricing
        router.push("/signup?plan=standard");
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${className ?? ""} ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Loading…" : children}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
