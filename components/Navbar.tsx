"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BarChart2, FileText, LogOut, LayoutDashboard, UserCircle, ShieldCheck, Search, History, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/topics", label: "Topics", icon: BookOpen },
  { href: "/exams", label: "Past Papers", icon: FileText },
  { href: "/practice", label: "Practice", icon: BarChart2 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/history", label: "History", icon: History },
  { href: "/referrals", label: "Refer & Earn", icon: Gift },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    // Use the server-side logout endpoint so the Prisma activeSessionId is
    // cleared and the vce_sid cookie is wiped in one round trip. The endpoint
    // also handles supabase.auth.signOut() on the server.
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-brand-700 dark:text-brand-400">
          <BookOpen className="h-6 w-6" />
          VCE Methods
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </Link>
        ))}

        {/* Admin link — only for admins */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                pathname === "/admin" || pathname.startsWith("/admin/")
                  ? "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Theme toggle + Sign out */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <ThemeToggle compact />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
