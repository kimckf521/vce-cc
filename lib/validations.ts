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

// =====================================================
// Affiliate Program
// =====================================================

export const AffiliateType = z.enum([
  "STUDENT_REFERRAL",
  "TUTOR_AFFILIATE",
  "INFLUENCER_AFFILIATE",
]);

// POST /api/auth/sync-user — accepts an optional referral code
export const syncUserSchema = z.object({
  referralCode: z.string().trim().min(1).max(60).optional(),
});

// POST /api/affiliates/register
export const registerAffiliateSchema = z
  .object({
    type: AffiliateType,
    abn: z.string().trim().regex(/^\d{11}$/, "ABN must be 11 digits").optional(),
    platform: z.string().trim().max(50).optional(),
    platformHandle: z.string().trim().max(200).optional(),
    followerCount: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) => data.type === "STUDENT_REFERRAL" || !!data.abn,
    { message: "ABN is required for tutors and influencers", path: ["abn"] }
  )
  .refine(
    (data) => data.type !== "INFLUENCER_AFFILIATE" || (!!data.platform && !!data.platformHandle),
    { message: "Platform and handle are required for influencers", path: ["platform"] }
  );

// POST /api/affiliates/payouts — request a payout
export const requestPayoutSchema = z.object({
  amount: z.coerce.number().int().min(2000, "Minimum payout is $20"),
});

// PATCH /api/admin/affiliates/[id]
export const updateAffiliateSchema = z.object({
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
  creditAdjustment: z.coerce.number().int().optional(), // Cents — positive or negative
  notes: z.string().max(2000).optional(),
});

// POST /api/admin/affiliates/[id]/contracts
export const createContractSchema = z.object({
  platform: z.string().trim().min(1).max(50),
  platformHandle: z.string().trim().min(1).max(200),
  followerCount: z.coerce.number().int().min(0).optional(),
  contentFee: z.coerce.number().int().min(0),
  contentDeadline: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

// PATCH /api/admin/affiliates/[id]/contracts/[contractId]
export const updateContractSchema = z.object({
  contentUrl: z.string().url().optional(),
  contentVerified: z.boolean().optional(),
  feePaid: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

// PATCH /api/admin/affiliates/payouts/[id]
export const updatePayoutSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  reference: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

// POST /api/admin/affiliates/[id]/mark-converted — manual override
export const markConvertedSchema = z.object({
  referralId: z.string().min(1),
});
