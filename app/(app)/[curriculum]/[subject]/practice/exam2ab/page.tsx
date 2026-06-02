import Exam2ABSetupForm from "./Exam2ABSetupForm";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

export default async function Exam2ABPage({ params }: PageProps) {
  const { subject } = await params;
  const topics = await getSubjectSetupTopics(subject);
  return <Exam2ABSetupForm topics={topics} title="Exam 2A & 2B Practice" />;
}
