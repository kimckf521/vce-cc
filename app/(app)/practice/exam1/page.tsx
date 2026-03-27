import { TOPICS } from "@/lib/topics-config";
import PracticeSetupForm from "@/components/PracticeSetupForm";

export default function Exam1Page() {
  return <PracticeSetupForm mode="exam1" topics={[...TOPICS]} title="Exam 1 Practice" />;
}
