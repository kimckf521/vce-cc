# Grammar Audit Report — Australian English Pass

**Total files audited:** 30 in-scope files across `app/` and `components/`  
**Total files changed:** 2  
**Total individual word/phrase changes:** 4  
**Oxford-comma policy:** WITH Oxford comma (see rationale below)

---

## Summary

The copy across the ATAR Hero site is already largely written in Australian English. No American→Australian spelling conversions were required in user-facing prose (e.g., "organised", "practise", "personalise", "authorise", "prioritise", "licence", "enrolment" were all already correct). The four changes made are:

- **Three Oxford-comma additions** in `app/page.tsx` (three-item lists were missing the serial comma before the final conjunction).
- **One practise/practice fix** in `app/(app)/dashboard/page.tsx` ("Practice now" as an imperative button label should use the verb form "Practise now").

---

## Oxford-Comma Policy

**Policy chosen: WITH Oxford comma** (serial comma before the final "and"/"or" in three-or-more-item lists).

**Rationale:** The vast majority of three-item lists in the existing copy already used the Oxford comma — for example:

- `"organised by topic, step-by-step worked solutions, timed practice exams, and progress tracking"` (faqs/page.tsx)
- `"your name, email address, and a password hash"` (privacy/page.tsx)
- `"Scrape, copy, republish, redistribute, or resell"` (terms/page.tsx)
- `"Finding antiderivatives of polynomial, exponential, and trigonometric functions."` (topics/page.tsx)

The three instances without Oxford comma in `app/page.tsx` were clear outliers; adding the comma brings them into line with the rest of the codebase.

---

## Change Table

| File | Line | Before | After | Reason |
|---|---|---|---|---|
| `app/page.tsx` | 53 | `correct, incorrect or needs-review` | `correct, incorrect, or needs-review` | Oxford comma — three-item list missing serial comma before "or" |
| `app/page.tsx` | 61 | `Light, dark or system theme` | `Light, dark, or system theme` | Oxford comma — three-item list missing serial comma before "or" |
| `app/page.tsx` | 80 | `correct, incorrect and review` | `correct, incorrect, and review` | Oxford comma — three-item list missing serial comma before "and" |
| `app/(app)/dashboard/page.tsx` | 131 | `"Practice now"` | `"Practise now"` | practice/practise — button is an imperative verb phrase; Australian English uses "practise" for the verb form |

---

## Files Audited With No Changes Required

The following in-scope files were audited and required no changes. All American→Australian spelling checks, Oxford-comma checks, practice/practise checks, em-dash checks, and grammar checks passed.

| File | Status |
|---|---|
| `components/MarketingNav.tsx` | No changes needed |
| `components/MarketingFooter.tsx` | No changes needed |
| `components/ContactForm.tsx` | No changes needed |
| `app/login/page.tsx` | No changes needed |
| `app/signup/page.tsx` | No changes needed |
| `app/forgot-password/page.tsx` | No changes needed |
| `app/reset-password/page.tsx` | No changes needed |
| `app/pricing/page.tsx` | No changes needed |
| `app/faqs/page.tsx` | No changes needed |
| `app/privacy/page.tsx` | No changes needed |
| `app/terms/page.tsx` | No changes needed |
| `app/(app)/profile/page.tsx` | No changes needed |
| `app/(app)/topics/page.tsx` | No changes needed |
| `app/(app)/topics/[slug]/page.tsx` | No changes needed |
| `app/(app)/exams/page.tsx` | No changes needed |
| `app/(app)/exams/[id]/page.tsx` | No changes needed |
| `app/(app)/history/page.tsx` | No changes needed |
| `app/(app)/search/page.tsx` | No changes needed |
| `app/(app)/practice/page.tsx` | No changes needed |
| `app/(app)/practice/PracticeClient.tsx` | No changes needed |
| `app/(app)/practice/exam1/page.tsx` | No changes needed |
| `app/(app)/practice/exam2a/page.tsx` | No changes needed |
| `app/(app)/practice/exam2b/page.tsx` | No changes needed |
| `app/(app)/practice/exam2ab/page.tsx` | No changes needed |
| `app/(app)/practice/exam2ab/Exam2ABSetupForm.tsx` | No changes needed |
| `app/(app)/practice/layout.tsx` | No changes needed |
| `app/(app)/practice/session/page.tsx` | No changes needed |
| `app/(app)/practice/session/loading.tsx` | No changes needed |

---

## Items Skipped / Notes

- **`#organization` in JSON-LD `@id` URIs** (`app/privacy/page.tsx` and `app/terms/page.tsx`): The string `"https://www.atarhero.com.au/#organization"` is a schema.org structured-data identifier (a URL fragment, not prose). Changing it to `#organisation` would break the JSON-LD graph. Left as-is.
- **`color` properties in TypeScript data objects** (`app/(app)/history/page.tsx`): The `color: "brand"` etc. are code identifiers passed as props to control Tailwind class selection — not user-facing prose. Left as-is per the brief's instruction to leave code identifiers unchanged.
- **Straight apostrophes in JavaScript string literals** (e.g., `"You'll"`, `"We'll"`, `"It's"` inside `""` strings): These are inside JS/TS string values (not JSX text nodes). The brief explicitly excludes "code identifiers and JSX attribute strings". Converting straight apostrophes inside JS string literals would require escaping and goes beyond the scope of this audit.
- **`Start practice →`** (`app/(app)/practice/PracticeClient.tsx` line 159): Read as "start the practice [set]" — "practice" as noun here is correct. Not changed.
- **`Start Practice →`** (`app/(app)/practice/exam2ab/Exam2ABSetupForm.tsx`): Same reasoning — noun usage. Not changed.
- **Admin pages**: Excluded from scope per brief.
