import { describe, expect, it } from "vitest";
import {
  DEFAULT_THRESHOLD_SWEEP,
  generateSyntheticCohort,
  runNoveltyEval,
  thresholdSensitivitySweep,
} from "./novelty-eval";

const START = new Date("2026-05-15T12:00:00");

// ── generateSyntheticCohort ──────────────────────────────

describe("generateSyntheticCohort", () => {
  it("produces the requested userCount", () => {
    const out = generateSyntheticCohort({ userCount: 50, seed: 42 });
    expect(out.length).toBe(50);
  });

  it("each user has a non-empty pantry", () => {
    const out = generateSyntheticCohort({ userCount: 10, seed: 1 });
    for (const u of out) {
      expect(u.pantry.length).toBeGreaterThanOrEqual(6);
      expect(u.pantry.length).toBeLessThanOrEqual(15);
    }
  });

  it("pantry has no duplicates", () => {
    const out = generateSyntheticCohort({ userCount: 10, seed: 1 });
    for (const u of out) {
      expect(new Set(u.pantry).size).toBe(u.pantry.length);
    }
  });

  it("deterministic — same seed → same cohort", () => {
    const a = generateSyntheticCohort({ userCount: 20, seed: 42 });
    const b = generateSyntheticCohort({ userCount: 20, seed: 42 });
    expect(a).toEqual(b);
  });

  it("different seed → different cohort", () => {
    const a = generateSyntheticCohort({ userCount: 20, seed: 42 });
    const b = generateSyntheticCohort({ userCount: 20, seed: 99 });
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it("each user has unique id", () => {
    const out = generateSyntheticCohort({ userCount: 30, seed: 7 });
    const ids = new Set(out.map((u) => u.id));
    expect(ids.size).toBe(30);
  });
});

// ── runNoveltyEval ───────────────────────────────────────

describe("runNoveltyEval", () => {
  const cohort = generateSyntheticCohort({ userCount: 20, seed: 42 });

  it("returns the input threshold + cohort × days as userDays", () => {
    const out = runNoveltyEval({
      cohort,
      threshold: 0.65,
      daysPerUser: 7,
      startDate: START,
    });
    expect(out.threshold).toBe(0.65);
    expect(out.userDays).toBe(140); // 20 × 7
  });

  it("fired + suppressed + silent always sums to userDays", () => {
    const out = runNoveltyEval({
      cohort,
      threshold: 0.65,
      daysPerUser: 7,
      startDate: START,
    });
    expect(out.fired + out.suppressed + out.silent).toBe(out.userDays);
  });

  it("fireRate is a 0..1 fraction", () => {
    const out = runNoveltyEval({
      cohort,
      threshold: 0.65,
      daysPerUser: 5,
      startDate: START,
    });
    expect(out.fireRate).toBeGreaterThanOrEqual(0);
    expect(out.fireRate).toBeLessThanOrEqual(1);
  });

  it("fireRate matches fired / userDays", () => {
    const out = runNoveltyEval({
      cohort,
      threshold: 0.65,
      daysPerUser: 5,
      startDate: START,
    });
    expect(out.fireRate).toBeCloseTo(out.fired / out.userDays, 5);
  });

  it("higher threshold → lower or equal fire rate", () => {
    const lowThresh = runNoveltyEval({
      cohort,
      threshold: 0.5,
      daysPerUser: 7,
      startDate: START,
    });
    const highThresh = runNoveltyEval({
      cohort,
      threshold: 0.9,
      daysPerUser: 7,
      startDate: START,
    });
    expect(highThresh.fireRate).toBeLessThanOrEqual(lowThresh.fireRate);
  });

  it("empty cohort → zero userDays + zero fireRate", () => {
    const out = runNoveltyEval({
      cohort: [],
      threshold: 0.65,
      daysPerUser: 7,
      startDate: START,
    });
    expect(out.userDays).toBe(0);
    expect(out.fireRate).toBe(0);
  });

  it("deterministic — same inputs → same result", () => {
    const a = runNoveltyEval({
      cohort,
      threshold: 0.65,
      daysPerUser: 5,
      startDate: START,
    });
    const b = runNoveltyEval({
      cohort,
      threshold: 0.65,
      daysPerUser: 5,
      startDate: START,
    });
    expect(a).toEqual(b);
  });
});

// ── thresholdSensitivitySweep ────────────────────────────

describe("thresholdSensitivitySweep", () => {
  const cohort = generateSyntheticCohort({ userCount: 10, seed: 7 });

  it("returns one result per input threshold", () => {
    const out = thresholdSensitivitySweep({
      cohort,
      thresholds: [0.5, 0.65, 0.8],
      daysPerUser: 5,
      startDate: START,
    });
    expect(out.length).toBe(3);
  });

  it("results sorted ascending by threshold", () => {
    const out = thresholdSensitivitySweep({
      cohort,
      thresholds: [0.8, 0.5, 0.65],
      daysPerUser: 5,
      startDate: START,
    });
    expect(out.map((r) => r.threshold)).toEqual([0.5, 0.65, 0.8]);
  });

  it("DEFAULT_THRESHOLD_SWEEP includes the engine's NOVELTY_FIRE_THRESHOLD", () => {
    expect(DEFAULT_THRESHOLD_SWEEP).toContain(0.65);
  });

  it("fire rate is monotonically non-increasing across the sweep", () => {
    const out = thresholdSensitivitySweep({
      cohort,
      thresholds: [...DEFAULT_THRESHOLD_SWEEP],
      daysPerUser: 7,
      startDate: START,
    });
    for (let i = 1; i < out.length; i++) {
      const prev = out[i - 1];
      const curr = out[i];
      if (prev && curr) {
        expect(curr.fireRate).toBeLessThanOrEqual(prev.fireRate);
      }
    }
  });
});
