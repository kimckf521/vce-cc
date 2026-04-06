import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const ErrorReporter = dynamic(() => import("@/components/ErrorReporter"), { ssr: false });
const PageViewTracker = dynamic(() => import("@/components/PageViewTracker"), { ssr: false });

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "VCE Methods — Revision Hub",
  description:
    "Master VCE Mathematical Methods with past exam questions, worked solutions, and practice exams.",
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
    <html lang="en" suppressHydrationWarning>
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
