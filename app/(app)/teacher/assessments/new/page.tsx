import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KNOWN_SUBJECT_SLUGS } from "@/lib/subject-context";
import { getSubjectSetupTopics } from "@/lib/practice-setup-topics";
import NewAssessmentForm, { type SubjectTopicsMap } from "./NewAssessmentForm";

export const dynamic = "force-dynamic";

/**
 * New-assessment builder — server shell.
 *
 * Preloads the topic list for all four maths subjects in one go so the client
 * form can switch subjects without a fetch (Methods 4 topics, General 5,
 * Specialist 6 — small enough that eager-loading everything is cheaper than a
 * round trip per switch). The default title is computed here so the server
 * and client render the same string (no hydration mismatch from `new Date()`).
 */
export default async function NewAssessmentPage() {
  const topicLists = await Promise.all(
    KNOWN_SUBJECT_SLUGS.map((slug) => getSubjectSetupTopics(slug))
  );
  const topicsBySubject: SubjectTopicsMap = Object.fromEntries(
    KNOWN_SUBJECT_SLUGS.map((slug, i) => [slug, topicLists[i]])
  );

  const defaultTitle = `Untitled paper — ${new Date().toLocaleDateString(
    "en-AU",
    { day: "numeric", month: "short", year: "numeric" }
  )}`;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/teacher"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Your assessments
      </Link>

      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        New assessment
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose a subject and style, and we assemble a paper from our original
        question bank. You can swap, reorder, or remove questions afterwards.
      </p>

      <NewAssessmentForm
        topicsBySubject={topicsBySubject}
        defaultTitle={defaultTitle}
      />
    </div>
  );
}
