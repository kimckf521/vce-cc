import type { Metadata } from "next";

// Auth flow page — explicitly noindex. The page is publicly reachable so we
// can't fully hide it from Google, but the metadata signals that we don't want
// it to appear in search results. robots.txt also disallows /signup.
export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free ATAR Hero account.",
  alternates: { canonical: "/signup" },
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

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
