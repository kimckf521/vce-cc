import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const ErrorReporter = dynamic(() => import("@/components/ErrorReporter"), { ssr: false });
const PageViewTracker = dynamic(() => import("@/components/PageViewTracker"), { ssr: false });

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "VCE Methods";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VCE Methods — VCAA Past Exams, Worked Solutions & Practice",
    template: "%s | VCE Methods",
  },
  description:
    "Master VCE Mathematical Methods with VCAA past exam questions, step-by-step worked solutions, and timed practice exams. Built for Year 12 students in Victoria.",
  applicationName: SITE_NAME,
  keywords: [
    "VCE Methods",
    "VCE Mathematical Methods",
    "VCAA past exams",
    "VCE Methods practice",
    "VCE Methods worked solutions",
    "Year 12 Maths Methods",
    "VCE revision",
    "Methods Exam 1",
    "Methods Exam 2",
    "Victorian Certificate of Education",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "VCE Methods — VCAA Past Exams, Worked Solutions & Practice",
    description:
      "Master VCE Mathematical Methods with VCAA past exam questions, worked solutions, and practice exams. Built for Year 12 students in Victoria.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VCE Methods — VCAA past exams and worked solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VCE Methods — VCAA Past Exams & Worked Solutions",
    description:
      "VCAA past exams, worked solutions, and timed practice for Year 12 Mathematical Methods.",
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
        "VCE Mathematical Methods revision platform with VCAA past exam questions, worked solutions, and practice exams for Year 12 students in Victoria, Australia.",
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
        "Past VCAA Mathematical Methods exams, worked solutions, and timed practice for Year 12 students in Victoria.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-AU",
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
      </body>
    </html>
  );
}
