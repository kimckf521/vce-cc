# CLAUDE.md — Project Context for AI-Assisted Development

## What This Project Is

A VCE Mathematical Methods revision hub for Australian Year 12 students. It provides past exam questions (2016-present) with worked solutions, timed practice exams, and progress tracking.

## Architecture

- **Next.js 14 App Router** with Server Components by default; Client Components marked with `"use client"`.
- **Supabase Auth** for email/password authentication. Middleware refreshes sessions on every request. The `(app)/` route group requires auth — `layout.tsx` redirects to `/login` if unauthenticated.
- **Prisma ORM** with PostgreSQL (Supabase-hosted). The `prisma` singleton is in `lib/prisma.ts`.
- **Tailwind CSS** with a custom `brand` color scale. Responsive: mobile-first with `lg:` breakpoints.

## Key Conventions

### Question Grouping
Questions have two shapes:
- **MCQ (part=null)**: Standalone questions, one per card.
- **Section B (part≠null)**: Grouped by `(examId, questionNumber)` into multi-part cards.

This grouping logic lives in `lib/question-counts.ts` (counting) and `lib/question-groups.ts` (fetching/grouping for display). Both files are authoritative — don't duplicate this logic.

### Topic Configuration
Four VCE topics are defined in two places that must stay in sync:
- `lib/topics-config.ts` — Static IDs/names/slugs for client use (avoids DB calls at build time).
- `lib/utils.ts` — `VCE_TOPICS` array used by seeding scripts.

Both files have cross-reference comments.

### Exam Configuration
All exam timing, question counts, and descriptions are centralized in `lib/exam-config.ts`. Don't hardcode exam parameters elsewhere.

### Validation
All API input validation uses Zod schemas from `lib/validations.ts`. Every API route has rate limiting via `lib/rate-limit.ts`.

### Admin Role
Admin-only routes check `dbUser.role === "ADMIN"` after Supabase auth. The admin flag flows through the layout (`isAdmin` prop on Navbar) and into components like `QuestionGroup` → `SolutionModal` for inline editing.

## File Patterns

- **API routes**: `app/api/*/route.ts` — always validate with Zod, rate limit, check auth.
- **Server Actions**: `app/(app)/topics/[slug]/actions.ts` — used for infinite scroll loading.
- **Shared hooks**: `hooks/` — `useAutoSave` (localStorage), `useSessionRefresh` (silent token refresh).
- **Shared libs**: `lib/` — no component code here, only utilities and config.
- **Tests**: `tests/unit/`, `tests/e2e/`, `tests/api/` — run with `npm test` (Vitest).

## Content Pipeline

PDF exam papers are processed through a Claude-powered extraction pipeline:
1. `npm run extract` — PDF → Claude API → JSON (questions)
2. `npm run seed` — JSON → Prisma → PostgreSQL
3. `npm run extract-solutions` — Solution PDF → Claude API → JSON
4. `npm run seed-solutions` — JSON → Prisma (matched by year/exam/question/part)

Output JSON files live in `scripts/output/`. See `scripts/PIPELINE.md` for details.

## Things to Watch Out For

- **`.next` cache corruption**: Running `next build` while the dev server is active corrupts the cache. Always stop the dev server first, or `rm -rf .next` to recover.
- **Prisma client regeneration**: After changing `schema.prisma`, run `npx prisma generate` before building. The `postinstall` script handles this for fresh installs.
- **Topic name mismatches**: The DB topic names changed from short names ("Calculus") to full VCE names ("Calculus" stayed, but others like "Algebra, Number, and Structure" are different from what extraction scripts produce). The seeding scripts handle mapping.
- **MCQ answer format**: Solutions use either `**Answer: X**` or `The correct answer is **X**` format (A-E). The `parseMCQAnswer` function in `QuestionGroup.tsx` handles both patterns.

## Running Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build (stop dev server first!)
npm test             # Run all tests
npm run db:push      # Apply schema changes
npm run db:studio    # Visual DB browser
```
