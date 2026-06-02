import Link from "next/link";
import { Sparkles, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getExam1FocusValue,
  getExam2FocusValue,
} from "@/lib/exam-filter-config";

interface Props {
  slug: string;
  /** URL prefix that scopes the topic (e.g. "/vce/foundation"). Defaults to "" for legacy callers. */
  subjectBase?: string;
  /** DB subject slug (e.g. "vce-general") — drives per-subject exam values. */
  subjectSlug?: string;
  firstSubtopicSlug?: string;
  currentSubtopic?: string;
  currentExam?: string;
}

export default function TopicGuidanceChips({
  slug,
  subjectBase = "",
  subjectSlug,
  firstSubtopicSlug,
  currentSubtopic,
  currentExam,
}: Props) {
  const examValues = (currentExam ?? "").split(",").filter(Boolean);

  const exam1Value = getExam1FocusValue(subjectSlug);
  const exam2Value = getExam2FocusValue(subjectSlug);
  const exam2Parts = exam2Value.split(",").filter(Boolean);

  const hasExam1 = examValues.includes(exam1Value);
  const hasAllExam2 = exam2Parts.length > 0 && exam2Parts.every((v) => examValues.includes(v));

  const isStartHere =
    !!firstSubtopicSlug && currentSubtopic === firstSubtopicSlug;
  const isExam1Focus = hasExam1 && !hasAllExam2;
  const isExam2Focus = hasAllExam2 && !hasExam1;

  // Foundation's paper has Section A / Section B rather than Exam 1 / Exam 2,
  // so the chip wording switches when the underlying values reflect that.
  const isSectionStyle = exam1Value === "SECTION_A";
  const exam1Label = isSectionStyle ? "Section A focus" : "Exam 1 focus";
  const exam2Label = isSectionStyle ? "Section B focus" : "Exam 2 focus";

  const chips: {
    key: string;
    label: string;
    icon: typeof Sparkles;
    href: string;
    active: boolean;
  }[] = [];

  if (firstSubtopicSlug) {
    chips.push({
      key: "start",
      label: "Start here",
      icon: Sparkles,
      href: `${subjectBase}/topics/${slug}?subtopic=${firstSubtopicSlug}`,
      active: isStartHere,
    });
  }
  chips.push({
    key: "exam1",
    label: exam1Label,
    icon: FileText,
    href: `${subjectBase}/topics/${slug}?exam=${exam1Value}`,
    active: isExam1Focus,
  });
  chips.push({
    key: "exam2",
    label: exam2Label,
    icon: BarChart3,
    href: `${subjectBase}/topics/${slug}?exam=${exam2Value}`,
    active: isExam2Focus,
  });

  return (
    <div className="mb-3 lg:mb-4 flex flex-wrap items-center gap-2">
      <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1">
        Suggested
      </span>
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <Link
            key={chip.key}
            href={chip.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              chip.active
                ? "border-brand-300 dark:border-brand-700 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
