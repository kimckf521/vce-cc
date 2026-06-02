"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  PenTool,
  Bookmark,
  History,
  ChevronsUpDown,
  Check,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUBJECTS,
  visibleSwitcherSubjects,
  type SubjectMetadata,
} from "@/lib/subject-context";

type Props = {
  curriculum: string;
  subject: string;
  /** Whether the user has paid access to this subject's content. */
  isPaid?: boolean;
  /**
   * The student's registered maths subjects (URL slugs). The swap dropdown
   * shows only these; empty/undefined → all subjects. The active `subject` is
   * always included even if deregistered.
   */
  studyingSubjects?: string[];
};

/**
 * Subject-scoped sidebar — shown only inside /[curriculum]/[subject]/...
 * pages on desktop. Provides:
 *   - subject swap (dropdown of all enrolled subjects)
 *   - 4 tool links (Topics / Past Papers / Practice / History)
 *   - status block (Paid / Free tier with upgrade CTA — B4 fills content)
 *
 * Hidden on mobile — SubjectBottomTabs covers the same nav surface.
 */
export default function SubjectSidebar({
  curriculum,
  subject,
  isPaid = false,
  studyingSubjects,
}: Props) {
  const pathname = usePathname();
  const [swapOpen, setSwapOpen] = useState(false);
  const swapRef = useRef<HTMLDivElement>(null);

  const meta = SUBJECTS.find((s) => s.urlSlug === subject);
  const subjectName = meta?.shortName ?? subject;

  // Only the student's registered subjects appear in the swap dropdown (the
  // current subject is always kept so it can't hide its own selection).
  const switcherSubjects = visibleSwitcherSubjects(studyingSubjects, subject);

  // Close subject-swap on route change / outside click
  useEffect(() => {
    setSwapOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!swapOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!swapRef.current?.contains(e.target as Node)) setSwapOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSwapOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [swapOpen]);

  const navItems = [
    {
      href: `/${curriculum}/${subject}/topics`,
      label: "Topics",
      icon: BookOpen,
      paidOnly: false,
    },
    {
      href: `/${curriculum}/${subject}/exams`,
      label: "Past papers",
      icon: FileText,
      paidOnly: false,
    },
    {
      href: `/${curriculum}/${subject}/practice`,
      label: "Practice",
      icon: PenTool,
      paidOnly: false,
    },
    {
      href: `/${curriculum}/${subject}/bookmark`,
      label: "Bookmark",
      icon: Bookmark,
      // Bookmarks rely on cross-topic access; gated to the VCE Maths plan.
      paidOnly: true,
    },
    {
      href: `/${curriculum}/${subject}/history`,
      label: "History",
      icon: History,
      // Practice history is a paid tool — gated to the VCE Maths plan (enforced
      // server-side in history/layout.tsx). Free users see the lock + paywall.
      paidOnly: true,
    },
  ];

  return (
    <aside className="hidden lg:flex fixed top-16 bottom-0 left-0 w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col">
      {/* Subject swap */}
      <div ref={swapRef} className="relative px-3 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setSwapOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={swapOpen}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {meta && (
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0",
                meta.colors.badge
              )}
            >
              {meta.badge}
            </span>
          )}
          <span className="flex-1 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {subjectName}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        </button>

        {swapOpen && (
          <div
            role="menu"
            className="absolute left-3 right-3 top-full mt-1 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 py-1 z-50"
          >
            {switcherSubjects.map((s) => (
              <SubjectSwapRow
                key={s.urlSlug}
                meta={s}
                href={`/${curriculum}/${s.urlSlug}/topics`}
                isActive={s.urlSlug === subject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, paidOnly }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          const locked = paidOnly && !isPaid;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
              title={locked ? "VCE Maths plan required" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {locked && (
                <Lock className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status block at bottom */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4">
        {isPaid ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
            </span>
            VCE Maths unlocked
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Lock className="h-3 w-3" />
              Free tier
            </div>
            <Link
              href="/pricing"
              className="block w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold text-center px-3 py-2 transition-colors"
            >
              Unlock VCE Maths
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              $9.99/month — all 4 subjects
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function SubjectSwapRow({
  meta,
  href,
  isActive,
}: {
  meta: SubjectMetadata;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded text-xs font-bold flex-shrink-0",
          meta.colors.badge
        )}
      >
        {meta.badge}
      </span>
      <span className="flex-1 truncate">{meta.shortName}</span>
      {isActive && (
        <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
      )}
    </Link>
  );
}
