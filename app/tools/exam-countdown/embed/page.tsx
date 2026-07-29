import type { Metadata } from "next";
import { VCE_EXAM_DATES } from "@/lib/exam-config";
import { getSubjectMetadata, isKnownSubject } from "@/lib/subject-context";
import { SITE_URL } from "@/lib/site";
import { buildCountdownExams } from "../countdown-lib";
import EmbedCountdown from "./EmbedCountdown";

/**
 * Embeddable single-subject countdown — minimal chrome (no nav/footer),
 * designed for a ~600×180 iframe on school and study-blog sites.
 *
 * noindex: this is chrome-less duplicate content of /tools/exam-countdown;
 * the main page is the one that ranks. The widget carries a small
 * "atarhero.com.au" attribution link back to the full tool.
 *
 * Cross-origin framing: next.config.mjs excludes this exact path from the
 * global `X-Frame-Options: SAMEORIGIN` rule and serves it with
 * `Content-Security-Policy: frame-ancestors *` instead, so external sites
 * can iframe it. Keep the header rules in sync if this route ever moves.
 */

interface EmbedPageProps {
  searchParams: { subject?: string };
}

/** Unknown/missing subjects fall back to Methods rather than erroring. */
function resolveSubject(raw: string | undefined): string {
  return raw && isKnownSubject(raw) && VCE_EXAM_DATES[raw] ? raw : "methods";
}

export function generateMetadata({ searchParams }: EmbedPageProps): Metadata {
  const meta = getSubjectMetadata(resolveSubject(searchParams.subject));
  return {
    title: `VCE ${meta?.shortName ?? "Maths"} Exam Countdown (embed)`,
    robots: { index: false, follow: false },
  };
}

export default function EmbedPage({ searchParams }: EmbedPageProps) {
  const slug = resolveSubject(searchParams.subject);
  const exams = buildCountdownExams().filter((e) => e.subjectSlug === slug);
  const meta = getSubjectMetadata(slug);

  return (
    <EmbedCountdown
      exams={exams}
      subjectDisplay={meta?.displayName ?? "VCE Maths"}
      initialNowMs={Date.now()}
      homeUrl={`${SITE_URL}/tools/exam-countdown`}
    />
  );
}
