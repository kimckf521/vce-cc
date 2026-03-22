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
  { name: "Functions & Graphs", slug: "functions-and-graphs", count: null },
  { name: "Algebra", slug: "algebra", count: null },
  { name: "Calculus", slug: "calculus", count: null },
  { name: "Probability & Statistics", slug: "probability-and-statistics", count: null },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <BookOpen className="h-6 w-6" />
            VCE Methods
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/topics" className="hover:text-brand-600 transition-colors">Topics</Link>
            <Link href="/exams" className="hover:text-brand-600 transition-colors">Past Papers</Link>
            <Link href="/practice" className="hover:text-brand-600 transition-colors">Practice</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-4 sm:px-6 text-center bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700 mb-6">
            VCE Mathematical Methods
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Ace your Methods exam
          </h1>
          <p className="mt-6 text-xl text-gray-500 leading-relaxed">
            Practice with real VCAA past exam questions, organised by topic. See worked solutions,
            track your progress, and build exam confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Start practising — it&apos;s free
            </Link>
            <Link
              href="/topics"
              className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm hover:border-brand-300 transition-colors"
            >
              Browse topics
            </Link>
          </div>
        </div>
      </section>

      {/* Topics preview */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Organised by syllabus topic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {topic.name}
              </h3>
              <p className="mt-1 text-sm text-gray-400">View questions →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            Everything you need to prepare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex-shrink-0 rounded-xl bg-brand-100 p-3 h-fit">
                  <f.icon className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900">Ready to start?</h2>
          <p className="mt-4 text-gray-500">
            Create a free account and begin practising past exam questions today.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>VCE Methods Revision Hub — not affiliated with VCAA</p>
      </footer>
    </div>
  );
}
