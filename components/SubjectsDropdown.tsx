"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Subject = {
  name: string;
  href: string;
  description: string;
};

const SUBJECTS: Subject[] = [
  {
    name: "Mathematical Methods",
    href: "/methods",
    description: "Functions, calculus, algebra, probability",
  },
  {
    name: "Specialist Mathematics",
    href: "/specialist",
    description: "Complex numbers, vectors, mechanics",
  },
  {
    name: "General Mathematics",
    href: "/general",
    description: "Applied financial, statistical, geometric maths",
  },
  {
    name: "Foundation Mathematics",
    href: "/foundation",
    description: "Real-world maths for everyday life",
  },
];

export default function SubjectsDropdown({ active = false }: { active?: boolean }) {
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
        className={`inline-flex items-center gap-1 ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Subjects
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
            {SUBJECTS.map((s) => (
              <li key={s.href} role="none">
                <Link
                  role="menuitem"
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                >
                  <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {s.description}
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
