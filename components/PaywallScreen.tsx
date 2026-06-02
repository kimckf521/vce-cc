import Link from "next/link";
import { Lock, Sparkles, ArrowLeft, Check } from "lucide-react";

type PaywallScreenProps = {
  /** What the user was trying to access — drives the headline copy. */
  feature: "topic" | "practice" | "search" | "history" | "bookmark";
  /** Optional specific name (e.g. "Calculus") shown in the headline. */
  name?: string;
  /** Where the back link should go. Defaults to /dashboard. */
  backHref?: string;
  /** Label for the back link. */
  backLabel?: string;
};

const COPY: Record<
  PaywallScreenProps["feature"],
  { title: (name?: string) => string; description: string }
> = {
  topic: {
    title: (name) =>
      name
        ? `${name} needs VCE Maths`
        : "This topic needs VCE Maths",
    description:
      "Unlock VCE Maths to get every topic across all 4 maths subjects — Methods, Specialist, Foundation and General.",
  },
  practice: {
    title: () => "Practice mode needs VCE Maths",
    description:
      "Build timed exam practice sessions across all 4 maths subjects. Available on the VCE Maths plan.",
  },
  search: {
    title: () => "Search needs VCE Maths",
    description:
      "Search across every past exam question in all 4 subjects instantly. Available on the VCE Maths plan.",
  },
  history: {
    title: () => "History needs VCE Maths",
    description:
      "Track your performance over time across every subject you study. Available on the VCE Maths plan.",
  },
  bookmark: {
    title: () => "Bookmarks need VCE Maths",
    description:
      "Save tricky questions for quick review across every topic and past paper. Available on the VCE Maths plan.",
  },
};

const PAID_PERKS = [
  "All 4 maths subjects — Methods, Specialist, Foundation and General",
  "Every topic, every subject — worked solutions for the lot",
  "Unlimited practice + timed Exam 2 simulations",
  "Performance history across every subject",
  "Cancel at any time",
];

export default function PaywallScreen({
  feature,
  name,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: PaywallScreenProps) {
  const copy = COPY[feature];

  return (
    <div className="max-w-2xl mx-auto py-8 lg:py-16">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8 lg:p-12">
        <div className="flex items-center justify-center h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-brand-50 dark:bg-brand-950 mx-auto mb-6">
          <Lock className="h-7 w-7 lg:h-8 lg:w-8 text-brand-600 dark:text-brand-400" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
          {copy.title(name)}
        </h1>
        <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
          {copy.description}
        </p>

        <ul className="space-y-3 mb-8">
          {PAID_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-sm lg:text-base text-gray-700 dark:text-gray-300">
                {perk}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 lg:py-4 text-base lg:text-lg font-semibold transition-colors"
        >
          <Sparkles className="h-5 w-5" />
          Unlock VCE Maths — $9.99/month
        </Link>
      </div>
    </div>
  );
}
