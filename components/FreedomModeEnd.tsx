import Link from "next/link";
import { RefreshCw } from "lucide-react";

interface Props {
  /** URL to start a new practice, e.g. /practice/exam1 */
  setupHref: string;
}

export default function FreedomModeEnd({ setupHref }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-6 py-8 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        You&apos;ve reached the end of this practice set.
      </p>
      <Link
        href={setupHref}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Start a new practice
      </Link>
    </div>
  );
}
