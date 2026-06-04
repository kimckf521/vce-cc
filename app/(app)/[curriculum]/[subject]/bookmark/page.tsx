import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  getDbSubjectSlug,
  isKnownSubject,
  getSubjectMetadata,
} from "@/lib/subject-context";
import MathContent from "@/components/MathContent";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

/**
 * Per-subject bookmark list. Shows only THIS subject's bookmarked questions
 * (both exam-paper questions and question-set items). Mirrors the global
 * BookmarkedSection on /history but scopes everything by `Subject.slug`,
 * so each subject's sidebar entry is its own focused list.
 *
 * Status badges show the user's last attempt status (CORRECT / INCORRECT /
 * ATTEMPTED / NEEDS_REVIEW), which is what "stores its corresponding math
 * questions' status" refers to.
 */
export default async function SubjectBookmarkPage({ params }: PageProps) {
  const { curriculum, subject } = await params;

  if (!isKnownSubject(subject)) {
    redirect(`/${curriculum}/methods/bookmark`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Bookmarks are free for every signed-in user — you can bookmark anything you
  // can access (the free Algebra topic + public past papers), and review your
  // own bookmarks here. The list below is already scoped to the user's own rows.
  const subjectDbSlug = getDbSubjectSlug(subject);
  const meta = getSubjectMetadata(subject);
  const shortName = meta?.shortName ?? subject;

  // Two parallel queries — exam-paper attempts and question-set attempts.
  // Both filter on `bookmarked: true` AND the underlying question's
  // subject.slug, so cross-subject bookmarks never leak in.
  const [examAttempts, setAttempts] = await Promise.all([
    prisma.attempt.findMany({
      where: {
        userId: user.id,
        bookmarked: true,
        question: { subject: { slug: subjectDbSlug } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        questionId: true,
        question: {
          select: {
            questionNumber: true,
            part: true,
            marks: true,
            exam: { select: { year: true, examType: true } },
            topic: { select: { name: true } },
          },
        },
      },
    }),
    prisma.questionSetAttempt.findMany({
      where: {
        userId: user.id,
        bookmarked: true,
        questionSetItem: {
          topic: { subject: { slug: subjectDbSlug } },
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        questionSetItemId: true,
        questionSetItem: {
          select: {
            content: true,
            marks: true,
            topic: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const total = examAttempts.length + setAttempts.length;

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Bookmark className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400 fill-current" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Bookmarked questions
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          {total === 0
            ? `You haven't bookmarked any ${shortName} questions yet.`
            : `${total} ${shortName} ${total === 1 ? "question" : "questions"} saved for review.`}
        </p>
      </div>

      {total === 0 ? (
        <EmptyState curriculum={curriculum} subject={subject} />
      ) : (
        <div className="space-y-2">
          {examAttempts.map((a) => {
            const examLabel = a.question.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
            const qLabel = `Q${a.question.questionNumber}${a.question.part ?? ""}`;
            return (
              <Link
                key={a.id}
                href={`/${curriculum}/${subject}/questions/${a.questionId}?from=bookmark`}
                className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
                    <Bookmark className="h-4 w-4 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {a.question.exam.year} {examLabel} · {qLabel}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {a.question.topic.name} · {a.question.marks} mark
                      {a.question.marks !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            );
          })}

          {setAttempts.map((a) => (
            <Link
              key={a.id}
              href={`/${curriculum}/${subject}/questions/set/${a.questionSetItemId}?from=bookmark`}
              className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
                  <Bookmark className="h-4 w-4 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 [&_.prose]:text-sm [&_.prose]:text-inherit [&_.katex]:text-sm [&_.katex-display]:text-sm [&_p]:mb-0 [&_.prose]:inline">
                    <MathContent content={a.questionSetItem.content} />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {a.questionSetItem.topic.name} · {a.questionSetItem.marks} mark
                    {a.questionSetItem.marks !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
        status === "CORRECT"
          ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
          : status === "INCORRECT"
            ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
            : status === "NEEDS_REVIEW"
              ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      )}
    >
      {status === "CORRECT"
        ? "Correct"
        : status === "INCORRECT"
          ? "Incorrect"
          : status === "NEEDS_REVIEW"
            ? "Review"
            : "Attempted"}
    </span>
  );
}

function EmptyState({ curriculum, subject }: { curriculum: string; subject: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 mb-4">
        <Bookmark className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        No bookmarks yet
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5 max-w-sm mx-auto">
        Tap the bookmark icon on any question while you're working through topics, past papers,
        or practice sessions — they'll show up here for quick review.
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Link
          href={`/${curriculum}/${subject}/topics`}
          className="inline-flex items-center rounded-xl bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Browse topics
        </Link>
        <Link
          href={`/${curriculum}/${subject}/exams`}
          className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Past papers
        </Link>
      </div>
    </div>
  );
}
