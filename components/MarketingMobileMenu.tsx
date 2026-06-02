"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type NavKey = "subjects" | "pricing" | "about" | null;

/** Mirrors the desktop SubjectsDropdown list so the two stay in sync.
 *  VCAA pathway order: Foundation → General → Methods → Specialist. */
const SUBJECTS = [
  { name: "Foundation Mathematics", href: "/foundation" },
  { name: "General Mathematics", href: "/general" },
  { name: "Mathematical Methods", href: "/methods" },
  { name: "Specialist Mathematics", href: "/specialist" },
];

/** Mirrors the desktop PastPapersDropdown — links to each subject's exams page. */
const PAST_PAPERS = [
  { name: "Foundation Mathematics", href: "/vce/foundation/exams" },
  { name: "General Mathematics", href: "/vce/general/exams" },
  { name: "Mathematical Methods", href: "/vce/methods/exams" },
  { name: "Specialist Mathematics", href: "/vce/specialist/exams" },
];

/**
 * Mobile-only nav for the marketing header. Below `md` the desktop links
 * (Subjects / Pricing / About) and the Log in link are hidden, so without
 * this a phone visitor can only reach the primary CTA or scroll to the
 * footer. The hamburger opens a slide-down panel with the same destinations
 * plus the theme toggle (otherwise phone-inaccessible — it's `sm:` only in
 * the header).
 */
export default function MarketingMobileMenu({
  loggedIn,
  active = null,
}: {
  loggedIn: boolean;
  active?: NavKey;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const itemClass =
    "block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop — sits below the header (top-16) so the header stays tappable */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30"
          />
          {/* Slide-down panel */}
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
            <nav className="px-4 py-3">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Subjects
              </p>
              {SUBJECTS.map((s) => (
                <Link key={s.href} href={s.href} className={itemClass}>
                  {s.name}
                </Link>
              ))}

              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Past Papers
              </p>
              {PAST_PAPERS.map((p) => (
                <Link key={p.href} href={p.href} className={itemClass}>
                  {p.name}
                </Link>
              ))}

              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

              <Link href="/pricing" className={itemClass}>
                Pricing
              </Link>
              <Link href="/about" className={itemClass}>
                About
              </Link>
              {!loggedIn && (
                <Link href="/login" className={itemClass}>
                  Log in
                </Link>
              )}

              <div className="mt-1 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-3 pt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Theme
                </span>
                <ThemeToggle compact />
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
