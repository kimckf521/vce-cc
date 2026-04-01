import { describe, it, expect } from "vitest";
import { parseMCQAnswer } from "@/components/QuestionGroup";

describe("parseMCQAnswer", () => {
  it("extracts answer letter from solution content", () => {
    expect(parseMCQAnswer("**Answer: B**\nThe answer is B because...")).toBe("B");
  });

  it("handles all valid answer letters A-E", () => {
    expect(parseMCQAnswer("**Answer: A**")).toBe("A");
    expect(parseMCQAnswer("**Answer: C**")).toBe("C");
    expect(parseMCQAnswer("**Answer: D**")).toBe("D");
    expect(parseMCQAnswer("**Answer: E**")).toBe("E");
  });

  it("returns null for non-MCQ solution content", () => {
    expect(parseMCQAnswer("The solution involves substituting x=2...")).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(parseMCQAnswer(null)).toBeNull();
    expect(parseMCQAnswer(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseMCQAnswer("")).toBeNull();
  });

  it("handles answer with surrounding content", () => {
    const content = "First we compute the derivative.\n**Answer: C**\nBecause f'(x) = 2x...";
    expect(parseMCQAnswer(content)).toBe("C");
  });
});
