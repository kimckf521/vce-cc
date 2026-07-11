import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

// Branded 404 — the default Next.js one is an unbranded dead end with no way
// back. Give lost visitors (broken share links, trimmed URLs, stale search
// results) the three most useful exits.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <MarketingNav />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          404
        </p>
        <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 max-w-md text-gray-500 dark:text-gray-400 lg:text-lg">
          The link may be old or mistyped. The maths is still here, though.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/vce/methods/exams"
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Browse past papers
          </Link>
          <Link
            href="/try/vce/methods"
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Try free questions
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
