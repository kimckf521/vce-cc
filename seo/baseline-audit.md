# SEO Baseline Audit — VCE Methods

**Date:** 2026-04-08
**Audited by:** SEO agent (first run)
**Branch state at audit:** `feature/free-tier-gating` with 16 files of WIP

---

## Site state before any changes

### Discoverability — CRITICAL GAPS
| Item | Status | Severity |
|---|---|---|
| `app/sitemap.ts` | **Missing** | 🔴 Critical |
| `app/robots.ts` | **Missing** | 🔴 Critical |
| Google Search Console verification | Unknown — needs human input | 🟡 |
| Bing Webmaster verification | Unknown | 🟡 |

**Impact:** Without `sitemap.xml`, Google has no efficient way to discover deep pages (topic, subtopic, exam, question pages). Without `robots.txt`, crawlers default to crawling everything — including authenticated routes that should never appear in search results.

### Metadata — minimal
| Item | Status |
|---|---|
| Root `<title>` | "VCE Methods — Revision Hub" — generic, low keyword density |
| Root `<meta description>` | Generic single sentence, no calls to action |
| `metadataBase` | Not set — Open Graph URLs will be relative and broken |
| Open Graph tags | None |
| Twitter Card tags | None |
| Canonical URLs | None per-page |
| `og:image` / Twitter image | None |
| Per-route `generateMetadata` | None on any page (homepage, pricing, login, signup, forgot/reset password) |
| Locale | Not set (defaults to generic English, not `en-AU`) |

### Structured data (JSON-LD)
| Schema | Status |
|---|---|
| `Organization` | Missing |
| `WebSite` (with SearchAction) | Missing |
| `EducationalOrganization` | Missing |
| `BreadcrumbList` (topic pages) | Missing |
| `Course` / `LearningResource` (topic landing) | Missing |
| `FAQPage` (pricing FAQs) | Missing — pricing page has 5 FAQs that could be exposed as rich results |
| `Quiz` / `Question` (sample questions) | Missing |

### Technical SEO observations
| Item | Status | Notes |
|---|---|---|
| `next.config.mjs` image opts | ✅ Good | AVIF + WebP enabled, Supabase remote pattern set |
| `next.config.mjs` package optimisation | ✅ Good | `lucide-react`, `react-markdown`, `katex` tree-shaken |
| Compression | ✅ Enabled |
| `X-DNS-Prefetch-Control` header | ✅ Set |
| Custom security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) | Missing |
| Font loading strategy | ✅ Inter with `display: swap` |
| `public/` directory | ❌ Empty — no `og-image.png`, no favicon, no Apple touch icon |
| Theme flash prevention | ✅ Inline script in root layout |
| Supabase preconnect/dns-prefetch | ✅ In root layout |

### Auth route exposure
| Route | Currently indexable? | Should be? |
|---|---|---|
| `app/(app)/dashboard` etc. | Yes (no noindex) | **No** — needs `noindex, nofollow` |
| `app/(app)/admin/*` | Yes | **No** |
| `app/(app)/profile` | Yes | **No** |
| `app/login` | Yes | **No** (low value) |
| `app/signup` | Yes | **No** (low value, has WIP) |
| `app/forgot-password`, `reset-password` | Yes | **No** |
| `app/api/*` | Yes | **No** |

### Public route inventory (what we WANT in the index)
| Route | Public? | Current metadata | Notes |
|---|---|---|---|
| `/` | Yes | Generic root only | Main landing page; has WIP changes |
| `/pricing` | Yes | None | Has 5 FAQs ripe for FAQPage schema |
| `/topics` | Behind auth currently | Should consider public topic landing pages for SEO |
| `/topics/[slug]` | Behind auth | Same — these are huge SEO opportunities (one page per topic = 4 pages now, 40+ with subtopics) |
| `/exams` | Behind auth | Each year × exam (Exam 1, Exam 2) = ~20 pages of long-tail goldmine if made public |
| `/practice` | Behind auth | Less critical for SEO |

### Tech stack notes
- Next.js 14 App Router → supports `app/sitemap.ts`, `app/robots.ts`, `generateMetadata` natively
- Server Components by default → can export `metadata` directly
- Client Components (`"use client"` files like login, forgot-password, reset-password) → CANNOT export metadata; need a parent `layout.tsx` to set per-route metadata, OR rely on root layout, OR (simpler) just disallow them in `robots.ts`

---

## Top 10 highest-impact fixes (prioritised)

| # | Fix | Effort | Impact | Risk |
|---|---|---|---|---|
| 1 | Create `app/sitemap.ts` | S | 🔴 Huge | Very low |
| 2 | Create `app/robots.ts` | S | 🔴 Huge | Very low (must be careful with disallows) |
| 3 | Add `metadataBase` + OG/Twitter tags to root layout | S | 🔴 Huge | Very low |
| 4 | Add `noindex, nofollow` to `app/(app)/layout.tsx` | XS | 🟠 High (privacy + index hygiene) | Very low |
| 5 | Per-page metadata for `/pricing` (incl. `FAQPage` JSON-LD) | M | 🟠 High | Very low |
| 6 | JSON-LD `Organization` + `WebSite` on root layout | S | 🟠 High | Very low |
| 7 | Make `/topics` and `/topics/[slug]` publicly indexable (currently auth-only) — requires architectural decision | L | 🔴 Massive | Medium (auth refactor) |
| 8 | Make `/exams` and per-exam pages publicly indexable | L | 🔴 Massive | Medium |
| 9 | Add `og-image.png` and favicons in `public/` | S | 🟡 Medium | None |
| 10 | Migrate URL structure to `/vce/methods/...` for multi-subject future | XL | 🟠 High (long-term) | Medium-high (needs 301 plan) |

Items #7 and #8 are the **single biggest organic growth levers** and need a product decision: a portion of the topic / exam / question content needs to be publicly accessible (perhaps with a paywall after N questions) so Google can index it.

---

## What was changed in tonight's session
See `seo/logs/2026-04-08.md` for the full change list and verification.
