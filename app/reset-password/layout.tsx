import type { Metadata } from "next";

// Auth flow page — explicitly noindex. robots.txt also disallows
// /reset-password.
export const metadata: Metadata = {
  title: "Set new password",
  description: "Choose a new password for your ATAR Hero account.",
  alternates: { canonical: "/reset-password" },
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

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
