import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles, BookOpen, FileText, BarChart2, CheckCircle, Clock, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CountdownRedirect from "./CountdownRedirect";

// Don't index this celebration page — it's only meaningful right after a
// successful upgrade, and Stripe's session_id query param shouldn't leak.
export const metadata: Metadata = {
  title: "Welcome to ATAR Hero",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Every topic, unlocked",
    description:
      "Full access to all four VCE Mathematical Methods topics — Functions, Algebra, Calculus and Probability & Statistics.",
  },
  {
    icon: FileText,
    title: "Real VCAA past papers",
    description:
      "Every Exam 1 and Exam 2 paper from 2016 onwards, with worked solutions for every question.",
  },
  {
    icon: Zap,
    title: "Unlimited practice questions",
    description:
      "Drill any subtopic until it clicks, with step-by-step worked solutions when you need a nudge.",
  },
  {
    icon: Clock,
    title: "Timed practice exams",
    description:
      "Simulate exam day with auto-marked timed sittings. Build your speed and confidence under pressure.",
  },
  {
    icon: BarChart2,
    title: "Track your progress",
    description:
      "See your strengths and weaknesses by topic, review every attempt and watch your scores climb.",
  },
];

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If they're not signed in, they shouldn't be here — bounce them home.
  // (We don't strictly verify they just paid; the celebration is harmless
  //  for anyone authenticated, and Stripe's redirect carries the auth cookie.)
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 lg:py-24">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-brand-100 dark:bg-brand-900 mb-6 lg:mb-8">
            <Sparkles className="h-10 w-10 lg:h-12 lg:w-12 text-brand-600 dark:text-brand-400" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Welcome to ATAR Hero!
          </h1>

          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            We&apos;re stoked to have you on board. Your subscription is now
            active — let&apos;s get you ready to ace your Methods exam.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 lg:mt-16">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-6 lg:mb-8">
            Here&apos;s what you&apos;ve unlocked
          </h2>

          <ul className="space-y-4">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit.title}
                className="flex gap-4 lg:gap-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 lg:p-6 shadow-sm"
              >
                <div className="flex-shrink-0 rounded-xl bg-brand-50 dark:bg-brand-950 p-3 h-fit">
                  <benefit.icon className="h-5 w-5 lg:h-6 lg:w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">
                      {benefit.title}
                    </h3>
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                  </div>
                  <p className="mt-1 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA + countdown */}
        <div className="mt-12 lg:mt-16 flex flex-col items-center">
          <CountdownRedirect destination="/dashboard" seconds={10} />
        </div>

        {/* Footer note */}
        <p className="mt-12 lg:mt-16 text-center text-xs lg:text-sm text-gray-400 dark:text-gray-500">
          You can manage your subscription at any time from your{" "}
          <span className="font-medium text-gray-500 dark:text-gray-400">
            Profile → Billing
          </span>{" "}
          tab.
        </p>
      </div>
    </div>
  );
}
