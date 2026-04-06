import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ChevronRight,
  CalendarDays,
  Shuffle,
  TrendingUp,
  RefreshCw,
  Waves,
  Divide,
  Maximize2,
  FunctionSquare,
  BarChart2,
  Zap,
  Hash,
  GitMerge,
  Link2,
  Target,
  BookOpen,
  RotateCcw,
  Activity,
  GitBranch,
  Percent,
  PieChart,
  LineChart,
  Ruler,
  Layers,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Map subtopic name → icon
function getSubtopicIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("transform")) return Shuffle;
  if (n.includes("logarithm") && n.includes("eq")) return BookOpen;
  if (n.includes("logarithm")) return TrendingUp;
  if (n.includes("inverse")) return RefreshCw;
  if (n.includes("trig") || n.includes("circular")) return Waves;
  if (n.includes("rational") || n.includes("quotient")) return Divide;
  if (n.includes("domain") || n.includes("range")) return Maximize2;
  if (n.includes("algebraic") || n.includes("function")) return FunctionSquare;
  if (n.includes("polynomial") || n.includes("polynomials")) return Hash;
  if (n.includes("exponential") && n.includes("eq")) return Zap;
  if (n.includes("exponential")) return TrendingUp;
  if (n.includes("quadratic")) return BarChart2;
  if (n.includes("simultaneous")) return GitMerge;
  if (n.includes("chain")) return Link2;
  if (n.includes("product") || n.includes("differentiation")) return Activity;
  if (n.includes("optimis")) return Target;
  if (n.includes("integration") || n.includes("integral") || n.includes("area")) return RotateCcw;
  if (n.includes("antidifferentiation") || n.includes("fundamental")) return BookOpen;
  if (n.includes("binomial") || n.includes("discrete")) return BarChart2;
  if (n.includes("normal") || n.includes("continuous")) return LineChart;
  if (n.includes("conditional") || n.includes("probability rules")) return GitBranch;
  if (n.includes("confidence")) return Ruler;
  if (n.includes("proportion") || n.includes("sampling") || n.includes("sample")) return PieChart;
  if (n.includes("combinatoric")) return Layers;
  if (n.includes("percent") || n.includes("probability")) return Percent;
  return FlaskConical;
}

// Topic colour themes
const topicThemes: Record<number, { bg: string; iconBg: string; iconColor: string; accent: string; freqColor: string }> = {
  1: { bg: "from-violet-50 to-white dark:from-violet-950 dark:to-gray-900", iconBg: "bg-violet-100 dark:bg-violet-900", iconColor: "text-violet-600 dark:text-violet-400", accent: "text-violet-700 dark:text-violet-400", freqColor: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400" },
  2: { bg: "from-sky-50 to-white dark:from-sky-950 dark:to-gray-900", iconBg: "bg-sky-100 dark:bg-sky-900", iconColor: "text-sky-600 dark:text-sky-400", accent: "text-sky-700 dark:text-sky-400", freqColor: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400" },
  3: { bg: "from-amber-50 to-white dark:from-amber-950 dark:to-gray-900", iconBg: "bg-amber-100 dark:bg-amber-900", iconColor: "text-amber-600 dark:text-amber-400", accent: "text-amber-700 dark:text-amber-400", freqColor: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400" },
  4: { bg: "from-emerald-50 to-white dark:from-emerald-950 dark:to-gray-900", iconBg: "bg-emerald-100 dark:bg-emerald-900", iconColor: "text-emerald-600 dark:text-emerald-400", accent: "text-emerald-700 dark:text-emerald-400", freqColor: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400" },
};

const SUBTOPIC_DESCRIPTIONS: Record<string, string> = {
  // Algebra, Number, and Structure
  "Algebraic Functions": "Piecewise, hybrid, and absolute value functions — defining rules and sketching their graphs.",
  "Domain and Range": "Finding maximal domains and ranges, and restricting domains for inverse functions.",
  "Exponential Functions": "Functions of the form a·bˣ — graphs, transformations, and key features.",
  "Inverse Functions": "Finding and verifying inverse functions including domain and range relationships.",
  "Logarithmic Functions": "Logarithmic functions and their transformations, focusing on log\u2091 (natural log).",
  "Polynomial Functions": "Polynomials up to degree 4 — factorising, key features, and graph sketching.",
  "Rational Functions": "Functions of the form 1/xⁿ — asymptotes, transformations, and sketching.",
  "Transformations": "Dilations, reflections, and translations applied to function graphs.",
  "Trigonometric Functions": "Circular functions sin, cos, and tan — amplitude, period, phase, and graphs.",
  // Functions, Relations, and Graphs
  "Exponential Equations": "Solving equations with exponential expressions using logarithm laws.",
  "Logarithmic Equations": "Solving logarithmic equations analytically and graphically.",
  "Polynomials": "Polynomial equations — factor theorem, remainder theorem, and solving techniques.",
  "Quadratics": "Solving quadratic equations by factoring, completing the square, or the quadratic formula.",
  "Simultaneous Equations": "Solving systems of linear and non-linear equations using substitution or elimination.",
  // Calculus
  "Antidifferentiation": "Finding antiderivatives of polynomial, exponential, and trigonometric functions.",
  "Area Under Curve": "Calculating exact areas bounded by curves using definite integrals.",
  "Areas Under Curves": "Estimating areas using numerical methods including the trapezium rule.",
  "Chain Rule": "Differentiating composite functions f(g(x)) using the chain rule.",
  "Definite Integrals": "Evaluating definite integrals and applying the fundamental theorem of calculus.",
  "Differentiation": "Finding derivatives from first principles and standard rules; rates of change.",
  "Fundamental Theorem": "Connecting differentiation and integration via the fundamental theorem of calculus.",
  "Integration": "Integration techniques and calculating signed areas between curves.",
  "Optimisation": "Using derivatives to find maximum and minimum values in applied problems.",
  "Product Rule": "Differentiating products of two functions: d/dx[u·v] = u'v + uv'.",
  "Quotient Rule": "Differentiating quotients of two functions: d/dx[u/v] = (u'v − uv')/v².",
  // Data Analysis, Probability, and Statistics
  "Binomial Distribution": "Discrete distribution for repeated independent trials — mean, variance, and probabilities.",
  "Combinatorics": "Counting methods including permutations and combinations for probability problems.",
  "Conditional Probability": "Probability given prior information — Pr(A|B) and independence testing.",
  "Confidence Intervals": "Constructing and interpreting confidence intervals for a population proportion.",
  "Continuous Distributions": "Probability density functions for general continuous random variables.",
  "Continuous Random Variables": "Working with PDFs and CDFs — calculating probabilities and expected values.",
  "Discrete Distributions": "Probability distributions for discrete random variables using tables and rules.",
  "Discrete Random Variables": "Expected value, variance, and probability for discrete random variables.",
  "Normal Distribution": "Standard and general normal distributions — z-scores and probability calculations.",
  "Probability Rules": "Addition, multiplication, and complement rules for calculating probabilities.",
  "Sample Proportions": "Distribution of sample proportions and the central limit theorem.",
  "Sampling": "Simulating sampling distributions to understand statistical inference.",
};

function getSubtopicDescription(name: string): string {
  return SUBTOPIC_DESCRIPTIONS[name] ?? "Practice questions for this topic area.";
}

function freqLabel(yearCount: number): { tag: string; dots: number; title: string } {
  if (yearCount >= 6) return { tag: "Every year", dots: 3, title: `Appeared in ${yearCount} of 8 years — very common exam topic` };
  if (yearCount >= 3) return { tag: "Most years", dots: 2, title: `Appeared in ${yearCount} of 8 years — common exam topic` };
  return { tag: "Rare", dots: 1, title: `Appeared in ${yearCount} of 8 years — infrequent exam topic` };
}


export default async function TopicsPage() {
  const [topics, subtopicYearCounts, subtopicStats, topicStats] = await Promise.all([
    // Lightweight topic + subtopic metadata (no questions)
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        description: true,
        subtopics: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    // Year counts per subtopic
    prisma.$queryRaw<{ subtopicId: string; yearCount: bigint }[]>`
      SELECT s."id" AS "subtopicId", COUNT(DISTINCT e."year") AS "yearCount"
      FROM "Subtopic" s
      JOIN "_QuestionToSubtopic" qs ON qs."B" = s."id"
      JOIN "Question" q ON q."id" = qs."A"
      JOIN "Exam" e ON e."id" = q."examId"
      GROUP BY s."id"
    `,
    // Question group counts + difficulty breakdown per subtopic (via SQL)
    prisma.$queryRaw<{ subtopicId: string; total: bigint; easy: bigint; medium: bigint; hard: bigint }[]>`
      SELECT qs."B" AS "subtopicId",
        COUNT(*) FILTER (WHERE q."part" IS NULL)
        + COUNT(DISTINCT CASE WHEN q."part" IS NOT NULL THEN q."examId" || '-' || q."questionNumber" END)
        AS "total",
        COUNT(*) FILTER (WHERE q."difficulty" = 'EASY' AND q."part" IS NULL)
        + COUNT(DISTINCT CASE WHEN q."difficulty" = 'EASY' AND q."part" IS NOT NULL THEN q."examId" || '-' || q."questionNumber" END)
        AS "easy",
        COUNT(*) FILTER (WHERE q."difficulty" = 'MEDIUM' AND q."part" IS NULL)
        + COUNT(DISTINCT CASE WHEN q."difficulty" = 'MEDIUM' AND q."part" IS NOT NULL THEN q."examId" || '-' || q."questionNumber" END)
        AS "medium",
        COUNT(*) FILTER (WHERE q."difficulty" = 'HARD' AND q."part" IS NULL)
        + COUNT(DISTINCT CASE WHEN q."difficulty" = 'HARD' AND q."part" IS NOT NULL THEN q."examId" || '-' || q."questionNumber" END)
        AS "hard"
      FROM "_QuestionToSubtopic" qs
      JOIN "Question" q ON q."id" = qs."A"
      GROUP BY qs."B"
    `,
    // Question group counts per topic
    prisma.$queryRaw<{ topicId: string; total: bigint }[]>`
      SELECT "topicId",
        COUNT(*) FILTER (WHERE "part" IS NULL)
        + COUNT(DISTINCT CASE WHEN "part" IS NOT NULL THEN "examId" || '-' || "questionNumber" END)
        AS "total"
      FROM "Question"
      GROUP BY "topicId"
    `,
  ]);

  // Build lookups
  const yearCountMap = new Map<string, number>();
  for (const row of subtopicYearCounts) {
    yearCountMap.set(row.subtopicId, Number(row.yearCount));
  }

  const subStatsMap = new Map(
    subtopicStats.map((r) => [
      r.subtopicId,
      { total: Number(r.total), easy: Number(r.easy), medium: Number(r.medium), hard: Number(r.hard) },
    ])
  );

  const topicStatsMap = new Map(topicStats.map((r) => [r.topicId, Number(r.total)]));

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Topics</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        Browse past exam questions organised by VCE Mathematical Methods syllabus topic.
      </p>

      <div className="space-y-6 lg:space-y-8">
        {topics.map((topic) => {
          const theme = topicThemes[topic.order] ?? topicThemes[1];
          const topicTotal = topicStatsMap.get(topic.id) ?? 0;

          return (
            <div key={topic.id} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Topic header */}
              <Link
                href={`/topics/${topic.slug}`}
                className={`flex items-center justify-between px-6 py-5 lg:px-8 lg:py-6 bg-gradient-to-r ${theme.bg} hover:brightness-[0.98] transition-all`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg lg:text-xl">{topic.name}</h2>
                  {topic.description && (
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
                  )}
                  <p className={`text-sm lg:text-base font-semibold mt-1.5 ${theme.accent}`}>
                    {topicTotal} questions
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-300 dark:text-gray-600 shrink-0" />
              </Link>

              {/* Subtopic card grid — more columns on wider screens */}
              {topic.subtopics.length > 0 && (
                <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {topic.subtopics.map((sub) => {
                    const { total, easy, medium, hard } = subStatsMap.get(sub.id) ?? { total: 0, easy: 0, medium: 0, hard: 0 };
                    const yearCount = yearCountMap.get(sub.id) ?? 0;
                    const { tag: freq, dots, title: freqTitle } = freqLabel(yearCount);
                    const Icon = getSubtopicIcon(sub.name);

                    return (
                      <div key={sub.id} className="group relative">
                        <Link
                          href={`/topics/${topic.slug}?subtopic=${sub.slug}`}
                          className="flex flex-col gap-2.5 sm:gap-3 lg:gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm transition-all p-3 sm:p-3.5 lg:p-5 h-full"
                        >
                          {/* Top row: icon + freq badge */}
                          <div className="flex items-start justify-between gap-1.5">
                            <span className={`flex h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 items-center justify-center rounded-lg lg:rounded-xl shrink-0 ${theme.iconBg}`}>
                              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${theme.iconColor}`} />
                            </span>
                            {/* Frequency badge: dots-only on mobile, full label on sm+ */}
                            <span
                              className="flex items-center gap-0.5 sm:gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1 sm:px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0"
                            >
                              <CalendarDays className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
                              <span className="hidden sm:inline lg:hidden xl:inline">{freq}</span>
                              <span className="flex gap-0.5 sm:ml-0.5">
                                {[1, 2, 3].map((d) => (
                                  <span
                                    key={d}
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${d <= dots ? "bg-gray-500 dark:bg-gray-400" : "bg-gray-200 dark:bg-gray-700"}`}
                                  />
                                ))}
                              </span>
                            </span>
                          </div>

                          {/* Name + count */}
                          <div>
                            <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 dark:text-gray-200 leading-snug">{sub.name}</p>
                            <p className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 mt-0.5">{total} question{total !== 1 ? "s" : ""}</p>
                          </div>

                          {/* Difficulty bar */}
                          {total > 0 && (
                            <div className="flex h-1 sm:h-1.5 lg:h-2 w-full rounded-full overflow-hidden gap-px mt-auto">
                              {easy > 0 && (
                                <div
                                  className="bg-green-400 rounded-full"
                                  style={{ width: `${(easy / total) * 100}%` }}
                                />
                              )}
                              {medium > 0 && (
                                <div
                                  className="bg-yellow-400 rounded-full"
                                  style={{ width: `${(medium / total) * 100}%` }}
                                />
                              )}
                              {hard > 0 && (
                                <div
                                  className="bg-red-400 rounded-full"
                                  style={{ width: `${(hard / total) * 100}%` }}
                                />
                              )}
                            </div>
                          )}
                        </Link>

                        {/* Description tooltip on hover */}
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 z-10 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 w-60 lg:w-72">
                          <div className="rounded-lg bg-gray-900 text-white text-xs lg:text-sm px-3 py-2.5 shadow-lg">
                            <p className="font-semibold mb-1">{sub.name}</p>
                            <p className="text-gray-300 dark:text-gray-400 leading-relaxed">{getSubtopicDescription(sub.name)}</p>
                            <div className="absolute top-full left-6 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
