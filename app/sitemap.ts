import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, getDbSubjectSlug } from "@/lib/subject-context";
import { DEFAULT_CURRICULUM_SLUG } from "@/lib/curriculum-context";
import { SITE_URL } from "@/lib/site";
import { examSlug } from "@/lib/exam-slug";

// Generated on-demand rather than at build time: new exams/questions appear
// immediately, and the production build doesn't need a live DB connection.
export const dynamic = "force-dynamic";

/**
 * XML sitemap exposed at /sitemap.xml
 *
 * Lists the public marketing pages PLUS the public content surface in the
 * (content) route group: each subject's Past Papers landing page, every exam
 * page (keyword slug URLs, e.g. /exams/2023-exam-1), and every individual
 * past-paper question page (the long-tail SEO targets — students search for
 * specific questions, not whole papers).
 *
 * Multi-part (Section B) questions share one page: every part's URL renders
 * the whole group, so only the GROUP LEADER (first part by part-label order)
 * is listed — the other parts canonicalise to it. Listing every part would
 * hand Google 3-4 competing near-duplicates per question.
 *
 * `lastModified` is the real `updatedAt` of the underlying rows (max across
 * a group / an exam's questions) so Google can trust the signal; emitting
 * `new Date()` on every request teaches it to ignore lastmod entirely.
 *
 * Excluded by design: topic / practice / dashboard pages (still behind auth)
 * and the drill-bank `questions/set/:id` pages (page-level noindex).
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    // Per-subject marketing landing pages — high-priority SEO targets.
    { url: `${SITE_URL}/methods`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/specialist`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/general`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/foundation`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    // Free-tools hub — the indexable collection page linking the individual
    // tools below. Content only changes when a tool is added or reframed.
    { url: `${SITE_URL}/tools`, changeFrequency: "monthly", priority: 0.7 },
    // Public study-score calculator — free-tool SEO target ("vce study score
    // calculator" queries). Data refreshes annually when VCAA publishes new
    // grade distributions.
    {
      url: `${SITE_URL}/tools/study-score-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Public exam countdown — free-tool SEO target ("vce exam dates 2026" /
    // "methods exam countdown" queries). The /embed variant is deliberately
    // absent (noindex, chrome-less duplicate).
    {
      url: `${SITE_URL}/tools/exam-countdown`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/faqs`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Public content pages (past papers + individual questions). Pulled from the
  // DB so new exams/questions appear automatically. Fails soft: if the DB is
  // unreachable, still serve the static pages rather than 500 the sitemap.
  const contentPages: MetadataRoute.Sitemap = [];
  const curriculum = DEFAULT_CURRICULUM_SLUG;
  try {
    for (const subject of SUBJECTS) {
      const dbSlug = getDbSubjectSlug(subject.urlSlug);
      const base = `${SITE_URL}/${curriculum}/${subject.urlSlug}`;

      const rows = await prisma.question.findMany({
        where: { exam: { subject: { slug: dbSlug }, year: { not: 9999 } } },
        select: {
          id: true,
          examId: true,
          questionNumber: true,
          part: true,
          updatedAt: true,
          // Worked solutions live on their own row and are edited through
          // their own admin path — a solution fix must bump lastmod even
          // when the question text is untouched.
          solution: { select: { updatedAt: true } },
          exam: { select: { year: true, examType: true } },
        },
        orderBy: [{ questionNumber: "asc" }, { part: "asc" }],
      });
      const questions = rows.map((q) => ({
        ...q,
        updatedAt:
          q.solution && q.solution.updatedAt > q.updatedAt ? q.solution.updatedAt : q.updatedAt,
      }));

      // Past Papers landing page for the subject — freshest when any of its
      // questions changed.
      const subjectLastMod = questions.reduce(
        (max, q) => (q.updatedAt > max ? q.updatedAt : max),
        new Date(0)
      );
      contentPages.push({
        url: `${base}/exams`,
        ...(questions.length > 0 ? { lastModified: subjectLastMod } : {}),
        changeFrequency: "monthly",
        priority: 0.8,
      });

      // One URL per exam (keyword slug), lastModified = max updatedAt of its
      // questions. One URL per question GROUP: MCQs (part=null) stand alone;
      // Section B parts collapse to the first part's id.
      const examMeta = new Map<string, { slug: string; lastMod: Date }>();
      const groupLeaders = new Map<
        string,
        { id: string; lastMod: Date }
      >();

      for (const q of questions) {
        const em = examMeta.get(q.examId);
        if (!em) {
          examMeta.set(q.examId, { slug: examSlug(q.exam), lastMod: q.updatedAt });
        } else if (q.updatedAt > em.lastMod) {
          em.lastMod = q.updatedAt;
        }

        // Group key: MCQs are their own group; Section B groups by
        // (examId, questionNumber). Rows arrive ordered by part, so the first
        // row seen for a key is the leader.
        const key =
          q.part === null ? `${q.examId}::mcq::${q.id}` : `${q.examId}::${q.questionNumber}`;
        const g = groupLeaders.get(key);
        if (!g) {
          groupLeaders.set(key, { id: q.id, lastMod: q.updatedAt });
        } else if (q.updatedAt > g.lastMod) {
          g.lastMod = q.updatedAt;
        }
      }

      for (const { slug, lastMod } of Array.from(examMeta.values())) {
        contentPages.push({
          url: `${base}/exams/${slug}`,
          lastModified: lastMod,
          changeFrequency: "yearly",
          priority: 0.7,
        });
      }
      for (const { id, lastMod } of Array.from(groupLeaders.values())) {
        contentPages.push({
          url: `${base}/questions/${id}`,
          lastModified: lastMod,
          changeFrequency: "yearly",
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    console.error("[sitemap] failed to load content pages:", err);
  }

  return [...staticPages, ...contentPages];
}
