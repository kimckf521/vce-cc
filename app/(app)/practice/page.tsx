import Link from "next/link";
import { PenLine, CheckSquare, FileText, LayoutGrid } from "lucide-react";

export default function PracticePage() {
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice Mode</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        Choose a practice format and configure your session.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
        {/* Exam 1 Practice */}
        <Link
          href="/practice/exam1"
          className="group rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 hover:bg-violet-100 dark:hover:bg-violet-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-violet-100 dark:bg-violet-900 p-3 lg:p-4">
              <PenLine className="h-6 w-6 lg:h-7 lg:w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              No Calculator
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 1 Practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Short answer questions without a CAS calculator. Mirrors the Exam 1 format.
            </p>
          </div>
          <div className="text-sm lg:text-base font-semibold text-violet-700 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform">Configure &amp; Start →</div>
        </Link>

        {/* Exam 2A Practice */}
        <Link
          href="/practice/exam2a"
          className="group rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-sky-100 dark:bg-sky-900 p-3 lg:p-4">
              <CheckSquare className="h-6 w-6 lg:h-7 lg:w-7 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              Calculator · MCQ
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 2A Practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Multiple choice questions with a CAS calculator. 20 questions in exam format.
            </p>
          </div>
          <div className="text-sm lg:text-base font-semibold text-sky-700 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">Configure &amp; Start →</div>
        </Link>

        {/* Exam 2B Practice */}
        <Link
          href="/practice/exam2b"
          className="group rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 dark:bg-amber-900 p-3 lg:p-4">
              <FileText className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              Calculator · Extended
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 2B Practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Extended response questions with a CAS calculator. Multi-part problem solving.
            </p>
          </div>
          <div className="text-sm lg:text-base font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">Configure &amp; Start →</div>
        </Link>

        {/* Exam 2A & 2B Practice */}
        <Link
          href="/practice/exam2ab"
          className="group rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900 p-3 lg:p-4">
              <LayoutGrid className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              Full Exam 2
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 2A &amp; 2B Practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Complete Exam 2 experience — 20 MCQs followed by 4–5 extended response questions.
            </p>
          </div>
          <div className="text-sm lg:text-base font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">Configure &amp; Start →</div>
        </Link>
      </div>
    </div>
  );
}
