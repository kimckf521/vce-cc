import { redirect } from "next/navigation";
import PracticeSetupForm from "@/components/PracticeSetupForm";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

export default async function FoundationExamPage({ params }: PageProps) {
  const { curriculum, subject } = await params;
  // Foundation is the only single-paper subject; the "exam" route doesn't
  // apply to the others.
  if (subject !== "foundation") {
    redirect(`/${curriculum}/${subject}/practice`);
  }

  const topics = await getSubjectSetupTopics(subject);
  return (
    <PracticeSetupForm mode="exam" topics={topics} title="Foundation Exam Practice" />
  );
}
