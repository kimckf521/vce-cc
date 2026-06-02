"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  PenTool,
  Bookmark,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  curriculum: string;
  subject: string;
};

/**
 * Mobile bottom-tab nav for subject-scoped tools — shown only inside the
 * `/[curriculum]/[subject]/...` route tree. Mirrors the SubjectSidebar's
 * 4 tools in a thumb-zone bar.
 *
 * Auto-hides during timed-exam mode (placeholder — the actual focus-mode
 * detection ships in a later batch; for now the bar always shows in subject
 * routes).
 */
export default function SubjectBottomTabs({ curriculum, subject }: Props) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/${curriculum}/${subject}/topics`,
      label: "Topics",
      icon: BookOpen,
    },
    {
      href: `/${curriculum}/${subject}/exams`,
      label: "Papers",
      icon: FileText,
    },
    {
      href: `/${curriculum}/${subject}/practice`,
      label: "Practice",
      icon: PenTool,
    },
    {
      href: `/${curriculum}/${subject}/bookmark`,
      label: "Bookmark",
      icon: Bookmark,
    },
    {
      href: `/${curriculum}/${subject}/history`,
      label: "History",
      icon: History,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-brand-700 dark:text-brand-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  active && "text-brand-600 dark:text-brand-400"
                )}
              />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
