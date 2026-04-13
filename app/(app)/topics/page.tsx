import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/utils";
import { canAccessTopic } from "@/lib/subscription";
import LockedTopicLink from "@/components/LockedTopicLink";
import {
  ChevronRight,
  Lock,
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
  FlaskConical,
  MoveUpRight,
  Gauge,
  PenLine,
  Combine,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Map subtopic name → icon
function getSubtopicIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  // Algebra, Number, and Structure
  if (n.includes("polynomial") && n.includes("eq")) return Hash;
  if (n.includes("exponential") && n.includes("eq")) return Zap;
  if (n.includes("logarithmic") && n.includes("eq")) return BookOpen;
  if (n.includes("trigonometric") && n.includes("eq")) return Waves;
  if (n.includes("simultaneous")) return GitMerge;
  if (n.includes("exponent") && n.includes("law")) return Scale;
  // Functions, Relations, and Graphs
  if (n.includes("polynomial") && n.includes("func")) return Hash;
  if (n.includes("exponential") && n.includes("func")) return TrendingUp;
  if (n.includes("logarithmic") && n.includes("func")) return TrendingUp;
  if (n.includes("trigonometric") && n.includes("func")) return Waves;
  if (n.includes("rational")) return Divide;
  if (n.includes("domain")) return Maximize2;
  if (n.includes("transform")) return Shuffle;
  if (n.includes("inverse")) return RefreshCw;
  if (n.includes("composite")) return Combine;
  // Calculus
  if (n.includes("chain")) return Link2;
  if (n.includes("product rule")) return Activity;
  if (n.includes("quotient")) return Divide;
  if (n.includes("tangent")) return PenLine;
  if (n.includes("rate")) return Gauge;
  if (n.includes("stationary")) return MoveUpRight;
  if (n.includes("optimis")) return Target;
  if (n.includes("antidifferentiation")) return RotateCcw;
  if (n.includes("definite")) return RotateCcw;
  if (n.includes("area")) return RotateCcw;
  if (n.includes("fundamental")) return BookOpen;
  if (n.includes("differentiation")) return Activity;
  // Data Analysis, Probability, and Statistics
  if (n.includes("binomial")) return BarChart2;
  if (n.includes("normal")) return LineChart;
  if (n.includes("continuous")) return LineChart;
  if (n.includes("discrete")) return BarChart2;
  if (n.includes("conditional")) return GitBranch;
  if (n.includes("confidence")) return Ruler;
  if (n.includes("sample") || n.includes("sampling")) return PieChart;
  if (n.includes("probability")) return Percent;
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
  "Polynomial Equations": "Solving polynomial equations using the factor theorem, remainder theorem, and algebraic techniques.",
  "Exponential Equations": "Solving equations with exponential expressions using logarithm laws.",
  "Logarithmic Equations": "Solving logarithmic equations analytically and graphically.",
  "Trigonometric Equations": "Solving trigonometric equations over specified domains including general solutions.",
  "Simultaneous Equations": "Solving systems of linear and non-linear equations using substitution or elimination.",
  "Exponent and Logarithm Laws": "Applying index laws, logarithm properties, and change-of-base rule to simplify expressions.",
  // Functions, Relations, and Graphs
  "Polynomial Functions": "Polynomials up to degree 4 — factorising, key features, and graph sketching.",
  "Exponential Functions": "Functions of the form a·bˣ and eˣ — graphs, transformations, and key features.",
  "Logarithmic Functions": "Logarithmic functions and their transformations, including logₑ (natural log).",
  "Trigonometric Functions": "Circular functions sin, cos, and tan — amplitude, period, phase, and graphs.",
  "Rational Functions": "Functions of the form 1/xⁿ — asymptotes, transformations, and sketching.",
  "Domain and Range": "Finding maximal domains and ranges, and restricting domains for inverse functions.",
  "Transformations": "Dilations, reflections, and translations applied to function graphs.",
  "Inverse Functions": "Finding and verifying inverse functions including domain and range relationships.",
  "Composite Functions": "Forming and evaluating composite functions f(g(x)) and determining their domains.",
  // Calculus
  "Differentiation": "Finding derivatives using first principles, power rule, and standard rules for all function types.",
  "Chain Rule": "Differentiating composite functions f(g(x)) using the chain rule.",
  "Product Rule": "Differentiating products of two functions: d/dx[u·v] = u'v + uv'.",
  "Quotient Rule": "Differentiating quotients of two functions: d/dx[u/v] = (u'v − uv')/v².",
  "Tangents and Normals": "Finding equations of tangent and normal lines to curves at given points.",
  "Rates of Change": "Using derivatives to model instantaneous and average rates of change in context.",
  "Stationary Points and Curve Sketching": "Finding and classifying stationary points; sketching curves using calculus.",
  "Optimisation": "Using derivatives to find maximum and minimum values in applied problems.",
  "Antidifferentiation": "Finding antiderivatives of polynomial, exponential, and trigonometric functions.",
  "Definite Integrals": "Evaluating definite integrals and understanding their geometric interpretation.",
  "Area Under Curves": "Calculating exact areas bounded by curves, axes, and between two curves.",
  "Fundamental Theorem of Calculus": "Connecting differentiation and integration via the fundamental theorem.",
  // Data Analysis, Probability, and Statistics
  "Probability Rules": "Addition, multiplication, and complement rules for calculating probabilities.",
  "Conditional Probability": "Probability given prior information — Pr(A|B) and independence testing.",
  "Discrete Random Variables": "Expected value, variance, and probability for discrete random variables.",
  "Binomial Distribution": "Discrete distribution for repeated independent trials — mean, variance, and probabilities.",
  "Continuous Random Variables": "Working with PDFs and CDFs — calculating probabilities and expected values.",
  "Normal Distribution": "Standard and general normal distributions — z-scores and probability calculations.",
  "Confidence Intervals": "Constructing and interpreting confidence intervals for a population proportion.",
  "Sample Proportions and Sampling": "Distribution of sample proportions, sampling distributions, and the central limit theorem.",
};

function getSubtopicDescription(name: string): string {
  return SUBTOPIC_DESCRIPTIONS[name] ?? "Practice questions for this topic area.";
}

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
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
  });

  // Compute lock state per topic for the current user.
  // Admins see no locks. PAID users see no locks. FREE users see locks on every
  // topic except the free-preview topic (Algebra).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dbUser = user
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
    : null;
  const isAdmin = isAdminRole(dbUser?.role);

  const lockedSlugs = new Set<string>();
  if (user && !isAdmin) {
    await Promise.all(
      topics.map(async (t) => {
        const access = await canAccessTopic(user.id, t.slug);
        if (!access.allowed) lockedSlugs.add(t.slug);
      })
    );
  }

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Topics</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        Browse past exam questions organised by VCE Mathematical Methods syllabus topic.
      </p>

      <div className="space-y-6 lg:space-y-8">
        {topics.map((topic) => {
          const theme = topicThemes[topic.order] ?? topicThemes[1];
          const isLocked = lockedSlugs.has(topic.slug);

          return (
            <div key={topic.id} className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden ${isLocked ? "opacity-75" : ""}`}>
              {/* Topic header */}
              <LockedTopicLink
                href={`/topics/${topic.slug}`}
                locked={isLocked}
                topicName={topic.name}
                className={`w-full flex items-center justify-between text-left px-6 py-5 lg:px-8 lg:py-6 bg-gradient-to-r ${theme.bg} hover:brightness-[0.98] transition-all`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg lg:text-xl">{topic.name}</h2>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-900/80 dark:bg-gray-700 px-2 py-0.5 text-xs font-semibold text-white">
                        <Lock className="h-3 w-3" />
                        Paid plan
                      </span>
                    )}
                  </div>
                  {topic.description && (
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-300 dark:text-gray-600 shrink-0" />
              </LockedTopicLink>

              {/* Subtopic card grid — more columns on wider screens */}
              {topic.subtopics.length > 0 && (
                <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {topic.subtopics.map((sub) => {
                    const Icon = getSubtopicIcon(sub.name);

                    return (
                      <div key={sub.id} className="group relative">
                        <LockedTopicLink
                          href={`/topics/${topic.slug}?subtopic=${sub.slug}`}
                          locked={isLocked}
                          topicName={topic.name}
                          className="flex flex-col gap-2.5 sm:gap-3 lg:gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm transition-all p-3 sm:p-3.5 lg:p-5 h-full text-left w-full"
                        >
                          {/* Icon */}
                          <div className="flex items-start">
                            <span className={`flex h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 items-center justify-center rounded-lg lg:rounded-xl shrink-0 ${theme.iconBg}`}>
                              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${theme.iconColor}`} />
                            </span>
                          </div>

                          {/* Name */}
                          <div>
                            <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 dark:text-gray-200 leading-snug">{sub.name}</p>
                          </div>
                        </LockedTopicLink>

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
