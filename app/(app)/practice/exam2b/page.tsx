import { TOPICS } from "@/lib/topics-config";
import PracticeSetupForm from "@/components/PracticeSetupForm";

export default function Exam2BPage() {
  return <PracticeSetupForm mode="exam2b" topics={[...TOPICS]} title="Exam 2B Practice" />;
}
