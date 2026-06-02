"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Tag, Lock, X, ArrowRight } from "lucide-react";

export type UpsellVariant = "default" | "referred" | "locked-topic";

type Props = {
  variant?: UpsellVariant;
  /** Subject context for the locked-topic variant (e.g., "Calculus"). */
  topicName?: string;
};

type CopySpec = {
  icon: typeof Zap;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  storageKey: string;
};

function getCopy(variant: UpsellVariant, topicName?: string): CopySpec {
  switch (variant) {
    case "referred":
      return {
        icon: Tag,
        text: "Your 50% discount is ready — $4.99 first month",
        ctaLabel: "Claim it",
        ctaHref: "/pricing",
        storageKey: "upsell-referred-dismissed",
      };
    case "locked-topic":
      return {
        icon: Lock,
        text: topicName
          ? `Continue ${topicName} with full access — VCE Maths $9.99/month`
          : "Continue this topic with full access — VCE Maths $9.99/month",
        ctaLabel: "Unlock",
        ctaHref: "/pricing",
        storageKey: "upsell-locked-topic-dismissed",
      };
    default:
      return {
        icon: Zap,
        text: "Unlock VCE Maths — $9.99/month for all 4 maths subjects",
        ctaLabel: "See plans",
        ctaHref: "/pricing",
        storageKey: "upsell-default-dismissed",
      };
  }
}

/**
 * Brand-tinted upsell banner. Shown above the page heading on free-user
 * dashboards and subject homes. Per-session dismiss via sessionStorage so
 * a tap of the X hides it until next visit (next tab/window).
 *
 * 3 variants:
 *   - default: generic "Unlock VCE Maths" line
 *   - referred: 50% discount available
 *   - locked-topic: surfaced inline above gated topic content
 *
 * Server pages decide variant + render this with isPaid=false guard.
 */
export default function UpsellBanner({ variant = "default", topicName }: Props) {
  const copy = getCopy(variant, topicName);
  const Icon = copy.icon;

  // Hidden by default so the SSR HTML doesn't flash before the dismiss
  // check runs — only show after we know the user hasn't dismissed it.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(copy.storageKey);
      if (!dismissed) setVisible(true);
    } catch {
      // sessionStorage may throw in some embedded contexts — show by default
      setVisible(true);
    }
  }, [copy.storageKey]);

  function handleDismiss() {
    try {
      sessionStorage.setItem(copy.storageKey, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-5 lg:mb-6 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 px-4 py-3 lg:px-5 flex items-center gap-3">
      <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />

      <p className="flex-1 text-sm lg:text-base text-brand-900 dark:text-brand-100">
        {copy.text}
      </p>

      <Link
        href={copy.ctaHref}
        className="flex-shrink-0 hidden sm:inline-flex items-center gap-1 text-sm lg:text-base font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 transition-colors"
      >
        {copy.ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-brand-700/60 dark:text-brand-300/60 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
