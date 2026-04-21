import Link from "next/link";
import { BookOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";

type NavKey = "topics" | "exams" | "practice" | "pricing" | null;

export default async function MarketingNav({ active = null }: { active?: NavKey }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const linkClass = (key: NavKey) =>
    active === key
      ? "text-brand-600 dark:text-brand-400 font-semibold transition-colors"
      : "hover:text-brand-600 dark:hover:text-brand-400 transition-colors";

  return (
    <header className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex h-16 lg:h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl lg:text-2xl text-brand-700 dark:text-brand-400"
        >
          <BookOpen className="h-6 w-6 lg:h-7 lg:w-7" />
          ATAR Hero
        </Link>
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          <Link href="/topics" className={linkClass("topics")}>
            Topics
          </Link>
          <Link href="/exams" className={linkClass("exams")}>
            Past Papers
          </Link>
          <Link href="/practice" className={linkClass("practice")}>
            Practice
          </Link>
          <Link href="/pricing" className={linkClass("pricing")}>
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle compact />
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-brand-600 px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm lg:text-base text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-brand-600 px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
