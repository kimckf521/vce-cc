import { redirect } from "next/navigation";
import PracticeSetupForm from "@/components/PracticeSetupForm";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

export default async function FoundationSectionBPage({ params }: PageProps) {
  const { curriculum, subject } = await params;
  // Section B is a Foundation-only paper shape; other subjects use the
  // Methods/Specialist/General Exam 1 / Exam 2 split.
  if (subject !== "foundation") {
    redirect(`/${curriculum}/${subject}/practice`);
  }

  const topics = await getSubjectSetupTopics(subject);
  return (
    <PracticeSetupForm mode="examB" topics={topics} title="Section B Practice" />
  );
}
