/**
 * VCE study-score estimator for the four VCE Mathematics studies.
 *
 * Pure functions, no dependencies, safe to run client-side. Powers the public
 * calculator at /tools/study-score-calculator. Unit tests live in
 * tests/unit/study-score.test.ts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DATA PROVENANCE — MANUAL ANNUAL UPDATE REQUIRED
 *
 * Every band table below was transcribed from the official VCAA grade
 * distribution PDFs (2023, 2024 and 2025 papers) and verified value-by-value
 * against freshly downloaded copies of those PDFs by an automated comparison
 * (396 band percentages + 396 score ranges, zero mismatches). GA weights were
 * verified against the VCE Mathematics Study Design (2023–2027) assessment
 * sections:
 *   https://www.vcaa.vic.edu.au/curriculum/vce-curriculum/vce-study-designs/mathematical-methods/assessment
 *   https://www.vcaa.vic.edu.au/curriculum/vce-curriculum/vce-study-designs/specialist-mathematics/assessment
 *   https://www.vcaa.vic.edu.au/curriculum/vce-curriculum/vce-study-designs/general-mathematics/assessment
 *   https://www.vcaa.vic.edu.au/curriculum/vce-curriculum/vce-study-designs/foundation-mathematics/assessment
 *
 * >>> WHEN VCAA PUBLISHES THE NEXT YEAR'S GRADE DISTRIBUTIONS (usually around
 * >>> April), ADD the new year's tables, DROP the oldest year, and re-verify
 * >>> every number against the PDFs. Per-table source URLs are in the comments
 * >>> beside each table. Also re-check the weights if a new study design
 * >>> accreditation period has started.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MODEL (and every assumption it makes)
 *
 * 1. Per-GA percentile. The user's percent on an assessment is converted to a
 *    raw score out of that GA's maximum, located in the year's published grade
 *    band, and mapped to a statewide percentile by linear interpolation within
 *    the band (ASSUMPTION: scores are uniformly spread inside a band). Band
 *    percentages are normalised to sum to 100 first — published bands sum to
 *    99.7–100.2 because of independent rounding and the small "NR" share that
 *    VCAA reports outside the bands. If a future table were published without
 *    score ranges, we fall back to 11 equal-width virtual bands across the
 *    score range and interpolate across cumulative band percentages the same
 *    way (ASSUMPTION: within-band uniformity again; documented fallback, not
 *    used by any current table).
 *
 * 2. Year averaging. The percentile is computed against each of the three
 *    published years and averaged (ASSUMPTION: the coming year's paper sits
 *    "somewhere in the middle" of recent years; exam difficulty genuinely
 *    moves — e.g. the Methods Exam 1 A+ cut-off was 73/80 in 2023, 66/80 in
 *    2024 and 72/80 in 2025 — so a single-year mapping would be misleading).
 *
 * 3. Combining GAs. Each GA percentile becomes a standard-normal z-score via
 *    Φ⁻¹, the z-scores are combined as a weighted mean using the study-design
 *    contribution weights, and the result maps back through Φ. This mirrors
 *    VCAA's approach (standardise each GA, weight, aggregate) more faithfully
 *    than averaging percentiles, which distorts the tails. Using the weighted
 *    MEAN of z (rather than dividing by √Σw²) implicitly ASSUMES a student's
 *    GA results are perfectly rank-correlated — conservative, and closer to
 *    reality than assuming independence, since the same student sits all GAs.
 *
 * 4. Study score. VCAA maps aggregate ranks onto a distribution with mean 30
 *    and standard deviation 7, truncated at 0 and 50. We do the same:
 *    SS = clamp(round(30 + 7·z), 0, 50).
 *
 * What this model does NOT capture (surfaced as caveats in the result):
 *  - SAC moderation. VCAA aligns each school's SAC distribution with the same
 *    students' external exam distribution. The percent you type is assumed to
 *    sit at the same point of the statewide moderated distribution — for
 *    schools far from the state average this can move the result noticeably.
 *  - VCAA's exact standardisation uses actual score means/SDs and applies
 *    further adjustments for small-cohort studies; published band tables only
 *    let us approximate the shape.
 *  - The coming year's cohort and papers are not the 2023–2025 ones.
 *
 * HONESTY CONSTRAINTS BUILT INTO THE API: `estimateStudyScore` never returns a
 * bare number — the result always carries an uncertainty band, the percentile,
 * per-input sensitivities and the caveat list. Scores of 45+ are flagged
 * (`display: "45+"`) because the top ~2% of the state is beyond the resolving
 * power of published band tables.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type SubjectKey = "methods" | "specialist" | "general" | "foundation";

/** Calculator input keys. `e1` is Exam 1 (Foundation: its single exam). */
export type InputKey = "e1" | "e2" | "sac";

export interface StudyScoreInput {
  subject: SubjectKey;
  /** Exam 1 result as a percent (0–100). For Foundation, the single exam. */
  e1: number;
  /** Exam 2 result as a percent (0–100). Not used by Foundation. */
  e2?: number;
  /**
   * SAC result as a percent (0–100). For Foundation this single figure feeds
   * both the Unit 3 and Unit 4 SAC graded assessments (ASSUMPTION: equal
   * performance across both units).
   */
  sac: number;
}

/** VCAA grade labels, lowest to highest, matching the published PDF columns. */
export const GRADES = ["UG", "E", "E+", "D", "D+", "C", "C+", "B", "B+", "A", "A+"] as const;
export type Grade = (typeof GRADES)[number];

export interface Band {
  readonly grade: Grade;
  /** Percent of the assessed cohort in this band (as published; bands sum to ~100). */
  readonly pct: number;
  /** Inclusive raw-score range [low, high], or null when VCAA didn't publish ranges. */
  readonly range: readonly [number, number] | null;
}

export interface GaYearTable {
  readonly year: number;
  /** Students assessed for this GA that year (from the same PDF). */
  readonly assessedN: number;
  readonly bands: readonly Band[];
}

export interface GaDef {
  readonly key: string;
  readonly label: string;
  /** Percent contribution to the study score (study-design weight). */
  readonly weight: number;
  /** Which calculator input drives this GA. */
  readonly input: InputKey;
  /** Maximum raw score for this GA (from the published score ranges). */
  readonly maxScore: number;
  readonly years: readonly GaYearTable[];
}

export interface SubjectDef {
  readonly key: SubjectKey;
  readonly name: string;
  /** Inputs this subject's calculator exposes, in display order. */
  readonly inputs: readonly { key: InputKey; label: string }[];
  readonly gas: readonly GaDef[];
}

export interface GaPercentileEntry {
  key: string;
  label: string;
  weight: number;
  /** Statewide percentile (0–100) for this GA, averaged across the data years. */
  percentile: number;
}

export interface SensitivityEntry {
  input: InputKey;
  label: string;
  /** Estimated study-score movement from +5 percentage points on this input. */
  delta: number;
}

export interface StudyScoreEstimate {
  subject: SubjectKey;
  /** Point estimate, integer 0–50. NEVER present this without `band`. */
  score: number;
  /** Display string — "45+" once the estimate reaches the top ~2% territory. */
  display: string;
  /** Uncertainty band [low, high]: ±2 in the middle, ±3 at the tails. */
  band: [number, number];
  /** Estimated aggregate statewide percentile (0–100). */
  percentile: number;
  gaPercentiles: GaPercentileEntry[];
  /** Sorted strongest-lever-first. */
  sensitivity: SensitivityEntry[];
  caveats: string[];
}

// ─── Normal distribution helpers (no deps) ───────────────────────────────────

/**
 * Error function, Abramowitz & Stegun approximation 7.1.26.
 * Max absolute error ≈ 1.5e-7 — far below the resolution of band tables.
 */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const poly =
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
    t;
  return sign * (1 - poly * Math.exp(-ax * ax));
}

/** Standard normal CDF Φ(z). */
export function phi(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Inverse standard normal CDF Φ⁻¹(p), by bisection against our own `phi` so
 * the pair is exactly self-consistent. p is clamped to [1e-6, 1 − 1e-6]
 * (|z| ≲ 4.75) — band tables can't resolve anything further into the tails.
 */
export function phiInv(p: number): number {
  const pc = Math.min(1 - 1e-6, Math.max(1e-6, p));
  let lo = -6;
  let hi = 6;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (phi(mid) < pc) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ─── Data ────────────────────────────────────────────────────────────────────

type BandRow = readonly [pct: number, low: number, high: number];

/** Build a GaYearTable from compact rows in published (UG → A+) order. */
function table(year: number, assessedN: number, rows: readonly BandRow[]): GaYearTable {
  return {
    year,
    assessedN,
    bands: rows.map(([pct, low, high], i) => ({
      grade: GRADES[i],
      pct,
      range: [low, high] as const,
    })),
  };
}

/**
 * All four subjects' GA definitions.
 *
 * Weights (verified against the study design):
 *  - Methods:    SAC 40 (U3 20 + U4 20), Exam 1 20, Exam 2 40
 *  - Specialist: SAC 40 (U3 20 + U4 20), Exam 1 20, Exam 2 40
 *  - General:    SAC 40 (U3 24 + U4 16), Exam 1 30, Exam 2 30
 *  - Foundation: U3 SAC 40, U4 SAC 20 (SAC 60 total), single exam 40
 *
 * Foundation publishes its two SAC units as separate GAs (GA1 max 60,
 * GA2 max 30) — both are driven by the calculator's single SAC input.
 */
export const SUBJECTS: readonly SubjectDef[] = [
  {
    key: "methods",
    name: "Mathematical Methods",
    inputs: [
      { key: "sac", label: "SACs" },
      { key: "e1", label: "Exam 1" },
      { key: "e2", label: "Exam 2" },
    ],
    gas: [
      {
        key: "sac",
        label: "SACs (Units 3–4)",
        weight: 40,
        input: "sac",
        maxScore: 100,
        years: [
          // 2025 — n(assessed)=16,339 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_mathematical_methods_ga25.pdf
          table(2025, 16339, [
            [0.6, 0, 9], [1.3, 10, 20], [6.8, 21, 34], [7.9, 35, 42], [10.8, 43, 50], [14.5, 51, 59], [16.6, 60, 68], [13.8, 69, 76], [11.0, 77, 83], [9.2, 84, 90], [7.7, 91, 100],
          ]),
          // 2024 — n(assessed)=15,589 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_mathematical_methods_ga24.pdf
          table(2024, 15589, [
            [0.5, 0, 9], [1.3, 10, 23], [6.2, 24, 35], [8.3, 36, 42], [11.1, 43, 49], [14.1, 50, 57], [16.6, 58, 66], [14.1, 67, 75], [10.3, 76, 83], [9.7, 84, 92], [8.0, 93, 100],
          ]),
          // 2023 — n(assessed)=14,761 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_mathematical_methods_ga23.pdf
          table(2023, 14761, [
            [0.5, 0, 9], [1.4, 10, 22], [6.8, 23, 35], [7.9, 36, 42], [11.9, 43, 50], [14.5, 51, 58], [15.4, 59, 67], [14.0, 68, 76], [10.7, 77, 84], [9.3, 85, 93], [7.3, 94, 100],
          ]),
        ],
      },
      {
        key: "exam1",
        label: "Exam 1",
        weight: 20,
        input: "e1",
        maxScore: 80,
        years: [
          // 2025 — n(assessed)=16,040 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_mathematical_methods_ga25.pdf
          table(2025, 16040, [
            [2.1, 0, 3], [2.4, 4, 7], [4.3, 8, 12], [5.1, 13, 18], [8.7, 19, 27], [10.0, 28, 35], [14.6, 36, 45], [17.2, 46, 55], [13.8, 56, 63], [13.0, 64, 71], [9.0, 72, 80],
          ]),
          // 2024 — n(assessed)=15,331 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_mathematical_methods_ga24.pdf
          table(2024, 15331, [
            [2.2, 0, 3], [3.3, 4, 6], [4.0, 7, 10], [5.0, 11, 15], [8.6, 16, 20], [10.0, 21, 27], [14.5, 28, 34], [17.1, 35, 45], [14.7, 46, 55], [11.4, 56, 65], [9.2, 66, 80],
          ]),
          // 2023 — n(assessed)=14,505 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_mathematical_methods_ga23.pdf
          table(2023, 14505, [
            [1.8, 0, 3], [2.4, 4, 7], [3.2, 8, 11], [6.1, 12, 16], [8.2, 17, 22], [12.0, 23, 31], [13.7, 32, 39], [17.7, 40, 51], [15.4, 52, 63], [11.6, 64, 72], [7.9, 73, 80],
          ]),
        ],
      },
      {
        key: "exam2",
        label: "Exam 2",
        weight: 40,
        input: "e2",
        maxScore: 160,
        years: [
          // 2025 — n(assessed)=16,044 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_mathematical_methods_ga25.pdf
          table(2025, 16044, [
            [1.3, 0, 15], [2.1, 16, 23], [4.2, 24, 33], [6.2, 34, 44], [8.1, 45, 56], [11.6, 57, 71], [14.4, 72, 86], [15.9, 87, 103], [14.3, 104, 120], [12.7, 121, 139], [9.2, 140, 160],
          ]),
          // 2024 — n(assessed)=15,329 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_mathematical_methods_ga24.pdf
          table(2024, 15329, [
            [0.8, 0, 13], [1.8, 14, 21], [4.2, 22, 31], [6.2, 32, 40], [8.7, 41, 50], [11.5, 51, 63], [14.5, 64, 76], [15.3, 77, 93], [14.3, 94, 110], [13.3, 111, 132], [9.4, 133, 160],
          ]),
          // 2023 — n(assessed)=14,501 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_mathematical_methods_ga23.pdf
          table(2023, 14501, [
            [1.3, 0, 11], [2.7, 12, 18], [4.3, 19, 26], [5.6, 27, 35], [8.8, 36, 45], [12.0, 46, 57], [14.0, 58, 70], [15.3, 71, 85], [13.8, 86, 101], [12.7, 102, 121], [9.6, 122, 160],
          ]),
        ],
      },
    ],
  },
  {
    key: "specialist",
    name: "Specialist Mathematics",
    inputs: [
      { key: "sac", label: "SACs" },
      { key: "e1", label: "Exam 1" },
      { key: "e2", label: "Exam 2" },
    ],
    gas: [
      {
        key: "sac",
        label: "SACs (Units 3–4)",
        weight: 40,
        input: "sac",
        maxScore: 100,
        years: [
          // 2025 — n(assessed)=4,066 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_specialist_mathematics_ga25.pdf
          table(2025, 4066, [
            [0.2, 0, 9], [0.2, 10, 12], [0.0, 13, 15], [1.1, 16, 26], [3.6, 27, 37], [8.9, 38, 49], [12.1, 50, 60], [16.9, 61, 70], [21.7, 71, 81], [19.6, 82, 90], [15.7, 91, 100],
          ]),
          // 2024 — n(assessed)=3,725 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_specialist_mathematics_ga24.pdf
          table(2024, 3725, [
            [0.3, 0, 9], [0.1, 10, 12], [0.2, 13, 15], [1.2, 16, 26], [3.3, 27, 35], [9.5, 36, 46], [13.0, 47, 56], [16.2, 57, 66], [21.3, 67, 77], [18.6, 78, 87], [16.3, 88, 100],
          ]),
          // 2023 — n(assessed)=3,615 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_specialist_mathematics_ga23.pdf
          table(2023, 3615, [
            [0.2, 0, 5], [0.2, 6, 12], [0.2, 13, 16], [0.9, 17, 25], [3.8, 26, 37], [10.9, 38, 50], [13.5, 51, 60], [15.0, 61, 69], [21.3, 70, 79], [18.3, 80, 88], [15.8, 89, 100],
          ]),
        ],
      },
      {
        key: "exam1",
        label: "Exam 1",
        weight: 20,
        input: "e1",
        maxScore: 80,
        years: [
          // 2025 — n(assessed)=4,018 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_specialist_mathematics_ga25.pdf
          table(2025, 4018, [
            [1.5, 0, 4], [2.9, 5, 10], [4.2, 11, 16], [7.0, 17, 25], [9.6, 26, 34], [12.4, 35, 43], [15.6, 44, 51], [14.8, 52, 59], [14.1, 60, 67], [10.6, 68, 74], [7.4, 75, 80],
          ]),
          // 2024 — n(assessed)=3,683 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_specialist_mathematics_ga24.pdf
          table(2024, 3683, [
            [1.7, 0, 5], [2.0, 6, 8], [4.0, 9, 14], [7.1, 15, 22], [9.8, 23, 30], [12.0, 31, 39], [16.0, 40, 49], [14.3, 50, 57], [13.3, 58, 65], [12.3, 66, 72], [7.3, 73, 80],
          ]),
          // 2023 — n(assessed)=3,574 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_specialist_mathematics_ga23.pdf
          table(2023, 3574, [
            [2.0, 0, 6], [2.6, 7, 10], [3.6, 11, 15], [6.5, 16, 22], [8.9, 23, 31], [12.3, 32, 41], [15.9, 42, 51], [14.6, 52, 59], [13.9, 60, 66], [11.9, 67, 73], [7.8, 74, 80],
          ]),
        ],
      },
      {
        key: "exam2",
        label: "Exam 2",
        weight: 40,
        input: "e2",
        maxScore: 160,
        years: [
          // 2025 — n(assessed)=4,018 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_specialist_mathematics_ga25.pdf
          table(2025, 4018, [
            [0.3, 0, 15], [1.9, 16, 29], [5.8, 30, 47], [7.8, 48, 64], [11.3, 65, 83], [13.0, 84, 99], [15.7, 100, 116], [14.4, 117, 130], [12.0, 131, 141], [10.2, 142, 150], [7.5, 151, 160],
          ]),
          // 2024 — n(assessed)=3,683 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_specialist_mathematics_ga24.pdf
          table(2024, 3683, [
            [0.8, 0, 15], [1.9, 16, 24], [5.2, 25, 37], [6.9, 38, 49], [11.1, 50, 65], [12.4, 66, 80], [16.2, 81, 98], [13.9, 99, 112], [13.3, 113, 126], [10.8, 127, 140], [7.3, 141, 160],
          ]),
          // 2023 — n(assessed)=3,574 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_specialist_mathematics_ga23.pdf
          table(2023, 3574, [
            [0.6, 0, 15], [1.7, 16, 25], [5.7, 26, 41], [7.6, 42, 55], [11.3, 56, 69], [12.7, 70, 84], [16.0, 85, 100], [14.2, 101, 115], [12.1, 116, 126], [10.0, 127, 138], [8.2, 139, 160],
          ]),
        ],
      },
    ],
  },
  {
    key: "general",
    name: "General Mathematics",
    inputs: [
      { key: "sac", label: "SACs" },
      { key: "e1", label: "Exam 1" },
      { key: "e2", label: "Exam 2" },
    ],
    gas: [
      {
        key: "sac",
        label: "SACs (Units 3–4)",
        weight: 40,
        input: "sac",
        maxScore: 100,
        years: [
          // 2025 — n(assessed)=32,280 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_general_mathematics_ga25.pdf
          table(2025, 32280, [
            [0.2, 0, 5], [0.3, 6, 12], [1.2, 13, 23], [8.3, 24, 41], [11.5, 42, 50], [11.8, 51, 57], [12.7, 58, 64], [15.8, 65, 73], [14.4, 74, 82], [13.8, 83, 92], [9.8, 93, 100],
          ]),
          // 2024 — n(assessed)=30,710 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_general_mathematics_ga24.pdf
          table(2024, 30710, [
            [0.4, 0, 9], [0.2, 10, 12], [0.7, 13, 19], [7.4, 20, 39], [10.9, 40, 48], [12.9, 49, 56], [13.2, 57, 64], [16.6, 65, 74], [14.6, 75, 83], [13.4, 84, 92], [9.6, 93, 100],
          ]),
          // 2023 — n(assessed)=29,604 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_general_mathematics_ga23.pdf
          table(2023, 29604, [
            [0.2, 0, 5], [0.5, 6, 12], [1.1, 13, 21], [8.1, 22, 40], [10.6, 41, 48], [12.2, 49, 55], [12.8, 56, 62], [16.7, 63, 72], [14.6, 73, 82], [12.8, 83, 92], [10.3, 93, 100],
          ]),
        ],
      },
      {
        key: "exam1",
        label: "Exam 1",
        weight: 30,
        input: "e1",
        maxScore: 80,
        years: [
          // 2025 — n(assessed)=30,918 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_general_mathematics_ga25.pdf
          table(2025, 30918, [
            [0.0, 0, 7], [0.1, 8, 15], [2.5, 16, 24], [6.6, 25, 33], [8.0, 34, 39], [13.7, 40, 46], [20.2, 47, 56], [16.1, 57, 64], [12.7, 65, 71], [12.6, 72, 76], [7.5, 77, 80],
          ]),
          // 2024 — n(assessed)=29,453 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_general_mathematics_ga24.pdf
          table(2024, 29453, [
            [0.0, 0, 7], [0.1, 8, 10], [1.0, 11, 16], [8.4, 17, 26], [8.7, 27, 32], [10.9, 33, 39], [16.5, 40, 47], [16.5, 48, 55], [15.1, 56, 63], [13.5, 64, 71], [9.4, 72, 80],
          ]),
          // 2023 — n(assessed)=28,305 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_general_mathematics_ga23.pdf
          table(2023, 28305, [
            [0.0, 0, 3], [0.0, 4, 7], [0.7, 8, 15], [7.7, 16, 27], [8.6, 28, 33], [11.5, 34, 39], [17.7, 40, 46], [17.3, 47, 55], [14.8, 56, 63], [11.8, 64, 71], [9.9, 72, 80],
          ]),
        ],
      },
      {
        key: "exam2",
        label: "Exam 2",
        weight: 30,
        input: "e2",
        maxScore: 120,
        years: [
          // 2025 — n(assessed)=30,895 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_general_mathematics_ga25.pdf
          table(2025, 30895, [
            [1.2, 0, 11], [1.6, 12, 16], [6.2, 17, 26], [8.1, 27, 34], [9.9, 35, 43], [13.5, 44, 52], [16.1, 53, 65], [14.3, 66, 77], [12.5, 78, 89], [9.6, 90, 100], [6.9, 101, 120],
          ]),
          // 2024 — n(assessed)=29,443 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-08/vce_general_mathematics_ga24.pdf
          table(2024, 29443, [
            [1.0, 0, 11], [1.0, 12, 15], [6.0, 16, 26], [7.4, 27, 34], [11.2, 35, 44], [12.2, 45, 55], [16.3, 56, 69], [13.9, 70, 81], [11.5, 82, 91], [10.8, 92, 101], [8.7, 102, 120],
          ]),
          // 2023 — n(assessed)=28,290 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_general_mathematics_ga23.pdf
          table(2023, 28290, [
            [0.2, 0, 5], [0.8, 6, 11], [4.9, 12, 23], [7.0, 24, 31], [11.3, 32, 40], [13.1, 41, 51], [17.2, 52, 65], [15.1, 66, 78], [11.9, 79, 91], [10.7, 92, 103], [7.7, 104, 120],
          ]),
        ],
      },
    ],
  },
  {
    key: "foundation",
    name: "Foundation Mathematics",
    // Foundation has ONE exam — the page hides the Exam 2 slider and labels
    // `e1` as "Exam". The single SAC input drives both SAC GAs below.
    inputs: [
      { key: "sac", label: "SACs" },
      { key: "e1", label: "Exam" },
    ],
    gas: [
      {
        key: "sac_unit3",
        label: "Unit 3 SACs",
        weight: 40,
        input: "sac",
        maxScore: 60,
        years: [
          // 2025 — n(assessed)=2,486 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_foundation_mathematics_ga25.pdf
          table(2025, 2486, [
            [0.7, 0, 5], [1.8, 6, 12], [4.1, 13, 20], [9.9, 21, 26], [10.0, 27, 29], [13.0, 30, 33], [14.7, 34, 37], [14.4, 38, 42], [12.3, 43, 47], [11.4, 48, 55], [7.8, 56, 60],
          ]),
          // 2024 — n(assessed)=1,909 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-04/vce_foundation_mathematics_ga24.pdf
          //   (ga24 for Foundation really lives under /2025-04/, unlike the other
          //   ga24 files at /2025-08/ — verified as VCAA's own published link.)
          table(2024, 1909, [
            [0.2, 0, 4], [0.7, 5, 9], [2.1, 10, 14], [7.6, 15, 22], [10.2, 23, 26], [12.4, 27, 30], [15.9, 31, 35], [15.7, 36, 40], [13.7, 41, 45], [12.6, 46, 53], [9.0, 54, 60],
          ]),
          // 2023 — n(assessed)=936 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_foundation_mathematics_ga23.pdf
          table(2023, 936, [
            [0.3, 0, 2], [0.7, 3, 5], [1.5, 6, 11], [6.8, 12, 24], [11.5, 25, 29], [15.3, 30, 33], [18.5, 34, 38], [15.8, 39, 43], [12.0, 44, 48], [9.7, 49, 54], [7.8, 55, 60],
          ]),
        ],
      },
      {
        key: "sac_unit4",
        label: "Unit 4 SACs",
        weight: 20,
        input: "sac",
        maxScore: 30,
        years: [
          // 2025 — n(assessed)=2,021 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_foundation_mathematics_ga25.pdf
          table(2025, 2021, [
            [0.7, 0, 2], [0.7, 3, 5], [0.9, 6, 7], [3.0, 8, 9], [10.7, 10, 12], [10.4, 13, 14], [18.3, 15, 17], [22.7, 18, 21], [13.7, 22, 24], [10.7, 25, 28], [7.9, 29, 30],
          ]),
          // 2024 — n(assessed)=1,537 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-04/vce_foundation_mathematics_ga24.pdf
          table(2024, 1537, [
            [0.8, 0, 1], [0.8, 2, 4], [1.0, 5, 6], [2.7, 7, 9], [10.2, 10, 12], [11.5, 13, 14], [17.8, 15, 17], [22.4, 18, 21], [13.7, 22, 24], [11.2, 25, 28], [7.7, 29, 30],
          ]),
          // 2023 — n(assessed)=775 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_foundation_mathematics_ga23.pdf
          table(2023, 775, [
            [1.0, 0, 4], [1.5, 5, 7], [1.9, 8, 9], [5.8, 10, 11], [10.5, 12, 13], [11.2, 14, 15], [15.6, 16, 17], [20.6, 18, 21], [15.0, 22, 25], [9.9, 26, 28], [6.7, 29, 30],
          ]),
        ],
      },
      {
        key: "exam",
        label: "Exam",
        weight: 40,
        input: "e1",
        maxScore: 160,
        years: [
          // 2025 — n(assessed)=1,916 — source: https://www.vcaa.vic.edu.au/sites/default/files/2026-04/vce_foundation_mathematics_ga25.pdf
          table(2025, 1916, [
            [0.1, 0, 4], [0.8, 5, 10], [3.4, 11, 18], [10.0, 19, 28], [15.1, 29, 40], [19.7, 41, 54], [18.6, 55, 69], [14.8, 70, 84], [9.4, 85, 104], [4.9, 105, 122], [3.0, 123, 160],
          ]),
          // 2024 — n(assessed)=1,441 — source: https://www.vcaa.vic.edu.au/sites/default/files/2025-04/vce_foundation_mathematics_ga24.pdf
          table(2024, 1441, [
            [0.2, 0, 7], [0.9, 8, 11], [2.8, 12, 19], [9.2, 20, 29], [13.9, 30, 41], [16.4, 42, 54], [17.1, 55, 69], [14.9, 70, 81], [12.4, 82, 101], [7.7, 102, 121], [4.4, 122, 160],
          ]),
          // 2023 — n(assessed)=730 — source: https://www.vcaa.vic.edu.au/sites/default/files/Documents/statistics/2023/section3/vce_foundation_mathematics_ga23.pdf
          table(2023, 730, [
            [1.5, 0, 9], [6.7, 10, 17], [10.7, 18, 25], [13.3, 26, 33], [16.6, 34, 42], [20.3, 43, 59], [15.9, 60, 78], [8.2, 79, 94], [4.1, 95, 112], [1.6, 113, 135], [1.0, 136, 160],
          ]),
        ],
      },
    ],
  },
];

export function getSubjectDef(key: SubjectKey): SubjectDef {
  const def = SUBJECTS.find((s) => s.key === key);
  if (!def) throw new Error(`Unknown subject: ${key}`);
  return def;
}

export function isSubjectKey(value: string): value is SubjectKey {
  return SUBJECTS.some((s) => s.key === value);
}

// ─── Model ───────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Map a percent score on one GA to the statewide percentile for ONE year's
 * published band table.
 *
 * Bands are treated as covering the half-open real interval
 * [low, next band's low) — the published integer ranges leave 1-mark gaps
 * (e.g. "0-9" then "10-20") that a fractional raw score could fall into —
 * with the top band closing at maxScore inclusive. Within a band the cohort
 * is assumed uniformly spread (linear interpolation).
 *
 * If a table has any unpublished range (`range: null`), we fall back to 11
 * equal-width virtual bands across [0, maxScore] and interpolate across the
 * cumulative band percentages the same way. No current table needs this.
 *
 * The result is normalised so the bands sum to exactly 100 (published tables
 * sum to 99.7–100.2 due to rounding + the NR share), then clamped to
 * [0.05, 99.95] — a band table cannot distinguish "best in the state" from
 * "top 0.05%".
 */
export function gaPercentileForYear(
  yearTable: GaYearTable,
  pctScore: number,
  maxScore: number
): number {
  const raw = (clamp(pctScore, 0, 100) / 100) * maxScore;
  const bands = yearTable.bands;
  const totalPct = bands.reduce((s, b) => s + b.pct, 0);

  const hasRanges = bands.every((b) => b.range !== null);
  // Band i covers [starts[i], ends[i]); the last band is closed at maxScore.
  const starts = bands.map((b, i) =>
    hasRanges ? (b.range as readonly [number, number])[0] : (maxScore * i) / bands.length
  );
  const ends = bands.map((_, i) => (i < bands.length - 1 ? starts[i + 1] : maxScore));

  let cumBelow = 0;
  let percentile = 100; // raw === maxScore falls through to "top of top band"
  for (let i = 0; i < bands.length; i++) {
    const within = raw < ends[i] || i === bands.length - 1;
    if (within) {
      const width = ends[i] - starts[i];
      const frac = width > 0 ? clamp((raw - starts[i]) / width, 0, 1) : 0.5;
      percentile = ((cumBelow + frac * bands[i].pct) / totalPct) * 100;
      break;
    }
    cumBelow += bands[i].pct;
  }
  return clamp(percentile, 0.05, 99.95);
}

/** Percentile for a GA, averaged across all published years (stability). */
export function gaPercentile(ga: GaDef, pctScore: number): number {
  const sum = ga.years.reduce(
    (s, y) => s + gaPercentileForYear(y, pctScore, ga.maxScore),
    0
  );
  return sum / ga.years.length;
}

/**
 * Combine per-GA percentiles into one aggregate percentile via a weighted
 * z-score mean: z = Φ⁻¹(p), z̄ = Σwᵢzᵢ/Σwᵢ, p̄ = Φ(z̄). See the module JSDoc
 * for why this beats averaging percentiles and what correlation it assumes.
 */
export function combineGaPercentiles(
  entries: readonly { percentile: number; weight: number }[]
): number {
  const totalW = entries.reduce((s, e) => s + e.weight, 0);
  if (totalW <= 0) throw new Error("combineGaPercentiles: weights must sum to > 0");
  const z =
    entries.reduce((s, e) => s + e.weight * phiInv(e.percentile / 100), 0) / totalW;
  return phi(z) * 100;
}

/** Continuous (unrounded) study score for an aggregate percentile, on [0, 50]. */
function continuousScore(aggregatePercentile: number): number {
  return clamp(30 + 7 * phiInv(aggregatePercentile / 100), 0, 50);
}

/** Core evaluation shared by the estimate and its sensitivity re-runs. */
function evaluate(def: SubjectDef, values: Record<InputKey, number>) {
  const gaPercentiles: GaPercentileEntry[] = def.gas.map((ga) => ({
    key: ga.key,
    label: ga.label,
    weight: ga.weight,
    percentile: gaPercentile(ga, values[ga.input]),
  }));
  const aggregate = combineGaPercentiles(gaPercentiles);
  return { gaPercentiles, aggregate, cont: continuousScore(aggregate) };
}

/** How much the +5-percentage-point sensitivity probe uses. */
const SENSITIVITY_STEP = 5;

/**
 * Estimate a VCE study score from assessment percentages.
 *
 * See the module JSDoc for the model and every assumption. The result always
 * carries the uncertainty band, percentile, sensitivities and caveats — treat
 * `score` alone as meaningless without `band`.
 *
 * @throws {TypeError} if a required input for the subject is missing or not a
 *   finite number (Foundation needs `e1` + `sac`; the others also need `e2`).
 */
export function estimateStudyScore(input: StudyScoreInput): StudyScoreEstimate {
  const def = getSubjectDef(input.subject);

  const values = {} as Record<InputKey, number>;
  for (const { key, label } of def.inputs) {
    const v = input[key];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new TypeError(
        `estimateStudyScore: "${key}" (${label}) is required for ${def.name}`
      );
    }
    values[key] = clamp(v, 0, 100);
  }

  const base = evaluate(def, values);
  const score = clamp(Math.round(base.cont), 0, 50);

  // ±2 in the body of the distribution, ±3 in the tails where band tables are
  // coarser and year-to-year movement is larger.
  const halfWidth = score >= 40 || score <= 20 ? 3 : 2;
  const band: [number, number] = [
    clamp(score - halfWidth, 0, 50),
    clamp(score + halfWidth, 0, 50),
  ];

  // Sensitivity: re-run the model with +5 percentage points on each input.
  const sensitivity: SensitivityEntry[] = def.inputs.map(({ key, label }) => {
    const bumped = { ...values, [key]: clamp(values[key] + SENSITIVITY_STEP, 0, 100) };
    const delta = evaluate(def, bumped).cont - base.cont;
    return { input: key, label, delta: Math.round(delta * 10) / 10 };
  });
  sensitivity.sort((a, b) => b.delta - a.delta);

  const years = def.gas[0].years.map((y) => y.year);
  const caveats: string[] = [
    `Estimate from published VCAA grade distributions (${Math.min(...years)}–${Math.max(...years)}), not VCAA's actual scaling for your year — treat the range, not the single number.`,
    "SAC scores are statistically moderated by VCAA against your school's exam results; we assume your SAC percent sits at the same point of the statewide moderated distribution.",
    "Within each published grade band we interpolate linearly, so precision is limited by band width.",
  ];
  if (score >= 45) {
    caveats.push(
      "45+ is roughly the top 2% of the state — at that level the published bands can't resolve differences, so we cap the display at 45+."
    );
  }
  if (score <= 10) {
    caveats.push(
      "At the very bottom of the distribution the published bands are too coarse for precision — read this as 'well below the state middle' rather than an exact score."
    );
  }
  if (def.key === "foundation") {
    caveats.push(
      "Foundation Mathematics has a small, fast-growing cohort (roughly 730 to 1,916 exam sittings across 2023–2025), so its distributions shift more year to year, and VCAA applies extra adjustments to small studies that we can't replicate.",
      "Your single SAC percent drives both the Unit 3 and Unit 4 SAC assessments here."
    );
  }

  return {
    subject: def.key,
    score,
    display: score >= 45 ? "45+" : String(score),
    band,
    // Re-clamp after rounding: Math.round(99.95 * 10) / 10 = 100, which would
    // un-do the [0.05, 99.95] honesty clamp (a band table can't place anyone
    // ahead of — or behind — 100% of the state). Same at the bottom, where
    // erf approximation error can round to 0.
    percentile: clamp(Math.round(base.aggregate * 10) / 10, 0.1, 99.9),
    gaPercentiles: base.gaPercentiles.map((g) => ({
      ...g,
      percentile: clamp(Math.round(g.percentile * 10) / 10, 0.1, 99.9),
    })),
    sensitivity,
    caveats,
  };
}
