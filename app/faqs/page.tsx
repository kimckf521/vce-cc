import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about ATAR Hero: free vs VCE Maths plans, subscriptions, VCAA past papers, progress tracking and more.",
  alternates: { canonical: "/faqs" },
};

const faqs: { q: string; a: string }[] = [
  {
    q: "What is ATAR Hero?",
    a: "ATAR Hero is an independent revision hub for Victorian Year 12 students studying VCE maths. We cover all 4 maths subjects — Mathematical Methods, Specialist Mathematics, Foundation Mathematics and General Mathematics — with past VCAA exam questions organised by topic, step-by-step worked solutions, timed practice exams and progress tracking.",
  },
  {
    q: "Is ATAR Hero affiliated with VCAA?",
    a: "No. ATAR Hero is an independent study platform built by VCE specialists who've sat the exams themselves. We are not affiliated with, endorsed by or sponsored by the Victorian Curriculum and Assessment Authority (VCAA). Past exam content is sourced from publicly available VCAA materials and is used for educational revision purposes only.",
  },
  {
    q: "What's included in the Free plan?",
    a: "The Free plan gives you a preview topic in each of the 4 maths subjects with practice questions, plus full access to view every VCAA past paper across Methods, Specialist, General and Foundation with worked solutions. You also get dark mode and a mobile-friendly UI. No credit card is required.",
  },
  {
    q: "What do I get with the VCE Maths plan?",
    a: "The VCE Maths plan ($9.99/month AUD) unlocks all 4 VCE maths subjects — Methods, Specialist, Foundation and General — with every topic, unlimited practice questions, step-by-step worked solutions for every question, timed practice exams (Exam 1, Exam 2A multiple-choice, Exam 2B short-answer), search across every past question, and full history and progress tracking.",
  },
  {
    q: "How much does VCE Maths cost?",
    a: "VCE Maths is $9.99 per month in Australian dollars (AUD), billed monthly. One subscription unlocks all 4 maths subjects — Methods, Specialist, Foundation and General. There is no minimum commitment — you can cancel at any time.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. You can cancel your VCE Maths subscription at any time from the billing portal on your profile page. You'll keep full access until the end of the billing period you've already paid for and you won't be charged again.",
  },
  {
    q: "Do you offer refunds?",
    a: "Because VCE Maths is a low-cost monthly subscription that you can cancel at any time, we do not generally offer refunds for partial months. If you believe you were charged in error, please contact us and we'll review your case.",
  },
  {
    q: "Do you offer annual plans or student discounts?",
    a: "Annual plans are coming soon. If you'd like to be notified when they launch, create a free account and we'll let you know. We're also exploring discounts for schools and tutoring groups — reach out if you're interested.",
  },
  {
    q: "Will more VCE subjects be added?",
    a: "All 4 VCE maths subjects are already live — Mathematical Methods, Specialist Mathematics, General Mathematics and Foundation Mathematics. Next we're working on the VCE Sciences (Biology, Chemistry, Physics, Psychology), followed by English, Business and Humanities. Our longer-term goal is to cover the full Australian Curriculum across every state. VCE Maths subscribers will be the first to know when new subjects launch.",
  },
  {
    q: "Which exam years are covered?",
    a: "We cover VCAA exams from 2016 onwards across Methods, Specialist and General (both Exam 1 and Exam 2), plus all available Foundation Mathematics exams (2023–present, since Foundation is a newer study). We keep the library up to date as new past papers become publicly available from VCAA.",
  },
  {
    q: "What is VCE Mathematical Methods and what does ATAR Hero cover?",
    a: "VCE Mathematical Methods is the standard advanced maths course for Year 12 students aiming for tertiary study in STEM, business or commerce. ATAR Hero covers every VCAA Methods exam from 2016 onwards (both Exam 1 — no calculator, and Exam 2 — calculator-allowed) with step-by-step worked solutions for every question. Topic areas: Functions and graphs, Algebra, Calculus, and Probability and Statistics.",
  },
  {
    q: "What is VCE Specialist Mathematics and what does ATAR Hero cover?",
    a: "VCE Specialist Mathematics is the most advanced VCE maths study, usually taken alongside Methods by students aiming for engineering, mathematics or physics at university. ATAR Hero covers every VCAA Specialist exam from 2016 onwards with worked solutions. Topic areas: Complex numbers, Vectors, Differential equations, Mechanics, Discrete mathematics and Statistical inference.",
  },
  {
    q: "What is VCE General Mathematics and what does ATAR Hero cover?",
    a: "VCE General Mathematics applies maths to financial, statistical, geometric and algebraic contexts. It's a strong scaled-score subject for ATAR. ATAR Hero covers every VCAA General Maths exam from 2016 onwards (Exam 1 and Exam 2) with worked solutions. Topic areas: Data analysis, Recursion and financial modelling, Matrices, Networks and decision mathematics, and Geometry and measurement.",
  },
  {
    q: "What is VCE Foundation Mathematics and what does ATAR Hero cover?",
    a: "VCE Foundation Mathematics is a Year 11/12 study introduced in the 2023 study design for students who want a practical, applied maths course rather than a calculus-heavy one. ATAR Hero covers every available Foundation past paper (2023 onwards) with worked solutions. Topic areas: Algebra number and structure, Discrete mathematics, Space and measurement, and Data analysis and statistics.",
  },
  {
    q: "How are the worked solutions written?",
    a: "Worked solutions are written to mirror how a VCE examiner awards marks: each step is shown, key working is highlighted and answers are clearly stated. For multiple-choice questions the correct letter is shown; for short-answer questions the full method is shown.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. The entire platform is mobile-friendly, so you can revise on your phone, tablet or laptop. Dark mode is supported on every page.",
  },
  {
    q: "How do I reset my password?",
    a: "Click 'Forgot password?' on the login page. We'll email you a password reset link. For security, the link expires after a short period — request a new one if it has expired.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us by email at support@atarhero.com.au. We aim to respond within two business days.",
  },
];

export default function FAQsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faqs` },
        ],
      },
    ],
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
            Everything you need to know about ATAR Hero, plans and billing.
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
              href="mailto:support@atarhero.com.au"
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
