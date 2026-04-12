"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock, Sparkles, X, Check } from "lucide-react";

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  /** Specific topic name shown in the headline (e.g. "Calculus"). */
  topicName?: string;
};

const PAID_PERKS = [
  "All four Mathematical Methods topics",
  "Unlimited practice questions and timed exams",
  "Search across every past exam question",
  "Performance history and progress tracking",
];

export default function PaywallModal({ open, onClose, topicName }: PaywallModalProps) {
  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const title = topicName
    ? `${topicName} is part of the paid plan`
    : "This topic is part of the paid plan";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950 mb-5">
          <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>

        <h2 id="paywall-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Upgrade to unlock everything below.
        </p>

        <ul className="space-y-2.5 mb-6">
          {PAID_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {perk}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm sm:text-base font-semibold transition-colors"
        >
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          See plans &amp; upgrade
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="block w-full text-center mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
