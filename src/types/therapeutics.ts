/**
 * Culinary Therapeutics — evidence registry types.
 *
 * Operationalizes the culinary-therapeutics evidence matrix (see
 * `docs/CULINARY-THERAPEUTICS-PLAN.md`). These types describe a static,
 * versioned, machine-readable encoding of graded dietary evidence so the
 * pairing engine can consume it (CT-3) and the evidence cards can cite it
 * (CT-4).
 *
 * Three invariants are enforced in code, not prose:
 *   1. Anti-overclaiming — every record carries an `interventionClass`
 *      (`recipe-native` | `fortified-food` | `extract-or-supplement`).
 *      Only the first two may ever move a recipe's score; extract/supplement
 *      records are education only. See `interventionClass` below + the scorer.
 *   2. Honest provenance — every record carries `sources` + a `reviewStatus`.
 *      Until a clinician approves a record it stays `unreviewed` and
 *      `isEducational: true` (founder gate G1).
 *   3. No medical claims — every human-facing string must pass
 *      `assertNoMedicalClaim` (see `src/lib/therapeutics/claim-contract.ts`),
 *      enforced by the registry guard test (founder gate G5).
 *
 * "Leaky gut" is intentionally NOT a `ConditionId`: the source report shows it
 * is not a formal diagnosis. It is handled only as an education label by the
 * escalation subsystem (CT-4), never as a scored condition.
 */

import type { NutrientKey } from "./nutrition";

export type ConditionId =
  | "high-ldl"
  | "masld"
  | "ibs"
  | "ulcerative-colitis"
  | "crohns"
  | "celiac"
  | "iron-deficiency"
  | "vitamin-d-insufficiency"
  | "calcium-insufficiency"
  | "magnesium-insufficiency";

/** Operational GRADE-style confidence (report §"Scope and grading"). */
export type Grade = "high" | "moderate" | "low" | "very-low";

export type StudyType =
  | "guideline"
  | "meta-analysis"
  | "rct"
  | "crossover-rct"
  | "observational"
  | "umbrella-review";

/**
 * The anti-overclaiming spine. Only `recipe-native` (and `fortified-food`
 * when the recipe actually uses the fortified ingredient) may move a recipe's
 * therapeutic score. `extract-or-supplement` is education only and must never
 * drive a recipe claim.
 */
export type InterventionClass =
  | "recipe-native"
  | "fortified-food"
  | "extract-or-supplement";

export type DirectionOfEffect =
  | "lowers"
  | "raises"
  | "improves-symptoms"
  | "no-benefit"
  | "exclude";

export interface EvidenceSource {
  title: string;
  studyType: StudyType;
  /** Optional — the source report cites the literature descriptively; real
   *  DOIs/URLs are attached during clinician review (G1). */
  url?: string;
}

export interface EffectSize {
  metric: string; // "LDL-C MD", "IBS-SSS MD", "Hb"
  value: number; // e.g. -0.73
  unit: string; // "mmol/L", "points", "g/dL", "nmol/L"
  ciLow?: number;
  ciHigh?: number;
  heterogeneityI2?: number; // e.g. 68.6
  note?: string; // e.g. "~ -17%"
}

export interface InterventionRecord {
  id: string; // "ldl-portfolio-pattern"
  conditionId: ConditionId;
  label: string; // "Portfolio dietary pattern"
  direction: DirectionOfEffect;
  interventionClass: InterventionClass;
  grade: Grade;
  effect?: EffectSize;
  doseSignal?: string; // "≥3 g/day beta-glucan"
  /** Catalog tags / ingredient terms that realize this intervention in a
   *  recipe. Matched against a dish's tags/name/description (CT-3). */
  recipeSignals: string[];
  /** Pattern gate (RCA fix): a whole DIETARY PATTERN (e.g. Mediterranean) must
   *  not fire on a single shared ingredient. `minSignals` requires at least N
   *  distinct components to co-occur (default 1 = single-ingredient evidence).
   *  `keystoneSignal` requires a defining component to be present (e.g. olive
   *  oil for Mediterranean — the fat Thai/Japanese/Indian dishes don't use). */
  minSignals?: number;
  keystoneSignal?: string;
  /** True for time-limited / phased protocols (e.g. low-FODMAP elimination →
   *  reintroduction). The engine must never present these as permanent diets. */
  phased?: boolean;
  prepImplication?: string;
  /** Clinician-honest phrasing. MUST pass `assertNoMedicalClaim`. */
  applicationNote: string;
  sources: EvidenceSource[];
  /** Founder gate G1 — flips to "clinician-approved" only after human review. */
  reviewStatus: "unreviewed" | "clinician-approved";
  lastReviewedAt?: string;
  /** Founder gates G1 + G5 — true until clinical + legal review clear. While
   *  true the UI frames this as education, not personalized medical advice. */
  isEducational: boolean;
}

export type InteractionTarget =
  | NutrientKey
  | "ldl"
  | "ibs-symptoms"
  | "celiac-safety";

export interface InteractionRule {
  id: string; // "iron-vitc-enhance"
  target: InteractionTarget;
  enhancers: string[];
  inhibitors: string[];
  /** Deterministic recipe-level optimization rule. MUST pass
   *  `assertNoMedicalClaim`. */
  rule: string;
  grade: Grade;
  sources: EvidenceSource[];
}

export interface ConditionInfo {
  id: ConditionId;
  displayName: string;
  /** One plain-English line shown in the capture chip. */
  plainDescriptor: string;
  firstLineStrategy: string;
  bestAdjuncts: string[];
  /** What the app must NOT overstate (report §priorities). */
  avoidOverstating: string;
}

export interface RegistryVersion {
  version: string;
  updatedAt: string;
  changelog: { version: string; date: string; note: string }[];
}
