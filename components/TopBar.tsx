"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/topics":    "Topics",
  "/exams":     "Past Papers",
  "/practice":  "Practice",
  "/profile":   "Profile",
  "/search":    "Search",
  "/history":   "History",
};

function getTitle(pathname: string): string {
  for (const [prefix, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return label;
  }
  return "VCE Methods";
}

export default function TopBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 lg:hidden">
      <Link href="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
        <BookOpen className="h-5 w-5 flex-shrink-0" />
        <span className="font-bold text-base">VCE Methods</span>
      </Link>
      <span className="text-gray-300 dark:text-gray-600">·</span>
      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm truncate flex-1">{title}</span>
      {isAdmin && (
        <Link href="/search" className="rounded-lg p-2 text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Search className="h-5 w-5" />
        </Link>
      )}
    </header>
  );
}
