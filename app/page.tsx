import Link from "next/link";
import { BookOpen, BarChart2, FileText, CheckCircle, Clock, ArrowRight, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    icon: BookOpen,
    title: "Question Bank",
    description:
      "Browse hundreds of past exam questions organised by topic and subtopic — from Functions to Probability.",
  },
  {
    icon: FileText,
    title: "Past Papers",
    description:
      "Access every VCAA Mathematical Methods Exam 1 and Exam 2 in one place, with official and worked solutions.",
  },
  {
    icon: CheckCircle,
    title: "Worked Solutions",
    description:
      "Step-by-step solutions for every question so you can understand exactly where marks come from.",
  },
  {
    icon: BarChart2,
    title: "Track Progress",
    description:
      "Mark questions as correct, incorrect, or needs review. See your strengths and weaknesses at a glance.",
  },
];

const journey = [
  {
    icon: Target,
    label: "Zero",
    title: "Start where you are",
    description:
      "No matter where you're at — overwhelmed, behind, or just starting out — your hero journey begins here.",
  },
  {
    icon: TrendingUp,
    label: "Grow",
    title: "Build skill, one question at a time",
    description:
      "Practise real VCAA past exam questions with worked solutions. Track every correct, incorrect and review.",
  },
  {
    icon: Trophy,
    label: "Hero",
    title: "Walk into the exam ready",
    description:
      "Timed practice exams, exam-day strategy, and confidence built from doing the work — not just reading it.",
  },
];

const subjects = [
  {
    name: "Mathematical Methods",
    description: "Functions, calculus, algebra, probability and statistics — complete Exam 1 & 2 coverage.",
    status: "available" as const,
    href: "/topics",
    topics: [
      { name: "Functions & Graphs", slug: "functions-and-graphs" },
      { name: "Algebra", slug: "algebra" },
      { name: "Calculus", slug: "calculus" },
      { name: "Probability & Statistics", slug: "probability-and-statistics" },
    ],
  },
  {
    name: "Specialist Mathematics",
    description: "Complex numbers, vectors, differential equations, mechanics and more.",
    status: "coming-soon" as const,
    href: "#",
    topics: [],
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-36 xl:py-44 px-5 sm:px-8 lg:px-12 text-center bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950 dark:via-gray-950 dark:to-gray-900">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-200/40 dark:bg-brand-700/20 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 dark:bg-brand-900 px-4 py-1.5 text-sm lg:text-base font-medium text-brand-700 dark:text-brand-300 mb-6 lg:mb-8">
            <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            Your VCE journey starts here
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-[1.05]">
            From{" "}
            <span className="text-gray-400 dark:text-gray-500 line-through decoration-4 decoration-red-400/70">
              zero
            </span>
            <br className="sm:hidden" />{" "}
            to{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-brand-400 dark:via-brand-300 dark:to-brand-500 bg-clip-text text-transparent">
              hero
            </span>
            .
          </h1>
          <p className="mt-6 lg:mt-8 text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Wherever you&apos;re starting from, ATAR Hero takes you all the way. Real VCAA past
            exam questions, worked solutions, and timed practice — built to turn study into a
            top ATAR.
          </p>
          <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="group rounded-2xl bg-brand-600 px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 transition-all"
            >
              {user ? "Go to dashboard" : "Begin your hero journey — free"}
              <ArrowRight className="inline-block h-4 w-4 lg:h-5 lg:w-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/topics"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              Browse topics
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
            No credit card. Free to start.
          </p>
        </div>
      </section>

      {/* Zero → Hero journey */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">
              Every hero starts somewhere
            </h2>
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              The gap between you and a top ATAR isn&apos;t talent — it&apos;s reps. Here&apos;s
              how ATAR Hero gets you across.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-gray-200 via-brand-300 to-amber-300 dark:from-gray-700 dark:via-brand-700 dark:to-amber-700" />

            {journey.map((step, i) => (
              <div key={step.label} className="relative text-center">
                {/* Step circle with icon */}
                <div className="relative mx-auto mb-5 inline-flex">
                  <div
                    className={`flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${
                      i === 0
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        : i === 1
                          ? "bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300"
                          : "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30"
                    }`}
                  >
                    <step.icon className="h-7 w-7 lg:h-9 lg:w-9" />
                  </div>
                </div>
                <p
                  className={`text-xs lg:text-sm font-bold uppercase tracking-widest mb-2 ${
                    i === 0
                      ? "text-gray-400 dark:text-gray-500"
                      : i === 1
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {step.label}
                </p>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4 text-center">
            VCE Subjects
          </h2>
          <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 text-center mb-10 lg:mb-14 max-w-2xl mx-auto">
            ATAR Hero is building revision tools for every VCE subject. Mathematical Methods is live now — more on the way.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className={`rounded-2xl border p-6 lg:p-8 transition-all ${
                  subject.status === "available"
                    ? "border-brand-200 bg-white dark:bg-gray-900 shadow-sm"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl lg:text-2xl font-bold ${
                    subject.status === "available" ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {subject.name}
                  </h3>
                  {subject.status === "available" ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      Available now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Clock className="h-3 w-3" />
                      Coming soon
                    </span>
                  )}
                </div>

                <p className={`text-sm lg:text-base leading-relaxed mb-5 ${
                  subject.status === "available" ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-500"
                }`}>
                  {subject.description}
                </p>

                {subject.status === "available" && subject.topics.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                      {subject.topics.map((topic) => (
                        <Link
                          key={topic.slug}
                          href={`/topics/${topic.slug}`}
                          className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {topic.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={subject.href}
                      className="inline-flex items-center gap-1.5 text-sm lg:text-base font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                      Start practising
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}

                {subject.status === "coming-soon" && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    We&apos;re working on this — stay tuned for updates.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12 lg:mb-16 text-center">
            Everything you need to prepare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            {features.map((f) => (
              <div key={f.title} className="flex gap-5 lg:gap-6">
                <div className="flex-shrink-0 rounded-2xl bg-brand-100 dark:bg-brand-900 p-3.5 lg:p-4 h-fit">
                  <f.icon className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold lg:text-lg text-gray-900 dark:text-gray-100">{f.title}</h3>
                  <p className="mt-1.5 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-36 px-5 sm:px-8 text-center bg-gradient-to-b from-white to-brand-50 dark:from-gray-900 dark:to-brand-950">
        <div className="max-w-2xl mx-auto">
          <Trophy className="h-10 w-10 lg:h-12 lg:w-12 text-amber-500 dark:text-amber-400 mx-auto mb-5" />
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100">
            Your hero arc starts today.
          </h2>
          <p className="mt-4 lg:mt-6 text-base lg:text-xl text-gray-500 dark:text-gray-400">
            Create a free account and take the first step from zero to hero. More VCE subjects are on the way.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="group mt-8 lg:mt-10 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-8 lg:px-12 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 transition-all"
          >
            {user ? "Go to dashboard" : "Create free account"}
            <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
