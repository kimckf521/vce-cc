import Link from "next/link";
import {
  BookOpen,
  FileText,
  PenTool,
  BarChart2,
  ArrowRight,
  Target,
  Play,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import {
  getSubjectMetadata,
} from "@/lib/subject-context";
import {
  getSubjectProgressForUser,
  type SubjectProgress,
} from "@/lib/subject-progress";
import UpsellBanner from "@/components/UpsellBanner";
import ExamCountdown from "@/components/ExamCountdown";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

/**
 * Subject home — mini-dashboard for a single subject. Shows the user's
 * progress, a "continue revising" deep link to their last topic, and quick
 * shortcuts to the subject's four tools (Topics / Past Papers / Practice /
 * Questions). Free users see the upsell banner above the hero.
 */
export default async function SubjectHomePage({ params }: PageProps) {
  const { curriculum, subject } = await params;
  const meta = getSubjectMetadata(subject);
  const subjectName = meta?.displayName ?? subject;
  const shortName = meta?.shortName ?? subject;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin role bypasses the upsell — they have access to everything without
  // a subscription. Keeps the page free of "Unlock VCE Maths" prompts for
  // staff browsing the product.
  let isAdmin = false;
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    isAdmin = isAdminRole(dbUser?.role);
  }

  let subjectProgress: SubjectProgress | null = null;
  if (user) {
    const all = await getSubjectProgressForUser(user.id);
    subjectProgress = all.find((p) => p.urlSlug === subject) ?? null;
  }

  const isPaid = isAdmin || (subjectProgress?.isPaid ?? false);
  const hasActivity = !!subjectProgress && subjectProgress.totalAttempts > 0;

  const tools = [
    { href: `/${curriculum}/${subject}/topics`, label: "Topics", icon: BookOpen },
    { href: `/${curriculum}/${subject}/exams`, label: "Past papers", icon: FileText },
    { href: `/${curriculum}/${subject}/practice`, label: "Practice", icon: PenTool },
    { href: `/${curriculum}/${subject}/questions`, label: "Questions", icon: BarChart2 },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {!isPaid && <UpsellBanner variant="default" />}

      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {subjectName}
          </h1>
          <p className="mt-1 text-sm lg:text-base text-gray-500 dark:text-gray-400">
            {hasActivity
              ? `${subjectProgress!.topicsAttempted}/${subjectProgress!.topicCount} topics started · ${subjectProgress!.accuracy}% accuracy`
              : `Pick a topic to get started, or jump into a past paper.`}
          </p>
        </div>
        <Link
          href={`/${curriculum}/${subject}/topics`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-semibold text-white transition-colors shrink-0"
        >
          <Play className="h-4 w-4" />
          {hasActivity ? "Keep practising" : "Start studying"}
        </Link>
      </div>

      {/* Exam countdown — this subject's next VCAA written exam. Hides
          itself when no date is published or the date has passed. */}
      <ExamCountdown subjects={[subject]} />

      {/* Continue revising card — only when there's a recent topic */}
      {subjectProgress?.lastTopicSlug && subjectProgress.lastTopicName && (
        <Link
          href={`/${curriculum}/${subject}/topics/${subjectProgress.lastTopicSlug}`}
          className="group block rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-gray-900 p-5 lg:p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900 flex-shrink-0">
              <Target className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Continue revising
              </p>
              <h2 className="mt-0.5 text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {subjectProgress.lastTopicName}
              </h2>
            </div>
            <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      )}

      {/* Tool shortcuts */}
      <div>
        <h2 className="text-sm lg:text-base font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          {shortName} tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
          {tools.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 lg:p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950 mb-3">
                <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
