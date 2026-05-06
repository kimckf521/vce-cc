"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

type Props = {
  /** Where to send the user when the timer ends. */
  destination: string;
  /** How long to wait before auto-redirecting, in seconds. */
  seconds: number;
};

/**
 * Counts down from `seconds` and pushes the user to `destination` when it
 * hits zero. Renders both a visible countdown ("Redirecting in 8s…") and a
 * manual button so the user can skip ahead. Cleans up the interval on
 * unmount so a fast manual redirect doesn't trigger a second navigation.
 */
export default function CountdownRedirect({ destination, seconds }: Props) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      router.push(destination);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, destination, router]);

  const progress = Math.max(0, (remaining / seconds) * 100);

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => router.push(destination)}
        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition-all"
      >
        Go to dashboard
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
          Redirecting in <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{remaining}s</span>
        </p>
        <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
