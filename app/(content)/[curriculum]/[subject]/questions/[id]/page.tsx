export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import BackLink from "@/components/BackLink";
import JsonLd from "@/components/JsonLd";
import SignupNudge from "@/components/SignupNudge";
import { isAdminRole } from "@/lib/utils";
import { canAccessTopic } from "@/lib/subscription";
import { getDbSubjectSlug, getSubjectMetadata, getUrlSubjectSlug } from "@/lib/subject-context";
import { questionBackLink } from "@/lib/question-back-link";
import { SITE_URL } from "@/lib/site";
import { examSlug } from "@/lib/exam-slug";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; id: string }>;
  searchParams: Promise<{ from?: string }>;
}

/**
 * Every part of a Section B question renders the identical full group, so all
 * parts canonicalise to the GROUP LEADER (first part by part-label order) —
 * otherwise a 4-part question is 4 competing near-duplicate URLs to Google.
 * MCQs (part=null) are their own leader. The `part: { not: null }` filter
 * matters: two-section papers restart numbering, so an MCQ can share
 * (examId, questionNumber) with an unrelated Section B question.
 */
async function groupLeaderId(q: {
  id: string;
  part: string | null;
  examId: string;
  questionNumber: number;
}): Promise<string> {
  if (q.part === null) return q.id;
  const leader = await prisma.question.findFirst({
    where: { examId: q.examId, questionNumber: q.questionNumber, part: { not: null } },
    orderBy: { part: "asc" },
    select: { id: true },
  });
  return leader?.id ?? q.id;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { curriculum, subject, id } = await params;
  const q = await prisma.question.findUnique({
    where: { id },
    select: {
      id: true,
      questionNumber: true,
      part: true,
      examId: true,
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      subject: { select: { slug: true } },
    },
  });
  if (!q) return { robots: { index: false, follow: false } };
  // Admin-testing fixture questions (year 9999) must never enter the index.
  if (q.exam.year === 9999) return { robots: { index: false, follow: false } };
  // A question id identifies its subject. Reached under any other valid
  // subject slug, redirect to the true subject's URL — otherwise every
  // question exists as four competing indexable URL spaces. Redirect here
  // (not just the page body) so it fires before the loading.tsx stream.
  const trueSubject = (q.subject ? getUrlSubjectSlug(q.subject.slug) : null) ?? subject;
  if (trueSubject !== subject) {
    permanentRedirect(`/${curriculum}/${trueSubject}/questions/${id}`);
  }
  const short = getSubjectMetadata(subject)?.shortName ?? "Methods";
  const examLabel = q.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
  const canonicalId = await groupLeaderId(q);
  const canonical = `${SITE_URL}/${curriculum}/${subject}/questions/${canonicalId}`;
  const title = `${q.exam.year} VCAA ${short} ${examLabel} Q${q.questionNumber} — Worked Solution`;
  const description = `Step-by-step worked solution to ${q.exam.year} VCAA ${short} ${examLabel} Question ${q.questionNumber} (${q.topic.name}). Free.`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: canonical, type: "article" },
  };
}

const questionSelect = (userId?: string) => ({
  id: true,
  questionNumber: true,
  part: true,
  marks: true,
  content: true,
  imageUrl: true,
  difficulty: true,
  examId: true,
  exam: { select: { year: true, examType: true } },
  topic: { select: { name: true, slug: true } },
  subject: { select: { slug: true } },
  subtopics: { select: { name: true } },
  solution: { select: { content: true, imageUrl: true, videoUrl: true } },
  attempts: userId
    ? ({ where: { userId }, select: { status: true, bookmarked: true } } as const)
    : (false as const),
} as const);

export default async function QuestionPage({ params, searchParams }: PageProps) {
  const { curriculum, subject: subjectSlug, id } = await params;
  const dbSubjectSlug = getDbSubjectSlug(subjectSlug);
  const { from } = await searchParams;
  const { href: backHref, label: backLabel } = questionBackLink(from, curriculum, subjectSlug);

  // Parallel: fetch question metadata (lightweight) + auth
  const [questionMeta, supabaseResult] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      select: { id: true, questionNumber: true, part: true, examId: true },
    }),
    createClient().then((s) => s.auth.getUser()),
  ]);
  if (!questionMeta) notFound();

  const user = supabaseResult.data.user;
  const select = questionSelect(user?.id);

  // Fetch full question data + sibling parts in parallel if multi-part
  const isSectionB = questionMeta.part !== null;
  const question = isSectionB
    ? await prisma.question.findUnique({ where: { id }, select })
    : await prisma.question.findUnique({ where: { id }, select });

  if (!question) notFound();

  // Mirror of the generateMetadata cross-subject redirect (defense in depth;
  // this one preserves the ?from= param when it fires).
  const trueSubjectSlug = question.subject ? getUrlSubjectSlug(question.subject.slug) : null;
  if (trueSubjectSlug && trueSubjectSlug !== subjectSlug) {
    permanentRedirect(
      `/${curriculum}/${trueSubjectSlug}/questions/${id}${from ? `?from=${encodeURIComponent(from)}` : ""}`
    );
  }

  let parts: (typeof question)[];
  if (isSectionB) {
    // `part: { not: null }` is load-bearing: two-section papers restart
    // question numbering, so an unrelated Section A MCQ can share this
    // (examId, questionNumber) and must not be pulled in as a phantom part.
    parts = await prisma.question.findMany({
      where: {
        examId: questionMeta.examId,
        questionNumber: questionMeta.questionNumber,
        part: { not: null },
      },
      select,
      orderBy: { part: "asc" },
    });
  } else {
    parts = [question];
  }

  const examLabel = question.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
  const sectionLabel: "Exam 1" | "Exam 2A" | "Exam 2B" =
    question.exam.examType === "EXAM_1"
      ? "Exam 1"
      : question.part === null
        ? "Exam 2A"
        : "Exam 2B";

  const title = `${question.exam.year} ${examLabel} — Question ${question.questionNumber}`;

  function toGroupParts(qs: typeof parts) {
    return qs.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      part: q.part,
      marks: q.marks,
      content: q.content,
      imageUrl: q.imageUrl,
      difficulty: q.difficulty,
      solution: q.solution,
      initialStatus: q.attempts?.[0]?.status ?? null,
      initialBookmarked: q.attempts?.[0]?.bookmarked ?? false,
    }));
  }

  // Self-marking and bookmarking are paid-only. Admins and active subscribers
  // pass; free users see locked Mark Correct / Mark Incorrect / Bookmark icons.
  const dbUser = user
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
    : null;
  // Mark/bookmark unlocked where the user can access this question's topic
  // ("save what you can access") — free users get live buttons on Algebra
  // questions, locked on paid-topic questions.
  const canTrackProgress =
    isAdminRole(dbUser?.role) ||
    (!!user && (await canAccessTopic(user.id, question.topic.slug, dbSubjectSlug)).allowed);

  // Prev/next question-group navigation. Papers come in two shapes:
  // two-section (Section A MCQ + Section B extended, numbering RESTARTS
  // between sections — stay inside this question's section) and
  // single-section (ONE continuous numbering that freely interleaves
  // standalone and multi-part questions — e.g. Specialist Exam 1, where a
  // section filter would silently skip real neighbours). Detection mirrors
  // the exam page's thresholds, so fetch the paper's slim question list once
  // and compute group-leader neighbours in JS.
  const examQuestions = await prisma.question.findMany({
    where: { examId: question.examId },
    select: { id: true, questionNumber: true, part: true },
    orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
  });
  const mcqCount = examQuestions.filter((q) => q.part === null).length;
  const sectionBCount = new Set(
    examQuestions.filter((q) => q.part !== null).map((q) => q.questionNumber)
  ).size;
  const isTwoSection = mcqCount >= 10 && sectionBCount >= 2;
  const navPool = isTwoSection
    ? examQuestions.filter((q) => (q.part === null) === (question.part === null))
    : examQuestions;
  const navLeaders: { id: string; questionNumber: number }[] = [];
  const seenGroups = new Set<string>();
  for (const q of navPool) {
    const key = q.part === null ? `mcq:${q.id}` : `group:${q.questionNumber}`;
    if (seenGroups.has(key)) continue;
    seenGroups.add(key);
    navLeaders.push({ id: q.id, questionNumber: q.questionNumber });
  }
  // parts[] uses the identical filter+order as groupLeaderId, so parts[0] IS
  // the group leader — no extra query needed on this hot public page.
  const leaderId = question.part === null ? question.id : parts[0].id;
  const currentIdx = navLeaders.findIndex((l) => l.id === leaderId);
  const prevQ = currentIdx > 0 ? navLeaders[currentIdx - 1] : null;
  const nextQ =
    currentIdx >= 0 && currentIdx < navLeaders.length - 1 ? navLeaders[currentIdx + 1] : null;

  const paperSlug = examSlug(question.exam);
  const paperHref = `/${curriculum}/${subjectSlug}/exams/${paperSlug}`;
  const siblingHref = (qid: string) =>
    `/${curriculum}/${subjectSlug}/questions/${qid}${from ? `?from=${encodeURIComponent(from)}` : ""}`;

  const subjectName = getSubjectMetadata(subjectSlug)?.displayName ?? "VCE Mathematics";
  const canonicalUrl = `${SITE_URL}/${curriculum}/${subjectSlug}/questions/${leaderId}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: `${subjectName} past papers`,
          item: `${SITE_URL}/${curriculum}/${subjectSlug}/exams`,
        },
        { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: title,
      url: canonicalUrl,
      learningResourceType: "Practice problem",
      educationalLevel: "VCE / Year 12",
      inLanguage: "en-AU",
      about: question.topic.name,
      isAccessibleForFree: true,
      provider: { "@type": "Organization", name: "ATAR Hero", url: SITE_URL },
    },
  ];

  return (
    <div>
      <JsonLd data={jsonLd} />
      <BackLink href={backHref} label={backLabel} className="mb-6" />

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        {question.topic.name}
        {question.subtopics.length > 0 && ` · ${question.subtopics.map((s) => s.name).join(", ")}`}
      </p>

      <QuestionGroup
        year={question.exam.year}
        examType={question.exam.examType}
        sectionLabel={sectionLabel}
        topic={question.topic.name}
        subtopics={question.subtopics.map((s) => s.name)}
        parts={toGroupParts(parts)}
        canTrackProgress={canTrackProgress}
        lockedCtaHref={
          user
            ? "/pricing"
            : `/signup?next=${encodeURIComponent(`/${curriculum}/${subjectSlug}/questions/${leaderId}`)}`
        }
        lockedTitle={user ? "Upgrade to save your progress" : "Sign up free to save your progress"}
      />

      {/* Lateral navigation: neighbours in this paper + the full paper. */}
      <nav
        aria-label="More questions from this paper"
        className="mt-8 flex flex-wrap items-center gap-2"
      >
        {prevQ && (
          <Link
            href={siblingHref(prevQ.id)}
            className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            ← Question {prevQ.questionNumber}
          </Link>
        )}
        <Link
          href={paperHref}
          className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          Full {question.exam.year} {examLabel} paper
        </Link>
        {nextQ && (
          <Link
            href={siblingHref(nextQ.id)}
            className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Question {nextQ.questionNumber} →
          </Link>
        )}
      </nav>

      {/* Anonymous SEO traffic lands here — nudge a free signup at the value
          moment (right after the worked solution). Logged-in users skip it. */}
      {!user && <SignupNudge variant="compact" className="mt-8" />}
    </div>
  );
}
