import { TOPICS } from "@/lib/topics-config";
import PracticeSetupForm from "@/components/PracticeSetupForm";

export default function Exam2APage() {
  return <PracticeSetupForm mode="exam2a" topics={[...TOPICS]} title="Exam 2A Practice" />;
}
