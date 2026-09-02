export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import ExamPageSkeleton from "@/components/ExamPageSkeleton";
import UpcomingExamPanel, { type TopicShare } from "@/components/UpcomingExamPanel";
import {
  daysBetweenISO,
  examDateLongPhrase,
  melbourneTodayISO,
  scheduledExamDate,
} from "@/lib/exam-schedule";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QuestionGroup from "@/components/QuestionGroup";
import { FileText } from "lucide-react";
import BackLink from "@/components/BackLink";
import JsonLd from "@/components/JsonLd";
import ExamCompleteButton from "@/components/ExamCompleteButton";
import BackToTopButton from "@/components/BackToTopButton";
import { getDbSubjectSlug, getSubjectMetadata, getUrlSubjectSlug } from "@/lib/subject-context";
import { SITE_URL } from "@/lib/site";
import { examSlug, parseExamSlug } from "@/lib/exam-slug";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; id: string }>;
}

/**
 * The [id] segment accepts the canonical keyword slug (`2023-exam-1`) or a
 * legacy cuid. Slugs resolve by (subject, year, examType); cuids resolve by
 * primary key so the page can 308 them to the slug URL (see lib/exam-slug.ts).
 *
 * Year 9999 is the admin-testing fixture year: those exams must never be
 * reachable via the guessable slug (they'd render indexable [TEST] content),
 * but stay reachable via their unguessable cuid for admin preview — with
 * noindex and no slug redirect (their slug URL intentionally 404s).
 */
async function resolveExam(subjectSlug: string, idOrSlug: string) {
  const parsed = parseExamSlug(idOrSlug);
  if (parsed) {
    if (parsed.year === 9999) return null;
    return prisma.exam.findFirst({
      where: {
        year: parsed.year,
        examType: parsed.examType,
        subject: { slug: getDbSubjectSlug(subjectSlug) },
      },
      include: { subject: { select: { slug: true } } },
    });
  }
  return prisma.exam.findUnique({
    where: { id: idOrSlug },
    include: { subject: { select: { slug: true } } },
  });
}

/**
 * A legacy cuid identifies its exam regardless of the URL's subject segment,
 * so the slug redirect must target the exam's OWN subject — otherwise
 * /vce/methods/exams/<specialist-cuid> would silently become the Methods
 * paper of the same year. Falls back to the requested slug for legacy rows
 * with no subject. Returns null when no redirect should happen (already
 * canonical, or a 9999 fixture kept on its cuid).
 */
function slugRedirectTarget(
  exam: { year: number; examType: string; subject: { slug: string } | null },
  requestedId: string,
  curriculum: string,
  requestedSubjectSlug: string
): string | null {
  const slug = examSlug(exam);
  if (requestedId === slug || exam.year === 9999) return null;
  const trueSubject =
    (exam.subject ? getUrlSubjectSlug(exam.subject.slug) : null) ?? requestedSubjectSlug;
  return `/${curriculum}/${trueSubject}/exams/${slug}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { curriculum, subject, id } = await params;
  const meta = getSubjectMetadata(subject);
  const name = meta?.displayName ?? "VCE Mathematics";
  const short = meta?.shortName ?? "Methods";
  const exam = await resolveExam(subject, id);
  // Throw (rather than return noindex) so the response is a real 404. This
  // only works because the route has NO loading.tsx: a route-level Suspense
  // boundary streams a 200 shell before the status can be set, and both
  // notFound() and permanentRedirect() silently degrade — the 404 to a 200
  // carrying 404 UI, the redirect to a <meta http-equiv="refresh">. Measured,
  // not assumed: with a loading.tsx here, /exams/2099-exam-1 answered 200 and
  // an unbounded {year}-exam-{n} space was indexable. Do not add one back.
  if (!exam) notFound();
  // Legacy cuid URLs redirect to the keyword-slug URL of the exam's OWN
  // subject. generateMetadata resolves before the page body, so this is the
  // copy that actually serves the 308; the body keeps a mirror as defense in
  // depth. See the notFound() note above for why neither may be re-wrapped in
  // a loading.tsx.
  const redirectTarget = slugRedirectTarget(exam, id, curriculum, subject);
  if (redirectTarget) permanentRedirect(redirectTarget);
  // Admin-testing fixtures (year 9999) stay reachable via cuid for preview
  // but must never enter the index.
  if (exam.year === 9999) return { robots: { index: false, follow: false } };
  const examLabel = exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
  // Canonical always uses the keyword slug, even when reached via cuid.
  const canonical = `${SITE_URL}/${curriculum}/${subject}/exams/${examSlug(exam)}`;
  // A paper seeded ahead of its sitting has no questions yet, and the page must
  // not claim otherwise — "Every question ... with full worked solutions" would
  // be false, and a title that oversells is what makes a pre-published page
  // read as a doorway. Describe what the page actually holds TODAY; the copy
  // flips on its own once the questions land, on the same URL.
  const questionCount = await prisma.question.count({ where: { examId: exam.id } });
  const title =
    questionCount === 0
      ? `${exam.year} VCAA ${short} ${examLabel} — Date, Structure & Worked Solutions`
      : `${exam.year} VCAA ${short} ${examLabel} — Questions & Worked Solutions`;
  const description =
    questionCount === 0
      ? `When the ${exam.year} VCAA ${name} ${examLabel} is sat, what it covers, and the topic breakdown from past papers. Worked solutions land here once VCAA publishes the paper. Free.`
      : `Every question from the ${exam.year} VCAA ${name} ${examLabel}, with full worked solutions. Free.`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: canonical, type: "article" },
  };
}

/**
 * Thin shell whose ONLY job is to settle the HTTP status before anything
 * streams: one cheap `resolveExam` lookup, then notFound() / permanentRedirect()
 * if warranted. Only once the status is committed does the heavy body — 25
 * questions with inline worked solutions, ~1.7MB — go behind a Suspense
 * boundary so it still streams and the shell paints immediately.
 *
 * Do NOT collapse this back into a route-level loading.tsx. That boundary sits
 * ABOVE the page, so Next flushes a 200 before the guards run and both the 404
 * and the redirect silently degrade. See components/ExamPageSkeleton.tsx.
 */
export default async function ExamPage({ params }: PageProps) {
  const { curriculum, subject: subjectSlug, id } = await params;
  const exam = await resolveExam(subjectSlug, id);
  if (!exam) notFound();
  const redirectTarget = slugRedirectTarget(exam, id, curriculum, subjectSlug);
  if (redirectTarget) permanentRedirect(redirectTarget);
  return (
    <Suspense fallback={<ExamPageSkeleton />}>
      <ExamBody params={params} />
    </Suspense>
  );
}

async function ExamBody({ params }: PageProps) {
  const { curriculum, subject: subjectSlug, id } = await params;
  const subjectMeta = getSubjectMetadata(subjectSlug);
  const subjectDisplayName = subjectMeta?.displayName ?? "VCE Mathematical Methods";
  const subjectShortName = subjectMeta?.shortName ?? "Methods";
  const examsHref = `/${curriculum}/${subjectSlug}/exams`;

  // Parallel: fetch exam metadata + auth at the same time
  const [exam, supabaseResult] = await Promise.all([
    resolveExam(subjectSlug, id),
    createClient().then((s) => s.auth.getUser()),
  ]);
  if (!exam) notFound();

  // Mirror of the generateMetadata redirect (defense in depth — metadata
  // normally throws first).
  const bodyRedirect = slugRedirectTarget(exam, id, curriculum, subjectSlug);
  if (bodyRedirect) permanentRedirect(bodyRedirect);
  const slug = examSlug(exam);

  const user = supabaseResult.data.user;

  // Kick off the completion check in parallel with the questions fetch (independent queries)
  const completionPromise = user
    ? prisma.examCompletion
        .findUnique({ where: { userId_examId: { userId: user.id, examId: exam.id } } })
        .then(Boolean)
    : Promise.resolve(false);

  // Fetch all questions for this exam ordered by question number then part
  const questions = await prisma.question.findMany({
    where: { examId: exam.id },
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

  // Await the completion check kicked off above (ran in parallel with the questions fetch)
  const isCompleted = await completionPromise;

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

  // Sibling papers for lateral internal links: previous/next year of the same
  // paper, and the other paper from the same year. Cheap query, big
  // crawl-depth win — exam pages previously never linked to each other.
  const siblingExams = await prisma.exam.findMany({
    where: { subject: { slug: getDbSubjectSlug(subjectSlug) }, year: { not: 9999 } },
    select: { year: true, examType: true },
  });
  const sameType = siblingExams
    .filter((e) => e.examType === exam.examType)
    .sort((a, b) => a.year - b.year);
  const prevYear = [...sameType].reverse().find((e) => e.year < exam.year) ?? null;
  const nextYear = sameType.find((e) => e.year > exam.year) ?? null;
  const sameYearOther =
    siblingExams.find((e) => e.year === exam.year && e.examType !== exam.examType) ?? null;
  const examTypeLabel = (t: string) => (t === "EXAM_1" ? "Exam 1" : "Exam 2");
  const examHref = (e: { year: number; examType: string }) =>
    `/${curriculum}/${subjectSlug}/exams/${examSlug(e)}`;

  // Public standalone page for a question group (its first part) — passed to
  // each card as a permalink so every question page is reachable from here.
  // Deliberately BARE: a `?from=exam:` param made every one of these a variant
  // URL, so not one internal link on the public site pointed at a canonical
  // question URL and Search Console reported "Referring page: None detected"
  // on pages that are plainly linked from here. The question page falls back
  // to its own paper for the back link, so the affordance survives the loss.
  const questionPermalink = (leaderId: string) =>
    `/${curriculum}/${subjectSlug}/questions/${leaderId}`;

  // Anonymous visitors get locked mark/bookmark buttons whose click becomes a
  // signup CTA (carrying a return-to), instead of live buttons that 401 with a
  // dead-end "please log in" message. Logged-in users keep live buttons.
  const anonProgressProps = user
    ? {}
    : {
        canTrackProgress: false,
        lockedCtaHref: `/signup?next=${encodeURIComponent(
          `/${curriculum}/${subjectSlug}/exams/${slug}`,
        )}`,
        lockedTitle: "Sign up free to save your progress",
      };

  const canonicalUrl = `${SITE_URL}/${curriculum}/${subjectSlug}/exams/${slug}`;
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

  // A paper with no questions is either seeded ahead of its sitting or waiting
  // on VCAA to publish it. Either way there is nothing to render below, and the
  // copyright notice ("questions on this page are reproduced from...") would be
  // plainly false. Take an early branch instead of threading emptiness through
  // the section layout.
  //
  // The page still has to earn its index slot on its own merits, so it carries
  // an original analysis of what this paper actually tests, computed from the
  // past papers already on the site — useful in September whether or not the
  // solutions ever arrive.
  if (questions.length === 0) {
    const pastRows = await prisma.question.findMany({
      where: {
        examId: { not: exam.id },
        exam: {
          examType: exam.examType,
          year: { not: 9999 },
          subject: { slug: getDbSubjectSlug(subjectSlug) },
        },
      },
      select: { examId: true, topic: { select: { name: true } }, exam: { select: { year: true } } },
    });

    const counts = new Map<string, number>();
    const paperIds = new Set<string>();
    let minYear = Infinity;
    let maxYear = -Infinity;
    for (const row of pastRows) {
      counts.set(row.topic.name, (counts.get(row.topic.name) ?? 0) + 1);
      paperIds.add(row.examId);
      if (row.exam.year < minYear) minYear = row.exam.year;
      if (row.exam.year > maxYear) maxYear = row.exam.year;
    }
    const topics: TopicShare[] = Array.from(counts.entries())
      .map(([name, questionCount]) => ({
        name,
        questionCount,
        share: pastRows.length > 0 ? questionCount / pastRows.length : 0,
      }))
      .sort((a, b) => b.questionCount - a.questionCount);

    const sitting = scheduledExamDate(subjectSlug, exam.examType);
    const dateISO = sitting?.date ?? null;
    // Foundation sits ONE paper, labelled just "Exam" on the VCAA timetable, so
    // prefer the timetable's own label over an "Exam 1" this subject never uses.
    const examLabel = sitting?.label ?? (exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2");

    return (
      <div>
        <JsonLd data={jsonLd} />
        <BackLink href={examsHref} label="Past papers" className="mb-6" />
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
          {subjectDisplayName}
        </p>
        <UpcomingExamPanel
          subjectDisplayName={subjectDisplayName}
          examLabel={examLabel}
          year={exam.year}
          dateISO={dateISO}
          datePhrase={dateISO ? examDateLongPhrase(dateISO) : null}
          timePhrase={sitting?.time ?? null}
          daysAway={dateISO ? daysBetweenISO(melbourneTodayISO(), dateISO) : null}
          topics={topics}
          papersAnalysed={paperIds.size}
          yearsAnalysed={
            Number.isFinite(minYear) && minYear !== maxYear ? `${minYear}\u2013${maxYear}` : null
          }
          examsHref={examsHref}
        />
      </div>
    );
  }

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
                permalink={questionPermalink(q.id)}
                solutionDisplay="inline"
                {...anonProgressProps}
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
                permalink={questionPermalink(group[0].id)}
                solutionDisplay="inline"
                {...anonProgressProps}
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
        <ExamCompleteButton examId={exam.id} initialCompleted={isCompleted} />
      )}

      {/* Lateral links to sibling papers — crawl paths between exam pages and
          a natural "what next" for students who finished this paper. */}
      {(prevYear || nextYear || sameYearOther) && (
        <nav
          aria-label={`More ${subjectShortName} past papers`}
          className="mt-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
        >
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
            More {subjectShortName} past papers
          </h2>
          <div className="flex flex-wrap gap-2">
            {prevYear && (
              <Link
                href={examHref(prevYear)}
                className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                ← {prevYear.year} {examTypeLabel(prevYear.examType)}
              </Link>
            )}
            {sameYearOther && (
              <Link
                href={examHref(sameYearOther)}
                className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                {sameYearOther.year} {examTypeLabel(sameYearOther.examType)}
              </Link>
            )}
            {nextYear && (
              <Link
                href={examHref(nextYear)}
                className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                {nextYear.year} {examTypeLabel(nextYear.examType)} →
              </Link>
            )}
            <Link
              href={examsHref}
              className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              All {subjectShortName} papers
            </Link>
          </div>
        </nav>
      )}

      <BackToTopButton />
    </div>
  );
}
