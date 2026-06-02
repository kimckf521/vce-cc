import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Timer, Target, CheckCircle, BarChart3 } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "VCE General Mathematics — Past exams, worked solutions & practice",
  description:
    "Master VCE General Mathematics with every VCAA past exam from 2016 onwards, step-by-step worked solutions and timed practice. The underrated maths that scales well for ATAR.",
  alternates: { canonical: "/general" },
  openGraph: {
    title: "VCE General Mathematics | ATAR Hero",
    description:
      "Every VCAA General Maths past exam from 2016 onwards with worked solutions and timed practice. Applied maths, real ATAR scaling.",
    url: "/general",
    type: "website",
  },
  keywords: [
    "VCE General Mathematics",
    "VCE General Maths practice",
    "VCAA General Maths past exams",
    "General Maths Exam 1",
    "General Maths Exam 2",
    "VCE General Maths worked solutions",
    "Year 12 General Maths",
    "VCE General Maths 2024",
    "Further Maths",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "VCE General Mathematics",
      description:
        "VCE General Mathematics revision: applied maths across financial, statistical, geometric and algebraic contexts. Real VCAA past exam questions, worked solutions and timed practice for Year 12.",
      provider: { "@id": "https://www.atarhero.com.au/#organization" },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      url: "https://www.atarhero.com.au/general",
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
        { "@type": "ListItem", position: 2, name: "VCE General Mathematics", item: "https://www.atarhero.com.au/general" },
      ],
    },
  ],
};

const topics = [
  { name: "Data Analysis & Statistics", slug: "data-analysis-probability-and-statistics", blurb: "Univariate and bivariate data, time series, scatterplots and linear regression." },
  { name: "Algebra, Number and Structure", slug: "algebra-number-and-structure", blurb: "Recursion, financial modelling, sequences, and linear and non-linear models." },
  { name: "Discrete Mathematics", slug: "discrete-mathematics", blurb: "Matrices and graph theory — networks, paths, trees and decision mathematics." },
  { name: "Functions, Relations and Graphs", slug: "functions-relations-and-graphs", blurb: "Linear, non-linear, exponential models and the algebra underpinning them." },
  { name: "Space and Measurement", slug: "space-and-measurement", blurb: "Trigonometry, similar figures, surface area, volume and Pythagorean problems." },
];

const features = [
  { icon: FileText, title: "Every VCAA General Maths past exam", text: "2016 onwards — including the older Further Mathematics papers that share content. Real questions, not invented." },
  { icon: CheckCircle, title: "Worked solutions for every question", text: "Each multiple-choice answer is justified; each short-answer question shows every step. No more guessing." },
  { icon: Timer, title: "Timed Exam 1 + Exam 2 practice", text: "Exam 1 is 80 MCQ in 90 minutes; Exam 2 is short and extended-response. Practise both under real timing." },
  { icon: Target, title: "Topic-by-topic drill", text: "Data Analysis, Recursion, Networks, Matrices — find your weakest area and grind it." },
];

const faqs = [
  {
    q: "What is VCE General Mathematics?",
    a: "VCE General Mathematics is an applied maths subject that covers financial modelling, data analysis, matrices, networks and geometry. It replaced VCE Further Mathematics in the 2023 study design but the content overlaps significantly. General Maths is for students who want a strong maths subject without the calculus of Methods.",
  },
  {
    q: "Is General Maths good for ATAR scaling?",
    a: "Better than most students think. General typically scales modestly down, but a strong study score in General (e.g. 40+) often produces a higher ATAR contribution than a middling Methods score (e.g. 28–30). For students who would struggle in Methods, General is often the smarter ATAR play.",
  },
  {
    q: "What's the difference between General Maths and Further Maths?",
    a: "Further Mathematics was renamed and restructured into General Mathematics in the 2023 VCE study design. The core content is similar (data analysis, recursion, geometry, matrices, networks), but the new General Maths has clearer Year 11 prerequisites and a slightly modernised structure. ATAR Hero covers both: every General Maths exam plus the older Further Maths papers that remain relevant.",
  },
  {
    q: "How many past papers does ATAR Hero have for General Maths?",
    a: "Every VCAA General Mathematics paper since the new study design, plus every Further Mathematics paper from 2016–2022 (since the content overlaps heavily). Worked solutions for every question.",
  },
];

export default function GeneralLandingPage() {
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
            <BarChart3 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            VCE General Mathematics
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Master <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-brand-400 dark:via-brand-300 dark:to-brand-500 bg-clip-text text-transparent">General Maths</span>. Lift your ATAR.
          </h1>
          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Applied maths across financial modelling, data analysis, networks and geometry. Every
            VCAA General Mathematics past exam from 2016 onwards, plus older Further Maths papers,
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
              href="/vce/general/topics"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              Browse General topics
            </Link>
          </div>
        </div>
      </section>

      {/* What is General Maths */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5">
            Why General Maths is underrated
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              VCE General Mathematics is one of the most undervalued ATAR plays in Victoria. It
              covers applied maths across <strong>data analysis and statistics</strong>,
              <strong> recursion and financial modelling</strong>, <strong>matrices</strong>,
              <strong> networks and decision mathematics</strong>, and <strong>geometry and
              measurement</strong>. No calculus, no proof — just maths that maps onto how the
              world actually works.
            </p>
            <p>
              Students often hear &quot;Methods scales better&quot; and assume General is the lesser
              path. That&apos;s only half-true. Yes, General scales down — but a strong study
              score in General (40+) typically produces a higher ATAR contribution than a
              middling Methods score (28–30). For students who would otherwise wrestle through
              Methods and land in the low 30s, General is often the smarter strategic choice.
            </p>
            <p>
              General Mathematics replaced Further Mathematics in the 2023 study design. The
              core content overlaps almost completely, so the Further Maths past papers from
              2016–2022 are still some of the best practice you can get — and ATAR Hero has them
              all, with worked solutions for every question.
            </p>
            <p>
              The single biggest factor in a strong General study score? <strong>Volume of
              practice on data analysis questions</strong>. Data Analysis is the biggest unit
              by weighting, and the questions reward students who&apos;ve seen every variant of
              scatterplot, time series and regression problem the examiners can write.
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
            Every topic in the VCE General Mathematics Study Design, organised by VCAA topic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/vce/general/topics/${t.slug}`}
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
            What&apos;s included for General Maths
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
            General Maths questions, answered
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
            Smart-play your General Maths ATAR.
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
