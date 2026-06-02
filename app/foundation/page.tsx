import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Timer, Target, CheckCircle, Compass } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "VCE Foundation Mathematics — Past exams, worked solutions & practice",
  description:
    "Master VCE Foundation Mathematics with every available VCAA past exam, step-by-step worked solutions and timed practice. Real-world maths for everyday life. New for 2023 — and growing fast.",
  alternates: { canonical: "/foundation" },
  openGraph: {
    title: "VCE Foundation Mathematics | ATAR Hero",
    description:
      "Every available VCAA Foundation Maths past exam with worked solutions and timed practice. Real-world, applied maths — done right.",
    url: "/foundation",
    type: "website",
  },
  keywords: [
    "VCE Foundation Mathematics",
    "VCE Foundation Maths practice",
    "VCAA Foundation Maths past exams",
    "Foundation Maths Exam 1",
    "Foundation Maths Exam 2",
    "VCE Foundation Maths worked solutions",
    "Year 12 Foundation Maths",
    "VCE Foundation Maths 2024",
    "Foundation Maths study design 2023",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "VCE Foundation Mathematics",
      description:
        "VCE Foundation Mathematics revision: real-world maths for everyday life — financial maths, measurement, statistics and algebra. Worked solutions and timed practice for Year 12 students.",
      provider: { "@id": "https://www.atarhero.com.au/#organization" },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      url: "https://www.atarhero.com.au/foundation",
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-AU",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.atarhero.com.au/" },
        { "@type": "ListItem", position: 2, name: "VCE Foundation Mathematics", item: "https://www.atarhero.com.au/foundation" },
      ],
    },
  ],
};

const topics = [
  { name: "Algebra, Number and Structure", slug: "algebra-number-and-structure", blurb: "Working with numbers, rates, ratios, percentages and basic algebra used in real-world contexts." },
  { name: "Data Analysis & Statistics", slug: "data-analysis-probability-and-statistics", blurb: "Interpreting data, charts, tables, summary statistics and everyday probability." },
  { name: "Discrete Mathematics", slug: "discrete-mathematics", blurb: "Networks, paths and sequences applied to scheduling, budgeting and everyday decisions." },
  { name: "Space and Measurement", slug: "space-and-measurement", blurb: "Length, area, volume, capacity, time and practical geometry — the maths of trades, cooking and travel." },
];

const features = [
  { icon: FileText, title: "Every available VCAA Foundation paper", text: "Foundation Maths is new for the 2023 study design. We have every past paper since the subject launched, with worked solutions." },
  { icon: CheckCircle, title: "Worked solutions for every question", text: "Real-world contexts can hide the maths inside the problem. Our solutions show how to extract and solve, step-by-step." },
  { icon: Timer, title: "Timed Exam 1 + Exam 2 practice", text: "Practise both papers under real VCAA timing. Build confidence with the format before sitting the real thing." },
  { icon: Target, title: "Topic-by-topic drill", text: "Find the topic you struggle with most and work through real exam questions until it&apos;s automatic." },
];

const faqs = [
  {
    q: "What is VCE Foundation Mathematics?",
    a: "VCE Foundation Mathematics is a Year 11/12 maths subject introduced in the 2023 study design. It's designed for students who want a practical, applied maths course without the calculus of Methods or the abstraction of Specialist. The course focuses on real-world maths — financial calculations, measurement, data analysis and the algebra you actually use in life and work.",
  },
  {
    q: "Does Foundation Maths count toward my ATAR?",
    a: "Yes. Foundation Mathematics is a fully assessed VCE Unit 3–4 subject and contributes to your ATAR like any other VCE subject. It scales down more than Methods or Specialist, but it's a strong choice for students who would otherwise struggle in higher maths and end up with a low study score.",
  },
  {
    q: "Foundation Maths vs General Maths — which should I take?",
    a: "General Mathematics is the next step up from Foundation. If you're comfortable with Year 11 General Maths and want a strong applied subject, do General. If you found Year 11 General Maths difficult, or you want a more practical course focused on everyday applications, Foundation is a better fit. Both count toward ATAR; both are taught in many Victorian schools.",
  },
  {
    q: "How many past papers does ATAR Hero have for Foundation?",
    a: "Every available VCAA Foundation Mathematics past paper since the subject was introduced in the 2023 study design. We add each new year's exam as soon as VCAA publishes it, with full worked solutions.",
  },
];

export default function FoundationLandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingNav active="subjects" />

      {/* Hero */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 dark:bg-brand-900 px-4 py-1.5 text-sm lg:text-base font-medium text-brand-700 dark:text-brand-300 mb-6">
            <Compass className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            VCE Foundation Mathematics
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-brand-400 dark:via-brand-300 dark:to-brand-500 bg-clip-text text-transparent">Foundation</span> Maths, done right.
          </h1>
          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Real-world maths for everyday life — financial maths, measurement, data and applied
            algebra. Every available VCAA Foundation past paper since the 2023 study design,
            with step-by-step worked solutions for every question.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="group rounded-2xl bg-brand-600 px-8 py-4 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-0.5 transition-all"
            >
              Start free — no credit card
              <ArrowRight className="inline-block h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/vce/foundation/topics"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              Browse Foundation topics
            </Link>
          </div>
        </div>
      </section>

      {/* What is Foundation */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5">
            What is VCE Foundation Mathematics?
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              VCE Foundation Mathematics is the newest VCE maths study, introduced in the 2023
              study design. It&apos;s built for students who want a practical, applied maths
              course — not the calculus-heavy abstraction of Methods or the abstract proof of
              Specialist, but the maths you actually use in everyday life and work.
            </p>
            <p>
              The course covers four areas: <strong>Algebra, Number and Structure</strong>
              (working with numbers, ratios, percentages and basic algebra), <strong>Discrete
              Mathematics</strong> (networks, sequences and everyday decision-making), <strong>
              Space and Measurement</strong> (length, area, volume, time — the maths of trades
              and travel) and <strong>Data Analysis and Statistics</strong> (interpreting data,
              charts and everyday probability).
            </p>
            <p>
              Foundation Mathematics is a fully assessed VCE Unit 3–4 subject and contributes to
              your ATAR. Yes, it scales down further than Methods or General — but for students
              who would otherwise struggle in those subjects and end up with a poor study score,
              Foundation is often the smarter ATAR play. A 35 in Foundation produces a better
              ATAR contribution than a 25 in Methods.
            </p>
            <p>
              Because Foundation is a newer subject, there are fewer past papers than for
              Methods or General. That makes every past paper more valuable — and ATAR Hero
              has every available VCAA Foundation paper, with worked solutions for every
              question, plus topic-by-topic practice between exam-format sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Topics covered */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-950/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">
            What you&apos;ll practise
          </h2>
          <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Every topic in the VCE Foundation Mathematics Study Design (2023+).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/vce/foundation/topics/${t.slug}`}
                className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition-all"
              >
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {t.name}
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t.blurb}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
                  Practise this topic
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center">
            What&apos;s included for Foundation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="inline-flex rounded-2xl bg-brand-100 dark:bg-brand-900/60 p-3 mb-4">
                  <f.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center">
            Foundation Maths questions, answered
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 lg:p-6 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {f.q}
                  <span className="text-brand-600 dark:text-brand-400 text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            More questions? See our <Link href="/faqs" className="text-brand-600 dark:text-brand-400 hover:underline">full FAQs</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 px-5 sm:px-8 text-center bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-gray-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100">
            Foundation Maths, made achievable.
          </h2>
          <p className="mt-4 lg:mt-6 text-base lg:text-xl text-gray-500 dark:text-gray-400">
            Start free — no credit card required.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-8 lg:px-12 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white shadow-lg hover:bg-brand-700 transition-all"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
