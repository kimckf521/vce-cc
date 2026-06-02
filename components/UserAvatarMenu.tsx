"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Gift,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

type Props = {
  isAdmin?: boolean;
  /** Display name from User.name; fallback derived from email. */
  displayName?: string | null;
  email?: string | null;
};

/**
 * Avatar circle with click-to-open dropdown — used in the top bar.
 * Closes on click-outside, ESC, or route change.
 */
export default function UserAvatarMenu({
  isAdmin = false,
  displayName,
  email,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const name = displayName?.trim() || email?.split("@")[0] || "you";
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

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

  async function handleSignOut() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-800 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 py-1.5 z-50"
        >
          {/* Identity header */}
          <div className="px-4 py-2.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {name}
            </p>
            {email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {email}
              </p>
            )}
          </div>

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          <MenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <MenuItem href="/profile" icon={UserCircle} label="Profile" />
          <MenuItem href="/referrals" icon={Gift} label="Refer a friend" />

          {isAdmin && (
            <>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <MenuItem
                href="/admin"
                icon={ShieldCheck}
                label="Admin"
                accent="violet"
              />
            </>
          )}

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          {/* Theme toggle row */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <ThemeToggle compact />
          </div>

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
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
      role="menuitem"
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        accent === "violet"
          ? "text-violet-700 dark:text-violet-400"
          : "text-gray-700 dark:text-gray-300"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          accent === "violet"
            ? "text-violet-500 dark:text-violet-400"
            : "text-gray-400 dark:text-gray-500"
        )}
      />
      {label}
    </Link>
  );
}
