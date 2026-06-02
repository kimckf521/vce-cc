"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CURRICULA,
  COMING_SOON_CURRICULA,
  type CurriculumMetadata,
} from "@/lib/curriculum-context";

type Props = {
  /** Currently active curriculum slug (resolved by the layout from the URL). */
  current: string;
};

/**
 * Curriculum scope switcher pill — `[VCE ▾]` in the top bar.
 *
 * Today VCE is the only live curriculum; the dropdown lists future curricula
 * (HSC / QCE / WACE) greyed as "coming soon" so the brand promise is visible.
 * Once a second curriculum lands, clicking it will navigate the user to that
 * curriculum's namespace. Today the live entry is a non-op (already there).
 */
export default function CurriculumPill({ current }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeMeta =
    CURRICULA.find((c) => c.slug === current) ?? CURRICULA[0];

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click + ESC
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {activeMeta.shortName}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-72 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 py-1.5 z-50"
        >
          <div className="px-4 pt-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Curriculum
          </div>

          {CURRICULA.map((c) => (
            <ActiveCurriculumItem
              key={c.slug}
              meta={c}
              isActive={c.slug === current}
            />
          ))}

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          <div className="px-4 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Coming soon
          </div>

          {COMING_SOON_CURRICULA.map((c) => (
            <div
              key={c.shortName}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">
                <span className="font-medium">{c.shortName}</span>
                <span className="ml-2 text-xs">— {c.displayName}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveCurriculumItem({
  meta,
  isActive,
}: {
  meta: CurriculumMetadata;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
        isActive
          ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
      // No-op for now — when HSC ships, clicking it will navigate to /hsc/...
    >
      <Check
        className={cn(
          "h-4 w-4 flex-shrink-0",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="flex-1 text-left">
        <span className="font-semibold">{meta.shortName}</span>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          — {meta.displayName}
        </span>
      </span>
    </button>
  );
}
