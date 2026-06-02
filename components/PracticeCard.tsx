"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import PaywallModal from "./PaywallModal";

// Tailwind class strings per accent. Centralised so the look stays consistent
// even when new accents are added — and so every class is present at build
// time (Tailwind purges anything it can't statically see).
const ACCENT_CLASSES = {
  sky: {
    border: "border-sky-200 dark:border-sky-800",
    bg: "bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900",
    iconBg: "bg-sky-100 dark:bg-sky-900",
    chip: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400",
    cta: "text-sky-700 dark:text-sky-400",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    chip: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400",
    cta: "text-amber-700 dark:text-amber-400",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
    chip: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400",
    cta: "text-emerald-700 dark:text-emerald-400",
  },
} as const;

export type PracticeCardAccent = keyof typeof ACCENT_CLASSES;

interface PracticeCardProps {
  /** Where to go when unlocked. Ignored when locked (opens modal instead). */
  href: string;
  locked: boolean;
  accent: PracticeCardAccent;
  icon: React.ReactNode;
  chip: string;
  title: string;
  description: string;
}

/**
 * Practice-format card used on the Practice landing page. When unlocked it
 * renders as a Link straight to the configuration screen. When locked, it
 * renders as a button that opens the PaywallModal — keeping the user on the
 * Practice page rather than navigating them away to /pricing every time
 * they click a paid card.
 */
export default function PracticeCard({
  href,
  locked,
  accent,
  icon,
  chip,
  title,
  description,
}: PracticeCardProps) {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const c = ACCENT_CLASSES[accent];

  // Inner body is identical for locked and unlocked variants — only the
  // outer wrapper element differs (Link vs button).
  const body = (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl ${c.iconBg} p-3 lg:p-4`}>{icon}</div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full ${c.chip} px-3 py-1 text-xs lg:text-sm font-semibold`}>
            {chip}
          </span>
          {locked && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/80 dark:bg-gray-700 text-white shrink-0">
              <Lock className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
      <div>
        <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2 text-left">
          {title}
        </div>
        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed text-left">
          {description}
        </p>
      </div>
      <div className={`text-sm lg:text-base font-semibold ${c.cta} group-hover:translate-x-0.5 transition-transform text-left`}>
        {locked ? "Unlock with VCE Maths →" : "Configure and start →"}
      </div>
    </div>
  );

  const sharedClass = `block w-full rounded-2xl border ${c.border} ${c.bg} p-6 lg:p-8 transition-all hover:shadow-md ${locked ? "opacity-60" : ""}`;

  if (locked) {
    return (
      <>
        <div className="group">
          <button
            type="button"
            onClick={() => setPaywallOpen(true)}
            className={`${sharedClass} text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
            aria-haspopup="dialog"
            aria-expanded={paywallOpen}
          >
            {body}
          </button>
        </div>
        <PaywallModal
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          topicName={title}
        />
      </>
    );
  }

  return (
    <div className="group">
      <Link href={href} className={sharedClass}>
        {body}
      </Link>
    </div>
  );
}
