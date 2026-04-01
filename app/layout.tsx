import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ErrorReporter from "@/components/ErrorReporter";
import PageViewTracker from "@/components/PageViewTracker";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VCE Methods — Revision Hub",
  description:
    "Master VCE Mathematical Methods with past exam questions, worked solutions, and practice exams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorReporter />
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
