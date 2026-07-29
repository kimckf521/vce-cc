import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, OG_IMAGE_PATH, ORGANIZATION_ID, WEBSITE_ID } from "@/lib/site";
import { SUBJECTS } from "@/lib/subject-context";
import CountdownLive from "./CountdownLive";
import EmbedSnippets, { type EmbedSnippet } from "./EmbedSnippets";
import { buildCountdownExams } from "./countdown-lib";

/**
 * Public VCE exam countdown — an indexable SEO/acquisition page.
 *
 * Server shell: metadata, FAQ copy + FAQPage structured data (dates are
 * public facts from the official VCAA timetable), and the embed snippets.
 * The live parts — ticking hero + self-hiding cards — live in the small
 * CountdownLive client component.
 *
 * ISR hourly: day counts baked into the HTML stay at most an hour stale
 * around Melbourne midnight, and the client corrects them on mount anyway.
 */

export const revalidate = 3600;

const PAGE_TITLE =
  "VCE Maths Exam Countdown 2026 — Methods, Specialist, General & Foundation";
const PAGE_DESCRIPTION =
  "Live countdown to every 2026 VCE maths exam — Mathematical Methods, Specialist, General and Foundation. Official VCAA dates and sitting times, days remaining, and a free embeddable widget for school and study sites.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "VCE exam countdown",
    "VCE exam dates 2026",
    "Methods Exam 1 date 2026",
    "Methods Exam 2 date 2026",
    "Specialist Maths exam date 2026",
    "General Maths exam date 2026",
    "Foundation Maths exam date 2026",
    "VCAA exam timetable 2026",
    "days until VCE exams",
  ],
  alternates: { canonical: "/tools/exam-countdown" },
  // NOTE: Next.js metadata does NOT deep-merge — a page-level `openGraph`
  // replaces the root layout's block wholesale, so images/siteName/locale
  // must be restated here or shared links render with no preview image.
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/tools/exam-countdown",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AU",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "ATAR Hero — VCE Maths Exam Countdown 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default function ExamCountdownPage() {
  const exams = buildCountdownExams();

  // One FAQ per exam, generated from the same config the countdown renders,
  // so the structured data can never drift from the visible dates. Dates are
  // fixed public facts, so they're safe inside statically cached JSON-LD —
  // unlike "days remaining", which never appears in FAQ copy.
  const examFaqs = exams.map((e) => ({
    q: `When is the 2026 ${e.subjectDisplay} ${e.label}?`,
    a: `The 2026 ${e.subjectDisplay} ${e.label} is on ${e.dateFull}${
      e.time ? `, ${e.time}` : ""
    } (AEDT, Melbourne time), according to the official VCAA VCE written examination timetable.`,
  }));

  const faqs = [
    ...examFaqs,
    {
      q: "Where do these exam dates come from?",
      a: "From the official VCAA VCE written examination timetable published at vcaa.vic.edu.au. We transcribe the dates and sitting times when the timetable is released and verify them against the source, then update this page each year as soon as the new timetable drops. Always confirm your own exam details with your school.",
    },
    {
      q: "What timezone is the countdown in?",
      a: "All dates and times are AEDT (Melbourne local time) — the timezone the exams are actually sat in. The day count flips at Melbourne midnight no matter where in the world you're viewing from.",
    },
    {
      q: "Can I embed this countdown on my school or study website?",
      a: "Yes — schools, teachers and study blogs are welcome to embed it. Copy the free iframe snippet for your subject from the 'Embed this countdown' section on this page. The widget stays current automatically and works in light and dark themes.",
    },
    {
      q: "Is ATAR Hero affiliated with VCAA?",
      a: "No. ATAR Hero is an independent revision platform. The exam dates and sitting times shown here are drawn from the publicly available VCAA examination timetable. For official information, visit vcaa.vic.edu.au.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/tools/exam-countdown#app`,
        name: "VCE Maths Exam Countdown 2026",
        url: `${SITE_URL}/tools/exam-countdown`,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description:
          "Live countdown to the 2026 VCE maths exams — Methods, Specialist, General and Foundation — using dates and sitting times from the official VCAA examination timetable.",
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
            name: "Exam Countdown",
            item: `${SITE_URL}/tools/exam-countdown`,
          },
        ],
      },
    ],
  };

  // Embed snippets carry the canonical origin so copied code works anywhere.
  const embedSnippets: EmbedSnippet[] = SUBJECTS.map((s) => ({
    slug: s.urlSlug,
    shortName: s.shortName,
    code: `<iframe src="${SITE_URL}/tools/exam-countdown/embed?subject=${s.urlSlug}" width="600" height="180" style="border:0;max-width:100%;" loading="lazy" title="VCE ${s.shortName} exam countdown — ATAR Hero"></iframe>`,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <JsonLd data={jsonLd} />
      <MarketingNav />

      {/* Hero header */}
      <section className="bg-gradient-to-b from-brand-50 to-white px-5 pb-8 pt-14 text-center dark:from-gray-950 dark:to-gray-900 sm:px-8 lg:px-12 lg:pb-10 lg:pt-20">
        <div className="mx-auto max-w-3xl">
          <span className="mb-5 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-400 lg:text-base">
            Live countdown — official VCAA 2026 dates
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl lg:text-5xl">
            VCE Maths Exam Countdown 2026
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 lg:mt-5 lg:text-xl">
            Every 2026 written exam for Methods, Specialist, General and
            Foundation — dates, sitting times and days remaining, straight from
            the official VCAA timetable. All times AEDT (Melbourne).
          </p>
        </div>
      </section>

      {/* Live countdown */}
      <section className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <CountdownLive exams={exams} initialNowMs={Date.now()} />
        </div>
      </section>

      {/* Embed section */}
      <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100 lg:text-3xl">
            Embed this countdown
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400 lg:text-base">
            Schools, teachers and study blogs are welcome to embed this
            countdown — it&apos;s free, stays current automatically, and adapts
            to light and dark themes. Paste the snippet for your subject
            anywhere HTML is allowed (about 600 × 180 pixels).
          </p>
          <EmbedSnippets snippets={embedSnippets} />

          {/* Dates / non-affiliation notice — mirrors the past-papers notice style */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Dates notice: </span>
            Exam dates and sitting times on this page are drawn from the
            official VCAA 2026 VCE written examination timetable and shown in
            AEDT (Melbourne time). Always confirm your exam details with your
            school. This site is not affiliated with, endorsed by or otherwise
            associated with the Victorian Curriculum and Assessment Authority
            (VCAA). For the official timetable, visit{" "}
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
      <section className="bg-gray-50 px-5 py-12 dark:bg-gray-800 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-gray-100 lg:mb-12 lg:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-6 lg:space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400 lg:text-base">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 text-center sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 lg:text-4xl">
            Counting down is free. So is the practice.
          </h2>
          <p className="mt-4 text-base text-gray-500 dark:text-gray-400 lg:mt-6 lg:text-xl">
            Every VCAA past paper with worked solutions, timed exam simulations
            and progress tracking — we built it so the days on this page turn
            into marks on yours.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-2xl bg-brand-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-700 lg:mt-10 lg:px-12 lg:py-5 lg:text-lg"
          >
            Create free account
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
