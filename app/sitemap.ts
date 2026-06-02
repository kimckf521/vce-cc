import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, getDbSubjectSlug } from "@/lib/subject-context";
import { DEFAULT_CURRICULUM_SLUG } from "@/lib/curriculum-context";

// Generated on-demand rather than at build time: new exams/questions appear
// immediately, and the production build doesn't need a live DB connection.
export const dynamic = "force-dynamic";

/**
 * XML sitemap exposed at /sitemap.xml
 *
 * Lists the public marketing pages PLUS the public content surface in the
 * (content) route group: each subject's Past Papers landing page, every exam
 * page, and every individual past-paper question page (the long-tail SEO
 * targets — students search for specific questions, not whole papers).
 *
 * Excluded by design: topic / practice / dashboard pages (still behind auth)
 * and the drill-bank `questions/set/:id` pages (page-level noindex).
 *
 * Set `NEXT_PUBLIC_SITE_URL` in your environment to your production domain
 * (e.g. `https://atarhero.com.au`). Falls back to localhost in development.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Per-subject marketing landing pages — high-priority SEO targets.
    { url: `${SITE_URL}/methods`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/specialist`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/general`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/foundation`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/faqs`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
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

      // Past Papers landing page for the subject.
      contentPages.push({
        url: `${base}/exams`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });

      const [exams, questions] = await Promise.all([
        prisma.exam.findMany({
          where: { subject: { slug: dbSlug }, year: { not: 9999 } },
          select: { id: true },
        }),
        prisma.question.findMany({
          where: { exam: { subject: { slug: dbSlug }, year: { not: 9999 } } },
          select: { id: true },
        }),
      ]);

      for (const e of exams) {
        contentPages.push({
          url: `${base}/exams/${e.id}`,
          lastModified,
          changeFrequency: "yearly",
          priority: 0.7,
        });
      }
      for (const q of questions) {
        contentPages.push({
          url: `${base}/questions/${q.id}`,
          lastModified,
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
