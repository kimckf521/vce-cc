import { notFound } from "next/navigation";
import { isKnownCurriculum } from "@/lib/curriculum-context";

/**
 * Curriculum route guard.
 *
 * Wraps every `/[curriculum]/[subject]/...` page. Validates that the URL's
 * `:curriculum` segment is a known curriculum slug (today only "vce"; HSC /
 * QCE / WACE etc. are added to the allowlist in `lib/curriculum-context.ts`
 * when their content goes live).
 *
 * Unknown slugs return 404 rather than serving VCE content under a different
 * URL, which would create duplicate-content SEO problems.
 */
export default async function CurriculumLayout({
  params,
  children,
}: {
  params: Promise<{ curriculum: string }>;
  children: React.ReactNode;
}) {
  const { curriculum } = await params;
  if (!isKnownCurriculum(curriculum)) {
    notFound();
  }
  return <>{children}</>;
}
