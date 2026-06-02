import Link from "next/link";
import { Lock, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubjectProgress } from "@/lib/subject-progress";

type Props = {
  curriculum: string;
  progress: SubjectProgress[];
};

/**
 * Grid of "your subjects" cards. Each card shows subject badge + name,
 * paid/free status, and a short progress line. Click → subject home.
 *
 * Empty state: rendered as a friendly hint to pick subjects in onboarding.
 */
export default function SubjectsGrid({ curriculum, progress }: Props) {
  if (progress.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-8 text-center">
        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
          You haven&apos;t enrolled in any subjects yet.
        </p>
        <Link
          href="/welcome"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
        >
          Pick your subjects
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      {progress.map((p) => (
        <SubjectCard key={p.urlSlug} curriculum={curriculum} progress={p} />
      ))}
    </div>
  );
}

function SubjectCard({
  curriculum,
  progress,
}: {
  curriculum: string;
  progress: SubjectProgress;
}) {
  const stat = formatStat(progress);
  return (
    <Link
      href={`/${curriculum}/${progress.urlSlug}`}
      className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold flex-shrink-0",
            progress.meta.colors.badge
          )}
        >
          {progress.meta.badge}
        </span>
        {progress.isPaid ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs font-semibold">
            <Check className="h-3 w-3" />
            Paid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-xs font-semibold">
            <Lock className="h-3 w-3" />
            Free
          </span>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
        {progress.meta.shortName}
      </h3>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
        {progress.meta.displayName}
      </p>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {stat}
      </p>
    </Link>
  );
}

function formatStat(p: SubjectProgress): string {
  if (p.totalAttempts === 0) {
    return "Not started yet";
  }
  if (p.lastActivityAt) {
    return `${p.topicsAttempted}/${p.topicCount} topics · ${formatRelative(p.lastActivityAt)}`;
  }
  return `${p.topicsAttempted}/${p.topicCount} topics started`;
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 4) return `${diffWk}w ago`;
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}
