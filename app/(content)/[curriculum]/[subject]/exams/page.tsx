import Link from "next/link";
import type { Metadata } from "next";
import { PenLine, Calculator, CheckCircle, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getDbSubjectSlug, getSubjectMetadata } from "@/lib/subject-context";
import { SITE_URL } from "@/lib/site";
import { examSlug } from "@/lib/exam-slug";
import { daysBetweenISO, examDatePhrase, melbourneTodayISO, scheduledExamDate } from "@/lib/exam-schedule";
import JsonLd from "@/components/JsonLd";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

/**
 * "Sat Fri 30 Oct" / "Sat 5 days ago" for a paper with no questions yet —
 * shown on the tile in place of a bare "0 questions". Null when VCAA has
 * published no date for that sitting, in which case the tile falls back to
 * neutral copy rather than inventing one.
 */
function upcomingNoteFor(
  subjectUrlSlug: string,
  examType: "EXAM_1" | "EXAM_2"
): string | null {
  const sitting = scheduledExamDate(subjectUrlSlug, examType);
  if (!sitting?.date) return null;
  const days = daysBetweenISO(melbourneTodayISO(), sitting.date);
  if (days > 1) return `Sits ${examDatePhrase(sitting.date)}`;
  if (days === 1) return "Sits tomorrow";
  if (days === 0) return "Sits today";
  return `Sat ${examDatePhrase(sitting.date)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { curriculum, subject } = await params;
  const name = getSubjectMetadata(subject)?.displayName ?? "VCE Mathematics";
  const canonical = `${SITE_URL}/${curriculum}/${subject}/exams`;
  const title = `${name} Past Exam Papers & Worked Solutions`;
  const description = `Every VCAA ${name} past exam, free — practise by year with full worked solutions for every question.`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

/**
 * Per-subject paper format metadata for the Past Papers landing page.
 *
 * Keyed by URL subject slug. Each entry describes how that subject's exams
 * should be presented: section title, short format blurb, accent colour, and
 * icon. `EXAM_1` and `EXAM_2` are the Prisma ExamType enum values; some
 * subjects (e.g. Foundation) only have a single paper, in which case only
 * EXAM_1 is configured and the section header drops the number.
 */
type PaperSectionStyle = {
  /** Section heading. "Exam 1"/"Exam 2" for two-paper subjects, "Exam" for single-paper. */
  heading: string;
  /** One-line format blurb under the heading (length · calc · marks). */
  blurb: string;
  /** Tailwind colour pair for the icon tile (bg + text). */
  iconBg: string;
  iconText: string;
  /** Hover border colour for the card (matches the section accent). */
  hoverBorder: string;
  /** "Open →" link colour for the card. */
  linkColor: string;
  /** Lucide icon component for the section. */
  icon: LucideIcon;
};

type SubjectPaperFormat = Partial<Record<"EXAM_1" | "EXAM_2", PaperSectionStyle>>;

const PAPER_FORMATS: Record<string, SubjectPaperFormat> = {
  methods: {
    EXAM_1: {
      heading: "Exam 1",
      blurb: "Short-answer · No calculator · 40 marks",
      iconBg: "bg-brand-100 dark:bg-brand-900",
      iconText: "text-brand-600 dark:text-brand-400",
      hoverBorder: "hover:border-brand-200 dark:hover:border-brand-800",
      linkColor:
        "text-brand-400 group-hover:text-brand-600 dark:group-hover:text-brand-400",
      icon: PenLine,
    },
    EXAM_2: {
      heading: "Exam 2",
      blurb: "Multiple-choice + extended-response · CAS · 80 marks",
      iconBg: "bg-violet-100 dark:bg-violet-900",
      iconText: "text-violet-600 dark:text-violet-400",
      hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
      linkColor:
        "text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-400",
      icon: Calculator,
    },
  },
  specialist: {
    EXAM_1: {
      heading: "Exam 1",
      blurb: "Short-answer · No calculator · 40 marks",
      iconBg: "bg-sky-100 dark:bg-sky-900",
      iconText: "text-sky-600 dark:text-sky-400",
      hoverBorder: "hover:border-sky-200 dark:hover:border-sky-800",
      linkColor: "text-sky-400 group-hover:text-sky-600 dark:group-hover:text-sky-400",
      icon: PenLine,
    },
    EXAM_2: {
      heading: "Exam 2",
      blurb: "Multiple-choice + extended-response · CAS · 80 marks",
      iconBg: "bg-indigo-100 dark:bg-indigo-900",
      iconText: "text-indigo-600 dark:text-indigo-400",
      hoverBorder: "hover:border-indigo-200 dark:hover:border-indigo-800",
      linkColor:
        "text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
      icon: Calculator,
    },
  },
  general: {
    EXAM_1: {
      heading: "Exam 1",
      blurb: "Multiple-choice · CAS · 40 marks",
      iconBg: "bg-emerald-100 dark:bg-emerald-900",
      iconText: "text-emerald-600 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800",
      linkColor:
        "text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      icon: PenLine,
    },
    EXAM_2: {
      heading: "Exam 2",
      blurb: "Extended-response · CAS · 60 marks",
      iconBg: "bg-teal-100 dark:bg-teal-900",
      iconText: "text-teal-600 dark:text-teal-400",
      hoverBorder: "hover:border-teal-200 dark:hover:border-teal-800",
      linkColor:
        "text-teal-400 group-hover:text-teal-600 dark:group-hover:text-teal-400",
      icon: Calculator,
    },
  },
  foundation: {
    // Foundation Mathematics has a single written paper, not split Exam 1 / Exam 2.
    EXAM_1: {
      heading: "Exam",
      blurb: "Written · CAS · 80 marks",
      iconBg: "bg-amber-100 dark:bg-amber-900",
      iconText: "text-amber-600 dark:text-amber-400",
      hoverBorder: "hover:border-amber-200 dark:hover:border-amber-800",
      linkColor:
        "text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-400",
      icon: FileText,
    },
  },
};

const FALLBACK_STYLE: PaperSectionStyle = {
  heading: "Exam",
  blurb: "Past paper",
  iconBg: "bg-gray-100 dark:bg-gray-800",
  iconText: "text-gray-600 dark:text-gray-400",
  hoverBorder: "hover:border-gray-300 dark:hover:border-gray-700",
  linkColor: "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300",
  icon: FileText,
};

/**
 * The current VCE Mathematics study design took effect in 2023 (running
 * 2023–2027). Papers from 2016–2022 follow the previous design — they're
 * still useful practice, but topic coverage, format, and assessed dot points
 * differ, so we surface them under their own subheading and put current-
 * design papers first.
 */
const CURRENT_SYLLABUS_START_YEAR = 2023;

export default async function ExamsPage({ params }: PageProps) {
  const { curriculum, subject: subjectSlug } = await params;
  const dbSubjectSlug = getDbSubjectSlug(subjectSlug);
  const subjectMeta = getSubjectMetadata(subjectSlug);
  const subjectDisplayName = subjectMeta?.displayName ?? "VCE Mathematical Methods";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const exams = await prisma.exam.findMany({
    where: { year: { not: 9999 }, subject: { slug: dbSubjectSlug } },
    orderBy: [{ year: "desc" }, { examType: "asc" }],
    select: {
      id: true,
      year: true,
      examType: true,
      questions: { select: { questionNumber: true, part: true } },
    },
  });

  // Fetch user's completed exams
  const completedExamIds = user
    ? new Set(
        (await prisma.examCompletion.findMany({
          where: { userId: user.id },
          select: { examId: true },
        })).map((c) => c.examId)
      )
    : new Set<string>();

  // Section A / Section B detection — kept in sync with the exam detail page
  // (`exams/[id]/page.tsx`). A paper is treated as having a distinct Section A
  // and Section B when it contains ≥10 standalone (MCQ) questions AND
  // ≥2 multi-part questions. The thresholds tolerate small extraction noise
  // (e.g. one stray standalone in an otherwise extended-response paper)
  // without splitting the card subtitle into a misleading breakdown.
  const SECTION_A_MIN = 10;
  const SECTION_B_MIN = 2;

  const examList = exams.map((e) => {
    const mcqCount = e.questions.filter((q) => q.part === null).length;
    const extendedCount = new Set(
      e.questions.filter((q) => q.part !== null).map((q) => q.questionNumber)
    ).size;
    const hasTwoSections = mcqCount >= SECTION_A_MIN && extendedCount >= SECTION_B_MIN;
    return {
      id: e.id,
      slug: examSlug(e),
      year: e.year,
      examType: e.examType as "EXAM_1" | "EXAM_2",
      completed: completedExamIds.has(e.id),
      mcqCount,
      extendedCount,
      hasTwoSections,
      // Total questions: standalone + unique grouped Section B question numbers.
      questionCount: mcqCount + extendedCount,
      // Papers seeded ahead of their sitting have no questions yet. "0
      // questions" reads as a broken card, so the tile shows the sitting date
      // instead — which is the thing a student actually wants from it in
      // September anyway.
      upcomingNote: upcomingNoteFor(subjectSlug, e.examType as "EXAM_1" | "EXAM_2"),
    };
  });

  // Group exams by examType, then build sections in a deterministic order
  // (Exam 1 before Exam 2). Sections with no papers are skipped so single-
  // paper subjects (Foundation) don't show an empty Exam 2 block.
  const subjectFormat = PAPER_FORMATS[subjectSlug] ?? {};
  const examTypeOrder: Array<"EXAM_1" | "EXAM_2"> = ["EXAM_1", "EXAM_2"];

  const sections = examTypeOrder
    .map((examType) => {
      // Newest-first within each syllabus group — current-design years are
      // most relevant to students sitting the upcoming paper.
      const papers = examList
        .filter((e) => e.examType === examType)
        .sort((a, b) => b.year - a.year);
      if (papers.length === 0) return null;
      const style = subjectFormat[examType] ?? FALLBACK_STYLE;
      const currentPapers = papers.filter((p) => p.year >= CURRENT_SYLLABUS_START_YEAR);
      const previousPapers = papers.filter((p) => p.year < CURRENT_SYLLABUS_START_YEAR);
      const sortedAsc = [...papers].sort((a, b) => a.year - b.year);
      const yearRange = `${sortedAsc[0].year} – ${sortedAsc[sortedAsc.length - 1].year}`;
      return { examType, papers, currentPapers, previousPapers, style, yearRange };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  // Subject-wide completion tally for the logged-in progress bar. Counts the
  // same `completed` flag the paper cards render, across every exam type.
  const completedCount = examList.filter((e) => e.completed).length;

  // Helper to compute a year-range label like "2016 – 2022" for a group.
  const groupRange = (group: typeof examList) => {
    if (group.length === 0) return "";
    const sorted = [...group].sort((a, b) => a.year - b.year);
    if (sorted.length === 1) return `${sorted[0].year}`;
    return `${sorted[0].year} – ${sorted[sorted.length - 1].year}`;
  };

  const hubUrl = `${SITE_URL}/${curriculum}/${subjectSlug}/exams`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: `${subjectDisplayName} past papers`, item: hubUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${subjectDisplayName} Past Exam Papers & Worked Solutions`,
      url: hubUrl,
      inLanguage: "en-AU",
      isAccessibleForFree: true,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: examList.length,
        itemListElement: examList.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${e.year} ${subjectDisplayName} ${e.examType === "EXAM_1" ? "Exam 1" : "Exam 2"}`,
          url: `${hubUrl}/${e.slug}`,
        })),
      },
    },
  ];

  return (
    <div>
      <JsonLd data={jsonLd} />
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Past papers</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-6">
        Every VCAA {subjectDisplayName} exam, with questions and solutions.
      </p>

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

      {/* Completion progress — logged-in users only. The page is public, so
          logged-out visitors see no change here. Covers the subject total
          across both exam types, matching the per-card `completed` flag. */}
      {user && examList.length > 0 && (
        <div className="mb-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 lg:p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
              Your progress
            </span>
            <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              {completedCount} of {examList.length}{" "}
              {examList.length === 1 ? "paper" : "papers"} completed
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={examList.length}
            aria-valuenow={completedCount}
            aria-label={`${completedCount} of ${examList.length} papers completed`}
            className="h-2 lg:h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <div
              className="h-full rounded-full bg-brand-600 dark:bg-brand-500 transition-all"
              style={{ width: `${(completedCount / examList.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">
          No past papers are available for {subjectDisplayName} yet. Check back soon.
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(({ examType, papers, currentPapers, previousPapers, style, yearRange }) => {
            const Icon = style.icon;
            // Subheadings are only shown when both syllabus groups are
            // present. If a subject has only current-design papers (e.g.
            // Foundation) we render one ungrouped grid and skip the labels.
            const showSyllabusSubheadings =
              currentPapers.length > 0 && previousPapers.length > 0;
            return (
              <div key={examType}>
                <div className="flex items-center gap-3 lg:gap-4 mb-2">
                  <div
                    className={`flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-xl lg:rounded-2xl ${style.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 lg:h-7 lg:w-7 ${style.iconText}`} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {style.heading}
                    </h2>
                    <p className="text-sm lg:text-base text-gray-400 dark:text-gray-500">
                      {style.blurb}
                    </p>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-5">
                  {papers.length} {papers.length === 1 ? "paper" : "papers"} · {yearRange}
                </p>

                {showSyllabusSubheadings ? (
                  <div className="space-y-6">
                    <PaperGroup
                      label="Current study design"
                      sublabel={`${groupRange(currentPapers)} · matches the exam you'll sit`}
                      papers={currentPapers}
                      style={style}
                      curriculum={curriculum}
                      subjectSlug={subjectSlug}
                    />
                    <PaperGroup
                      label="Previous study design"
                      sublabel={`${groupRange(previousPapers)} · older syllabus, still useful for practice`}
                      papers={previousPapers}
                      style={style}
                      curriculum={curriculum}
                      subjectSlug={subjectSlug}
                      muted
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
                    {papers.map((exam) => (
                      <PaperCard
                        key={exam.id}
                        exam={exam}
                        style={style}
                        curriculum={curriculum}
                        subjectSlug={subjectSlug}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * One syllabus subgroup within an exam-type section. Renders a small heading
 * row (label + helper line) and a card grid. When `muted` is true the heading
 * row is rendered in a quieter colour to signal that the papers below come
 * from the previous study design.
 */
function PaperGroup({
  label,
  sublabel,
  papers,
  style,
  curriculum,
  subjectSlug,
  muted = false,
}: {
  label: string;
  sublabel: string;
  papers: Array<{
    id: string;
    slug: string;
    year: number;
    completed: boolean;
    questionCount: number;
    mcqCount: number;
    extendedCount: number;
    hasTwoSections: boolean;
  }>;
  style: PaperSectionStyle;
  curriculum: string;
  subjectSlug: string;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-col gap-0.5">
        <span
          className={`text-sm font-semibold ${
            muted
              ? "text-gray-500 dark:text-gray-400"
              : "text-gray-800 dark:text-gray-200"
          }`}
        >
          {label}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
        {papers.map((exam) => (
          <PaperCard
            key={exam.id}
            exam={exam}
            style={style}
            curriculum={curriculum}
            subjectSlug={subjectSlug}
            muted={muted}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Single past-paper card. `muted` dims the year/question-count slightly to
 * visually signal previous-design papers without making them illegible.
 *
 * Two-section papers (e.g. Methods/Specialist Exam 2, Foundation Exam 1)
 * display the Section A (MCQ) / Section B (extended) breakdown as the
 * subtitle so students see the structure before clicking in. Single-section
 * papers fall back to a total question count.
 */
function PaperCard({
  exam,
  style,
  curriculum,
  subjectSlug,
  muted = false,
}: {
  exam: {
    id: string;
    slug: string;
    year: number;
    completed: boolean;
    questionCount: number;
    mcqCount: number;
    extendedCount: number;
    hasTwoSections: boolean;
    upcomingNote?: string | null;
  };
  style: PaperSectionStyle;
  curriculum: string;
  subjectSlug: string;
  muted?: boolean;
}) {
  return (
    <Link
      href={`/${curriculum}/${subjectSlug}/exams/${exam.slug}`}
      className={`group relative flex flex-col items-center justify-center rounded-2xl border p-5 lg:p-7 text-center shadow-sm transition-all hover:shadow-md ${
        exam.completed
          ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30"
          : muted
          ? `border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 ${style.hoverBorder}`
          : `border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 ${style.hoverBorder}`
      }`}
    >
      {exam.completed && (
        <CheckCircle className="absolute top-2.5 right-2.5 h-4 w-4 text-green-500 dark:text-green-400" />
      )}
      <span
        className={`text-2xl lg:text-3xl font-bold mb-1 ${
          muted
            ? "text-gray-700 dark:text-gray-300"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {exam.year}
      </span>
      {exam.questionCount === 0 ? (
        <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-500">
          {exam.upcomingNote ?? "Not published yet"}
        </span>
      ) : exam.hasTwoSections ? (
        <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 leading-tight">
          <span className="block">Section A · {exam.mcqCount} MCQ</span>
          <span className="block">Section B · {exam.extendedCount} extended</span>
        </span>
      ) : (
        <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-500">
          {exam.questionCount} questions
        </span>
      )}
      {exam.completed ? (
        <span className="mt-3 text-xs lg:text-sm font-semibold text-green-600 dark:text-green-400">
          Completed
        </span>
      ) : (
        <span
          className={`mt-3 text-xs lg:text-sm font-semibold transition-colors ${style.linkColor}`}
        >
          Open →
        </span>
      )}
    </Link>
  );
}
