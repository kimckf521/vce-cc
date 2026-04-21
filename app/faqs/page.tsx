import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "FAQs — ATAR Hero",
  description:
    "Answers to common questions about ATAR Hero: free vs Standard plans, subscriptions, VCAA past papers, progress tracking, and more.",
  alternates: { canonical: "/faqs" },
};

const faqs: { q: string; a: string }[] = [
  {
    q: "What is ATAR Hero?",
    a: "ATAR Hero is an independent revision hub for Victorian Year 12 students studying VCE Mathematical Methods. It gives you past VCAA exam questions organised by topic, step-by-step worked solutions, timed practice exams, and progress tracking.",
  },
  {
    q: "Is ATAR Hero affiliated with VCAA?",
    a: "No. ATAR Hero is an independent study platform built by students, for students. We are not affiliated with, endorsed by, or sponsored by the Victorian Curriculum and Assessment Authority (VCAA). Past exam content is sourced from publicly available VCAA materials and is used for educational revision purposes only.",
  },
  {
    q: "What's included in the Free plan?",
    a: "The Free plan gives you a preview of the Algebra, Number & Structure topic with a limited set of practice questions, plus full access to view every VCAA Mathematical Methods past paper with worked solutions. You also get dark mode and a mobile-friendly UI. No credit card is required.",
  },
  {
    q: "What do I get with the Standard plan?",
    a: "The Standard plan ($9.99/month AUD) unlocks all four Mathematical Methods topics (Algebra Number & Structure, Functions Relations & Graphs, Calculus, and Data Analysis Probability & Statistics), unlimited practice questions, step-by-step worked solutions for every question, timed practice exams (Exam 1, Exam 2A multiple choice, Exam 2B short-answer), search across every past question, and full history / progress tracking.",
  },
  {
    q: "How much does Standard cost?",
    a: "Standard is $9.99 per month in Australian dollars (AUD), billed monthly. There is no minimum commitment — you can cancel anytime.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your Standard subscription at any time from the billing portal on your profile page. You'll keep full access until the end of the billing period you've already paid for, and you won't be charged again.",
  },
  {
    q: "Do you offer refunds?",
    a: "Because Standard is a low-cost monthly subscription that you can cancel at any time, we do not generally offer refunds for partial months. If you believe you were charged in error, please contact us and we'll review your case.",
  },
  {
    q: "Do you offer annual plans or student discounts?",
    a: "Annual plans are coming soon. If you'd like to be notified when they launch, create a free account and we'll let you know. We're also exploring discounts for schools and tutoring groups — reach out if you're interested.",
  },
  {
    q: "Will more VCE subjects be added?",
    a: "Yes. We're starting with VCE Mathematical Methods and plan to expand to Specialist Mathematics next, followed by other VCE subjects. Our longer-term goal is to cover the full Australian Curriculum. Standard subscribers will be the first to know when new subjects launch.",
  },
  {
    q: "Which exam years are covered?",
    a: "We cover the most recent years of VCAA Mathematical Methods exams (both Exam 1 and Exam 2), and we keep the library up to date as new past papers become publicly available from VCAA.",
  },
  {
    q: "How are the worked solutions written?",
    a: "Worked solutions are written to mirror how a VCE examiner awards marks: each step is shown, key working is highlighted, and answers are clearly stated. For multiple-choice questions the correct letter is shown; for short-answer questions the full method is shown.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. The entire platform is mobile-friendly, so you can revise on your phone, tablet, or laptop. Dark mode is supported on every page.",
  },
  {
    q: "How do I reset my password?",
    a: "Click \"Forgot password?\" on the login page. We'll email you a password reset link. For security, the link expires after a short period — request a new one if it has expired.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us by email at support@vcemethods.com.au. We aim to respond within two business days.",
  },
];

export default function FAQsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarketingNav />

      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Frequently asked questions
          </h1>
          <p className="mt-5 text-lg lg:text-xl text-gray-500 dark:text-gray-400">
            Everything you need to know about ATAR Hero, plans, and billing.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 lg:p-6 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {f.q}
                <span className="text-brand-600 dark:text-brand-400 text-xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 lg:mt-16 text-center text-sm lg:text-base text-gray-500 dark:text-gray-400">
          <p>
            Still have a question?{" "}
            <a
              href="mailto:support@vcemethods.com.au"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Email our support team
            </a>
            .
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
