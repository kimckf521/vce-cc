# SEO Playbook — VCE Methods

> Living document. The SEO agent maintains it. Humans should be able to read this and understand "how we do SEO here."

## Brand voice
- Australian English everywhere. Maths, optimise, organise, behaviour, centre, practise (verb) / practice (noun), Year 12 (not "grade 12"), AUD (not USD).
- Tone: confident, calm, student-focused. No hype, no fear-marketing about exams. Acknowledge stress without amplifying it.
- Always say *"not affiliated with VCAA"*.

## Audience model
- Primary persona: Year 12 student in Victoria, mostly on mobile, searching late at night with high-stakes intent
- Secondary: Year 11 students starting to think about Year 12
- Tertiary: parents and teachers
- Long-term: students from other Australian states (NSW HSC, QLD QCE, WA WACE, SA SACE)

## Search intents we serve (in priority order)
1. **Specific past exam question** — "vcaa methods 2019 exam 2 question 4"
2. **Topic explanation** — "derivative rules vce methods", "binomial distribution year 12"
3. **Study planning** — "how to study for methods", "methods study score calculator"
4. **Resource discovery** — "best vce methods practice site", "free methods past papers"
5. **Comparison / brand** — "atarnotes vs ...", "edrolo alternatives"

## URL structure (target — not yet implemented)
```
/                                    Homepage
/vce/methods/                        Methods landing
/vce/methods/topics/                 Topic index
/vce/methods/topics/calculus/        Topic landing
/vce/methods/topics/calculus/derivatives/  Subtopic landing
/vce/methods/exams/                  Exam index
/vce/methods/exams/2024/exam-1/      Per-exam page
/vce/methods/exams/2024/exam-1/q5/   Per-question page
/vce/specialist/                     (future) Specialist landing
```

Current structure uses `/topics/...` and `/exams/...` which couples the URL space to Methods. **Migrating now** while the site is small is much cheaper than later.

## Title-tag pattern
`{specific topic} | VCE Methods` (≤ 60 chars)
- Homepage: `VCE Methods — Past Exam Questions, Worked Solutions & Practice`
- Topic landing: `{Topic Name} — VCE Methods Practice & Past Questions | VCE Methods`
- Exam landing: `VCAA Methods {Year} Exam {N} — Worked Solutions | VCE Methods`
- FAQ: `{Question} | VCE Methods FAQ`

## Meta description pattern
- 140–160 characters
- Lead with the user's intent (what they get)
- Mention "VCAA past exam" or "Year 12 Maths Methods" early
- End with a soft CTA: "Practise free →"

## Internal linking rules
- Every topic page links to its 3 nearest sibling topics (e.g. Calculus → Functions, Algebra)
- Every exam page links to the same year's other exam paper
- Every question page links back to its topic + exam
- Footer has links to: pricing, FAQ, all topics, all exams

## Structured data we ship
- `Organization` + `WebSite` (root layout, every page)
- `EducationalOrganization` (root layout)
- `BreadcrumbList` (any nested page)
- `Course` (topic landings)
- `LearningResource` (per-topic, per-exam)
- `FAQPage` (pricing, future FAQ pages)
- `Quiz` / `Question` (per-question pages, when public)

## Off-page (when we get there)
- r/vce on Reddit — answer questions, link sparingly when relevant
- AU teacher blogs and mailing lists — guest posts on study technique
- Shareable tools (study score calculator, exam countdown widget) → backlink magnets
- VCAA-adjacent communities (Discord servers, Facebook groups)
- Outreach drafts always go to `seo/drafts/` and require human approval before sending

## Things we don't do
- Buy backlinks
- Generate AI filler content
- Stuff keywords
- Mock VCAA branding
- Reproduce copyrighted exam content verbatim
- Auto-publish anything outreach-related
- Touch auth, middleware, payment, or database code
