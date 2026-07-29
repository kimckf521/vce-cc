import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";
import SubjectsDropdown from "@/components/SubjectsDropdown";
import PastPapersDropdown from "@/components/PastPapersDropdown";
import MarketingMobileMenu from "@/components/MarketingMobileMenu";
import { createClient } from "@/lib/supabase/server";

type NavKey = "subjects" | "tools" | "pricing" | "about" | null;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex h-16 lg:h-20 items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg sm:text-xl lg:text-2xl text-brand-700 dark:text-brand-400 min-w-0 md:shrink-0"
        >
          <BrandMark className="h-9 w-auto sm:h-10 lg:h-12" />
          {/* Wordmark hidden on very narrow screens to prevent two-line wrap */}
          <span className="hidden xs:inline whitespace-nowrap">ATAR Hero</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          <SubjectsDropdown active={active === "subjects"} />
          <PastPapersDropdown />
          <Link
            href="/tools"
            className={`whitespace-nowrap ${linkClass("tools")}`}
          >
            {/* Shorter label below xl so the header fits at md/early-lg widths */}
            <span className="xl:hidden">Tools</span>
            <span className="hidden xl:inline">Free tools</span>
          </Link>
          <Link href="/pricing" className={linkClass("pricing")}>
            Pricing
          </Link>
          <Link href="/about" className={linkClass("about")}>
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Theme toggle hidden on phone — moves to profile/settings; recovers ~75px of header space.
              Also hidden in the md band (768-1023px) where the full desktop nav +
              logged-out CTAs leave no room for its ~100px segmented control */}
          <div className="hidden sm:block md:hidden lg:block">
            <ThemeToggle compact />
          </div>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-brand-600 px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
            >
              Dashboard
            </Link>
          ) : (
            <>
              {/* Login link hidden on smallest screens — students will use Get started CTA */}
              <Link
                href="/login"
                className="hidden sm:inline text-sm lg:text-base text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-brand-600 px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
          {/* Mobile-only menu — exposes Subjects / Pricing / About / Log in,
              which are otherwise hidden below md with no replacement */}
          <MarketingMobileMenu loggedIn={!!user} active={active} />
        </div>
      </div>
    </header>
  );
}
