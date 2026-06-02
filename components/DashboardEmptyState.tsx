import Link from "next/link";
import { ClipboardList, BookOpen, FileText, ArrowRight } from "lucide-react";

export default function DashboardEmptyState() {
  return (
    <section className="rounded-2xl border border-brand-100 dark:border-brand-900 bg-gradient-to-br from-brand-50/70 via-white to-white dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900 p-5 lg:p-7 shadow-sm">
      <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
        Ready to begin? Pick a starting point
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Your stats are empty for now. Try one of these to get the first numbers
        on the board.
      </p>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <Link
          href="/vce/methods/practice/exam1"
          className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 lg:p-5 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950 mb-3">
            <ClipboardList className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
            Practise Exam 1
          </h3>
          <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Real VCAA short-answer questions, no CAS, 60 minutes.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs lg:text-sm font-semibold text-brand-600 dark:text-brand-400">
            Start practising
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        <Link
          href="/vce/methods/topics"
          className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 lg:p-5 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 mb-3">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
            Browse by topic
          </h3>
          <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Pick where to start — Functions, Algebra, Calculus, or Probability.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs lg:text-sm font-semibold text-brand-600 dark:text-brand-400">
            Open topics
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        <Link
          href="/vce/methods/exams"
          className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 lg:p-5 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950 mb-3">
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
            Browse past papers
          </h3>
          <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Every VCAA paper from 2016, free to access.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs lg:text-sm font-semibold text-brand-600 dark:text-brand-400">
            See papers
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    </section>
  );
}
