import { z } from "zod";

// Enums matching Prisma schema
export const ExamType = z.enum(["EXAM_1", "EXAM_2"]);
export const Difficulty = z.enum(["EASY", "MEDIUM", "HARD"]);
export const AttemptStatus = z.enum(["ATTEMPTED", "CORRECT", "INCORRECT", "NEEDS_REVIEW"]);

// POST /api/admin/exams
export const createExamSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  examType: ExamType,
  pdfUrl: z.string().url().nullish(),
  answerUrl: z.string().url().nullish(),
});

// POST /api/admin/questions
export const createQuestionSchema = z.object({
  examId: z.string().min(1),
  topicId: z.string().min(1),
  subtopicIds: z.array(z.string().min(1)).optional().default([]),
  questionNumber: z.coerce.number().int().min(1),
  part: z.string().nullish(),
  marks: z.coerce.number().int().min(1).max(20),
  content: z.string().min(1),
  imageUrl: z.string().url().nullish(),
  difficulty: Difficulty.default("MEDIUM"),
  solution: z
    .object({
      content: z.string().min(1),
      imageUrl: z.string().url().nullish(),
      videoUrl: z.string().url().nullish(),
    })
    .nullish(),
});

// GET /api/practice (query params)
export const practiceQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(100).default(10),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ALL"]).nullish(),
  topics: z.string().optional(),
  weak: z.enum(["0", "1"]).optional(),
});

// POST /api/attempts
export const createAttemptSchema = z.object({
  questionId: z.string().min(1),
  status: AttemptStatus,
});

// DELETE /api/attempts
export const deleteAttemptSchema = z.object({
  questionId: z.string().min(1),
});

// POST /api/user/update-name
export const updateNameSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name is too long"),
});
