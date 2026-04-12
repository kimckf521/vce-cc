import type { MetadataRoute } from "next";

/**
 * XML sitemap exposed at /sitemap.xml
 *
 * Currently lists only public pages (the homepage and pricing). Topic, exam,
 * and question pages are behind auth today — once they are made publicly
 * indexable (see seo/30-day-plan.md, Phase 2), they should be added here,
 * pulled dynamically from `lib/topics-config.ts` and the Prisma DB.
 *
 * Set `NEXT_PUBLIC_SITE_URL` in your environment to your production domain
 * (e.g. `https://vcemethods.com.au`). Falls back to localhost in development.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // TODO (Phase 2): once topic / exam / question pages are publicly
    // indexable, generate entries dynamically here. Example:
    //
    // import { TOPICS } from "@/lib/topics-config";
    // ...TOPICS.map((t) => ({
    //   url: `${SITE_URL}/vce/methods/topics/${t.slug}`,
    //   lastModified,
    //   changeFrequency: "weekly" as const,
    //   priority: 0.9,
    // })),
  ];
}
