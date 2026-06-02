import PracticeSetupForm from "@/components/PracticeSetupForm";
import PaywallScreen from "@/components/PaywallScreen";
import { canAccessPaidPractice } from "@/lib/practice-gate";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

// VCE General Mathematics Exam 2 — the full extended-response paper.
// No A/B split: ~15-18 multi-part questions, 60 marks, 1.5h, CAS allowed.
// Mirrors the structure students sit on the real VCAA paper.
export default async function Exam2Page({ params }: PageProps) {
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
  return <PracticeSetupForm mode="exam2" topics={topics} title="Exam 2 Practice" />;
}
