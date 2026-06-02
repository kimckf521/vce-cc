import { describe, it, expect } from "vitest";
import {
  SUBJECTS,
  visibleSwitcherSubjects,
} from "@/lib/subject-context";

const ALL = SUBJECTS.filter((s) => s.available).map((s) => s.urlSlug);
const slugs = (list: { urlSlug: string }[]) => list.map((s) => s.urlSlug);

describe("visibleSwitcherSubjects", () => {
  it("shows all available subjects when nothing is registered", () => {
    expect(slugs(visibleSwitcherSubjects([]))).toEqual(ALL);
    expect(slugs(visibleSwitcherSubjects(undefined))).toEqual(ALL);
  });

  it("returns only the registered subjects", () => {
    expect(slugs(visibleSwitcherSubjects(["methods", "specialist"]))).toEqual([
      "methods",
      "specialist",
    ]);
  });

  it("renders in SUBJECTS (pathway) order, not selection order", () => {
    // Registered out of order → still Foundation → … → Specialist order.
    expect(slugs(visibleSwitcherSubjects(["specialist", "foundation"]))).toEqual(
      ["foundation", "specialist"],
    );
  });

  it("always includes the current subject even when deregistered", () => {
    expect(
      slugs(visibleSwitcherSubjects(["methods"], "specialist")),
    ).toEqual(["methods", "specialist"]);
  });

  it("does not let the current subject alone collapse the list when nothing is registered", () => {
    // Empty registration means 'all' — current subject must not narrow it.
    expect(slugs(visibleSwitcherSubjects([], "methods"))).toEqual(ALL);
  });

  it("ignores unknown slugs", () => {
    expect(slugs(visibleSwitcherSubjects(["not-a-subject", "methods"]))).toEqual(
      ["methods"],
    );
  });

  it("falls back to all subjects when every registered slug is unknown", () => {
    expect(slugs(visibleSwitcherSubjects(["nope", "bad"]))).toEqual(ALL);
  });

  it("never returns an empty list", () => {
    expect(visibleSwitcherSubjects([]).length).toBeGreaterThan(0);
    expect(visibleSwitcherSubjects(["methods"]).length).toBeGreaterThan(0);
  });
});
