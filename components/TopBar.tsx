"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/topics":    "Topics",
  "/exams":     "Past Papers",
  "/practice":  "Practice",
  "/profile":   "Profile",
};

function getTitle(pathname: string): string {
  for (const [prefix, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return label;
  }
  return "VCE Methods";
}

export default function TopBar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 lg:hidden">
      <Link href="/" className="flex items-center gap-2 text-brand-700">
        <BookOpen className="h-5 w-5 flex-shrink-0" />
        <span className="font-bold text-base">VCE Methods</span>
      </Link>
      <span className="text-gray-300">·</span>
      <span className="font-semibold text-gray-700 text-sm truncate">{title}</span>
    </header>
  );
}
