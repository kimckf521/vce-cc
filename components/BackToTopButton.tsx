"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 1000;

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed right-4 z-30 lg:hidden flex items-center justify-center h-11 w-11 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ bottom: "calc(64px + env(safe-area-inset-bottom) + 12px)" }}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
