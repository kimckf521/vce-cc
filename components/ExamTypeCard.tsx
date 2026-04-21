import Link from "next/link";
import {
  FileText,
  ClipboardList,
  Target,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  ClipboardList,
  Target,
  Layers,
};

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  brand: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-600 dark:text-brand-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-600 dark:text-green-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-600 dark:text-purple-400",
  },
};

// Map mode string → history detail URL slug
const MODE_SLUG: Record<string, string> = {
  "Exam 1": "exam1",
  "Exam 2A": "exam2a",
  "Exam 2B": "exam2b",
  "Exam 2A & 2B": "exam2ab",
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

interface Props {
  mode: string;
  label: string;
  iconName: string;
  color: string;
  count: number;
  avgScore: number | null;
  bestScore: number | null;
  latestAt: string | null;
  latestSessionId: string | null;
}

export default function ExamTypeCard({
  mode,
  label,
  iconName,
  color,
  count,
  avgScore,
  bestScore,
  latestAt,
}: Props) {
  const Icon = ICON_MAP[iconName] ?? FileText;
  const colors = COLOR_MAP[color] ?? COLOR_MAP.brand;
  const slug = MODE_SLUG[mode] ?? "exam1";
  const href = `/history/type/${slug}`;

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors flex flex-col"
    >
      <div className={cn("inline-flex rounded-xl p-2.5 mb-3 w-fit", colors.bg)}>
        <Icon className={cn("h-5 w-5", colors.text)} />
      </div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {label}
      </p>
      {count === 0 ? (
        <>
          <p className="text-2xl font-bold text-gray-400 dark:text-gray-600">—</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            No attempts yet
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {count}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              attempt{count !== 1 ? "s" : ""}
            </span>
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
            {avgScore !== null ? (
              <p>
                Avg <span className="font-semibold text-gray-700 dark:text-gray-300">{avgScore}%</span>
                {bestScore !== null && bestScore !== avgScore && (
                  <>
                    {" · "}Best{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {bestScore}%
                    </span>
                  </>
                )}
              </p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">Not marked yet</p>
            )}
            {latestAt && <p>Last: {formatRelative(latestAt)}</p>}
          </div>
        </>
      )}
    </Link>
  );
}
