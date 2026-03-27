import Link from "next/link";
import { BookOpen, BarChart2, FileText, CheckCircle } from "lucide-react";

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

const topics = [
  { name: "Functions & Graphs", slug: "functions-and-graphs" },
  { name: "Algebra", slug: "algebra" },
  { name: "Calculus", slug: "calculus" },
  { name: "Probability & Statistics", slug: "probability-and-statistics" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex h-16 lg:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl lg:text-2xl text-brand-700">
            <BookOpen className="h-6 w-6 lg:h-7 lg:w-7" />
            VCE Methods
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base text-gray-600">
            <Link href="/topics" className="hover:text-brand-600 transition-colors">Topics</Link>
            <Link href="/exams" className="hover:text-brand-600 transition-colors">Past Papers</Link>
            <Link href="/practice" className="hover:text-brand-600 transition-colors">Practice</Link>
          </nav>
          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              href="/login"
              className="text-sm lg:text-base text-gray-600 hover:text-brand-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-brand-600 px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 lg:py-36 xl:py-44 px-5 sm:px-8 lg:px-12 text-center bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm lg:text-base font-medium text-brand-700 mb-6 lg:mb-8">
            VCE Mathematical Methods
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Ace your Methods exam
          </h1>
          <p className="mt-6 lg:mt-8 text-xl lg:text-2xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Practice with real VCAA past exam questions, organised by topic. See worked solutions,
            track your progress, and build exam confidence.
          </p>
          <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-2xl bg-brand-600 px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Start practising — it&apos;s free
            </Link>
            <Link
              href="/topics"
              className="rounded-2xl border border-gray-200 bg-white px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold text-gray-700 shadow-sm hover:border-brand-300 transition-colors"
            >
              Browse topics
            </Link>
          </div>
        </div>
      </section>

      {/* Topics preview */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 lg:mb-12 text-center">
            Organised by syllabus topic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="group rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 shadow-sm hover:border-brand-300 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold lg:text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
                  {topic.name}
                </h3>
                <p className="mt-1.5 text-sm lg:text-base text-gray-400">View questions →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 lg:mb-16 text-center">
            Everything you need to prepare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            {features.map((f) => (
              <div key={f.title} className="flex gap-5 lg:gap-6">
                <div className="flex-shrink-0 rounded-2xl bg-brand-100 p-3.5 lg:p-4 h-fit">
                  <f.icon className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold lg:text-lg text-gray-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm lg:text-base text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-36 px-5 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">Ready to start?</h2>
          <p className="mt-4 lg:mt-6 text-base lg:text-xl text-gray-500">
            Create a free account and begin practising past exam questions today.
          </p>
          <Link
            href="/signup"
            className="mt-8 lg:mt-10 inline-block rounded-2xl bg-brand-600 px-8 lg:px-12 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 lg:py-10 text-center text-sm lg:text-base text-gray-400">
        <p>VCE Methods Revision Hub — not affiliated with VCAA</p>
      </footer>
    </div>
  );
}
