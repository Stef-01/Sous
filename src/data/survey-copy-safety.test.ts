import { describe, expect, it } from "vitest";

import { collectOnboardingStrings, ONBOARDING_V2_DEF } from "./onboarding-v2";
import { PULSES } from "./pulses";
import { IMPORT_PROMPTS } from "./import-prompts";
import { buildOnboardingResult } from "@/lib/onboarding/apply-onboarding";
import type { AggregatedSignals } from "@/lib/surveys/compute-survey-signals";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";

/**
 * §6.2 W6 — the unified copy-safety gate. EVERY user-facing string the
 * survey/onboarding/pulse/mirror surfaces produce must:
 *   1. pass `assertNoMedicalClaim` (no cure/treat/diagnose framing), and
 *   2. contain no fabricated social-proof stat (D-22).
 * One sweep across all sources so a new string can't slip the net.
 */

// D-22: ban "25% of users save money"-style fabricated social proof.
const STAT_BAN = /\d+\s*%[^.]*\b(users|cooks|people|members|customers)\b/i;

function pulseStrings(): string[] {
  const out: string[] = [];
  for (const p of PULSES) {
    const step = p.def.steps[0];
    out.push(p.label);
    if ("title" in step && step.title) out.push(step.title);
    if ("subtitle" in step && step.subtitle) out.push(step.subtitle);
    if ("options" in step) for (const o of step.options) out.push(o.label);
    if (step.kind === "thumbs") for (const r of step.rows) out.push(r.label);
    if (step.kind === "statements")
      for (const s of step.statements) out.push(s.text);
  }
  return out;
}

function mirrorStrings(): string[] {
  // Exhaust the mirror-card templates across goals / flags / dietary / kcal.
  const goals = [
    "macros",
    "plan",
    "simple",
    "inspiration",
    "family",
    "longevity",
  ];
  const allFlags = {
    budgetSensitive: true,
    timeStrapped: true,
    lowEnergy: true,
    decisionFatigue: true,
    wholeFoods: true,
    kidStruggle: true,
  };
  const out = new Set<string>();
  for (const goal of goals) {
    for (const dietary of ["vegan", "pescatarian", "vegetarian", "none"]) {
      const signals: AggregatedSignals = {
        preferenceUpdates: {},
        flags: allFlags,
        suppressedTags: [],
      };
      const r = buildOnboardingResult(
        {
          goal,
          dietary: [dietary],
          sex: "female",
          age: 30,
          height: 165,
          weight: 65,
        },
        signals,
        "2026-06-16T00:00:00.000Z",
      );
      for (const c of r.mirrorCards) out.add(c.text);
    }
  }
  return [...out];
}

function importPromptStrings(): string[] {
  // The in-app blurbs/labels + the full prompt bodies (shown via "Preview").
  return Object.values(IMPORT_PROMPTS).flatMap((p) => [
    p.label,
    p.blurb,
    p.inputHint,
    p.prompt,
  ]);
}

describe("§6.2 W6 — survey/onboarding/pulse/mirror copy safety", () => {
  const groups: Record<string, string[]> = {
    onboarding: collectOnboardingStrings(ONBOARDING_V2_DEF),
    pulses: pulseStrings(),
    mirror: mirrorStrings(),
    importPrompts: importPromptStrings(),
  };

  for (const [name, strings] of Object.entries(groups)) {
    describe(name, () => {
      it("collects a non-empty set of strings", () => {
        expect(strings.length).toBeGreaterThan(0);
      });
      it("is free of medical claims", () => {
        for (const s of strings) {
          expect(assertNoMedicalClaim(s).ok, `${name}: ${s}`).toBe(true);
        }
      });
      it("is free of fabricated social-proof stats", () => {
        for (const s of strings) {
          expect(STAT_BAN.test(s), `${name}: ${s}`).toBe(false);
        }
      });
    });
  }

  it("the mirror surfaces every template across goals + flags", () => {
    // sanity: the exhaustive sweep actually produced the goal + flag cards.
    const m = mirrorStrings();
    expect(m.some((t) => /nutrition goals/i.test(t))).toBe(true);
    expect(m.some((t) => /Parent Mode/i.test(t))).toBe(true);
    expect(m.some((t) => /kcal/i.test(t))).toBe(true);
  });
});
