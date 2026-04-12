# Scrape Defence & Security Strategy

**Last updated:** 2026-04-08
**Status:** Layer 1 shipped. Layers 2–6 require human action (mostly Vercel dashboard + product decisions).

---

## The honest reality

1. **`robots.txt` is advisory.** It relies entirely on the crawler's goodwill. Big companies (OpenAI, Anthropic, Google, Perplexity) publicly honour it. Malicious scrapers ignore it completely.
2. **Your content is already mostly behind auth.** The question bank, exam papers, worked solutions, and practice sessions all live under `app/(app)/*` and require login. That's your single biggest protection.
3. **The real scraper risk is logged-in users.** Someone signs up (free or paid), then runs a script against your API and hoovers everything. Rate limits + per-account quotas + bot detection are the defences against this, not robots.txt.
4. **Perfect protection doesn't exist.** Every website with valuable content is in an arms race. The goal is to make scraping expensive enough that attackers move on to softer targets.

## The SEO vs scrape-proofing tension

This is the most important thing to understand: **you cannot simultaneously rank for a page on Google AND keep it hidden from scrapers.** Google indexes by crawling the public HTML. If Google can see it, any scraper with the same HTTP tool can see it too.

Your 30-day plan's Phase 2 (making topic and exam landing pages publicly indexable for SEO) directly conflicts with "nobody can grab my data". You need to decide, per-page-type, which side of the line each page sits on:

| Page type | SEO-indexed (scrapeable) | Behind auth (safer) |
|---|---|---|
| Homepage | ✅ — recommended | ❌ |
| Pricing | ✅ — recommended | ❌ |
| **Topic landing** (name, description, why it matters, sample) | ✅ — see below | ❌ |
| **Full topic content** (all questions) | ❌ | ✅ — recommended |
| **Exam landing** (year, paper, topics covered) | ✅ — see below | ❌ |
| **Full exam questions** | ❌ | ✅ — recommended |
| **Worked solutions** | ❌ | ✅ — recommended (core IP) |
| Dashboard, admin, profile, history | ❌ | ✅ — mandatory |

**The strategy:** publish **lean landing pages** for SEO (topic description, 1–3 sample questions, FAQs, student testimonials). Keep the full question bank and all worked solutions behind auth. Google can index the landing pages; Google cannot index the question bank because it can't log in.

This gives you SEO traffic from topic-intent queries (`vce methods calculus`, `vce methods binomial distribution`) while keeping the core IP protected.

---

## The six layers of scrape defence

### Layer 1 — `robots.txt` (✅ shipped tonight)

**What it does:** Tells well-behaved crawlers what they can and can't access. Blocks known AI training bots site-wide (GPTBot, ClaudeBot, Google-Extended, Bytespider, CCBot, Perplexity, Meta AI, Apple AI, Amazon, Cohere, and more). Blocks auth flow pages and every `(app)/*` route.

**What it does NOT do:** Stop a single malicious scraper. It's a signpost, not a wall.

**Maintenance:** Review quarterly. New AI bots appear every few months — check the list at https://darkvisitors.com/agents or similar registries and update `AI_CRAWLER_USER_AGENTS` in `app/robots.ts`.

### Layer 2 — Vercel Firewall (🟡 requires human action, no code)

**What it does:** Real-time request filtering at the Vercel edge. Can block by IP, ASN, country, user-agent, request rate, path pattern. Requests are rejected BEFORE they hit your Next.js app.

**How to enable:**
1. Vercel dashboard → your project → **Firewall** tab
2. Create rules. Recommended starter set:
   - **Rule: Block known scraper user-agents.** Condition: `User-Agent` contains `HTTrack | WebCopier | Scrapy | httrack | wget | curl/7` (case-insensitive). Action: Deny.
   - **Rule: Block data-center ASNs on auth endpoints.** Condition: `Path` starts with `/api/` AND `User-Agent` doesn't match known legitimate bots. Action: Challenge or Deny.
   - **Rule: Rate limit the free tier harder.** Condition: `Path` starts with `/api/questions` or `/api/practice`. Action: Rate limit 30 requests / minute per IP.
3. Test in **Log mode** first, monitor for 24 hours, then switch to **Deny** mode.

**Cost:** Included in Vercel's paid tiers (Pro and Enterprise). Not available on Hobby.

**Effectiveness:** High against unsophisticated scrapers. Moderate against serious ones (who will rotate residential IPs and spoof user-agents).

### Layer 3 — Vercel BotID (🟡 requires human action)

**What it does:** Vercel's managed bot detection. Uses fingerprinting, behavioural signals, and ML to identify bots even when they spoof user-agents. Can challenge suspicious requests with a JavaScript puzzle (invisible to humans, fatal to most scrapers).

**How to enable:**
1. Vercel dashboard → your project → **Bot Management** (may be labelled "BotID" or under Firewall)
2. Enable for all routes, or selectively for `/api/*`
3. Set action: **Challenge** (safer) or **Block** (stricter)

**Cost:** Paid feature. Pricing varies — check the Vercel dashboard for current rates.

**Effectiveness:** High. This is your strongest automated defence. The main cost is false positives (a genuine user on a weird browser gets challenged).

### Layer 4 — Per-account rate limits and quotas (🟡 needs code work, not tonight)

Currently `lib/rate-limit.ts` exists and is applied to API routes. Tonight I did NOT modify it because it's core infrastructure. Recommendations for Phase 2:

1. **Per-user quotas, not just per-IP.** An attacker creates one account, then hammers the API. Rate limiting by user ID in addition to IP catches this. Example: "no user can call `/api/practice/start` more than 60 times per hour".
2. **Aggregate daily quotas.** "Free users: max 50 question views per day. Standard users: max 500 per day." Legitimate studying doesn't hit these ceilings; a scraper does immediately.
3. **Anomaly detection.** If a single account makes 1000 API calls in 5 minutes, lock it and email the owner. If an IP creates 20 accounts in an hour, block the IP.
4. **Fingerprint on request timing.** Humans don't issue 10 requests per second. A script does. Add a minimum time-between-requests check at the API level.
5. **Log everything to a time-series store.** You can't detect anomalies without data. Consider Vercel Log Drains to Datadog, Axiom, or BetterStack.

### Layer 5 — Harden signup (🟡 needs product decisions)

Scrapers need accounts. Make signup expensive.

1. **CAPTCHA on signup.** Cloudflare Turnstile (free) or Google reCAPTCHA v3. Adds ~2 seconds to the signup flow for real users, blocks mass-account creation.
2. **Email verification REQUIRED before access.** Currently Supabase can be configured either way — check your Auth settings. If "confirm email" is OFF, any email address can sign up without proving it exists. Scrapers love disposable email services.
3. **Block disposable email domains** on signup (`mailinator.com`, `tempmail.com`, etc.). A curated list is cheap to maintain.
4. **Phone verification for paid accounts** (optional). Expensive for attackers, trivial for real users.
5. **Manual review of high-risk signups.** If 50 accounts sign up from the same IP subnet in an hour, flag them for admin review before granting access.

### Layer 6 — Legal deterrence (🟢 one-time setup)

1. **Terms of Service** clearly prohibiting scraping, automated access, and redistribution of content. Yours should say: *"You may not use any automated means (including scrapers, bots, crawlers, or data mining tools) to access, copy, or collect any content from the Service. You may not copy, reproduce, or redistribute any questions, solutions, or other content."*
2. **DMCA takedown template** ready to send. If you find your questions published on another site, this is your fastest remedy.
3. **Watermarking.** Embed invisible identifiers (user ID, timestamp, session hash) in the HTML of question pages. If a scraped dataset appears online, you can prove which account leaked it and ban them.

---

## What I will NOT do without your explicit go-ahead

- **Modify `middleware.ts`** to add UA filtering. It works but adds failure surface to every single request. If it has a bug, the whole site breaks. I'll hand you the code sample below for you to paste in if you decide.
- **Modify `lib/rate-limit.ts`** or any auth / API code. Changing rate limits mid-term-season can lock out real students.
- **Enable Vercel Firewall rules** — they require access to the Vercel dashboard, which I don't have. You do that yourself.
- **Change Supabase Auth settings** — this is your production user database. Don't let any agent touch it.
- **Send DMCA notices** on your behalf. Legal action is always human-driven.

---

## Middleware UA filter (code sample — do not auto-apply)

**If you decide** you want a middleware-level UA block (IN ADDITION to robots.txt, not instead of it), here's the minimal code. Add this to `middleware.ts` manually, test on a preview deployment first, and only deploy to production after verifying legitimate users aren't affected.

```ts
// In middleware.ts, at the TOP of the middleware function, before updateSession:
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Patterns for known scraper user agents. Order matters — most specific first.
// Real browsers don't contain these strings; legitimate bots (Googlebot,
// Bingbot, Applebot) don't contain these strings.
const BLOCKED_UA_PATTERNS = [
  /HTTrack/i,
  /WebCopier/i,
  /Offline Explorer/i,
  /Teleport/i,
  /grab-site/i,
  /Scrapy/i,
  /^Wget\//i,
  /^curl\//i,           // 'curl/7.88' etc. — not 'curlbot' etc.
  /^python-requests/i,
  /^python-urllib/i,
  /libwww-perl/i,
];

export async function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";

  // Only block on content routes, not on /api/health or auth callbacks
  const path = request.nextUrl.pathname;
  const isContentRoute =
    path.startsWith("/topics") ||
    path.startsWith("/exams") ||
    path.startsWith("/practice") ||
    path.startsWith("/questions") ||
    path.startsWith("/api/practice") ||
    path.startsWith("/api/search");

  if (isContentRoute && BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return await updateSession(request);
}
```

**Why I haven't applied this:** your current middleware matcher doesn't cover `/questions` or some of these paths. You'd also need to update the `config.matcher` to include content routes. Adding middleware to routes that don't currently run any is a meaningful architectural change — wants product review.

---

## Priority order for YOU (what to do first)

1. **Today**: Merge tonight's branch (including the updated `robots.txt`). Layer 1 is in place.
2. **This week**: Log into Vercel dashboard → Firewall → enable a basic UA blocklist in **Log mode**, monitor for 3 days, then switch to **Deny**.
3. **This week**: Check Supabase Auth settings. Confirm "Email verification required" is ON for signups. If it's OFF, turn it on.
4. **Next week**: Enable Vercel BotID if you're on a paid plan. This is the highest-leverage single action.
5. **Next 30 days**: Add CAPTCHA (Cloudflare Turnstile is free) to the signup form. I can draft the integration PR when you're ready.
6. **Next 30 days**: Add per-account rate limits in `lib/rate-limit.ts`. I can draft the changes for you to review.
7. **Ongoing**: Write a scraping-explicit clause into your Terms of Service. Get a lawyer to review if the site makes real revenue.

---

## What tonight's robots.txt update actually blocks

A rough estimate of AI crawler coverage after tonight:

| AI company | Crawler | Now blocked? |
|---|---|---|
| OpenAI | GPTBot, ChatGPT-User, OAI-SearchBot | ✅ |
| Anthropic | ClaudeBot, Claude-Web, anthropic-ai | ✅ |
| Google (AI) | Google-Extended | ✅ |
| Google (search) | Googlebot | ❌ still allowed — you want this |
| Microsoft / Bing | Bingbot | ❌ still allowed — you want this |
| Perplexity | PerplexityBot, Perplexity-User | ✅ |
| Apple (AI) | Applebot-Extended | ✅ |
| Apple (Siri/search) | Applebot | ❌ still allowed — you want this |
| ByteDance / TikTok | Bytespider | ✅ |
| Meta / Facebook | Meta-ExternalAgent, FacebookBot | ✅ |
| Amazon | Amazonbot | ✅ |
| Cohere | cohere-ai, cohere-training-data-crawler | ✅ |
| Common Crawl | CCBot | ✅ |
| You.com | YouBot | ✅ |
| DuckDuckGo (AI) | DuckAssistBot | ✅ |
| DuckDuckGo (search) | DuckDuckBot | ❌ still allowed — you want this |

**Key distinction:** tonight's rules preserve all legitimate SEARCH ENGINES (Googlebot, Bingbot, DuckDuckBot, Applebot for Siri) so you still rank on Google and appear in Siri results. Only the AI TRAINING crawlers and generic scraping toolkits are blocked.
