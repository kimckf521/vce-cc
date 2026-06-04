import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Timer, Target, CheckCircle, TrendingUp } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { SITE_URL, ORGANIZATION_ID } from "@/lib/site";

export const metadata: Metadata = {
  title: "VCE Mathematical Methods — Past exams, worked solutions & practice",
  description:
    "Master VCE Mathematical Methods with every VCAA past exam from 2016 onwards, step-by-step worked solutions for every question and timed practice exams. Built for Year 12 students in Victoria.",
  alternates: { canonical: "/methods" },
  openGraph: {
    title: "VCE Mathematical Methods | ATAR Hero",
    description:
      "Every VCAA Methods past exam from 2016 onwards with worked solutions and timed practice. From zero to hero in VCE.",
    url: "/methods",
    type: "website",
  },
  keywords: [
    "VCE Mathematical Methods",
    "VCE Methods practice",
    "VCAA Methods past exams",
    "Methods Exam 1",
    "Methods Exam 2",
    "VCE Methods worked solutions",
    "Year 12 Maths Methods",
    "VCE Methods 2024",
    "Methods study design",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "VCE Mathematical Methods",
      alternateName: "VCE Methods",
      description:
        "VCE Mathematical Methods revision: functions, calculus, algebra, probability and statistics. Real VCAA past exam questions, step-by-step worked solutions and timed practice exams for Year 12 students.",
      provider: { "@id": ORGANIZATION_ID },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      url: `${SITE_URL}/methods`,
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
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "VCE Mathematical Methods", item: `${SITE_URL}/methods` },
      ],
    },
  ],
};

const topics = [
  { name: "Algebra, Number and Structure", slug: "algebra-number-and-structure", blurb: "Polynomials, logarithms, exponentials and circular functions." },
  { name: "Functions, Relations and Graphs", slug: "functions-relations-and-graphs", blurb: "Linear, quadratic, cubic, quartic, hyperbolic, exponential and trigonometric functions." },
  { name: "Calculus", slug: "calculus", blurb: "Differentiation, integration, anti-differentiation and applications." },
  { name: "Probability and Statistics", slug: "data-analysis-probability-and-statistics", blurb: "Discrete and continuous random variables, sampling, confidence intervals." },
];

const features = [
  { icon: FileText, title: "Every VCAA Methods past exam", text: "2016 onwards. Both Exam 1 (no calculator) and Exam 2 (technology-active). Real questions, not lookalikes." },
  { icon: CheckCircle, title: "Worked solutions for every question", text: "Step-by-step, mirroring how a VCAA examiner awards marks. No more guessing where you lost marks." },
  { icon: Timer, title: "Timed practice exam modes", text: "Exam 1 (1 hr), Exam 2A (20 MCQ), Exam 2B (extended response) or full Exam 2 — under VCAA timing." },
  { icon: Target, title: "Topic-by-topic drill", text: "Find your weak spot in Calculus or Functions and grind it until it's automatic." },
];

const faqs = [
  {
    q: "What is VCE Mathematical Methods?",
    a: "VCE Mathematical Methods is the standard advanced maths subject for Year 12 students aiming for tertiary study in STEM, business or commerce. It covers functions, calculus, algebra, probability and statistics. Most Year 12 students chasing an ATAR for university take Methods.",
  },
  {
    q: "What does VCE Methods Exam 1 and Exam 2 look like?",
    a: "Exam 1 is a 1-hour technology-free paper testing core skills (short-answer, no calculator). Exam 2 is a 2-hour technology-active paper with 20 multiple-choice questions (Section A) and 4–5 extended response questions (Section B), with a CAS calculator allowed. ATAR Hero gives you timed practice in all of these formats.",
  },
  {
    q: "How many past papers does ATAR Hero have for Methods?",
    a: "Every VCAA Mathematical Methods Exam 1 and Exam 2 from 2016 onwards — over a decade of past papers, with worked solutions for every single question.",
  },
  {
    q: "Methods vs Specialist — should I do both?",
    a: "Methods is the foundation that Specialist Mathematics is built on. If you're aiming for engineering, physics or pure maths at uni, Specialist alongside Methods is the standard pathway. If you're aiming for business, biology, medicine or general STEM, Methods alone is usually enough.",
  },
];

export default function MethodsLandingPage() {
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
            <BookOpen className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            VCE Mathematical Methods
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Master VCE <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-brand-400 dark:via-brand-300 dark:to-brand-500 bg-clip-text text-transparent">Methods</span> with real VCAA exams.
          </h1>
          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Every VCAA Mathematical Methods past exam from 2016 onwards, step-by-step worked solutions for every question and timed practice exams that mirror the real format. The exam every ATAR-chasing Year 12 sits — done right.
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
              href="/vce/methods/exams"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              Browse Methods past papers
            </Link>
          </div>
        </div>
      </section>

      {/* What is Methods */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5">
            What is VCE Mathematical Methods?
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              VCE Mathematical Methods is the most-taken VCE maths subject in Victoria. It&apos;s the
              standard advanced course for Year 12 students aiming for university entry in STEM,
              business, commerce, economics, finance or any quantitative field. Universities expect
              Methods as a prerequisite or assumed-knowledge subject for hundreds of degrees.
            </p>
            <p>
              The course covers four big areas: <strong>Algebra, Number and Structure</strong>,
              <strong> Functions, Relations and Graphs</strong>, <strong>Calculus</strong> and
              <strong> Probability and Statistics</strong>. You sit two external exams in November:
              Exam 1 (1 hour, no calculator) and Exam 2 (2 hours, CAS-calculator allowed). Together
              with two school-assessed coursework (SAC) tasks, these determine your study score.
            </p>
            <p>
              The single biggest mistake Year 12 Methods students make? Reading the textbook
              instead of practising real exam questions. ATAR Hero solves that — every VCAA exam
              from 2016 onwards is here, with worked solutions for every question.
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
            Every topic in the VCE Methods Study Design, organised by VCAA topic and subtopic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/vce/methods/topics/${t.slug}`}
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
            What&apos;s included for Methods
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

      {/* Past papers — links to the public, indexable exams surface */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-950/60">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            VCE Methods past papers — free to browse
          </h2>
          <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Every VCAA Mathematical Methods Exam 1 and Exam 2 from 2016 onwards, with full worked
            solutions for every question. No account needed to read them — search by year and open
            any paper.
          </p>
          <Link
            href="/vce/methods/exams"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
          >
            <FileText className="h-4 w-4" />
            View all VCE Methods past papers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Methods vs Specialist callout */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-brand-50 dark:from-gray-900 dark:to-brand-950">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-900 p-6 lg:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-2xl bg-brand-100 dark:bg-brand-900/60 p-3">
                <TrendingUp className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Doing Specialist alongside Methods?
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                  Smart move for engineering, physics or pure-maths pathways. One ATAR Hero
                  subscription unlocks both — and the Specialist content builds directly on
                  Methods, so you&apos;re reinforcing twice.
                </p>
                <Link href="/specialist" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                  See VCE Specialist Mathematics
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore all VCE maths subjects — internal-linking hub */}
      <section className="py-12 lg:py-16 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-5">
            Explore all VCE maths subjects
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/foundation" className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              VCE Foundation Mathematics
            </Link>
            <Link href="/general" className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              VCE General Mathematics
            </Link>
            <Link href="/specialist" className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              VCE Specialist Mathematics
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center">
            Methods questions, answered
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
            Ready to ace VCE Methods?
          </h2>
          <p className="mt-4 lg:mt-6 text-base lg:text-xl text-gray-500 dark:text-gray-400">
            From zero to hero. Start free — no credit card required.
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
