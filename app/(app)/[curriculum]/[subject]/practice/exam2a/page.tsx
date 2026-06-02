import PracticeSetupForm from "@/components/PracticeSetupForm";
import PaywallScreen from "@/components/PaywallScreen";
import { canAccessPaidPractice } from "@/lib/practice-gate";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

export default async function Exam2APage({ params }: PageProps) {
  const { curriculum, subject } = await params;
  if (!(await canAccessPaidPractice())) {
    return (
      <PaywallScreen
        feature="practice"
        backHref={`/${curriculum}/${subject}/practice`}
        backLabel="Back to practice"
      />
    );
  }
  const topics = await getSubjectSetupTopics(subject);
  return <PracticeSetupForm mode="exam2a" topics={topics} title="Exam 2A Practice" />;
}
