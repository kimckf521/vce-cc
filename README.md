# VCE Mathematical Methods Revision Hub

A full-stack revision platform for VCE Mathematical Methods students, built with Next.js 14, Supabase Auth, and Prisma/PostgreSQL. Features past exam questions with worked solutions, timed practice exams, progress tracking, and search.

## Prerequisites

- Node.js 18+
- PostgreSQL database (via [Supabase](https://supabase.com))
- Anthropic API key (for PDF extraction scripts only)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
DATABASE_URL=              # Prisma connection (pooled, e.g. Supabase connection pooler)
DIRECT_URL=                # Direct Postgres connection (for migrations)
NEXT_PUBLIC_SUPABASE_URL=  # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY= # Supabase service role key (for scripts only)
ANTHROPIC_API_KEY=         # Anthropic API key (for extraction scripts only)
```

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Database

The project uses Prisma ORM with PostgreSQL (hosted on Supabase).

```bash
npm run db:push       # Push schema changes to database
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:studio     # Open Prisma Studio (visual DB browser)
```

### Key Models

- **Topic** / **Subtopic** -- VCE curriculum areas (4 topics, ~40 subtopics)
- **Exam** -- Past papers identified by year + type (EXAM_1 or EXAM_2)
- **Question** -- Individual questions/parts with content, marks, difficulty
- **Solution** -- Worked solutions with LaTeX content, optional video URLs
- **Attempt** -- Per-user progress tracking (correct/incorrect/needs review)
- **ExamSession** -- Completed practice exam results with scores and timing
- **User** -- Synced from Supabase Auth, with STUDENT or ADMIN role

## Content Pipeline

Questions and solutions are extracted from VCAA exam PDFs using Claude, then seeded into the database. See [scripts/PIPELINE.md](scripts/PIPELINE.md) for the full workflow.

### Quick Reference

```bash
# Extract questions from a PDF
npm run extract -- --pdf ./exams/2024-exam1.pdf --year 2024 --exam 1

# Extract from a folder of PDFs
npm run extract -- --folder ./exams

# Seed extracted questions into database
npm run seed                           # all files in scripts/output/
npm run seed -- --file 2024-EXAM_1     # single file
npm run seed -- --dry-run              # preview only

# Extract solutions from solution PDFs
npm run extract-solutions -- --file 2024-mm1-sol.pdf
npm run extract-solutions -- --folder ./exams/solutions

# Seed solutions into database
npm run seed-solutions                                # all
npm run seed-solutions -- --file 2024-EXAM_1-solutions

# Upload solution PDFs to Supabase Storage
npm run upload-solutions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
app/
  (app)/              # Authenticated routes (dashboard, topics, practice, etc.)
  api/                # API routes (attempts, practice, search, admin, etc.)
components/           # React components (QuestionGroup, SolutionModal, etc.)
hooks/                # Custom hooks (useAutoSave, useSessionRefresh, etc.)
lib/                  # Shared utilities (prisma, supabase, validations, configs)
prisma/
  schema.prisma       # Database schema
scripts/              # PDF extraction and seeding pipeline
tests/                # Vitest test suites (unit, e2e, api)
```

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Auth**: Supabase Auth (email/password)
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS
- **Math Rendering**: KaTeX
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library
- **AI Extraction**: Anthropic Claude API (scripts only)
