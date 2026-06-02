import { prisma } from "@/lib/prisma";
import { getDbSubjectSlug } from "@/lib/subject-context";

/**
 * Fetch the topic list for a subject's practice-setup form, ordered for
 * display. Each practice setup page (exam1/2a/2b/2ab/exam) calls this so the
 * "Custom practice" topic-distribution control shows the CURRENT subject's
 * topics — Methods has 4, General 5, Specialist 6 — rather than the static
 * Methods-only `TOPICS` constant the pages used to import.
 *
 * `subjectUrlSlug` is the short URL slug (methods / general / specialist /
 * foundation); it's translated to the DB slug internally.
 */
export async function getSubjectSetupTopics(
  subjectUrlSlug: string
): Promise<{ id: string; name: string; slug: string }[]> {
  return prisma.topic.findMany({
    where: { subject: { slug: getDbSubjectSlug(subjectUrlSlug) } },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
