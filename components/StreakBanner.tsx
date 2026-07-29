import { Flame } from "lucide-react";

/**
 * Study-streak banner — shared by the History page and the Dashboard.
 * Renders nothing at streak 0, so callers can drop it in unconditionally
 * and let the component decide whether it has anything to say.
 *
 * The streak itself comes from `getStudyStreak` in lib/streak.ts (completed
 * exam sessions OR 3+ drill/exam attempts per Melbourne-local day).
 */
export default function StreakBanner({ streak }: { streak: number }) {
  if (streak <= 0) return null;

  return (
    <div className="rounded-2xl border border-orange-200 dark:border-orange-900 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
        <Flame className="h-5 w-5 text-orange-500" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {streak} day streak
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {streak === 1
            ? "Great start! Keep it going tomorrow."
            : streak < 5
              ? "Keep it up!"
              : streak < 10
                ? "You're on fire!"
                : "Unstoppable!"}
        </p>
      </div>
    </div>
  );
}
