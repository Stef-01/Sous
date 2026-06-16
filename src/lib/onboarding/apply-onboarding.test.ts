import { describe, expect, it } from "vitest";

import { buildOnboardingResult } from "./apply-onboarding";
import type { AggregatedSignals } from "@/lib/surveys/compute-survey-signals";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import type { SurveyAnswers } from "@/types/survey";

const sig = (over: Partial<AggregatedSignals> = {}): AggregatedSignals => ({
  preferenceUpdates: {},
  flags: {},
  suppressedTags: [],
  ...over,
});
const AT = "2026-06-16T00:00:00.000Z";
const STAT_BAN = /\d+\s*%[^.]*\b(users|cooks|people)\b/i;

describe("buildOnboardingResult", () => {
  it("captures goal, frictions (minus none), dietary, cuisines, skill", () => {
    const answers: SurveyAnswers = {
      goal: "plan",
      friction: ["time", "none"],
      dietary: ["vegetarian"],
      cuisines: { japanese: "like", indian: "dislike" },
      skill: "confident",
    };
    const r = buildOnboardingResult(
      answers,
      sig({ effortTolerance: "minimal", flags: { timeStrapped: true } }),
      AT,
    );
    expect(r.profile.goalKey).toBe("plan");
    expect(r.profile.frictions).toEqual(["time"]);
    expect(r.dietary).toBe("vegetarian");
    expect(r.profile.cuisineLikes).toEqual(["japanese"]);
    expect(r.profile.cuisineDislikes).toEqual(["indian"]);
    expect(r.profile.skill).toBe("confident");
    expect(r.effortTolerance).toBe("minimal");
    expect(r.profile.completedAt).toBe(AT);
  });

  it("computes a personal profile + kcal only on the macro branch", () => {
    const r = buildOnboardingResult(
      { goal: "macros", sex: "male", age: 30, height: 180, weight: 80 },
      sig(),
      AT,
    );
    expect(r.personalProfile).toMatchObject({
      sex: "male",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "light",
      goal: "maintain",
    });
    expect(r.kcalTarget).toBeGreaterThan(1200);
  });

  it("skips the numeric branch for non-macro goals", () => {
    const r = buildOnboardingResult(
      { goal: "simple", sex: "male", age: 30 },
      sig(),
      AT,
    );
    expect(r.personalProfile).toBeUndefined();
    expect(r.kcalTarget).toBeUndefined();
    expect(r.profile.numeric).toBeUndefined();
  });

  it("passes through the parent-mode age band", () => {
    const r = buildOnboardingResult(
      { goal: "family" },
      sig({ parentModeAgeBand: "4-8" }),
      AT,
    );
    expect(r.parentModeAgeBand).toBe("4-8");
  });

  it("builds mirror cards from flags + dietary + kcal", () => {
    const r = buildOnboardingResult(
      {
        goal: "macros",
        sex: "female",
        age: 35,
        height: 165,
        weight: 60,
        dietary: ["vegan"],
      },
      sig({ flags: { budgetSensitive: true, wholeFoods: true } }),
      AT,
    );
    const texts = r.mirrorCards.map((c) => c.text.toLowerCase());
    expect(texts.some((t) => t.includes("pantry-first"))).toBe(true);
    expect(texts.some((t) => t.includes("whole-ingredient"))).toBe(true);
    expect(texts.some((t) => t.includes("vegan"))).toBe(true);
    expect(texts.some((t) => t.includes("kcal"))).toBe(true);
    expect(r.mirrorCards.length).toBeLessThanOrEqual(5);
  });

  it("always yields at least one mirror card", () => {
    const r = buildOnboardingResult({}, sig(), AT);
    expect(r.mirrorCards.length).toBeGreaterThanOrEqual(1);
  });

  it("mirror copy is claim-safe and stat-free", () => {
    const r = buildOnboardingResult(
      {
        goal: "macros",
        sex: "male",
        age: 40,
        height: 175,
        weight: 75,
        dietary: ["pescatarian"],
      },
      sig({
        flags: {
          budgetSensitive: true,
          decisionFatigue: true,
          wholeFoods: true,
          kidStruggle: true,
        },
      }),
      AT,
    );
    for (const c of r.mirrorCards) {
      expect(assertNoMedicalClaim(c.text).ok, c.text).toBe(true);
      expect(STAT_BAN.test(c.text), c.text).toBe(false);
    }
  });
});
