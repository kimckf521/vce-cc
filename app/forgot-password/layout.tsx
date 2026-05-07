import type { Metadata } from "next";

// Auth flow page — explicitly noindex. robots.txt also disallows
// /forgot-password.
export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your ATAR Hero account password.",
  alternates: { canonical: "/forgot-password" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
