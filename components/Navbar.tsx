"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BarChart2, FileText, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/topics", label: "Topics", icon: BookOpen },
  { href: "/exams", label: "Past Papers", icon: FileText },
  { href: "/practice", label: "Practice", icon: BarChart2 },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 lg:w-72 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg lg:text-xl text-brand-700">
          <BookOpen className="h-5 w-5 lg:h-6 lg:w-6" />
          VCE Methods
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-5 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
            {label}
          </Link>
        ))}

      </nav>

      {/* Sign out */}
      <div className="px-3 lg:px-4 pb-4 lg:pb-5 border-t border-gray-100 pt-3 lg:pt-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
