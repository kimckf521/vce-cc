# SEO 30-Day Plan — VCE Methods

**Created:** 2026-04-08
**Status:** Phase 1 (audit + safe additive changes) — completed tonight. Phase 2+ awaiting human approval to continue.

---

## Phase 1 — Foundations (DONE tonight)
- ✅ `app/sitemap.ts` — discoverable by Google
- ✅ `app/robots.ts` — clear allow/disallow rules
- ✅ Root layout metadata: title template, OG, Twitter, canonical, `metadataBase`, `en-AU` locale
- ✅ JSON-LD `Organization` + `WebSite` + `EducationalOrganization` on root layout
- ✅ `noindex, nofollow` on `app/(app)/layout.tsx`
- ✅ `/pricing` per-page metadata + `FAQPage` JSON-LD

## Phase 2 — Content discoverability (week 1–2, requires human go-ahead)
- [ ] **Decision needed:** make some/all topic pages publicly indexable. Three options:
  1. Fully public, gated by free-tier limits (best for SEO, worst for monetisation pressure)
  2. Public preview (first N questions per topic), full access behind auth (balanced)
  3. SSR public landing page per topic with description + featured questions, full question list behind auth (recommended — gives Google something to index, gives humans a reason to sign up)
- [ ] Once decision made, implement public topic landing pages at `/topics/[slug]` (or migrated path)
- [ ] Add `Course` / `LearningResource` JSON-LD to topic landings
- [ ] `BreadcrumbList` schema for nested pages
- [ ] Add `og-image.png` (1200×630) to `public/` and reference in metadata
- [ ] Add favicons (`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`)

## Phase 3 — Past papers index (week 2)
- [ ] Make `/exams` publicly indexable as a hub page listing all years
- [ ] Per-year landing pages: `/exams/[year]/[paper]` (or migrated path)
- [ ] Each landing page: paper overview, topics covered, link to (gated) questions
- [ ] `Course` / `LearningResource` schema per page

## Phase 4 — Long-tail content (week 3–4)
- [ ] FAQ section on every topic landing page targeting PAA queries
- [ ] Glossary page: VCE maths terms with definitions (long-tail goldmine)
- [ ] Study guide page per topic (overview + tips + linked questions)
- [ ] "How to do X" tutorial pages for high-volume queries

## Phase 5 — Technical health (ongoing)
- [ ] Core Web Vitals audit + fixes (especially KaTeX-induced CLS)
- [ ] Internal linking pass: every topic page links to 3–5 related topics
- [ ] Add security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- [ ] Set up Google Search Console + verify ownership
- [ ] Set up Bing Webmaster Tools
- [ ] Submit sitemap to GSC
- [ ] Track first 50 queries in `seo/tracked-queries.json`

## Phase 6 — Brand evolution (week 4+)
- [ ] Decision: rebrand from "VCE Methods" to a multi-subject identity
- [ ] Migrate URL structure from `/topics/...` to `/vce/methods/topics/...` (with 301s)
- [ ] Plan namespace for upcoming subjects: `/vce/specialist`, `/vce/biology`, etc.
- [ ] Update all metadata, schema, and copy to be subject-agnostic where possible

---

## What stays human-only
- All product decisions (paywall placement, content gating, brand naming)
- All Stripe / payment / auth code
- Approving any URL migration before it ships
- Outreach to external sites (drafts only from the agent)
- Merging the SEO branch to `main`
