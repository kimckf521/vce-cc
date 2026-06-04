import Link from "next/link";
import { FileText, CheckCircle, Clock, ArrowRight, Sparkles, Target, TrendingUp, Trophy, HelpCircle, Award, Smartphone, Timer, LineChart } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const stats = [
  { value: "2,900+", label: "Past exam questions" },
  { value: "10 yrs", label: "Of VCAA papers" },
  { value: "4",      label: "VCE maths subjects" },
  { value: "100%",   label: "With worked solutions" },
];

const features = [
  {
    icon: FileText,
    title: "Real VCAA past exams",
    description:
      "Every VCAA Exam 1 and Exam 2 from 2016 onwards across all 4 maths subjects — actual questions, not lookalikes.",
    iconBg: "bg-brand-100 dark:bg-brand-900/60",
    iconColor: "text-brand-600 dark:text-brand-400",
  },
  {
    icon: CheckCircle,
    title: "Step-by-step solutions",
    description:
      "Every answer is broken down so you understand the why, not just the what. Learn how marks are earned.",
    iconBg: "bg-green-100 dark:bg-green-900/60",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Timer,
    title: "Timed exam practice",
    description:
      "Mirror real exam conditions — Exam 1 (no calculator), Exam 2A (MCQ), Exam 2B (extended), or full Exam 2.",
    iconBg: "bg-amber-100 dark:bg-amber-900/60",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Target,
    title: "Topic-by-topic drill",
    description:
      "Browse by topic and subtopic. Find your weak spots and grind them into strengths, one question at a time.",
    iconBg: "bg-violet-100 dark:bg-violet-900/60",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: LineChart,
    title: "Smart progress tracking",
    description:
      "Mark questions as correct, incorrect or needs-review. Bookmark anything. See your trend over time.",
    iconBg: "bg-sky-100 dark:bg-sky-900/60",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: Smartphone,
    title: "Works everywhere you do",
    description:
      "Mobile, tablet, desktop. Light, dark or system theme. Study on the bus or at your desk — same beautiful UI.",
    iconBg: "bg-rose-100 dark:bg-rose-900/60",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

const journey = [
  {
    icon: Target,
    label: "Zero",
    title: "Start where you are",
    description:
      "No matter where you're at — overwhelmed, behind or just starting out — your VCE Maths journey begins here.",
  },
  {
    icon: TrendingUp,
    label: "Grow",
    title: "Build skill, one question at a time",
    description:
      "Practise real VCAA past exam questions with worked solutions. Track every correct answer, mistake and review.",
  },
  {
    icon: Trophy,
    label: "Hero",
    title: "Walk into the exam ready",
    description:
      "Timed practice exams, exam-day strategy and confidence built from doing the work — not just reading it.",
  },
];

// VCAA pathway order: Foundation → General → Methods → Specialist
// (matches the in-app SUBJECTS order in lib/subject-context.ts and the nav).
//
// `guideHref` points at the public, indexable subject landing page (e.g.
// `/methods`) — the homepage should pass authority to those SEO pages, not
// only to the gated in-app `topics` view. `examsHref` points at the public
// Past Papers surface. `href` (topics) stays for the "Start practising" CTA.
const subjects = [
  {
    name: "Foundation Mathematics",
    description: "Real-world maths for everyday life — financial maths, measurement, statistics and algebra.",
    status: "available",
    href: "/vce/foundation/topics",
    guideHref: "/foundation",
    examsHref: "/vce/foundation/exams",
    topics: [
      { name: "Algebra", slug: "algebra-number-and-structure" },
      { name: "Discrete Maths", slug: "discrete-mathematics" },
      { name: "Space & Measurement", slug: "space-and-measurement" },
      { name: "Data & Statistics", slug: "data-analysis-probability-and-statistics" },
    ],
  },
  {
    name: "General Mathematics",
    description: "Applied maths across financial, statistical, geometric and algebraic contexts — full Exam 1 and Exam 2 coverage.",
    status: "available",
    href: "/vce/general/topics",
    guideHref: "/general",
    examsHref: "/vce/general/exams",
    topics: [
      { name: "Algebra", slug: "algebra-number-and-structure" },
      { name: "Functions & Graphs", slug: "functions-relations-and-graphs" },
      { name: "Discrete Maths", slug: "discrete-mathematics" },
      { name: "Space & Measurement", slug: "space-and-measurement" },
      { name: "Data & Statistics", slug: "data-analysis-probability-and-statistics" },
    ],
  },
  {
    name: "Mathematical Methods",
    description: "Functions, calculus, algebra, probability and statistics — complete Exam 1 and Exam 2 coverage.",
    status: "available",
    href: "/vce/methods/topics",
    guideHref: "/methods",
    examsHref: "/vce/methods/exams",
    topics: [
      { name: "Algebra", slug: "algebra-number-and-structure" },
      { name: "Functions & Graphs", slug: "functions-relations-and-graphs" },
      { name: "Calculus", slug: "calculus" },
      { name: "Probability & Statistics", slug: "data-analysis-probability-and-statistics" },
    ],
  },
  {
    name: "Specialist Mathematics",
    description: "Complex numbers, vectors, differential equations, mechanics, discrete maths and more.",
    status: "available",
    href: "/vce/specialist/topics",
    guideHref: "/specialist",
    examsHref: "/vce/specialist/exams",
    topics: [
      { name: "Algebra", slug: "algebra-number-and-structure" },
      { name: "Functions & Graphs", slug: "functions-relations-and-graphs" },
      { name: "Calculus", slug: "calculus" },
      { name: "Discrete Maths", slug: "discrete-mathematics" },
      { name: "Space & Measurement", slug: "space-and-measurement" },
      { name: "Data & Statistics", slug: "data-analysis-probability-and-statistics" },
    ],
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
          <p className="mt-5 lg:mt-6 text-base lg:text-lg font-semibold text-brand-700 dark:text-brand-300 max-w-2xl mx-auto">
            Created by VCE specialists to help students practise smarter with real VCAA exam questions.
          </p>
          <p className="mt-4 lg:mt-5 text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Wherever you&apos;re starting from, ATAR Hero takes you all the way. Real VCAA past
            exam questions, worked solutions and timed practice — built to turn study into a
            top ATAR score.
          </p>
          <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="group rounded-2xl bg-brand-600 px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 transition-all"
            >
              {user ? "Go to dashboard" : "Start practising — free"}
              <ArrowRight className="inline-block h-4 w-4 lg:h-5 lg:w-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/vce/methods/topics"
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
              Every VCE journey starts somewhere
            </h2>
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              The gap between you and a top ATAR isn&apos;t talent — it&apos;s reps. Here&apos;s
              how ATAR Hero helps you bridge it.
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
            ATAR Hero is building revision tools for every VCE subject. All 4 maths subjects are live now — Sciences, English and more on the way.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
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
                    {subject.status === "available" && subject.guideHref ? (
                      <Link
                        href={subject.guideHref}
                        className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        VCE {subject.name}
                      </Link>
                    ) : (
                      subject.name
                    )}
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
                          href={`${subject.href}/${topic.slug}`}
                          className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {topic.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <Link
                        href={subject.href}
                        className="inline-flex items-center gap-1.5 text-sm lg:text-base font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        Start practising
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      {subject.examsHref && (
                        <Link
                          href={subject.examsHref}
                          className="inline-flex items-center gap-1.5 text-sm lg:text-base font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                          View past papers
                        </Link>
                      )}
                    </div>
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
      <section className="relative overflow-hidden py-20 lg:py-28 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-950/60">
        {/* Soft accent glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-[60%] rounded-full bg-brand-200/30 dark:bg-brand-800/15 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 dark:bg-brand-900/60 px-3 py-1 text-xs lg:text-sm font-medium text-brand-700 dark:text-brand-300 mb-4">
              <Sparkles className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              Why ATAR Hero
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4 tracking-tight">
              Everything you need to ace VCE
            </h2>
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Built by VCE specialists who&apos;ve sat the exams. Real exam content, smart tools and a UX that doesn&apos;t get in your way.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-14 lg:mb-20">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-5 lg:px-6 lg:py-6 text-center shadow-sm"
              >
                <p className="text-2xl lg:text-3xl xl:text-4xl font-extrabold bg-gradient-to-br from-brand-600 to-brand-500 dark:from-brand-400 dark:to-brand-300 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Feature grid — 6 cards, 1/2/3 columns responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:p-7 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all"
              >
                <div className={cn("inline-flex rounded-2xl p-3 lg:p-3.5 mb-5", f.iconBg)}>
                  <f.icon className={cn("h-6 w-6 lg:h-7 lg:w-7", f.iconColor)} />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* Inline secondary CTA */}
          <div className="mt-12 lg:mt-14 text-center">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="group inline-flex items-center gap-2 text-sm lg:text-base font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              {user ? "Jump back to your dashboard" : "Browse every topic and try sample questions free"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section
        id="contact"
        className="relative overflow-hidden py-20 lg:py-28 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
      >
        {/* Subtle grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-25 [background-image:linear-gradient(to_right,rgb(0_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.04)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 dark:bg-brand-900/60 px-3 py-1 text-xs lg:text-sm font-medium text-brand-700 dark:text-brand-300 mb-4">
              We&apos;d love to hear from you
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4 tracking-tight">
              Get in touch
            </h2>
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              Have a question about plans, a content suggestion or a bug to report? Drop us a line.
            </p>
          </div>

          <ContactForm />

          {/* Inline FAQs nudge */}
          <div className="mt-8 lg:mt-10 text-center">
            <Link
              href="/faqs"
              className="group inline-flex items-center gap-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Looking for quick answers? Browse our FAQs
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-36 px-5 sm:px-8 text-center bg-gradient-to-b from-white to-brand-50 dark:from-gray-900 dark:to-brand-950">
        <div className="max-w-2xl mx-auto">
          <Trophy className="h-10 w-10 lg:h-12 lg:w-12 text-amber-500 dark:text-amber-400 mx-auto mb-5" />
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100">
            Your VCE Maths journey starts today.
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

      {/* Independence disclaimer */}
      <section className="py-14 lg:py-20 px-5 sm:px-8 lg:px-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700 mb-5 lg:mb-6">
            <Award className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            All content on this website has been developed independently of, and is not endorsed
            by, the Victorian Curriculum and Assessment Authority (VCAA). VCAA<sup>®</sup> is a
            registered trademark of the Victorian Curriculum and Assessment Authority. Past exam
            content is sourced from publicly available VCAA materials and is used for educational
            revision purposes only.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
