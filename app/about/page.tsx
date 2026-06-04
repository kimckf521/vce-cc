import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Target, BookOpen, Heart, Trophy, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { SITE_URL, ORGANIZATION_ID, WEBSITE_ID } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "ATAR Hero is the Year 12 maths revision platform built by VCE specialists who sat the exams themselves. Real VCAA past exams, worked solutions and practice across all 4 VCE maths subjects — Methods, Specialist, Foundation and General.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About ATAR Hero — Built by VCE specialists, for Year 12",
    description:
      "Why we built ATAR Hero, what makes it different and who it's for. Real VCAA past exams + worked solutions across all 4 VCE maths subjects.",
    url: "/about",
    type: "website",
  },
};

// JSON-LD: AboutPage + Organization. Strong E-E-A-T signal for education sites.
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#aboutpage`,
      name: "About ATAR Hero",
      description:
        "Why ATAR Hero exists, what makes it different and who it's built for — the Year 12 VCE maths revision platform from VCE specialists in Victoria.",
      url: `${SITE_URL}/about`,
      inLanguage: "en-AU",
      datePublished: "2026-05-08",
      dateModified: "2026-05-08",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
      mainEntity: { "@id": ORGANIZATION_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
      ],
    },
  ],
};

const values = [
  {
    icon: BookOpen,
    title: "Real VCAA content, never lookalikes",
    description:
      "Every question on ATAR Hero comes from an actual VCAA past exam — not invented questions that hope to feel similar. The fastest way to get good at the VCE exam is to do the VCE exam.",
  },
  {
    icon: ShieldCheck,
    title: "Independent and honest",
    description:
      "ATAR Hero is independently built and is not affiliated with VCAA. We don't oversell, we don't promise score guarantees, and we tell students what the data actually shows about how they're tracking.",
  },
  {
    icon: Heart,
    title: "Made for students, not for institutions",
    description:
      "Most VCE platforms are sold to schools first and students second. ATAR Hero is built for the student studying alone at 11pm — clean UI, mobile-first, dark mode, no upsells in your face.",
  },
  {
    icon: Trophy,
    title: "From zero to hero",
    description:
      "Wherever you're starting from — overwhelmed, behind or just starting Year 12 — ATAR Hero is the path that takes you all the way to walking into the exam ready.",
  },
];

const stats = [
  { value: "2,900+", label: "Past exam questions" },
  { value: "4", label: "VCE maths subjects" },
  { value: "10 yrs", label: "Of VCAA papers" },
  { value: "100%", label: "With worked solutions" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <MarketingNav />

      {/* Hero */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 dark:bg-brand-900 px-4 py-1.5 text-sm lg:text-base font-medium text-brand-700 dark:text-brand-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            About ATAR Hero
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Built by VCE specialists.
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-brand-400 dark:via-brand-300 dark:to-brand-500 bg-clip-text text-transparent">
              Made for Year 12.
            </span>
          </h1>
          <p className="mt-5 lg:mt-6 text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
            ATAR Hero is the revision hub we wished existed when we were sitting VCE.
            One subscription, all 4 VCE maths subjects, real VCAA past exam questions —
            and worked solutions for every single one.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5">
            Why we built ATAR Hero
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              Every Year 12 student in Victoria runs into the same wall.
              You finish a chapter in class. You half-remember the trick. The teacher
              moves on. The exam is in eight months. And nothing online seems to give
              you what you actually need — <em>volume</em> of practice on the questions
              that actually appear on the real exam.
            </p>
            <p>
              Most platforms either give you a handful of lookalike questions and a
              paywall, or sell to schools and forget about you. The good resources are
              scattered across eight tabs, PDF downloads and YouTube playlists. You spend
              hours hunting for the worked solution to a 2019 Methods Exam 2 Question 4,
              instead of doing 2019 Methods Exam 2 Question 4.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-gray-100">
                ATAR Hero is the thing we wished existed.
              </strong>{" "}
              Every VCAA past exam from 2016 onwards across all four VCE maths subjects.
              Step-by-step worked solutions for every question. Timed practice that
              mirrors the real exam format. Progress tracking that tells you where your
              gaps actually are. One subscription, no upsells, built for the student
              studying alone at 11pm.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-950/60">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-5 lg:px-6 lg:py-6 text-center shadow-sm"
              >
                <p className="text-2xl lg:text-3xl xl:text-4xl font-extrabold bg-gradient-to-br from-brand-600 to-brand-500 dark:from-brand-400 dark:to-brand-300 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">
              What we believe
            </h2>
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              The principles that shape every question, every solution and every UI decision on ATAR Hero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:p-7 shadow-sm"
              >
                <div className="inline-flex rounded-2xl bg-brand-100 dark:bg-brand-900/60 p-3 lg:p-3.5 mb-5">
                  <v.icon className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's next */}
      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-brand-50 dark:from-gray-900 dark:to-brand-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5 text-center">
            Where we&apos;re going
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              All 4 VCE maths subjects — Mathematical Methods, Specialist Mathematics,
              General Mathematics and Foundation Mathematics — are live now. Next:
              VCE Sciences (Biology, Chemistry, Physics, Psychology), then English,
              then Business and Humanities.
            </p>
            <p>
              Beyond Victoria, our longer-term goal is to cover the full Australian
              senior-secondary curriculum — HSC, QCE, WACE, SACE — and eventually
              every student studying for a high-stakes exam in Australia.
            </p>
            <p>
              We&apos;ll get there one subject at a time. We&apos;d rather do four
              subjects exceptionally than forty subjects badly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="py-20 lg:py-28 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 mb-5">
            <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Got a question? An idea? A bug?
          </h2>
          <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 mb-8">
            We read every email. The fastest way to influence what comes next on
            ATAR Hero is to tell us what would help you most.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="mailto:hello@atarhero.com.au"
              className="rounded-2xl bg-brand-600 px-7 lg:px-9 py-3.5 lg:py-4 text-base lg:text-lg font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
            >
              Email us
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/faqs"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-7 lg:px-9 py-3.5 lg:py-4 text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              Read FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Independence disclaimer */}
      <section className="py-14 lg:py-20 px-5 sm:px-8 lg:px-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700 mb-5 lg:mb-6">
            <Target className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            All content on this website has been developed independently of, and is not endorsed
            by, the Victorian Curriculum and Assessment Authority (VCAA). VCAA<sup>®</sup> is a
            registered trademark of the Victorian Curriculum and Assessment Authority. Past exam
            content is sourced from publicly available VCAA materials and is used for educational
            revision purposes only.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
