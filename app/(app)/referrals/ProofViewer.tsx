"use client";

import { useEffect, useState } from "react";
import { Paperclip, X, ExternalLink } from "lucide-react";

/**
 * Inline link that opens the payout proof in a centered modal popup.
 * Images are rendered inline; PDFs are embedded via iframe. There's a fallback
 * "Open in new tab" link in the modal header for browsers that block embedded
 * PDFs or for users who want to download.
 */
export default function ProofViewer({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    // Lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Detect PDF by extension; everything else treated as an image.
  // Stripe Storage URLs include the original extension we set on upload.
  const isPdf = /\.pdf(\?|$)/i.test(url);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-medium"
      >
        <Paperclip className="h-3 w-3" />
        View
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Payment proof"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Payment proof
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400"
                  title="Open in a new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
              {isPdf ? (
                <iframe
                  src={url}
                  className="w-full h-[80vh] bg-white"
                  title="Payment proof PDF"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={url}
                  alt="Payment proof"
                  className="w-full h-auto block"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
