import { describe, it, expect } from "vitest";
import { EXAM_CONFIG, getExamQuestionCount, type ExamMode } from "@/lib/exam-config";

describe("EXAM_CONFIG", () => {
  it("has configuration for all four exam modes", () => {
    expect(EXAM_CONFIG.exam1).toBeDefined();
    expect(EXAM_CONFIG.exam2a).toBeDefined();
    expect(EXAM_CONFIG.exam2b).toBeDefined();
    expect(EXAM_CONFIG.exam2ab).toBeDefined();
  });

  it("exam1 has correct base settings", () => {
    const cfg = EXAM_CONFIG.exam1;
    expect(cfg.calculatorAllowed).toBe(false);
    expect(cfg.readingSeconds).toBe(15 * 60);
    expect(cfg.writingSeconds).toBe(60 * 60);
    expect(cfg.examCountRange).toEqual([8, 9]);
  });

  it("exam2a has correct base settings", () => {
    const cfg = EXAM_CONFIG.exam2a;
    expect(cfg.calculatorAllowed).toBe(true);
    expect(cfg.examCount).toBe(20);
    expect(cfg.writingSeconds).toBe(30 * 60);
    expect(cfg.examCountRange).toBeUndefined();
  });

  it("exam2b has correct base settings", () => {
    const cfg = EXAM_CONFIG.exam2b;
    expect(cfg.calculatorAllowed).toBe(true);
    expect(cfg.writingSeconds).toBe(90 * 60);
    expect(cfg.examCountRange).toEqual([4, 5]);
  });

  it("exam2ab has correct base settings", () => {
    const cfg = EXAM_CONFIG.exam2ab;
    expect(cfg.calculatorAllowed).toBe(true);
    expect(cfg.writingSeconds).toBe(2 * 60 * 60);
  });

  it("all modes have consistent freedom config", () => {
    for (const mode of Object.values(EXAM_CONFIG)) {
      expect(mode.freedomMin).toBeLessThan(mode.freedomMax);
      expect(mode.freedomStep).toBeGreaterThan(0);
      expect(mode.freedomDefault).toBeGreaterThanOrEqual(mode.freedomMin);
      expect(mode.freedomDefault).toBeLessThanOrEqual(mode.freedomMax);
    }
  });

  it("all modes have non-empty descriptions", () => {
    for (const mode of Object.values(EXAM_CONFIG)) {
      expect(mode.examDescription.length).toBeGreaterThan(0);
      expect(mode.timerDescription.length).toBeGreaterThan(0);
    }
  });
});

describe("getExamQuestionCount", () => {
  it("returns fixed count for exam2a (no range)", () => {
    // exam2a has no range, always returns 20
    for (let i = 0; i < 20; i++) {
      expect(getExamQuestionCount("exam2a")).toBe(20);
    }
  });

  it("returns count within range for exam1 (8-9)", () => {
    const counts = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const c = getExamQuestionCount("exam1");
      expect(c).toBeGreaterThanOrEqual(8);
      expect(c).toBeLessThanOrEqual(9);
      counts.add(c);
    }
    // Should have seen both 8 and 9 in 100 iterations
    expect(counts.size).toBe(2);
  });

  it("returns count within range for exam2b (4-5)", () => {
    const counts = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const c = getExamQuestionCount("exam2b");
      expect(c).toBeGreaterThanOrEqual(4);
      expect(c).toBeLessThanOrEqual(5);
      counts.add(c);
    }
    expect(counts.size).toBe(2);
  });
});
