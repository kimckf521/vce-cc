"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BarChart2, FileText, LayoutDashboard, UserCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/topics",    label: "Topics",    icon: BookOpen      },
  { href: "/exams",     label: "Papers",    icon: FileText      },
  { href: "/practice",  label: "Practice",  icon: BarChart2     },
  { href: "/profile",   label: "Profile",   icon: UserCircle    },
];

export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...navItems, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : navItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 lg:hidden"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-stretch h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? href === "/admin" ? "text-violet-700 dark:text-violet-400" : "text-brand-700 dark:text-brand-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", active && (href === "/admin" ? "text-violet-600 dark:text-violet-400" : "text-brand-600 dark:text-brand-400"))} />
              <span className="text-[10px] sm:text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
