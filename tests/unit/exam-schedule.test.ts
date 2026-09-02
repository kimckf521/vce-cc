import { describe, it, expect } from "vitest";
import {
  daysBetweenISO,
  examDateLongPhrase,
  examDatePhrase,
  scheduledExamDate,
} from "@/lib/exam-schedule";

describe("scheduledExamDate", () => {
  it("maps Exam 1 / Exam 2 in timetable order", () => {
    expect(scheduledExamDate("methods", "EXAM_1")?.date).toBe("2026-11-05");
    expect(scheduledExamDate("methods", "EXAM_2")?.date).toBe("2026-11-06");
    expect(scheduledExamDate("general", "EXAM_1")?.date).toBe("2026-10-30");
  });

  it("returns the single Foundation sitting for EXAM_1 only", () => {
    // Foundation sits ONE paper, labelled just "Exam", and every Foundation
    // row in the DB is EXAM_1. A phantom "Exam 2" must not resolve.
    const only = scheduledExamDate("foundation", "EXAM_1");
    expect(only?.date).toBe("2026-11-17");
    expect(only?.label).toBe("Exam");
    expect(scheduledExamDate("foundation", "EXAM_2")).toBeNull();
  });

  it("returns null for an unknown subject", () => {
    expect(scheduledExamDate("not-a-subject", "EXAM_1")).toBeNull();
  });
});

describe("daysBetweenISO", () => {
  it("counts whole calendar days forward and backward", () => {
    expect(daysBetweenISO("2026-09-02", "2026-10-30")).toBe(58);
    expect(daysBetweenISO("2026-10-30", "2026-10-30")).toBe(0);
    expect(daysBetweenISO("2026-11-06", "2026-11-05")).toBe(-1);
  });

  it("is unaffected by daylight saving, which starts in Melbourne on 4 Oct 2026", () => {
    // Melbourne shifts +10:00 -> +11:00 overnight on 2026-10-04. Doing the
    // arithmetic at UTC midnight keeps the count whole across that boundary.
    expect(daysBetweenISO("2026-10-03", "2026-10-05")).toBe(2);
  });
});

describe("date phrases", () => {
  it("formats the exam date without shifting across midnight", () => {
    expect(examDatePhrase("2026-10-30")).toBe("Fri, 30 Oct");
    expect(examDateLongPhrase("2026-10-30")).toBe("Friday 30 October 2026");
  });
});
