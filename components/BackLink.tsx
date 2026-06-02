import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared "back" affordance used at the top of detail pages (history review,
 * topic detail, exam detail, …).
 *
 * Rendered as a compact, tactile pill rather than a bare hyperlink: a subtle
 * bordered surface with a soft shadow, neutral-grey text, and an arrow that
 * nudges left on hover. Reads as a real control and stays quiet enough not to
 * compete with the page heading beneath it.
 */
export default function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-900 py-1.5 pl-2 pr-3 text-sm font-medium",
        "text-gray-600 dark:text-gray-300 shadow-sm transition-colors",
        "hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70",
        "hover:text-gray-900 dark:hover:text-gray-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
        className,
      )}
    >
      <ArrowLeft
        className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-300"
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}
