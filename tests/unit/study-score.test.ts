import { describe, it, expect } from "vitest";
import {
  SUBJECTS,
  GRADES,
  getSubjectDef,
  isSubjectKey,
  erf,
  phi,
  phiInv,
  gaPercentileForYear,
  gaPercentile,
  combineGaPercentiles,
  estimateStudyScore,
  type SubjectKey,
  type StudyScoreInput,
} from "@/lib/study-score";

const SUBJECT_KEYS = SUBJECTS.map((s) => s.key);

/** Valid mid-range input for any subject (e2 ignored by Foundation). */
function midInput(subject: SubjectKey): StudyScoreInput {
  return { subject, sac: 65, e1: 60, e2: 60 };
}

describe("data integrity", () => {
  it("covers the four VCE maths studies", () => {
    expect(SUBJECT_KEYS).toEqual(["methods", "specialist", "general", "foundation"]);
    expect(isSubjectKey("methods")).toBe(true);
    expect(isSubjectKey("physics")).toBe(false);
  });

  it("GA weights sum to 100 for every subject", () => {
    for (const s of SUBJECTS) {
      const total = s.gas.reduce((sum, ga) => sum + ga.weight, 0);
      expect(total, s.key).toBe(100);
    }
  });

  it("study-design weights match the verified values", () => {
    const w = (key: SubjectKey) => getSubjectDef(key).gas.map((g) => g.weight);
    expect(w("methods")).toEqual([40, 20, 40]);
    expect(w("specialist")).toEqual([40, 20, 40]);
    expect(w("general")).toEqual([40, 30, 30]);
    expect(w("foundation")).toEqual([40, 20, 40]); // U3 SAC / U4 SAC / exam
  });

  it("every GA has 3 years of 11 contiguous bands from 0 to maxScore summing to ~100", () => {
    for (const s of SUBJECTS) {
      for (const ga of s.gas) {
        expect(ga.years.map((y) => y.year), `${s.key}/${ga.key}`).toEqual([2025, 2024, 2023]);
        for (const y of ga.years) {
          const tag = `${s.key}/${ga.key}/${y.year}`;
          expect(y.bands.length, tag).toBe(11);
          expect(y.bands.map((b) => b.grade), tag).toEqual([...GRADES]);
          expect(y.assessedN, tag).toBeGreaterThan(0);

          // Published bands sum to 99.7–100.2 (independent rounding + NR share).
          const sum = y.bands.reduce((t, b) => t + b.pct, 0);
          expect(sum, tag).toBeGreaterThanOrEqual(99.7 - 1e-9);
          expect(sum, tag).toBeLessThanOrEqual(100.2 + 1e-9);

          // Ranges tile [0, maxScore] with the published 1-mark gaps.
          const ranges = y.bands.map((b) => b.range!);
          expect(ranges[0][0], tag).toBe(0);
          expect(ranges[10][1], tag).toBe(ga.maxScore);
          for (let i = 0; i < 10; i++) {
            expect(ranges[i + 1][0], `${tag} band ${i}`).toBe(ranges[i][1] + 1);
          }
        }
      }
    }
  });
});

describe("normal helpers", () => {
  it("erf and phi hit known values", () => {
    expect(erf(0)).toBeCloseTo(0, 8); // A&S 7.1.26 has ~1e-9 residual at 0
    expect(erf(1)).toBeCloseTo(0.8427, 4);
    expect(erf(-1)).toBeCloseTo(-0.8427, 4);
    expect(phi(0)).toBeCloseTo(0.5, 6);
    expect(phi(1.96)).toBeCloseTo(0.975, 3);
    expect(phi(-1.96)).toBeCloseTo(0.025, 3);
  });

  it("phiInv inverts phi across the working range", () => {
    expect(phiInv(0.5)).toBeCloseTo(0, 6);
    for (const z of [-3, -2, -1, -0.5, 0.5, 1, 2, 3]) {
      expect(phiInv(phi(z))).toBeCloseTo(z, 4);
    }
  });

  it("phiInv clamps extreme probabilities instead of diverging", () => {
    expect(phiInv(0)).toBeLessThan(-4);
    expect(phiInv(0)).toBeGreaterThan(-6);
    expect(phiInv(1)).toBeGreaterThan(4);
    expect(phiInv(1)).toBeLessThan(6);
  });
});

describe("gaPercentileForYear — hand-computed references", () => {
  const methods = getSubjectDef("methods");

  it("Methods 2025 Exam 1 at 90% lands at the A+ cut-off (~91.0th percentile)", () => {
    // Hand-computed from the published 2025 Exam 1 table (see lib/study-score.ts):
    //   raw = 90% of 80 = 72, exactly the A+ band's low bound (72–80), so the
    //   within-band fraction is 0 and the percentile is the cumulative mass of
    //   the ten bands below A+:
    //   2.1+2.4+4.3+5.1+8.7+10.0+14.6+17.2+13.8+13.0 = 91.2
    //   All 11 bands sum to 100.2, so percentile = 91.2 / 100.2 * 100 = 91.02.
    const exam1 = methods.gas.find((g) => g.key === "exam1")!;
    const p = gaPercentileForYear(exam1.years[0], 90, exam1.maxScore);
    expect(p).toBeCloseTo(91.02, 1);
  });

  it("Methods 2025 SAC at 50% sits at ~26.0th percentile (SAC scores skew high)", () => {
    // Hand-computed from the published 2025 SAC table:
    //   raw = 50 on the 0–100 SAC scale → D+ band (43–50); the next band (C)
    //   starts at 51, so the band covers [43, 51) and frac = (50-43)/8 = 0.875.
    //   Cumulative below D+: 0.6+1.3+6.8+7.9 = 16.6; D+ holds 10.8.
    //   percentile = (16.6 + 0.875*10.8) / 100.2 * 100 = 26.05/100.2*100 = 26.00.
    const sac = methods.gas.find((g) => g.key === "sac")!;
    const p = gaPercentileForYear(sac.years[0], 50, sac.maxScore);
    expect(p).toBeCloseTo(26.0, 1);
  });

  it("clamps the floor and ceiling instead of returning 0 or 100", () => {
    const exam1 = methods.gas.find((g) => g.key === "exam1")!;
    expect(gaPercentileForYear(exam1.years[0], 0, exam1.maxScore)).toBe(0.05);
    expect(gaPercentileForYear(exam1.years[0], 100, exam1.maxScore)).toBe(99.95);
  });

  it("is monotone in the raw percent for every table", () => {
    for (const s of SUBJECTS) {
      for (const ga of s.gas) {
        for (const y of ga.years) {
          let prev = -1;
          for (let pct = 0; pct <= 100; pct += 2) {
            const p = gaPercentileForYear(y, pct, ga.maxScore);
            expect(p, `${s.key}/${ga.key}/${y.year} @${pct}`).toBeGreaterThanOrEqual(prev);
            prev = p;
          }
        }
      }
    }
  });

  it("year-averaged percentile sits between the per-year extremes", () => {
    const exam1 = getSubjectDef("methods").gas.find((g) => g.key === "exam1")!;
    const perYear = exam1.years.map((y) => gaPercentileForYear(y, 75, exam1.maxScore));
    const avg = gaPercentile(exam1, 75);
    expect(avg).toBeGreaterThanOrEqual(Math.min(...perYear));
    expect(avg).toBeLessThanOrEqual(Math.max(...perYear));
  });
});

describe("combineGaPercentiles", () => {
  it("returns the shared percentile when all GAs agree", () => {
    for (const p of [10, 26, 50, 75, 91]) {
      const combined = combineGaPercentiles([
        { percentile: p, weight: 40 },
        { percentile: p, weight: 20 },
        { percentile: p, weight: 40 },
      ]);
      expect(combined).toBeCloseTo(p, 4);
    }
  });

  it("weights pull the aggregate toward the heavier GA", () => {
    const heavyHigh = combineGaPercentiles([
      { percentile: 80, weight: 40 },
      { percentile: 40, weight: 20 },
    ]);
    const heavyLow = combineGaPercentiles([
      { percentile: 80, weight: 20 },
      { percentile: 40, weight: 40 },
    ]);
    expect(heavyHigh).toBeGreaterThan(heavyLow);
  });
});

describe("estimateStudyScore", () => {
  it("cohort-middle inputs land near a study score of 30 (28–32)", () => {
    // sac 65 / e1 60 / e2 56 are approximately the 2023–2025 Methods cohort
    // medians for each GA (e.g. the 2025 SAC median falls in the C+ band
    // 60–68), so the aggregate should sit near the centre of the 30 ± 7 scale.
    const r = estimateStudyScore({ subject: "methods", sac: 65, e1: 60, e2: 56 });
    expect(r.score).toBeGreaterThanOrEqual(28);
    expect(r.score).toBeLessThanOrEqual(32);
    expect(r.percentile).toBeGreaterThan(35);
    expect(r.percentile).toBeLessThan(65);
  });

  it("is monotone in every input for every subject", () => {
    for (const s of SUBJECTS) {
      for (const { key } of s.inputs) {
        let prev = -1;
        for (let v = 0; v <= 100; v += 5) {
          const input = { ...midInput(s.key), [key]: v };
          const r = estimateStudyScore(input);
          expect(r.score, `${s.key} ${key}=${v}`).toBeGreaterThanOrEqual(prev);
          prev = r.score;
        }
      }
    }
  });

  it("clamps extremes sanely and flags 45+ territory", () => {
    for (const s of SUBJECTS) {
      const top = estimateStudyScore({ subject: s.key, sac: 100, e1: 100, e2: 100 });
      expect(top.score, s.key).toBeGreaterThanOrEqual(45);
      expect(top.score, s.key).toBeLessThanOrEqual(50);
      expect(top.display, s.key).toBe("45+");
      expect(top.band[1], s.key).toBeLessThanOrEqual(50);
      expect(top.percentile, s.key).toBeGreaterThan(99);
      // The rounded fields must never claim "ahead of 100% of the state" —
      // rounding 99.95 to one decimal would otherwise produce exactly 100.
      expect(top.percentile, s.key).toBeLessThanOrEqual(99.9);
      for (const g of top.gaPercentiles) {
        expect(g.percentile, `${s.key} ${g.label}`).toBeLessThanOrEqual(99.9);
      }

      const bottom = estimateStudyScore({ subject: s.key, sac: 0, e1: 0, e2: 0 });
      expect(bottom.score, s.key).toBeGreaterThanOrEqual(0);
      expect(bottom.score, s.key).toBeLessThanOrEqual(15);
      expect(bottom.band[0], s.key).toBeGreaterThanOrEqual(0);
      expect(bottom.percentile, s.key).toBeLessThan(5);
      // Symmetric floor: never "behind 100% of the state" either.
      expect(bottom.percentile, s.key).toBeGreaterThanOrEqual(0.1);
      for (const g of bottom.gaPercentiles) {
        expect(g.percentile, `${s.key} ${g.label}`).toBeGreaterThanOrEqual(0.1);
      }
    }
  });

  it("never returns a score without its uncertainty band", () => {
    const r = estimateStudyScore(midInput("methods"));
    expect(r.band[0]).toBeLessThanOrEqual(r.score);
    expect(r.band[1]).toBeGreaterThanOrEqual(r.score);
    // ±2 in the middle of the scale...
    expect(r.band).toEqual([r.score - 2, r.score + 2]);
    // ...and wider (±3) at the tails.
    const tail = estimateStudyScore({ subject: "methods", sac: 95, e1: 95, e2: 95 });
    expect(tail.band[1] - tail.band[0]).toBeGreaterThanOrEqual(5);
  });

  it("sensitivity deltas are non-negative and heavier levers move more", () => {
    const r = estimateStudyScore({ subject: "methods", sac: 65, e1: 60, e2: 56 });
    for (const s of r.sensitivity) {
      expect(s.delta, s.input).toBeGreaterThanOrEqual(0);
    }
    const byKey = Object.fromEntries(r.sensitivity.map((s) => [s.input, s.delta]));
    // Methods Exam 2 carries 40% vs Exam 1's 20% — at similar band densities
    // the heavier lever must move the score more.
    expect(byKey.e2).toBeGreaterThan(byKey.e1);
    expect(byKey.e2).toBeGreaterThan(0);
    // Sorted strongest-first.
    const deltas = r.sensitivity.map((s) => s.delta);
    expect([...deltas].sort((a, b) => b - a)).toEqual(deltas);
  });

  it("sensitivity is zero for an input already at 100%", () => {
    const r = estimateStudyScore({ subject: "methods", sac: 100, e1: 60, e2: 56 });
    const sac = r.sensitivity.find((s) => s.input === "sac")!;
    expect(sac.delta).toBe(0);
  });

  it("Foundation uses sac + e1 only and adds small-cohort caveats", () => {
    const r = estimateStudyScore({ subject: "foundation", sac: 60, e1: 55 });
    expect(r.sensitivity.map((s) => s.input).sort()).toEqual(["e1", "sac"]);
    expect(r.caveats.join(" ")).toMatch(/small/i);
    expect(r.caveats.length).toBeGreaterThan(0);
  });

  it("throws when a required input is missing", () => {
    expect(() => estimateStudyScore({ subject: "methods", sac: 60, e1: 60 })).toThrow(
      TypeError
    );
    expect(() =>
      estimateStudyScore({ subject: "methods", sac: 60, e1: 60, e2: NaN })
    ).toThrow(TypeError);
    // ...but Foundation genuinely doesn't need e2.
    expect(() => estimateStudyScore({ subject: "foundation", sac: 60, e1: 60 })).not.toThrow();
  });

  it("clamps out-of-range inputs instead of extrapolating", () => {
    const over = estimateStudyScore({ subject: "methods", sac: 120, e1: 120, e2: 120 });
    const capped = estimateStudyScore({ subject: "methods", sac: 100, e1: 100, e2: 100 });
    expect(over.score).toBe(capped.score);
  });

  it("always returns caveats", () => {
    for (const s of SUBJECTS) {
      const r = estimateStudyScore(midInput(s.key));
      expect(r.caveats.length, s.key).toBeGreaterThanOrEqual(3);
    }
  });
});
