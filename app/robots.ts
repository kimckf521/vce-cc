import type { MetadataRoute } from "next";

/**
 * robots.txt exposed at /robots.txt
 *
 * Three layers of rules:
 *
 *   1. Default rule for "good" crawlers (Googlebot, Bingbot, DuckDuckBot, etc.):
 *      allow public pages, disallow every authenticated / API / auth-flow path.
 *
 *   2. Explicit blocks for known AI training crawlers (GPTBot, ClaudeBot,
 *      Google-Extended, PerplexityBot, CCBot, etc.). These companies have
 *      publicly committed to honouring robots.txt — blocking here is
 *      effective for compliant operators but does nothing against actors
 *      who ignore the protocol.
 *
 *   3. A "last resort" rule blocking generic scraping toolkits (Scrapy,
 *      HTTrack, Wget, etc.) — weak defence because user agents can be spoofed,
 *      but raises the bar for low-effort scrapers.
 *
 * IMPORTANT: robots.txt is ADVISORY. It relies entirely on the crawler's
 * goodwill. For real scrape protection on authenticated content, see
 * seo/security-and-scraping.md — you need Vercel Firewall rules, BotID,
 * rate limiting, and CAPTCHA on signup. robots.txt is the first layer,
 * not the only layer.
 *
 * Set `NEXT_PUBLIC_SITE_URL` to your production domain so the sitemap URL
 * resolves correctly.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// AI training crawlers that publicly commit to honouring robots.txt.
// Each of these is either (a) used to scrape content for LLM training or
// (b) used as a real-time content fetcher by an AI product. Blocking them
// keeps your question bank and worked solutions out of model training sets
// belonging to compliant operators.
//
// NOTE: This is deliberately NOT "block everything except Google/Bing".
// Smaller search engines and legitimate non-AI crawlers (Applebot for Siri,
// DuckDuckBot for DuckDuckGo search, etc.) are still allowed.
const AI_CRAWLER_USER_AGENTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",

  // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",

  // Google AI training opt-out (NOT Googlebot — that stays allowed for search)
  "Google-Extended",

  // Perplexity
  "PerplexityBot",
  "Perplexity-User",

  // Apple AI training opt-out (NOT Applebot — that stays allowed for Siri/Spotlight)
  "Applebot-Extended",

  // Meta / Facebook AI
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "FacebookBot",

  // ByteDance (TikTok) AI training
  "Bytespider",

  // Amazon AI
  "Amazonbot",

  // Cohere
  "cohere-ai",
  "cohere-training-data-crawler",

  // Common Crawl — used as a dataset by many AI trainers
  "CCBot",

  // Other AI-training / AI-assistant crawlers
  "Diffbot",
  "YouBot",
  "DuckAssistBot",
  "AI2Bot",
  "Kangaroo Bot",
  "Timpibot",
  "Omgilibot",
  "Omgili",
  "ImagesiftBot",
  "Panscient",
];

// Generic scraping frameworks and command-line tools. These don't honour
// robots.txt by default but some respect it when run by well-meaning
// researchers. Listing them here is a weak signal at best — see
// seo/security-and-scraping.md for the real defences.
const GENERIC_SCRAPER_USER_AGENTS = [
  "Scrapy",
  "HTTrack",
  "Wget",
  "curl",
  "python-requests",
  "python-urllib",
  "libwww-perl",
  "Java/",
  "Go-http-client",
  "node-fetch",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Layer 1: Default rule for all polite crawlers (search engines).
      // Allow public marketing pages, disallow everything authenticated.
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
        ],
        disallow: [
          // API + auth callbacks
          "/api/",
          "/auth/",

          // Auth flow pages — low SEO value, often gated by middleware
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",

          // Authenticated app routes — DO NOT REMOVE without making the
          // pages publicly accessible AND removing redirects in (app)/layout.tsx
          "/dashboard",
          "/profile",
          "/admin",
          "/admin/",
          "/history",
          "/search",
          "/questions",
          "/referrals",

          // Currently behind auth — remove these once topic/exam pages are
          // made publicly indexable in Phase 2.
          "/topics",
          "/topics/",
          "/exams",
          "/exams/",
          "/practice",
          "/practice/",
        ],
      },

      // Layer 2: Block AI training crawlers site-wide. Even the public
      // marketing pages shouldn't feed LLM training sets — that way the
      // brand, pricing, and copy aren't regurgitated by chatbots for free.
      {
        userAgent: AI_CRAWLER_USER_AGENTS,
        disallow: "/",
      },

      // Layer 3: Block generic scraping toolkits site-wide. Weak defence
      // (UA strings are easily spoofed) but raises the bar against the
      // laziest actors and deters a handful of bots that do honour it.
      {
        userAgent: GENERIC_SCRAPER_USER_AGENTS,
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
