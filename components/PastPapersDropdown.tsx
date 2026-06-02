"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Paper = {
  name: string;
  href: string;
  description: string;
};

// Links point at each subject's Past Papers page (`/{curriculum}/{subject}/exams`).
// Year ranges mirror the seeded archive: Methods/Specialist/General run 2016–2025,
// Foundation only exists from 2023. Keep in sync with MarketingMobileMenu.
const PAPERS: Paper[] = [
  {
    name: "Mathematical Methods",
    href: "/vce/methods/exams",
    description: "2016–2025 exams · worked solutions",
  },
  {
    name: "Specialist Mathematics",
    href: "/vce/specialist/exams",
    description: "2016–2025 exams · worked solutions",
  },
  {
    name: "General Mathematics",
    href: "/vce/general/exams",
    description: "2016–2025 exams · worked solutions",
  },
  {
    name: "Foundation Mathematics",
    href: "/vce/foundation/exams",
    description: "2023–2025 exams · worked solutions",
  },
];

export default function PastPapersDropdown({ active = false }: { active?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [open]);

  const triggerClass = active
    ? "text-brand-600 dark:text-brand-400 font-semibold transition-colors"
    : "hover:text-brand-600 dark:hover:text-brand-400 transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 whitespace-nowrap ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Past Papers
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-3 w-72 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5 overflow-hidden z-50"
        >
          <ul className="py-2">
            {PAPERS.map((p) => (
              <li key={p.href} role="none">
                <Link
                  role="menuitem"
                  href={p.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                >
                  <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {p.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
