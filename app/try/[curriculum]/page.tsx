import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { isKnownCurriculum } from "@/lib/curriculum-context";

interface PageProps {
  params: Promise<{ curriculum: string }>;
}

// /try/vce (no subject) previously 404'd — send it to the default subject.
export default async function TryCurriculumPage({ params }: PageProps) {
  const { curriculum } = await params;
  if (!isKnownCurriculum(curriculum)) notFound();
  redirect(`/try/${curriculum}/methods`);
}
