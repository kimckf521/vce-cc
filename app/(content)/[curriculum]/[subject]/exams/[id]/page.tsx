export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import { FileText } from "lucide-react";
import BackLink from "@/components/BackLink";
import JsonLd from "@/components/JsonLd";
import ExamCompleteButton from "@/components/ExamCompleteButton";
import BackToTopButton from "@/components/BackToTopButton";
import { getSubjectMetadata } from "@/lib/subject-context";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { curriculum, subject, id } = await params;
  const meta = getSubjectMetadata(subject);
  const name = meta?.displayName ?? "VCE Mathematics";
  const short = meta?.shortName ?? "Methods";
  const exam = await prisma.exam.findUnique({
    where: { id },
    select: { year: true, examType: true },
  });
  if (!exam) return { robots: { index: false, follow: false } };
  const examLabel = exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
  const canonical = `${SITE_URL}/${curriculum}/${subject}/exams/${id}`;
  const title = `${exam.year} VCAA ${short} ${examLabel} — Questions & Worked Solutions`;
  const description = `Every question from the ${exam.year} VCAA ${name} ${examLabel}, with full worked solutions. Free.`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: canonical, type: "article" },
  };
}

export default async function ExamPage({ params }: PageProps) {
  const { curriculum, subject: subjectSlug, id } = await params;
  const subjectMeta = getSubjectMetadata(subjectSlug);
  const subjectDisplayName = subjectMeta?.displayName ?? "VCE Mathematical Methods";
  const subjectShortName = subjectMeta?.shortName ?? "Methods";
  const examsHref = `/${curriculum}/${subjectSlug}/exams`;

  // Parallel: fetch exam metadata + auth at the same time
  const [exam, supabaseResult] = await Promise.all([
    prisma.exam.findUnique({ where: { id } }),
    createClient().then((s) => s.auth.getUser()),
  ]);
  if (!exam) notFound();

  const user = supabaseResult.data.user;

  // Fetch all questions for this exam ordered by question number then part
  const questions = await prisma.question.findMany({
    where: { examId: id },
    select: {
      id: true,
      questionNumber: true,
      part: true,
      marks: true,
      content: true,
      imageUrl: true,
      difficulty: true,
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      subtopics: { select: { name: true } },
      solution: { select: { content: true, imageUrl: true, videoUrl: true } },
      attempts: user ? { where: { userId: user.id }, select: { status: true, bookmarked: true } } : false,
    },
    orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
  });

  // Check if user has completed this exam
  const isCompleted = user
    ? !!(await prisma.examCompletion.findUnique({
        where: { userId_examId: { userId: user.id, examId: id } },
      }))
    : false;

  // Section A: standalone MCQs (part === null)
  const sectionA = questions.filter((q) => q.part === null);

  // Section B: multi-part questions (part !== null), grouped by questionNumber
  const sectionBMap = questions
    .filter((q) => q.part !== null)
    .reduce((acc, q) => {
      const key = q.questionNumber;
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    }, {} as Record<number, typeof questions>);
  const sectionBGroups = Object.values(sectionBMap);

  // An exam is "two-section" when it has both a real Section A (a bank of
  // standalone MCQs) and Section B (multi-part extended-response). We require
  // ≥10 standalone questions before treating them as Section A, since a few
  // stray standalone rows (e.g. 1 question in General Exam 2 due to extraction
  // noise) shouldn't split the exam into two sections. ≥2 multi-part questions
  // is the floor for a real Section B.
  //
  // This is intentionally data-driven, not gated on `examType === "EXAM_2"`:
  // VCE Foundation has a single paper that itself splits into Section A
  // (MCQ) + Section B (extended response), so it needs the same treatment.
  const isTwoSection = sectionA.length >= 10 && sectionBGroups.length >= 2;
  const title = `${exam.year} ${subjectShortName} — Exam ${exam.examType === "EXAM_1" ? "1" : "2"}`;

  // Per-section label shown inside each question card header (e.g.
  // "2024 · Section A · Q3"). For two-section papers we want the section
  // letter, not just "Exam 2"; for single-section papers the existing label
  // ("Exam 1" / "Exam 2") is the most useful descriptor.
  const sectionALabel = isTwoSection
    ? "Section A"
    : exam.examType === "EXAM_1"
    ? "Exam 1"
    : "Exam 2";
  const sectionBLabel = isTwoSection
    ? "Section B"
    : exam.examType === "EXAM_1"
    ? "Exam 1"
    : "Exam 2";

  function toGroupParts(group: typeof questions) {
    return group.map((q) => ({
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

  const canonicalUrl = `${SITE_URL}/${curriculum}/${subjectSlug}/exams/${id}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: `${subjectDisplayName} past papers`,
          item: examsHref ? `${SITE_URL}${examsHref}` : `${SITE_URL}/${curriculum}/${subjectSlug}/exams`,
        },
        { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: title,
      url: canonicalUrl,
      learningResourceType: "Exam paper",
      educationalLevel: "VCE / Year 12",
      inLanguage: "en-AU",
      isAccessibleForFree: true,
      provider: { "@type": "Organization", name: "ATAR Hero", url: SITE_URL },
    },
  ];

  return (
    <div>
      <JsonLd data={jsonLd} />
      <BackLink href={examsHref} label="Past papers" className="mb-6" />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 lg:text-base">
            {isTwoSection
              ? `Section A: ${sectionA.length} questions · Section B: ${sectionBGroups.length} questions`
              : `${sectionA.length + sectionBGroups.length} questions`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {exam.pdfUrl && (
            <a
              href={exam.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/50 px-3 py-2 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Original exam PDF
            </a>
          )}
          {exam.answerUrl && (
            <a
              href={exam.answerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Examiner report
            </a>
          )}
        </div>
      </div>

      {/* VCAA Copyright Notice */}
      <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        <span className="font-semibold text-gray-600 dark:text-gray-300">Copyright notice: </span>
        Exam questions on this page are reproduced from past VCAA {subjectDisplayName} examinations for the purposes of individual study and research under the fair dealing provisions of the{" "}
        <em>Copyright Act 1968</em> (Cth). This site is not affiliated with, endorsed by or otherwise associated with the Victorian Curriculum and Assessment Authority (VCAA).{" "}
        © Victorian Curriculum and Assessment Authority. For current and official versions of all VCE examinations, visit{" "}
        <a
          href="https://www.vcaa.vic.edu.au"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          www.vcaa.vic.edu.au
        </a>
        .
      </div>

      {/* Section A — Multiple Choice */}
      {sectionA.length > 0 && (
        <div className="mb-10 lg:mb-12">
          {isTwoSection && (
            <div className="mb-4 lg:mb-5">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">Section A — Multiple Choice</h2>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{sectionA.length} questions · 1 mark each</p>
            </div>
          )}
          <div className="space-y-4 lg:space-y-5">
            {sectionA.map((q) => (
              <QuestionGroup
                key={q.id}
                year={exam.year}
                examType={exam.examType}
                sectionLabel={sectionALabel}
                questionIndex={q.questionNumber}
                topic={q.topic.name}
                subtopics={q.subtopics.map((s) => s.name)}
                parts={toGroupParts([q])}
                hideBadges
              />
            ))}
          </div>
        </div>
      )}

      {/* Section B — Extended Response */}
      {sectionBGroups.length > 0 && (
        <div>
          {isTwoSection && (
            <div className="mb-4 lg:mb-5">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">Section B — Extended Response</h2>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{sectionBGroups.length} questions</p>
            </div>
          )}
          <div className="space-y-4 lg:space-y-5">
            {sectionBGroups.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
                No questions found for this exam.
              </div>
            )}
            {sectionBGroups.map((group) => (
              <QuestionGroup
                key={group[0].questionNumber}
                year={exam.year}
                examType={exam.examType}
                sectionLabel={sectionBLabel}
                questionIndex={group[0].questionNumber}
                topic={group[0].topic.name}
                subtopics={group[0].subtopics.map((s) => s.name)}
                parts={toGroupParts(group)}
                hideBadges
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback if no sections */}
      {sectionA.length === 0 && sectionBGroups.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
          No questions found for this exam.
        </div>
      )}

      {/* Complete button — logged-in only (the completion API requires auth;
          logged-out visitors are viewing a free public copy). */}
      {user && (sectionA.length > 0 || sectionBGroups.length > 0) && (
        <ExamCompleteButton examId={id} initialCompleted={isCompleted} />
      )}

      <BackToTopButton />
    </div>
  );
}
