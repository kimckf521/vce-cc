# PDF Extraction Pipeline

This documents the full workflow for getting VCE exam content from PDF papers into the database.

## Overview

```
 VCAA Exam PDF                    Solution PDF
      │                                │
      ▼                                ▼
 extract-questions.ts            extract-solutions.ts
 (Claude API vision)             (Claude API vision)
      │                                │
      ▼                                ▼
 scripts/output/                 scripts/output/
 {year}-{EXAM_TYPE}.json         {year}-{EXAM_TYPE}-solutions.json
      │                                │
      ▼                                ▼
 seed-questions.ts               seed-solutions.ts
 (Prisma → PostgreSQL)           (matched by year/exam/qNum/part)
                                       │
                                       ▼
                                 upload-solutions.ts
                                 (PDFs → Supabase Storage)
```

## Step 1: Extract Questions

Sends exam PDFs to Claude's vision API, which returns structured JSON for every question.

```bash
# Single PDF
npm run extract -- --pdf ./exams/2024-exam1.pdf --year 2024 --exam 1

# All PDFs in a folder
npm run extract -- --folder ./exams
```

**Input**: PDF files. Naming convention: `{year}-exam{1|2}.pdf`

**Output**: `scripts/output/{year}-EXAM_{1|2}.json`

```json
{
  "year": 2024,
  "examType": "EXAM_1",
  "questions": [
    {
      "questionNumber": 1,
      "part": null,
      "marks": 2,
      "content": "Find $f'(x)$ where $f(x) = x^3 - 2x$.",
      "topic": "Calculus",
      "subtopic": "Differentiation",
      "difficulty": "EASY",
      "imageDescription": null
    }
  ]
}
```

**Notes**:
- Math uses LaTeX: inline `$...$`, display `$$...$$`
- MCQs (Exam 2 Section A) use `**A.**`, `**B.**` etc. format for options
- Claude assigns topic, subtopic, and difficulty estimates
- Parts are `"a"`, `"b"`, `"c"` or `null` for standalone questions

## Step 2: Seed Questions

Reads the extracted JSON and creates Topic, Subtopic, Exam, and Question records in the database.

```bash
# Seed everything in scripts/output/
npm run seed

# Single file
npm run seed -- --file 2024-EXAM_1

# Preview without writing
npm run seed -- --dry-run
```

**Behaviour**:
- Creates Topics and Subtopics if they don't exist (with slugs and ordering)
- Creates Exams with `@@unique([year, examType])` — skips if already exists
- Creates Questions linked to the exam and topic
- Links questions to subtopics via the many-to-many relation

## Step 3: Extract Solutions

Same approach as question extraction but for solution/answer PDFs.

```bash
# Single file
npm run extract-solutions -- --file 2024-mm1-sol.pdf

# All solution PDFs
npm run extract-solutions -- --folder ./exams/solutions
```

**Input**: Solution PDFs. Naming: `{year}-mm{1|2}-sol.pdf`

**Output**: `scripts/output/{year}-EXAM_{1|2}-solutions.json`

```json
{
  "year": 2024,
  "examType": "EXAM_1",
  "solutions": [
    {
      "questionNumber": 1,
      "part": null,
      "content": "**Step 1** *(1 mark)*\n\nApply the power rule:\n\n$$f'(x) = 3x^2 - 2$$"
    }
  ]
}
```

**Notes**:
- Solutions use step-by-step format with mark annotations
- Each step/equation is on its own paragraph (blank-line separated)
- For MCQs, solutions use `**Answer: B**` format followed by explanation

## Step 4: Seed Solutions

Matches extracted solutions to existing questions by `(year, examType, questionNumber, part)` and creates Solution records.

```bash
# All solution files
npm run seed-solutions

# Single file
npm run seed-solutions -- --file 2024-EXAM_1-solutions

# Preview
npm run seed-solutions -- --dry-run
```

## Step 5: Upload Solution PDFs (Optional)

Uploads the original solution PDF files to Supabase Storage and links them to the Exam record via `answerUrl`.

```bash
npm run upload-solutions
npm run upload-solutions -- --file 2024-mm1-sol.pdf
```

## Fix Scripts

Several one-off fix scripts exist in `scripts/` for correcting data issues after extraction:

| Script | Purpose |
|--------|---------|
| `fix-image-urls.ts` | Correct image URL references |
| `fix-q8.ts` | Fix specific question content |
| `fix-q8-preamble.ts` | Fix shared preamble extraction |
| `fix-q8-graph.ts` | Fix graph configuration |
| `fix-q3a-ranges.ts` | Fix domain/range specifications |
| `fix-q3a-solution-graph.ts` | Fix solution graph config |
| `migrate-topics.ts` | Migrate topic names to new VCE naming |
| `create-buckets.ts` | Create Supabase Storage buckets |

These are run ad-hoc with `tsx --env-file=.env.local scripts/<name>.ts`.

## Adding a New Year's Exam

1. Place exam PDF in `./exams/` (e.g. `2025-exam1.pdf`)
2. Place solution PDF in `./exams/solutions/` (e.g. `2025-mm1-sol.pdf`)
3. Extract: `npm run extract -- --pdf ./exams/2025-exam1.pdf --year 2025 --exam 1`
4. Review JSON in `scripts/output/2025-EXAM_1.json` — fix any extraction errors
5. Seed: `npm run seed -- --file 2025-EXAM_1`
6. Extract solutions: `npm run extract-solutions -- --file 2025-mm1-sol.pdf`
7. Review and seed: `npm run seed-solutions -- --file 2025-EXAM_1-solutions`
8. Upload PDF: `npm run upload-solutions -- --file 2025-mm1-sol.pdf`
9. Repeat for Exam 2
