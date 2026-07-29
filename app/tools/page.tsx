import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, CalendarClock } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, OG_IMAGE_PATH, WEBSITE_ID } from "@/lib/site";

/**
 * Public free-tools hub — an indexable SEO/acquisition page.
 *
 * Collects the standalone free tools (study-score calculator, exam countdown)
 * on one crawlable page so "free VCE tools" queries and internal links have a
 * single destination, then quietly routes visitors on to the always-free
 * content (past papers, guest trial). Static: no data dependencies.
 *
 * The JSON-LD WebApplication items reuse the SAME @id + description strings
 * as the tool pages' own schema, so Google merges them into one node per tool
 * instead of seeing conflicting duplicates.
 */

const PAGE_TITLE = "Free VCE Maths Tools — Study Score Calculator & Exam Countdown";
const PAGE_DESCRIPTION =
  "Free tools for VCE maths students — a study score calculator built on published VCAA grade distributions and a live countdown to every 2026 VCE maths exam. No sign-up needed.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "free VCE tools",
    "VCE maths tools",
    "VCE study score calculator",
    "VCE exam countdown",
    "VCE exam dates 2026",
    "study score estimate",
    "VCE maths resources free",
  ],
  alternates: { canonical: "/tools" },
  // NOTE: Next.js metadata does NOT deep-merge — a page-level `openGraph`
  // replaces the root layout's block wholesale, so images/siteName/locale
  // must be restated here or shared links render with no preview image.
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/tools",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AU",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "ATAR Hero — Free VCE Maths Tools",
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

const tools = [
  {
    name: "Study Score Calculator",
    href: "/tools/study-score-calculator",
    icon: Calculator,
    // Description strings match the tool pages' own JSON-LD so the graph
    // nodes merge cleanly.
    jsonLdName: "VCE Study Score Calculator",
    jsonLdDescription:
      "Estimates VCE maths study scores from SAC and exam percentages using published VCAA grade distributions (2023–2025).",
    description:
      "Enter your SAC and exam percentages and we estimate your study score — with an honest likely range instead of a single magic number. Built on three years of published VCAA grade distributions, not a made-up formula.",
    chips: ["All 4 maths subjects", "No sign-up", "Honest range"],
    cta: "Open the calculator",
  },
  {
    name: "Exam Countdown",
    href: "/tools/exam-countdown",
    icon: CalendarClock,
    jsonLdName: "VCE Maths Exam Countdown 2026",
    jsonLdDescription:
      "Live countdown to the 2026 VCE maths exams — Methods, Specialist, General and Foundation — using dates and sitting times from the official VCAA examination timetable.",
    description:
      "A live countdown to every 2026 VCE maths written exam — official dates and sitting times for Methods, Specialist, General and Foundation, in Melbourne time. Schools and study blogs can embed the free widget on their own sites.",
    chips: ["Official 2026 timetable", "Live to the second", "Embeddable widget"],
    cta: "See the countdown",
  },
];

const pastPapers = [
  { name: "Methods past papers", href: "/vce/methods/exams" },
  { name: "Specialist past papers", href: "/vce/specialist/exams" },
  { name: "General past papers", href: "/vce/general/exams" },
  { name: "Foundation past papers", href: "/vce/foundation/exams" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/tools#collection`,
      name: "Free VCE Maths Tools",
      url: `${SITE_URL}/tools`,
      description: PAGE_DESCRIPTION,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": `${SITE_URL}/tools#list` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/tools#list`,
      itemListElement: tools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "WebApplication",
          "@id": `${SITE_URL}${tool.href}#app`,
          name: tool.jsonLdName,
          url: `${SITE_URL}${tool.href}`,
          description: tool.jsonLdDescription,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Free Tools", item: `${SITE_URL}/tools` },
      ],
    },
  ],
};

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <JsonLd data={jsonLd} />
      <MarketingNav active="tools" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white px-5 pb-8 pt-14 text-center dark:from-gray-950 dark:to-gray-900 sm:px-8 lg:px-12 lg:pb-10 lg:pt-20">
        <div className="mx-auto max-w-3xl">
          <span className="mb-5 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-400 lg:text-base">
            No sign-up needed
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl lg:text-5xl">
            Free tools for VCE maths students
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 lg:mt-5 lg:text-xl">
            A study score calculator and a live exam countdown — no account, no
            paywall, no catch. We keep them free because they&apos;re most
            useful that way, and because some of you will like how we do the
            simple things and stay for the practice.
          </p>
        </div>
      </section>

      {/* Tool cards */}
      <section className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-8">
          {tools.map((tool) => (
            <article
              key={tool.href}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900 lg:h-14 lg:w-14">
                <tool.icon className="h-6 w-6 text-brand-600 dark:text-brand-400 lg:h-7 lg:w-7" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100 lg:mt-5 lg:text-2xl">
                {tool.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400 lg:mt-3 lg:text-base">
                {tool.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <Link
                  href={tool.href}
                  className="block rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:inline-block lg:text-base"
                >
                  {tool.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Always-free content — quiet secondary section */}
      <section className="bg-gray-50 px-5 py-10 dark:bg-gray-800 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 lg:text-3xl">
            The free part doesn&apos;t stop at tools
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 lg:text-base">
            Every VCAA maths past paper on ATAR Hero is free to read — worked
            solutions included — and always will be.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-3">
            {pastPapers.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:text-brand-400 lg:text-base"
              >
                {p.name}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400 lg:text-base">
            Want to try the practice side too? The{" "}
            <Link
              href="/try"
              className="font-medium text-brand-600 underline transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              free guest trial
            </Link>{" "}
            lets you attempt real exam questions without creating an account.
          </p>
        </div>
      </section>

      {/* Soft signup CTA */}
      <section className="px-5 py-14 text-center sm:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 lg:text-3xl">
            When you&apos;re ready to practise
          </h2>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 lg:mt-4 lg:text-lg">
            A free account adds a preview topic in each of the four maths
            subjects and unlimited timed Exam 1 practice — no credit card
            needed.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-block rounded-2xl bg-brand-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-700 lg:mt-8 lg:px-10 lg:text-lg"
          >
            Create free account
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
