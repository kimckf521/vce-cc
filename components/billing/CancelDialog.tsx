"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  currentPeriodEnd: string | null;
};

export default function CancelDialog({
  open,
  onClose,
  onConfirm,
  loading,
  currentPeriodEnd,
}: Props) {
  if (!open) return null;

  const dateLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "the end of your billing period";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-xl bg-red-50 dark:bg-red-950 p-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
              Cancel subscription?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your subscription will remain active until{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {dateLabel}
              </span>
              . After that, you&apos;ll lose access to premium topics, practice
              exams, and worked solutions.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Keep subscription
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Cancelling…" : "Cancel subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}
