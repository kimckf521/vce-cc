import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Timer, Target, CheckCircle, Zap } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "VCE Specialist Mathematics — Past exams, worked solutions & practice",
  description:
    "Master VCE Specialist Mathematics with every VCAA past exam from 2016 onwards, worked solutions for every question and timed practice. Built for ATAR-chasing Year 12 students taking Specialist alongside Methods.",
  alternates: { canonical: "/specialist" },
  openGraph: {
    title: "VCE Specialist Mathematics | ATAR Hero",
    description:
      "Every VCAA Specialist past exam from 2016 onwards with worked solutions and timed practice. The toughest VCE maths, done right.",
    url: "/specialist",
    type: "website",
  },
  keywords: [
    "VCE Specialist Mathematics",
    "VCE Specialist practice",
    "VCAA Specialist past exams",
    "Specialist Exam 1",
    "Specialist Exam 2",
    "VCE Specialist worked solutions",
    "Year 12 Specialist Maths",
    "VCE Specialist 2024",
    "Specialist Mathematics study design",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "VCE Specialist Mathematics",
      description:
        "VCE Specialist Mathematics revision: complex numbers, vectors, differential equations, mechanics and discrete maths. Real VCAA past exam questions, worked solutions and timed practice for Year 12.",
      provider: { "@id": "https://www.atarhero.com.au/#organization" },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      url: "https://www.atarhero.com.au/specialist",
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
        { "@type": "ListItem", position: 2, name: "VCE Specialist Mathematics", item: "https://www.atarhero.com.au/specialist" },
      ],
    },
  ],
};

const topics = [
  { name: "Algebra, Number and Structure", slug: "algebra-number-and-structure", blurb: "Complex numbers, proof techniques, sequences and series." },
  { name: "Functions, Relations and Graphs", slug: "functions-relations-and-graphs", blurb: "Reciprocal functions, rational functions, inverse trig, hyperbolic functions." },
  { name: "Calculus", slug: "calculus", blurb: "Advanced differentiation and integration, differential equations, kinematics." },
  { name: "Space and Measurement", slug: "space-and-measurement", blurb: "Vectors in 2D and 3D, vector calculus, parametric equations." },
  { name: "Discrete Mathematics", slug: "discrete-mathematics", blurb: "Mathematical induction, logic, sequences." },
  { name: "Data Analysis & Statistics", slug: "data-analysis-probability-and-statistics", blurb: "Statistical inference for normal distributions, hypothesis testing." },
];

const features = [
  { icon: FileText, title: "Every VCAA Specialist past exam", text: "2016 onwards. Both Exam 1 (no calculator, 1 hr) and Exam 2 (CAS-active, 2 hr). The real questions, not lookalikes." },
  { icon: CheckCircle, title: "Worked solutions for every question", text: "Specialist questions are dense — our worked solutions show every step, including the algebra most textbooks skip." },
  { icon: Timer, title: "Timed practice under VCAA conditions", text: "Practise Exam 1, Exam 2A (MCQ) and Exam 2B (extended) at real exam pace. Build stamina, not just skill." },
  { icon: Target, title: "Topic-by-topic deep practice", text: "Find your weak topic (vectors? complex numbers? differential equations?) and drill it until it clicks." },
];

const faqs = [
  {
    q: "What is VCE Specialist Mathematics?",
    a: "VCE Specialist Mathematics is the most advanced VCE maths subject — the standard pathway for students aiming for engineering, mathematics, physics or quantitative science at university. It builds directly on Methods, adding complex numbers, vectors, differential equations, mechanics and rigorous proof. Specialist is almost always taken alongside Methods, not instead of it.",
  },
  {
    q: "Is Specialist Maths worth the effort?",
    a: "For the right student, yes — Specialist scales higher than Methods on most ATAR conversions, and it's a prerequisite or strong recommendation for engineering and pure-maths degrees at top universities. But it's significantly harder than Methods and only worth taking if you can comfortably handle the Methods workload first.",
  },
  {
    q: "What does Specialist Exam 1 and Exam 2 look like?",
    a: "Exam 1 is a 1-hour technology-free paper with short-answer questions testing core skills. Exam 2 is a 2-hour technology-active paper: 20 multiple-choice questions in Section A and 4–5 extended-response questions in Section B, with a CAS calculator. ATAR Hero lets you practise both formats under timed conditions.",
  },
  {
    q: "How many past papers does ATAR Hero have for Specialist?",
    a: "Every VCAA Specialist Mathematics Exam 1 and Exam 2 from 2016 onwards, with step-by-step worked solutions for every question. That's over a decade of past papers — the largest single body of Specialist practice material you can access.",
  },
];

export default function SpecialistLandingPage() {
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
            <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            VCE Specialist Mathematics
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Push past <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-brand-400 dark:via-brand-300 dark:to-brand-500 bg-clip-text text-transparent">Methods</span>. Master Specialist.
          </h1>
          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            The toughest VCE maths — and the one that scales hardest for engineering and physics
            ATARs. Every VCAA Specialist past exam from 2016 onwards, worked solutions for every
            question and timed practice under real exam conditions.
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
              href="/vce/specialist/topics"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              Browse Specialist topics
            </Link>
          </div>
        </div>
      </section>

      {/* What is Specialist */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5">
            Should you take Specialist Mathematics?
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              VCE Specialist Mathematics is harder than Methods. There&apos;s no way around that.
              The course assumes you&apos;re comfortable with everything in Methods and then adds
              complex numbers, vectors in 2D and 3D, mechanics (Newton&apos;s laws applied with
              calculus), differential equations and rigorous mathematical proof.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-gray-100">But here&apos;s the thing.</strong> Specialist
              scales higher than Methods on most ATAR conversions. A 30 in Specialist often
              produces a higher ATAR contribution than a 35 in Methods. For engineering, pure
              maths and physics at top universities, Specialist is either a hard prerequisite or
              a strongly recommended subject — and admissions officers know exactly what a
              Specialist study score signals.
            </p>
            <p>
              Specialist is taken <em>alongside</em> Methods, almost never instead of it. The two
              courses reinforce each other — calculus you learn in Methods deepens in Specialist,
              and Specialist&apos;s vector mechanics is essentially Year 11 physics on harder mode.
            </p>
            <p>
              The single biggest reason students underperform in Specialist? Not enough practice
              with real Specialist exam questions. The questions are different from Methods —
              denser, longer, more proof-heavy — and you can&apos;t simulate that without doing
              actual past papers. That&apos;s what ATAR Hero is for.
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
            Every topic in the VCE Specialist Mathematics Study Design, broken down by VCAA topic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/vce/specialist/topics/${t.slug}`}
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
            What&apos;s included for Specialist
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
            Specialist questions, answered
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
            Master Specialist. Lift your ATAR.
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
