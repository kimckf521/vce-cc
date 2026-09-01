import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** "block" = full card (page footer); "compact" = slim inline bar. */
  variant?: "block" | "compact";
  className?: string;
};

/**
 * Conversion nudge shown to LOGGED-OUT visitors on the public content pages
 * (past papers + question pages). The content itself is free and public — this
 * just invites anonymous SEO traffic to create a free account. Callers render
 * it only when there is no authenticated user.
 *
 * Copy stays honest about the FREE tier: free users can practise, save their
 * progress, and bookmark on the content they can access (the free Algebra topic
 * + public past papers). It does NOT claim the paid differentiators (all other
 * topics, timed Exam 2, all-subjects depth).
 */
export default function SignupNudge({ variant = "block", className }: Props) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 px-4 py-3",
          className,
        )}
      >
        <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Studying VCE Maths?
          </span>{" "}
          Create a free account to practise, save your progress, and bookmark
          questions — free, no card.
        </p>
        <Link
          href="/signup"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign up free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-6 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900">
        <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 lg:text-xl">
        Track your progress. Free.
      </h2>
      <p className="mx-auto mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400 lg:text-base">
        Create a free account to mark questions correct or incorrect, build a
        study streak, and bookmark the ones to revisit — no credit card
        needed. Unlock every topic and timed Exam 2 practice across all 4 VCE
        maths subjects when you're ready.
      </p>
      <Link
        href="/signup"
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 lg:text-base"
      >
        Create your free account
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
