"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface Props {
  /** When true, navigating away is intercepted and confirmed. */
  enabled: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Guards against accidentally leaving a page with unfinished work.
 *
 * Next.js' App Router has no route-change guard, so this covers both exits:
 *   - Tab close / refresh / typed URL / external link → native `beforeunload`
 *     prompt (browsers don't allow a custom dialog here).
 *   - In-app <a>/<Link> clicks → intercepted in the capture phase and replaced
 *     with the styled modal below; navigation proceeds only on confirm.
 *
 * Programmatic navigations (router.push from a button) aren't <a> clicks, so
 * they pass through untouched — flip `enabled` to false before those run if
 * the unload prompt should be skipped too.
 */
export default function NavigationGuard({
  enabled,
  title = "Leave this page?",
  message = "You have unsaved changes.",
  confirmLabel = "Leave",
  cancelLabel = "Stay",
}: Props) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Full-page exits — native prompt (not customisable by spec).
  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);

  // In-app link clicks — intercept and show the modal instead of navigating.
  useEffect(() => {
    if (!enabled) return;
    const onClickCapture = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href === window.location.pathname + window.location.search
      ) {
        return;
      }
      // Cancel the navigation now; re-issue it via router.push only if the
      // user confirms in the modal.
      e.preventDefault();
      e.stopImmediatePropagation();
      setPendingHref(href);
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [enabled]);

  // If the guard turns off (e.g. marking finished), drop any pending prompt.
  useEffect(() => {
    if (!enabled) setPendingHref(null);
  }, [enabled]);

  // Esc dismisses (stay); lock background scroll while the modal is open.
  useEffect(() => {
    if (!pendingHref) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingHref(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [pendingHref]);

  const confirmLeave = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) router.push(href);
  }, [pendingHref, router]);

  if (!pendingHref) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={() => setPendingHref(null)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="navguard-title"
        className="relative w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2
              id="navguard-title"
              className="text-base font-bold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={() => setPendingHref(null)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={confirmLeave}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
