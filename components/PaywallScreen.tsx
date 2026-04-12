import Link from "next/link";
import { Lock, Sparkles, ArrowLeft, Check } from "lucide-react";

type PaywallScreenProps = {
  /** What the user was trying to access — drives the headline copy. */
  feature: "topic" | "practice" | "search" | "history";
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
    title: (name) => (name ? `${name} is part of the paid plan` : "This topic is part of the paid plan"),
    description:
      "Upgrade to unlock all four Mathematical Methods topics, plus practice mode, search, and history.",
  },
  practice: {
    title: () => "Practice mode is part of the paid plan",
    description:
      "Build timed exam practice sessions with custom topic and difficulty distributions. Available on the paid plan.",
  },
  search: {
    title: () => "Search is part of the paid plan",
    description:
      "Search across every past exam question instantly. Available on the paid plan.",
  },
  history: {
    title: () => "History is part of the paid plan",
    description:
      "Track your performance across practice exams over time. Available on the paid plan.",
  },
};

const PAID_PERKS = [
  "All four Mathematical Methods topics",
  "Unlimited practice questions and timed exams",
  "Search across every past exam question",
  "Performance history and progress tracking",
  "Cancel anytime",
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
          See plans &amp; upgrade
        </Link>
      </div>
    </div>
  );
}
