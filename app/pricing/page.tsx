import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata: Metadata = {
  title: "Pricing — Free & Standard Plans",
  description:
    "Try VCE Methods free with a topic preview and every VCAA past paper. Upgrade to Standard ($9.99/month AUD) for full access to every topic, every question, and worked solutions.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "VCE Methods Pricing — Free & Standard Plans",
    description:
      "Free plan with VCAA past papers, or Standard at $9.99/month AUD for full Methods access.",
    url: "/pricing",
    type: "website",
  },
};

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  href?: string;
  checkout?: boolean;
  highlighted: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try the platform with limited access — no credit card needed.",
    cta: "Get started",
    href: "/signup",
    highlighted: false,
    features: [
      "Preview the Algebra, Number & Structure topic",
      "Limited practice questions",
      "View all VCAA past papers",
      "Track your progress",
      "Dark mode and mobile-friendly",
    ],
  },
  {
    name: "Standard",
    price: "$9.99",
    period: "/month",
    description: "Full access to Mathematical Methods — every topic, every question.",
    cta: "Start Standard",
    checkout: true,
    highlighted: true,
    features: [
      "Full access to Mathematical Methods",
      "All four VCE topics unlocked",
      "Unlimited practice questions",
      "Step-by-step worked solutions",
      "Timed practice exams",
      "Progress tracking and review history",
      "Cancel anytime",
    ],
  },
];

const faqs = [
  {
    q: "What's included in the free plan?",
    a: "You get a preview of the Algebra, Number & Structure topic with limited practice questions, plus full access to view every VCAA Mathematical Methods past paper. It's a great way to try the platform before subscribing.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — you can cancel your Standard subscription at any time. You'll keep access until the end of your current billing period.",
  },
  {
    q: "Do you offer annual discounts?",
    a: "Annual plans are coming soon. If you'd like to be notified when they launch, sign up for a free account and we'll let you know.",
  },
  {
    q: "Will more subjects be added?",
    a: "Yes. We're starting with Mathematical Methods and plan to expand to Specialist Mathematics and other VCE subjects. Standard subscribers will be the first to know when new subjects launch.",
  },
  {
    q: "Is this affiliated with VCAA?",
    a: "No. VCE Methods is an independent revision platform. Past exam content is sourced from publicly available VCAA materials.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* FAQPage structured data — surfaces FAQs as rich results in Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarketingNav active="pricing" />

      {/* Hero */}
      <section className="py-20 lg:py-28 px-5 sm:px-8 lg:px-12 text-center bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-brand-100 dark:bg-brand-900 px-4 py-1.5 text-sm lg:text-base font-medium text-brand-700 dark:text-brand-400 mb-6">
            Simple, transparent pricing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Choose the plan that fits you
          </h1>
          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Start free with a topic preview and every VCAA past paper. Upgrade when you&apos;re ready for full access.
          </p>
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
            All prices in AUD. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-12 lg:py-16 px-5 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 lg:p-8 transition-all ${
                  plan.highlighted
                    ? "border-brand-300 dark:border-brand-600 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-brand-200 dark:ring-brand-800"
                    : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-gray-100">
                    {plan.price}
                  </span>
                  <span className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                    {plan.period}
                  </span>
                  {plan.name === "Standard" && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">AUD</span>
                  )}
                </div>

                {plan.checkout ? (
                  <CheckoutButton
                    className={`block w-full rounded-xl px-5 py-3 text-center text-sm lg:text-base font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400"
                    }`}
                  >
                    {plan.cta}
                  </CheckoutButton>
                ) : (
                  <Link
                    href={plan.href ?? "#"}
                    className={`block w-full rounded-xl px-5 py-3 text-center text-sm lg:text-base font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 mt-0.5 rounded-full p-0.5 ${
                        plan.highlighted
                          ? "bg-brand-100 dark:bg-brand-900"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        <Check className={`h-3.5 w-3.5 ${
                          plan.highlighted
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`} />
                      </span>
                      <span className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Premium teaser */}
          <div className="mt-8 lg:mt-10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-8 text-center">
            <p className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
              More plans coming soon
            </p>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              We&apos;re working on a Premium tier with practice exams, video solutions, and more subjects. Stay tuned.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 lg:mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6 lg:space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold lg:text-lg text-gray-900 dark:text-gray-100">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 px-5 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Ready to start practising?
          </h2>
          <p className="mt-4 lg:mt-6 text-base lg:text-xl text-gray-500 dark:text-gray-400">
            Create a free account in seconds. No credit card required.
          </p>
          <Link
            href="/signup"
            className="mt-8 lg:mt-10 inline-block rounded-2xl bg-brand-600 px-8 lg:px-12 py-4 lg:py-5 text-base lg:text-lg font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
