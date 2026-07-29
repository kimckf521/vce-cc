"use client";

import { useEffect } from "react";
import { ChevronLeft, FileText, Printer } from "lucide-react";

/**
 * Floating on-screen controls for the print preview — hidden by @media print
 * (see print.css). The only client component on this route; it also owns
 * keeping the forced light theme in place.
 */
export default function PrintToolbar({
  assessmentId,
  solutions,
}: {
  assessmentId: string;
  solutions: boolean;
}) {
  // Paper is white: keep the root `dark` class off while this route is
  // mounted. A one-shot removal wouldn't stick — ThemeProvider re-applies the
  // stored theme after hydration (parent effects run after children's) and on
  // system-preference changes — so an observer reverts any re-add.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    const observer = new MutationObserver(() => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      // Mirror the root layout's anti-flash script so a client-side exit
      // restores the user's stored preference.
      try {
        const stored = localStorage.getItem("theme");
        if (
          stored === "dark" ||
          (stored !== "light" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
          root.classList.add("dark");
        }
      } catch {
        // localStorage unavailable — leave the theme light.
      }
    };
  }, []);

  const paperHref = `/print/assessments/${assessmentId}`;

  return (
    <div className="print-toolbar" role="toolbar" aria-label="Print controls">
      <button
        type="button"
        onClick={() => window.print()}
        className="print-toolbar-btn print-toolbar-primary"
      >
        <Printer className="print-toolbar-icon" aria-hidden="true" />
        Print / Save as PDF
      </button>
      {/* Plain <a> links (full page loads) on purpose: the other variant needs
          server-fresh data and a fresh <title>, and a full navigation re-runs
          both theme scripts, so light/dark hand-off stays correct. */}
      <a
        href={solutions ? paperHref : `${paperHref}?solutions=1`}
        className="print-toolbar-btn"
      >
        <FileText className="print-toolbar-icon" aria-hidden="true" />
        {solutions ? "Student paper" : "Marking guide"}
      </a>
      <a href={`/teacher/assessments/${assessmentId}`} className="print-toolbar-btn">
        <ChevronLeft className="print-toolbar-icon" aria-hidden="true" />
        Back to editor
      </a>
    </div>
  );
}
