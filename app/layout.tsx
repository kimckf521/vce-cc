import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
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
    <html lang="en">
      <head>
        {/* Preconnect to Supabase for faster auth + API calls */}
        <link rel="preconnect" href="https://seouzwjvrptwpvhubxui.supabase.co" />
        <link rel="dns-prefetch" href="https://seouzwjvrptwpvhubxui.supabase.co" />
      </head>
      <body className={inter.className}>
        <ErrorReporter />
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
