import { describe, it, expect } from "vitest";
import {
  domainTier,
  nameMatchesLocalpart,
  hasGradYearDigits,
  scoreApplication,
} from "@/lib/teacher-application";

describe("domainTier", () => {
  it("classifies the Department of Education staff domain", () => {
    expect(domainTier("jane.smith@education.vic.gov.au")).toBe("GOV_STAFF");
  });

  it("flags the government student domain", () => {
    expect(domainTier("jsmith26@schools.vic.gov.au")).toBe("STUDENT_DOMAIN");
    expect(domainTier("x@melbourne.schools.vic.gov.au")).toBe("STUDENT_DOMAIN");
  });

  it("classifies .edu.au school domains", () => {
    expect(domainTier("jsmith@scotch.vic.edu.au")).toBe("SCHOOL");
    expect(domainTier("j.smith@stmarys.catholic.edu.au")).toBe("SCHOOL");
  });

  it("classifies consumer providers as PERSONAL", () => {
    expect(domainTier("jane.smith@gmail.com")).toBe("PERSONAL");
    expect(domainTier("jane@outlook.com.au")).toBe("PERSONAL");
  });

  it("falls back to OTHER for business domains and malformed input", () => {
    expect(domainTier("jane@brightsparks-tutoring.com.au")).toBe("OTHER");
    expect(domainTier("not-an-email")).toBe("OTHER");
  });
});

describe("nameMatchesLocalpart", () => {
  it("matches common school conventions", () => {
    expect(nameMatchesLocalpart("John Smith", "john.smith@x.edu.au")).toBe(true);
    expect(nameMatchesLocalpart("John Smith", "jsmith@x.edu.au")).toBe(true);
    expect(nameMatchesLocalpart("John Smith", "smithj@x.edu.au")).toBe(true);
    expect(nameMatchesLocalpart("John Smith", "smith.john@x.edu.au")).toBe(true);
  });

  it("tolerates digits and separators in the localpart", () => {
    expect(nameMatchesLocalpart("John Smith", "john.smith2@x.edu.au")).toBe(true);
    expect(nameMatchesLocalpart("John Smith", "j_smith@x.edu.au")).toBe(true);
  });

  it("handles middle names and hyphens/apostrophes", () => {
    expect(nameMatchesLocalpart("Mary Anne O'Brien", "obrien.m@x.edu.au")).toBe(true);
    expect(nameMatchesLocalpart("Jean-Luc Picard", "jpicard@x.edu.au")).toBe(true);
  });

  it("rejects unrelated localparts", () => {
    expect(nameMatchesLocalpart("John Smith", "principal@x.edu.au")).toBe(false);
    expect(nameMatchesLocalpart("John Smith", "kwilliams@x.edu.au")).toBe(false);
  });

  it("requires exact match for very short names to avoid false positives", () => {
    expect(nameMatchesLocalpart("Li Wu", "li@x.edu.au")).toBe(true);
    expect(nameMatchesLocalpart("Li Wu", "olivia@x.edu.au")).toBe(false);
  });
});

describe("hasGradYearDigits", () => {
  it("flags 4-digit and 2-digit year-like localparts", () => {
    expect(hasGradYearDigits("jsmith2026@x.edu.au")).toBe(true);
    expect(hasGradYearDigits("26jsmith@x.edu.au")).toBe(true);
    expect(hasGradYearDigits("jsmith26@x.edu.au")).toBe(true);
  });

  it("does not flag plain or low-digit localparts", () => {
    expect(hasGradYearDigits("john.smith@x.edu.au")).toBe(false);
    expect(hasGradYearDigits("john.smith2@x.edu.au")).toBe(false);
  });
});

describe("scoreApplication", () => {
  it("combines the three signals", () => {
    expect(scoreApplication("Jane Smith", "jane.smith@education.vic.gov.au")).toEqual({
      domainTier: "GOV_STAFF",
      nameMatch: true,
      gradYearFlag: false,
    });
    expect(scoreApplication("Tom Jones", "tjones2026@scotch.vic.edu.au")).toEqual({
      domainTier: "SCHOOL",
      nameMatch: true,
      gradYearFlag: true,
    });
  });
});
