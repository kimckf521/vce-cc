"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  LayoutDashboard,
  UserCircle,
  Gift,
  ShieldCheck,
  History,
  LogOut,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { visibleSwitcherSubjects } from "@/lib/subject-context";
import {
  CURRICULA,
  COMING_SOON_CURRICULA,
} from "@/lib/curriculum-context";

type Props = {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  curriculum: string;
  activeSubject?: string;
  /** Whether the user has paid VCE Maths access (drives the status block). */
  isPaid?: boolean;
  /**
   * The student's registered maths subjects (URL slugs). The subject list
   * shows only these; empty/undefined → all subjects. The `activeSubject` is
   * always included even if deregistered.
   */
  studyingSubjects?: string[];
};

/**
 * Full-screen mobile drawer triggered by the TopBar hamburger. Contains:
 *   - close button
 *   - curriculum picker (mirrors the desktop pill)
 *   - subject list (active subject highlighted; tap to navigate)
 *   - global nav: Dashboard / History / Referrals / Profile / Admin / Logout
 *   - status block: paid or free-tier with upgrade CTA
 *
 * Closes on backdrop tap, ESC, route change, or the explicit close button.
 */
export default function MobileDrawer({
  open,
  onClose,
  isAdmin = false,
  curriculum,
  activeSubject,
  isPaid = false,
  studyingSubjects,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Only the student's registered subjects appear (active subject always kept).
  const subjects = visibleSwitcherSubjects(studyingSubjects, activeSubject);

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on ESC; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  async function handleSignOut() {
    onClose();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!open) return null;

  const activeCurriculumMeta =
    CURRICULA.find((c) => c.slug === curriculum) ?? CURRICULA[0];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 lg:hidden"
      />

      {/* Drawer panel — slides from left, full height */}
      <div className="fixed inset-y-0 left-0 z-50 w-[88%] max-w-sm bg-white dark:bg-gray-900 shadow-xl flex flex-col lg:hidden">
        {/* Header with close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Curriculum section */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Curriculum
            </p>
            <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2.5">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {activeCurriculumMeta.shortName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeCurriculumMeta.displayName}
              </p>
            </div>
            {COMING_SOON_CURRICULA.length > 0 && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Coming soon: {COMING_SOON_CURRICULA.map((c) => c.shortName).join(", ")}
              </p>
            )}
          </div>

          {/* Subjects */}
          <div className="px-5 pt-3 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Subjects
            </p>
            <div className="space-y-0.5">
              {subjects.map((s) => {
                const isActive = s.urlSlug === activeSubject;
                return (
                  <Link
                    key={s.urlSlug}
                    href={`/${curriculum}/${s.urlSlug}/topics`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0",
                        s.colors.badge
                      )}
                    >
                      {s.badge}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {s.shortName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {s.displayName}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Global nav */}
          <div className="px-5 pt-3 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Your account
            </p>
            <div className="space-y-0.5">
              <DrawerLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <DrawerLink href="/history" icon={History} label="History" />
              <DrawerLink href="/profile" icon={UserCircle} label="Profile" />
              <DrawerLink href="/referrals" icon={Gift} label="Refer a friend" />
              {isAdmin && (
                <DrawerLink
                  href="/admin"
                  icon={ShieldCheck}
                  label="Admin"
                  accent="violet"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom: status block + sign out */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3">
          {isPaid ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                <Check className="h-3 w-3" />
              </span>
              VCE Maths unlocked
            </div>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center justify-between gap-3 rounded-lg bg-brand-50 dark:bg-brand-950 px-3 py-2.5 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <div>
                  <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    Unlock VCE Maths
                  </p>
                  <p className="text-xs text-brand-600/70 dark:text-brand-400/70">
                    $9.99/month — all 4 subjects
                  </p>
                </div>
              </div>
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerLink({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  accent?: "violet";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        accent === "violet"
          ? "text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0",
          accent === "violet"
            ? "text-violet-500 dark:text-violet-400"
            : "text-gray-400 dark:text-gray-500"
        )}
      />
      {label}
    </Link>
  );
}
