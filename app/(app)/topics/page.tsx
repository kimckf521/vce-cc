export const dynamic = "force-dynamic";

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
  1: { bg: "from-violet-50 to-white", iconBg: "bg-violet-100", iconColor: "text-violet-600", accent: "text-violet-700", freqColor: "bg-violet-100 text-violet-700" },
  2: { bg: "from-sky-50 to-white", iconBg: "bg-sky-100", iconColor: "text-sky-600", accent: "text-sky-700", freqColor: "bg-sky-100 text-sky-700" },
  3: { bg: "from-amber-50 to-white", iconBg: "bg-amber-100", iconColor: "text-amber-600", accent: "text-amber-700", freqColor: "bg-amber-100 text-amber-700" },
  4: { bg: "from-emerald-50 to-white", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", accent: "text-emerald-700", freqColor: "bg-emerald-100 text-emerald-700" },
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

// A Section B question with parts a/b/c counts as 1 group (1 question).
// An MCQ (part=null) is always its own standalone group.
// This helper returns the number of displayable groups, matching the detail page count.
type QuestionRow = {
  examId: string;
  questionNumber: number;
  part: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  exam: { year: number };
};

function computeGroupStats(questions: QuestionRow[]) {
  // MCQs: each is its own group
  const mcqs = questions.filter((q) => q.part === null);

  // Section B: deduplicate by (examId, questionNumber), keep first part's difficulty
  const sectionBMap = new Map<string, "EASY" | "MEDIUM" | "HARD">();
  for (const q of questions.filter((q) => q.part !== null)) {
    const key = `${q.examId}-${q.questionNumber}`;
    if (!sectionBMap.has(key)) sectionBMap.set(key, q.difficulty);
  }

  const difficulties = [
    ...mcqs.map((q) => q.difficulty),
    ...Array.from(sectionBMap.values()),
  ];

  return {
    total: difficulties.length,
    easy: difficulties.filter((d) => d === "EASY").length,
    medium: difficulties.filter((d) => d === "MEDIUM").length,
    hard: difficulties.filter((d) => d === "HARD").length,
    years: Array.from(new Set(questions.map((q) => q.exam.year))).sort(),
  };
}

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      // Fetch topic-level questions for the header group count
      questions: {
        select: {
          examId: true,
          questionNumber: true,
          part: true,
          difficulty: true,
          exam: { select: { year: true } },
        },
      },
      subtopics: {
        orderBy: { name: "asc" },
        include: {
          questions: {
            select: {
              examId: true,
              questionNumber: true,
              part: true,
              difficulty: true,
              exam: { select: { year: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Topics</h1>
      <p className="text-gray-500 lg:text-base mb-8">
        Browse past exam questions organised by VCE Mathematical Methods syllabus topic.
      </p>

      <div className="space-y-6 lg:space-y-8">
        {topics.map((topic) => {
          const theme = topicThemes[topic.order] ?? topicThemes[1];
          const topicStats = computeGroupStats(topic.questions);

          return (
            <div key={topic.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              {/* Topic header */}
              <Link
                href={`/topics/${topic.slug}`}
                className={`flex items-center justify-between px-6 py-5 lg:px-8 lg:py-6 bg-gradient-to-r ${theme.bg} hover:brightness-[0.98] transition-all`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="font-bold text-gray-900 text-lg lg:text-xl">{topic.name}</h2>
                  {topic.description && (
                    <p className="text-sm lg:text-base text-gray-500 mt-1">{topic.description}</p>
                  )}
                  <p className={`text-sm lg:text-base font-semibold mt-1.5 ${theme.accent}`}>
                    {topicStats.total} questions
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-300 shrink-0" />
              </Link>

              {/* Subtopic card grid — more columns on wider screens */}
              {topic.subtopics.length > 0 && (
                <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {topic.subtopics.map((sub) => {
                    const { total, easy, medium, hard, years } = computeGroupStats(sub.questions);
                    const { tag: freq, dots, title: freqTitle } = freqLabel(years.length);
                    const Icon = getSubtopicIcon(sub.name);

                    return (
                      <div key={sub.id} className="group relative">
                        <Link
                          href={`/topics/${topic.slug}?subtopic=${sub.slug}`}
                          className="flex flex-col gap-2.5 sm:gap-3 lg:gap-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all p-3 sm:p-3.5 lg:p-5 h-full"
                        >
                          {/* Top row: icon + freq badge */}
                          <div className="flex items-start justify-between gap-1.5">
                            <span className={`flex h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 items-center justify-center rounded-lg lg:rounded-xl shrink-0 ${theme.iconBg}`}>
                              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${theme.iconColor}`} />
                            </span>
                            {/* Frequency badge: dots-only on mobile, full label on sm+ */}
                            <span
                              className="flex items-center gap-0.5 sm:gap-1 rounded-md border border-gray-200 bg-white px-1 sm:px-1.5 py-0.5 text-xs font-medium text-gray-500 shrink-0"
                            >
                              <CalendarDays className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="hidden sm:inline lg:hidden xl:inline">{freq}</span>
                              <span className="flex gap-0.5 sm:ml-0.5">
                                {[1, 2, 3].map((d) => (
                                  <span
                                    key={d}
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${d <= dots ? "bg-gray-500" : "bg-gray-200"}`}
                                  />
                                ))}
                              </span>
                            </span>
                          </div>

                          {/* Name + count */}
                          <div>
                            <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 leading-snug">{sub.name}</p>
                            <p className="text-xs lg:text-sm text-gray-400 mt-0.5">{total} question{total !== 1 ? "s" : ""}</p>
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
                            <p className="text-gray-300 leading-relaxed">{getSubtopicDescription(sub.name)}</p>
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
