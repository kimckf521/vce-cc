import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isKnownCurriculum } from "@/lib/curriculum-context";
import { SUBJECTS } from "@/lib/subject-context";

export const metadata: Metadata = {
  title: "VCE Mathematics — Methods, Specialist, Foundation, General",
  description:
    "All 4 VCE mathematics studies on one platform. Mathematical Methods, Specialist Mathematics, Foundation Mathematics and General Mathematics — every topic, every VCAA past paper, every worked solution.",
};

interface PageProps {
  params: Promise<{ curriculum: string }>;
}

/**
 * Mathematics area landing page — sits at /[curriculum]/mathematics.
 *
 * Lives as a static route under [curriculum]/, so Next.js's static-over-
 * dynamic precedence routes /vce/mathematics here instead of falling
 * through to [curriculum]/[subject]. When HSC ships the same file will
 * serve /hsc/mathematics with HSC's subjects.
 *
 * SEO-friendly: descriptive intro paragraph + clear subject cards so the
 * page ranks for "[curriculum] maths subjects" searches.
 */
export default async function MathematicsAreaPage({ params }: PageProps) {
  const { curriculum } = await params;
  if (!isKnownCurriculum(curriculum)) {
    notFound();
  }

  // Today all SUBJECTS are VCE maths — when HSC ships, this would filter
  // by curriculum once SUBJECTS gains a curriculum field.
  const subjects = SUBJECTS;

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Hero */}
      <header>
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900">
            <Calculator className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </span>
          <span className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {curriculum.toUpperCase()} · Mathematics
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
          VCE Mathematics
        </h1>
        <p className="mt-3 text-base lg:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
          Four VCE maths studies, one subscription. Pick the subject you&apos;re
          enrolled in below — every topic comes with worked solutions, every
          VCAA past paper from 2016 is in your hands, and timed exam practice
          is just a tap away.
        </p>
      </header>

      {/* Subject cards */}
      <section>
        <h2 className="sr-only">Subjects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
          {subjects.map((s) => (
            <Link
              key={s.urlSlug}
              href={`/${curriculum}/${s.urlSlug}`}
              className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 lg:p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold flex-shrink-0",
                    s.colors.badge
                  )}
                >
                  {s.badge}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                    {s.shortName}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {s.displayName}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO/descriptive content */}
      <section className="prose prose-sm lg:prose-base prose-gray dark:prose-invert max-w-3xl">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
          Why study with ATAR Hero?
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Every question on ATAR Hero is from a real VCAA exam. No look-alikes,
          no recycled textbook problems — just the actual papers, organised by
          topic and subtopic, with step-by-step worked solutions that explain
          the why behind every answer.
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          One subscription ($9.99/month AUD) unlocks all four maths subjects.
          Whether you&apos;re sitting just Methods or all four, you get the same
          deep coverage — and you can switch between them any time as your
          interests change.
        </p>
      </section>
    </div>
  );
}
