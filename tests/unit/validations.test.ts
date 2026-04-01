import { describe, it, expect } from "vitest";
import {
  createExamSchema,
  createQuestionSchema,
  practiceQuerySchema,
  createAttemptSchema,
  deleteAttemptSchema,
  updateNameSchema,
} from "@/lib/validations";

describe("createExamSchema", () => {
  it("accepts valid exam data", () => {
    const result = createExamSchema.safeParse({ year: 2024, examType: "EXAM_1" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid exam type", () => {
    const result = createExamSchema.safeParse({ year: 2024, examType: "EXAM_3" });
    expect(result.success).toBe(false);
  });

  it("rejects year below 2000", () => {
    const result = createExamSchema.safeParse({ year: 1999, examType: "EXAM_1" });
    expect(result.success).toBe(false);
  });

  it("rejects year above 2100", () => {
    const result = createExamSchema.safeParse({ year: 2101, examType: "EXAM_1" });
    expect(result.success).toBe(false);
  });

  it("coerces string year to number", () => {
    const result = createExamSchema.safeParse({ year: "2024", examType: "EXAM_2" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.year).toBe(2024);
  });

  it("accepts optional PDF and answer URLs", () => {
    const result = createExamSchema.safeParse({
      year: 2024,
      examType: "EXAM_1",
      pdfUrl: "https://example.com/exam.pdf",
      answerUrl: "https://example.com/answers.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URLs", () => {
    const result = createExamSchema.safeParse({
      year: 2024,
      examType: "EXAM_1",
      pdfUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("createQuestionSchema", () => {
  const validQuestion = {
    examId: "exam123",
    topicId: "topic456",
    questionNumber: 1,
    marks: 3,
    content: "What is 2+2?",
  };

  it("accepts valid question with defaults", () => {
    const result = createQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.difficulty).toBe("MEDIUM"); // default
      expect(result.data.subtopicIds).toEqual([]); // default
    }
  });

  it("accepts question with all optional fields", () => {
    const result = createQuestionSchema.safeParse({
      ...validQuestion,
      part: "a",
      difficulty: "HARD",
      subtopicIds: ["sub1"],
      imageUrl: "https://example.com/img.png",
      solution: {
        content: "The answer is 4",
        videoUrl: "https://example.com/video",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = createQuestionSchema.safeParse({ ...validQuestion, content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects marks over 20", () => {
    const result = createQuestionSchema.safeParse({ ...validQuestion, marks: 21 });
    expect(result.success).toBe(false);
  });

  it("rejects marks of 0", () => {
    const result = createQuestionSchema.safeParse({ ...validQuestion, marks: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid difficulty", () => {
    const result = createQuestionSchema.safeParse({ ...validQuestion, difficulty: "IMPOSSIBLE" });
    expect(result.success).toBe(false);
  });
});

describe("practiceQuerySchema", () => {
  it("uses defaults when no params provided", () => {
    const result = practiceQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(10);
    }
  });

  it("accepts valid count", () => {
    const result = practiceQuerySchema.safeParse({ count: "20" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.count).toBe(20);
  });

  it("rejects count over 100", () => {
    const result = practiceQuerySchema.safeParse({ count: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects count of 0", () => {
    const result = practiceQuerySchema.safeParse({ count: "0" });
    expect(result.success).toBe(false);
  });

  it("accepts valid difficulty filter", () => {
    expect(practiceQuerySchema.safeParse({ difficulty: "EASY" }).success).toBe(true);
    expect(practiceQuerySchema.safeParse({ difficulty: "ALL" }).success).toBe(true);
  });

  it("rejects invalid difficulty", () => {
    expect(practiceQuerySchema.safeParse({ difficulty: "SUPER_HARD" }).success).toBe(false);
  });

  it("accepts weak area flag", () => {
    const result = practiceQuerySchema.safeParse({ weak: "1" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.weak).toBe("1");
  });
});

describe("createAttemptSchema", () => {
  it("accepts valid attempt", () => {
    const result = createAttemptSchema.safeParse({ questionId: "q1", status: "CORRECT" });
    expect(result.success).toBe(true);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["ATTEMPTED", "CORRECT", "INCORRECT", "NEEDS_REVIEW"]) {
      expect(createAttemptSchema.safeParse({ questionId: "q1", status }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(createAttemptSchema.safeParse({ questionId: "q1", status: "PERFECT" }).success).toBe(false);
  });

  it("rejects empty questionId", () => {
    expect(createAttemptSchema.safeParse({ questionId: "", status: "CORRECT" }).success).toBe(false);
  });
});

describe("deleteAttemptSchema", () => {
  it("accepts valid questionId", () => {
    expect(deleteAttemptSchema.safeParse({ questionId: "q1" }).success).toBe(true);
  });

  it("rejects empty questionId", () => {
    expect(deleteAttemptSchema.safeParse({ questionId: "" }).success).toBe(false);
  });
});

describe("updateNameSchema", () => {
  it("accepts valid name", () => {
    const result = updateNameSchema.safeParse({ name: "John" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = updateNameSchema.safeParse({ name: "  Kim  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Kim");
  });

  it("rejects whitespace-only name", () => {
    const result = updateNameSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = updateNameSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts name of exactly 100 characters", () => {
    const result = updateNameSchema.safeParse({ name: "A".repeat(100) });
    expect(result.success).toBe(true);
  });
});
