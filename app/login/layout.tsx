import type { Metadata } from "next";

// Auth flow page — explicitly noindex. The page is publicly reachable so we
// can't fully hide it from Google, but the metadata signals that we don't want
// it to appear in search results. robots.txt also disallows /login.
export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your ATAR Hero account.",
  alternates: { canonical: "/login" },
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

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
