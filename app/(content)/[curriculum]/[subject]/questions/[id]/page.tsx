export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import BackLink from "@/components/BackLink";
import JsonLd from "@/components/JsonLd";
import { isAdminRole } from "@/lib/utils";
import { hasActiveSubscription } from "@/lib/subscription";
import { getDbSubjectSlug, getSubjectMetadata } from "@/lib/subject-context";
import { questionBackLink } from "@/lib/question-back-link";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; id: string }>;
  searchParams: Promise<{ from?: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { curriculum, subject, id } = await params;
  const short = getSubjectMetadata(subject)?.shortName ?? "Methods";
  const q = await prisma.question.findUnique({
    where: { id },
    select: {
      questionNumber: true,
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
    },
  });
  if (!q) return { robots: { index: false, follow: false } };
  const examLabel = q.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
  const canonical = `${SITE_URL}/${curriculum}/${subject}/questions/${id}`;
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
  topic: { select: { name: true } },
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

  let parts: (typeof question)[];
  if (isSectionB) {
    parts = await prisma.question.findMany({
      where: { examId: questionMeta.examId, questionNumber: questionMeta.questionNumber },
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
  const canTrackProgress =
    isAdminRole(dbUser?.role) || (!!user && (await hasActiveSubscription(user.id, dbSubjectSlug)));

  const subjectName = getSubjectMetadata(subjectSlug)?.displayName ?? "VCE Mathematics";
  const canonicalUrl = `${SITE_URL}/${curriculum}/${subjectSlug}/questions/${id}`;
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
      />
    </div>
  );
}
