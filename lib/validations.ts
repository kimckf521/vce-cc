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
  status: AttemptStatus.optional(),
  bookmarked: z.boolean().optional(),
});

// DELETE /api/attempts
export const deleteAttemptSchema = z.object({
  questionId: z.string().min(1),
});

// POST /api/user/update-name
export const updateNameSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name is too long"),
});

// POST /api/report
export const ReportCategory = z.enum([
  "BUG",
  "FEATURE_REQUEST",
  "CONTENT_ERROR",
  "ACCOUNT_BILLING",
  "OTHER",
]);

export const createReportSchema = z.object({
  category: ReportCategory,
  description: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters")
    .max(4000, "Description is too long (max 4000 characters)"),
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
  // Per-affiliate commission rate override (cents). 0–100000 = $0–$1000 per
  // referral. `null` clears the override and reverts to the per-track default.
  // Currently only enforced for influencer accounts (server-side check).
  commissionOverrideCents: z
    .union([z.coerce.number().int().min(0).max(100_000), z.null()])
    .optional(),
  // Custom referral code — only allowed for influencer accounts (enforced
  // server-side). Slug format: 3-40 chars of lowercase letters, numbers, hyphens.
  // Hyphens may not lead/trail or repeat.
  referralCode: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Code must be at least 3 characters")
    .max(40, "Code must be at most 40 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and single hyphens (no leading/trailing/double hyphens)"
    )
    .optional(),
});

// POST /api/admin/affiliates/[id]/contracts
export const createContractSchema = z.object({
  platform: z.string().trim().min(1).max(50),
  // Optional — older flow captured channel handle; newer simplified form
  // relies on the video URL alone.
  platformHandle: z.string().trim().max(200).optional(),
  followerCount: z.coerce.number().int().min(0).optional(),
  contentFee: z.coerce.number().int().min(0),
  // Renamed conceptually to "post date" but keeps the contentDeadline column
  // since it still represents the content's publish date.
  contentDeadline: z.string().datetime().optional(),
  // The published video URL — set at contract creation time in the new flow.
  contentUrl: z.string().trim().url().optional(),
  notes: z.string().max(2000).optional(),
});

// PATCH /api/admin/affiliates/[id]/contracts/[contractId]
export const updateContractSchema = z.object({
  contentUrl: z.string().url().optional(),
  contentVerified: z.boolean().optional(),
  feePaid: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  // View count — manually entered by admins. Capped at 1B as a sanity check.
  views: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
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

// POST /api/admin/affiliates/[id]/attribute-referral — retroactive attribution
// Accepts either a user ID or email to identify the referred user.
export const attributeReferralSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "Either userId or email is required",
  });

// =====================================================
// Teacher assessment builder (/api/teacher/**)
// =====================================================

// Enums matching Prisma schema (teacher routes)
export const AssessmentStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const QuestionSetItemType = z.enum([
  "MCQ",
  "SHORT_ANSWER",
  "EXTENDED_ANSWER",
  "EXTENDED_RESPONSE",
]);
export const Tech = z.enum(["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED"]);

/**
 * Canonical role list for role-change / user-creation validation. Inline
 * z.enum role lists (e.g. app/api/admin/users/route.ts) must stay in sync —
 * prefer importing this one.
 */
export const Role = z.enum([
  "STUDENT",
  "TEACHER",
  "TUTOR",
  "INFLUENCER",
  "ADMIN",
  "SUPER_ADMIN",
]);

// Builder settings snapshot — stored verbatim on Assessment.settings.
// difficulty values are percents that must sum to exactly 100.
export const assessmentSettingsSchema = z.object({
  topicIds: z.array(z.string().min(1)).max(50).optional(),
  difficulty: z
    .object({
      easy: z.number().int().min(0).max(100),
      medium: z.number().int().min(0).max(100),
      hard: z.number().int().min(0).max(100),
    })
    .refine((d) => d.easy + d.medium + d.hard === 100, {
      message: "Difficulty percentages must sum to 100",
    })
    .optional(),
  tech: z.enum(["TECH_FREE", "ANY"]).optional(),
  targetMarks: z.number().int().min(1).max(300).optional(),
  questionCount: z.number().int().min(1).max(100).optional(),
});

// POST /api/teacher/assessments
export const createAssessmentSchema = z.object({
  subjectSlug: z.string().trim().min(1),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  autoAssemble: z.boolean().optional().default(false),
  settings: assessmentSettingsSchema.optional(),
});

// PATCH /api/teacher/assessments/[id]
export const updateAssessmentSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: AssessmentStatus.optional(),
});

// POST /api/teacher/assessments/[id]/items
export const addAssessmentItemSchema = z.object({
  questionSetItemId: z.string().min(1),
  position: z.number().int().min(0).optional(),
});

// POST /api/teacher/assessments/[id]/reorder — must be a complete
// permutation of the paper's current item ids (checked server-side).
export const reorderAssessmentSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1).max(200),
});

// GET /api/teacher/question-pool (query params). `tech=ANY` means "no tech
// filter" (mirrors the builder settings); a concrete Tech value filters to
// exactly that tag.
export const teacherPoolQuerySchema = z.object({
  subjectSlug: z.string().trim().min(1),
  topicId: z.string().trim().min(1).optional(),
  difficulty: Difficulty.optional(),
  type: QuestionSetItemType.optional(),
  tech: z.enum(["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED", "ANY"]).optional(),
  q: z.string().trim().max(200).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// POST /api/admin/users/[id]/credit — super-admin adjusts platform credit.
// Amount is in dollars (form-friendly); converted to cents server-side.
// Positive = add credit; negative = deduct credit (clawback). Range chosen
// to be wide enough for normal use but reject obvious typos.
export const giveCreditSchema = z
  .object({
    amountDollars: z.coerce.number().min(-1000).max(1000),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((d) => Math.abs(d.amountDollars) >= 0.5, {
    message: "Amount must be at least $0.50 (positive or negative)",
    path: ["amountDollars"],
  });

// POST /api/teachers/apply — self-serve teacher/tutor account application.
// VIT registration numbers are numeric; exact length isn't published, so the
// range is kept deliberately loose (the admin cross-checks the register
// anyway). ABN is the standard 11 digits, optional and tutor-only in the UI.
export const teacherApplySchema = z
  .object({
    applicantType: z.enum(["SCHOOL_TEACHER", "PRIVATE_TUTOR"]),
    fullName: z.string().trim().min(2).max(100),
    schoolName: z.string().trim().min(2).max(150).optional(),
    schoolEmail: z.string().trim().toLowerCase().email().max(200),
    vitNumber: z
      .string()
      .trim()
      .regex(/^\d{3,10}$/, "VIT registration number should be numeric"),
    abn: z
      .string()
      .trim()
      .regex(/^\d{11}$/, "ABN must be 11 digits")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine((d) => d.applicantType !== "SCHOOL_TEACHER" || !!d.schoolName, {
    message: "School name is required for school teachers",
    path: ["schoolName"],
  });

// PATCH /api/admin/teacher-applications/[id] — admin review decision.
export const teacherReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().max(300).optional(),
});
