"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SUBJECTS, type SubjectSlug } from "@/lib/subject-context";

/**
 * Subject filter pills for admin list pages. Reads/writes ?subject=<slug> in
 * the URL — pages handle filtering server-side (Server Components) or via
 * fetch URL params (Client Components). Empty/missing param means "All".
 */
export default function SubjectFilterPills({
  extraParams,
}: {
  /** Other URL params to preserve when the active subject changes. */
  extraParams?: Record<string, string | null | undefined>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("subject");

  function hrefFor(slug: SubjectSlug | null): string {
    const params = new URLSearchParams();
    // Preserve all existing params except `subject`.
    searchParams.forEach((v, k) => {
      if (k !== "subject") params.set(k, v);
    });
    // Apply caller-supplied param overrides.
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        if (v === null || v === undefined) {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
    }
    if (slug) params.set("subject", slug);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const baseClass =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border";
  const activeClass = "bg-brand-600 text-white border-brand-600";
  const idleClass =
    "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700";

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href={hrefFor(null)}
        className={`${baseClass} ${!active ? activeClass : idleClass}`}
      >
        All
      </Link>
      {SUBJECTS.map((s) => {
        const isActive = active === s.urlSlug;
        return (
          <Link
            key={s.urlSlug}
            href={hrefFor(s.urlSlug)}
            className={`${baseClass} ${isActive ? activeClass : idleClass}`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold ${
                isActive ? "bg-white/20 text-white" : s.colors.badge
              }`}
            >
              {s.badge}
            </span>
            {s.shortName}
          </Link>
        );
      })}
    </div>
  );
}
