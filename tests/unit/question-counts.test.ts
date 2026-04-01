import { describe, it, expect } from "vitest";
import { computeGroupCount, computeAttemptedGroups } from "@/lib/question-counts";

describe("computeGroupCount", () => {
  it("counts MCQ-only questions (part=null) as individual groups", () => {
    const questions = [
      { examId: "e1", questionNumber: 1, part: null },
      { examId: "e1", questionNumber: 2, part: null },
      { examId: "e1", questionNumber: 3, part: null },
    ];
    expect(computeGroupCount(questions)).toBe(3);
  });

  it("deduplicates Section B questions by (examId, questionNumber)", () => {
    const questions = [
      { examId: "e2", questionNumber: 1, part: "a" },
      { examId: "e2", questionNumber: 1, part: "b" },
      { examId: "e2", questionNumber: 1, part: "c" },
    ];
    // 3 parts → 1 group
    expect(computeGroupCount(questions)).toBe(1);
  });

  it("handles mixed MCQ and Section B questions", () => {
    const questions = [
      { examId: "e1", questionNumber: 1, part: null },
      { examId: "e1", questionNumber: 2, part: null },
      { examId: "e2", questionNumber: 3, part: "a" },
      { examId: "e2", questionNumber: 3, part: "b" },
      { examId: "e2", questionNumber: 4, part: "a" },
      { examId: "e2", questionNumber: 4, part: "b" },
    ];
    // 2 MCQs + 2 Section B groups = 4
    expect(computeGroupCount(questions)).toBe(4);
  });

  it("returns 0 for empty array", () => {
    expect(computeGroupCount([])).toBe(0);
  });

  it("treats same questionNumber but different examId as separate groups", () => {
    const questions = [
      { examId: "e1", questionNumber: 1, part: "a" },
      { examId: "e2", questionNumber: 1, part: "a" },
    ];
    expect(computeGroupCount(questions)).toBe(2);
  });
});

describe("computeAttemptedGroups", () => {
  it("counts attempted MCQs individually", () => {
    const questions = [
      { examId: "e1", questionNumber: 1, part: null, attempts: [{ status: "CORRECT" }] },
      { examId: "e1", questionNumber: 2, part: null, attempts: [{ status: "INCORRECT" }] },
      { examId: "e1", questionNumber: 3, part: null, attempts: [] },
    ];
    const result = computeAttemptedGroups(questions);
    expect(result.attempted).toBe(2);
    expect(result.correct).toBe(1);
  });

  it("counts Section B group as attempted if any part has an attempt", () => {
    const questions = [
      { examId: "e2", questionNumber: 1, part: "a", attempts: [{ status: "CORRECT" }] },
      { examId: "e2", questionNumber: 1, part: "b", attempts: [] },
      { examId: "e2", questionNumber: 1, part: "c", attempts: [] },
    ];
    const result = computeAttemptedGroups(questions);
    expect(result.attempted).toBe(1);
    expect(result.correct).toBe(1);
  });

  it("counts Section B group as correct if any part has CORRECT status", () => {
    const questions = [
      { examId: "e2", questionNumber: 1, part: "a", attempts: [{ status: "INCORRECT" }] },
      { examId: "e2", questionNumber: 1, part: "b", attempts: [{ status: "CORRECT" }] },
    ];
    const result = computeAttemptedGroups(questions);
    expect(result.attempted).toBe(1);
    expect(result.correct).toBe(1);
  });

  it("returns zeros for empty array", () => {
    const result = computeAttemptedGroups([]);
    expect(result.attempted).toBe(0);
    expect(result.correct).toBe(0);
  });

  it("returns zeros when no questions have attempts", () => {
    const questions = [
      { examId: "e1", questionNumber: 1, part: null, attempts: [] },
      { examId: "e2", questionNumber: 2, part: "a", attempts: [] },
    ];
    const result = computeAttemptedGroups(questions);
    expect(result.attempted).toBe(0);
    expect(result.correct).toBe(0);
  });

  it("handles multiple Section B groups correctly", () => {
    const questions = [
      { examId: "e2", questionNumber: 1, part: "a", attempts: [{ status: "CORRECT" }] },
      { examId: "e2", questionNumber: 1, part: "b", attempts: [{ status: "CORRECT" }] },
      { examId: "e2", questionNumber: 2, part: "a", attempts: [{ status: "INCORRECT" }] },
      { examId: "e2", questionNumber: 2, part: "b", attempts: [{ status: "INCORRECT" }] },
      { examId: "e2", questionNumber: 3, part: "a", attempts: [] },
    ];
    const result = computeAttemptedGroups(questions);
    expect(result.attempted).toBe(2); // groups 1 and 2
    expect(result.correct).toBe(1); // only group 1
  });
});
