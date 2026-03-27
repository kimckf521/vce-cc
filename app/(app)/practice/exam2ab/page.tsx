import { TOPICS } from "@/lib/topics-config";
import Exam2ABSetupForm from "./Exam2ABSetupForm";

export default function Exam2ABPage() {
  return <Exam2ABSetupForm topics={[...TOPICS]} />;
}
