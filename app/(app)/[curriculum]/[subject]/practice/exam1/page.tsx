import PracticeSetupForm from "@/components/PracticeSetupForm";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

export default async function Exam1Page({ params }: PageProps) {
  const { subject } = await params;
  const topics = await getSubjectSetupTopics(subject);
  return <PracticeSetupForm mode="exam1" topics={topics} title="Exam 1 Practice" />;
}
