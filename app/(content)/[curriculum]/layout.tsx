import { notFound } from "next/navigation";
import { isKnownCurriculum } from "@/lib/curriculum-context";

/**
 * Curriculum route guard for the public content group — mirrors the validation
 * in `(app)/[curriculum]/layout.tsx`. Validates the `:curriculum` segment is a
 * known slug (today only "vce"); unknown slugs 404 rather than serving VCE
 * content under a different URL (which would create duplicate-content issues).
 */
export default async function PublicCurriculumLayout({
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
