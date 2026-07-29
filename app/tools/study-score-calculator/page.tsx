import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, OG_IMAGE_PATH, ORGANIZATION_ID, WEBSITE_ID } from "@/lib/site";
import Calculator from "./Calculator";

/**
 * Public VCE study-score calculator — an indexable SEO/acquisition page.
 * All estimation maths lives in lib/study-score.ts (pure, unit-tested,
 * runs client-side); this server page carries the metadata, structured data
 * and the honest-framing copy around the tool.
 */

export const metadata: Metadata = {
  title: "VCE Study Score Calculator — Methods, Specialist, General & Foundation",
  description:
    "Free VCE study score calculator for the four VCE maths subjects. Enter your SAC and exam percentages and we estimate your study score, likely range and state percentile from published VCAA grade distributions (2023–2025).",
  keywords: [
    "VCE study score calculator",
    "study score calculator maths",
    "Mathematical Methods study score",
    "Specialist Mathematics study score",
    "General Mathematics study score",
    "Foundation Mathematics study score",
    "VCE maths study score estimate",
    "VCAA grade distributions",
  ],
  alternates: { canonical: "/tools/study-score-calculator" },
  // NOTE: Next.js metadata does NOT deep-merge — a page-level `openGraph`
  // replaces the root layout's block wholesale, so images/siteName/locale
  // must be restated here or shared links render with no preview image.
  openGraph: {
    title: "VCE Study Score Calculator — Methods, Specialist, General & Foundation",
    description:
      "Estimate your VCE maths study score and state percentile from your SAC and exam percentages, using published VCAA grade distributions (2023–2025).",
    url: "/tools/study-score-calculator",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AU",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "ATAR Hero — VCE Study Score Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VCE Study Score Calculator — Methods, Specialist, General & Foundation",
    description:
      "Estimate your VCE maths study score and state percentile from your SAC and exam percentages, using published VCAA grade distributions (2023–2025).",
    images: [OG_IMAGE_PATH],
  },
};

const faqs = [
  {
    q: "How accurate is this VCE study score calculator?",
    a: "It's an honest estimate, not a promise. We convert each of your marks into a statewide percentile using three years of published VCAA grade distributions (2023–2025), combine them with the official study-design weights, and map the result onto the study score scale (mean 30, standard deviation 7). We always show a likely range — usually ±2, wider at the extremes — because exam difficulty shifts each year and VCAA moderates school SAC scores before they count.",
  },
  {
    q: "How does VCAA actually calculate study scores?",
    a: "VCAA standardises each graded assessment score, weights it by its study-design contribution, and ranks every student on the combined total. That ranking is mapped onto a scale with a mean of 30 and a standard deviation of 7, truncated at 0 and 50, so most study scores fall between 23 and 37. School SAC scores are first statistically moderated so each school's distribution aligns with its students' external exam performance, and further adjustments apply to studies with small enrolments.",
  },
  {
    q: "What percentage of students get each study score?",
    a: "For studies with large enrolments (1,000 or more), roughly 2% of students score 45 or above, 9% score 40+, 26% score 35+, 53% score 30+, 78% score 25+ and 93% score 20+. All four VCE maths studies had well over 1,000 students in 2025.",
  },
  {
    q: "Which VCE maths subjects does this calculator cover?",
    a: "All four VCE mathematics studies, with their official assessment weights: Mathematical Methods and Specialist Mathematics (SACs 40%, Exam 1 20%, Exam 2 40%), General Mathematics (SACs 40%, Exam 1 30%, Exam 2 30%) and Foundation Mathematics (SACs 60%, single exam 40%).",
  },
  {
    q: "Is this calculator affiliated with VCAA?",
    a: "No. ATAR Hero is an independent revision platform. The grade distributions and assessment weights we use are drawn from publicly available VCAA statistics and the VCE Mathematics Study Design.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/tools/study-score-calculator#app`,
      name: "VCE Study Score Calculator",
      url: `${SITE_URL}/tools/study-score-calculator`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description:
        "Estimates VCE maths study scores from SAC and exam percentages using published VCAA grade distributions (2023–2025).",
      offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
      provider: { "@id": ORGANIZATION_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Study Score Calculator",
          item: `${SITE_URL}/tools/study-score-calculator`,
        },
      ],
    },
  ],
};

const howItWorks = [
  {
    title: "How we estimate your score",
    body: (
      <>
        <p>
          Each mark you enter is converted into a raw score out of that assessment&apos;s maximum,
          then placed in VCAA&apos;s published grade bands for that assessment to find your
          statewide percentile (interpolating linearly inside a band). We do this against each of
          the last three published years — 2023, 2024 and 2025 — and average them, because a single
          year&apos;s paper can be unusually hard or easy.
        </p>
        <p className="mt-3">
          The per-assessment percentiles are then combined using the official study-design weights
          via standard-normal z-scores — the same standardise-weight-aggregate idea VCAA uses — and
          the result is mapped onto the study score scale: mean 30, standard deviation 7, capped at
          0 and 50.
        </p>
      </>
    ),
  },
  {
    title: "Where the numbers come from",
    body: (
      <>
        <p>
          36 grade-distribution tables — four subjects, three graded assessments each (two for
          Foundation&apos;s SAC units plus its exam), three years — transcribed from the official
          VCAA statistics PDFs and verified value-by-value against them. Assessment weights come
          from the VCE Mathematics Study Design (2023–2027). We update the tables each year when
          VCAA publishes new distributions.
        </p>
      </>
    ),
  },
  {
    title: "Honest limitations",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Exam difficulty moves.</strong> The Methods Exam 1 A+ cut-off was 73/80 in 2023,
          66/80 in 2024 and 72/80 in 2025, and the General Exam 1 average jumped from 49.0 to 55.5
          between 2024 and 2025. The same raw percent maps to different percentiles in different
          years — we average three years, but your year will be its own.
        </li>
        <li>
          <strong>SACs are moderated.</strong> VCAA statistically aligns each school&apos;s SAC
          distribution with its students&apos; exam performance. The SAC percent you type is a
          proxy for that moderated score, not the real thing.
        </li>
        <li>
          <strong>Small cohorts wobble.</strong> Foundation&apos;s exam cohort grew from about 730
          in 2023 to about 1,916 in 2025, and VCAA applies extra adjustments to small studies that
          published tables don&apos;t capture.
        </li>
        <li>
          <strong>Bands have edges.</strong> Published tables can&apos;t show rank order inside a
          grade band, which is why we show a likely range — and cap the top display at 45+, the
          top ~2% of the state.
        </li>
      </ul>
    ),
  },
];

export default function StudyScoreCalculatorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <JsonLd data={jsonLd} />
      <MarketingNav />

      {/* Hero */}
      <section className="pt-14 pb-8 lg:pt-20 lg:pb-10 px-5 sm:px-8 lg:px-12 text-center bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-brand-100 dark:bg-brand-900 px-4 py-1.5 text-sm lg:text-base font-medium text-brand-700 dark:text-brand-400 mb-5">
            Free tool — no sign-up needed
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            VCE Study Score Calculator
          </h1>
          <p className="mt-4 lg:mt-5 text-base lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Estimate your Methods, Specialist, General or Foundation study score from your SAC and
            exam percentages — built on published VCAA grade distributions from 2023–2025, with an
            honest range instead of a single magic number.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-8 lg:py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center text-gray-400 dark:text-gray-500">
                Loading calculator…
              </div>
            }
          >
            <Calculator />
          </Suspense>
        </div>
      </section>

      {/* How this works */}
      <section className="py-10 lg:py-16 px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 lg:mb-8">
            How this works
          </h2>
          <div className="space-y-3">
            {howItWorks.map((item) => (
              <details
                key={item.title}
                className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 list-none [&::-webkit-details-marker]:hidden">
                  {item.title}
                  <span className="ml-3 text-gray-400 transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.body}
                </div>
              </details>
            ))}
          </div>

          {/* Data / non-affiliation notice — mirrors the past-papers notice style */}
          <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Data notice: </span>
            The grade distributions and assessment weights used by this calculator are drawn from
            publicly available VCAA statistics and the VCE Mathematics Study Design. Results are
            estimates for study purposes only — they are not official scores. This site is not
            affiliated with, endorsed by or otherwise associated with the Victorian Curriculum and
            Assessment Authority (VCAA). For official information, visit{" "}
            <a
              href="https://www.vcaa.vic.edu.au"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              www.vcaa.vic.edu.au
            </a>
            .
          </div>
        </div>
      </section>

      {/* FAQ — visible content backing the FAQPage structured data */}
      <section className="py-12 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 lg:mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6 lg:space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold lg:text-lg text-gray-900 dark:text-gray-100">{faq.q}</h3>
                <p className="mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            The estimate is free. So is the practice.
          </h2>
          <p className="mt-4 lg:mt-6 text-base lg:text-xl text-gray-500 dark:text-gray-400">
            Every VCAA past paper with worked solutions, timed exam practice and progress tracking —
            start free, no credit card required.
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
