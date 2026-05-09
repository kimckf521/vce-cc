import { TOPICS } from "@/lib/topics-config";
import PracticeSetupForm from "@/components/PracticeSetupForm";
import PaywallScreen from "@/components/PaywallScreen";
import { canAccessPaidPractice } from "@/lib/practice-gate";

export default async function Exam2APage() {
  if (!(await canAccessPaidPractice())) {
    return <PaywallScreen feature="practice" backHref="/practice" backLabel="Back to practice" />;
  }
  return <PracticeSetupForm mode="exam2a" topics={[...TOPICS]} title="Exam 2A Practice" />;
}
