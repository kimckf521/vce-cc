import { TOPICS } from "@/lib/topics-config";
import Exam2ABSetupForm from "./Exam2ABSetupForm";
import PaywallScreen from "@/components/PaywallScreen";
import { canAccessPaidPractice } from "@/lib/practice-gate";

export default async function Exam2ABPage() {
  if (!(await canAccessPaidPractice())) {
    return <PaywallScreen feature="practice" backHref="/practice" backLabel="Back to practice" />;
  }
  return <Exam2ABSetupForm topics={[...TOPICS]} />;
}
