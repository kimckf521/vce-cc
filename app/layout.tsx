import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const ErrorReporter = dynamic(() => import("@/components/ErrorReporter"), { ssr: false });
const PageViewTracker = dynamic(() => import("@/components/PageViewTracker"), { ssr: false });

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "ATAR Hero";
// GA4 Measurement ID. Public by design (it renders into page HTML), so a default
// is fine here; set NEXT_PUBLIC_GA_ID to override per environment if ever needed.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-E2WQVXBF6S";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ATAR Hero — From Zero to Hero in VCE",
    template: "%s | ATAR Hero",
  },
  description:
    "Go from zero to hero in VCE. Master all 4 VCE maths subjects — Methods, Specialist, Foundation and General — with VCAA past exam questions, step-by-step worked solutions and timed practice exams. Built for Year 12 students in Victoria.",
  applicationName: SITE_NAME,
  keywords: [
    "ATAR Hero",
    "ATAR",
    "VCE",
    "VCE Maths",
    "VCE Mathematical Methods",
    "VCE Specialist Mathematics",
    "VCE General Mathematics",
    "VCE Foundation Mathematics",
    "VCAA past exams",
    "VCE practice",
    "VCE worked solutions",
    "Year 12 Maths",
    "VCE revision",
    "Methods Exam 1",
    "Methods Exam 2",
    "Specialist Exam 1",
    "Specialist Exam 2",
    "Victorian Certificate of Education",
    "ATAR score",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "ATAR Hero — From Zero to Hero in VCE",
    description:
      "Master all 4 VCE maths subjects — Methods, Specialist, Foundation and General — with VCAA past exam questions, worked solutions and practice exams. Built for Year 12 students in Victoria.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ATAR Hero — From zero to hero in VCE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATAR Hero — VCAA Past Exams & Worked Solutions",
    description:
      "All 4 VCE maths subjects. VCAA past exams, worked solutions and timed practice for Year 12. From zero to hero.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "education",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.png`,
      description:
        "ATAR Hero — go from zero to hero in VCE. VCE Maths revision platform covering Methods, Specialist, Foundation and General, with VCAA past exam questions, worked solutions and practice exams for Year 12 students in Victoria, Australia.",
      areaServed: { "@type": "Country", name: "Australia" },
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "ATAR Hero — past VCAA exams across all 4 VCE maths subjects, worked solutions and timed practice for Year 12 students in Victoria. From zero to hero.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-AU",
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/#course`,
      name: "VCE Maths Revision",
      description:
        "Year 12 VCE maths preparation across Mathematical Methods, Specialist Mathematics, Foundation Mathematics and General Mathematics — with VCAA past exam questions, step-by-step worked solutions and timed practice exams.",
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          category: "Free",
          price: "0",
          priceCurrency: "AUD",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "VCE Maths",
          category: "Subscription",
          price: "9.99",
          priceCurrency: "AUD",
          availability: "https://schema.org/InStock",
        },
      ],
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-AU",
        courseWorkload: "PT100H",
      },
      hasPart: [
        { "@id": `${SITE_URL}/#course-methods` },
        { "@id": `${SITE_URL}/#course-specialist` },
        { "@id": `${SITE_URL}/#course-general` },
        { "@id": `${SITE_URL}/#course-foundation` },
      ],
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/#course-methods`,
      name: "VCE Mathematical Methods",
      alternateName: "VCE Methods",
      description:
        "VCE Mathematical Methods revision: functions, calculus, algebra, probability and statistics. Real VCAA past exam questions, step-by-step worked solutions and timed practice exams for Year 12 students.",
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      isPartOf: { "@id": `${SITE_URL}/#course` },
      url: `${SITE_URL}/vce/methods/topics`,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-AU",
      },
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/#course-specialist`,
      name: "VCE Specialist Mathematics",
      description:
        "VCE Specialist Mathematics revision: complex numbers, vectors, differential equations, mechanics and discrete maths. Real VCAA past exam questions, worked solutions and timed practice for Year 12.",
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      isPartOf: { "@id": `${SITE_URL}/#course` },
      url: `${SITE_URL}/vce/specialist/topics`,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-AU",
      },
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/#course-general`,
      name: "VCE General Mathematics",
      description:
        "VCE General Mathematics revision: applied maths across financial, statistical, geometric and algebraic contexts. Real VCAA past exam questions, worked solutions and timed practice for Year 12.",
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      isPartOf: { "@id": `${SITE_URL}/#course` },
      url: `${SITE_URL}/vce/general/topics`,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-AU",
      },
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/#course-foundation`,
      name: "VCE Foundation Mathematics",
      description:
        "VCE Foundation Mathematics revision: real-world maths for everyday life — financial maths, measurement, statistics and algebra. Worked solutions and timed practice for Year 12 students.",
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalLevel: "Senior Secondary School",
      inLanguage: "en-AU",
      isPartOf: { "@id": `${SITE_URL}/#course` },
      url: `${SITE_URL}/vce/foundation/topics`,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-AU",
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase for faster auth + API calls */}
        <link rel="preconnect" href="https://seouzwjvrptwpvhubxui.supabase.co" />
        <link rel="dns-prefetch" href="https://seouzwjvrptwpvhubxui.supabase.co" />
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
        {/* Structured data: EducationalOrganization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ErrorReporter />
          <PageViewTracker />
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {/* Google Analytics 4 — production only, so localhost + preview deploys stay out of the data. */}
        {process.env.VERCEL_ENV === "production" && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
