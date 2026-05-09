import Link from "next/link";
import { BookOpen, ListChecks, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
      <div className="max-w-2xl w-full text-center">
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
          404 — page not found
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          We couldn&apos;t find that question
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          It may have been moved, or the link could be out of date. Try one of
          the options below to keep practising.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/topics"
            className="group rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-left shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all"
          >
            <div className="inline-flex rounded-2xl p-3 mb-4 bg-brand-50 dark:bg-brand-950/40">
              <BookOpen className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Browse topics
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Functions, Algebra, Calculus, Probability &amp; statistics.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Open topics
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            href="/practice"
            className="group rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-left shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all"
          >
            <div className="inline-flex rounded-2xl p-3 mb-4 bg-emerald-50 dark:bg-emerald-950/40">
              <ListChecks className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Try practice
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Exam 1, Exam 2, or build your own custom set.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Start practising
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
