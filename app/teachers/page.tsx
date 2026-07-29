import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Printer,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "For Teachers & Tutors — Free VCE Maths Assessment Builder",
  description:
    "Build tests and SACs from an original VCE Maths question bank, then print a student paper and marking guide in one click. Free for VIT-registered teachers and tutors.",
  alternates: { canonical: "/teachers" },
  openGraph: {
    title: "ATAR Hero for Teachers — Free VCE Maths Assessment Builder",
    description:
      "Build tests and SACs from an original question bank across Methods, Specialist and General. Free for VIT-registered teachers and tutors.",
    url: "/teachers",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Build a paper in minutes",
    body: "Pick a subject, topics, difficulty mix and calculator rules — we assemble a balanced paper from our original question bank. Exam 1 / Exam 2 presets included, or go fully custom for short topic quizzes.",
  },
  {
    icon: Printer,
    title: "Print paper + marking guide",
    body: "One click gives you a clean student paper and a separate marking guide with full worked solutions — paginated and ready for the photocopier.",
  },
  {
    icon: ShieldCheck,
    title: "Original questions, no copyright headaches",
    body: "Every question in the builder is written by us for the current study design. Nothing is reproduced from VCAA papers, so you can distribute freely at school or in tutoring sessions.",
  },
  {
    icon: Sparkles,
    title: "Free for registered educators",
    body: "The builder is free for VIT-registered teachers and private tutors. We verify against the VIT register — that's it, no credit card.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Create a free account",
    body: "Sign up with any email — it takes 30 seconds.",
  },
  {
    step: "2",
    title: "Apply with your VIT number",
    body: "Tell us your name, school (or that you tutor privately) and VIT registration number, then confirm your email.",
  },
  {
    step: "3",
    title: "Get approved & start building",
    body: "We check the VIT register — usually within one school day — and email you when the builder is unlocked.",
  },
];

export default function TeachersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 dark:bg-brand-900/50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300 mb-5">
            <GraduationCap className="h-4 w-4" />
            For teachers & tutors
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Build VCE maths assessments
            <br className="hidden sm:block" /> in minutes, not weekends.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-gray-500 dark:text-gray-400">
            An assessment builder over an original question bank for Methods,
            Specialist and General — with a printable student paper and marking
            guide. Free for VIT-registered teachers and private tutors.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/teachers/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Apply for a teacher account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              Free · verified against the VIT register
            </span>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-14">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
              >
                <f.icon className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {f.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who qualifies */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
          <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              Who qualifies?
            </h2>
            <ul className="space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <li>
                <strong className="text-gray-900 dark:text-gray-200">School teachers</strong>{" "}
                — current VIT registration plus your school email.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Private tutors</strong>{" "}
                — current VIT registration (Permission to Teach counts). No
                school email needed.
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Not VIT-registered? You can still use every student feature —{" "}
              <Link href="/pricing" className="underline hover:text-brand-600 dark:hover:text-brand-400">
                see plans
              </Link>{" "}
              — and join our{" "}
              <Link href="/referrals" className="underline hover:text-brand-600 dark:hover:text-brand-400">
                referral program
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
