import { describe, expect, it } from "vitest";
import {
  computePersonalTargets,
  type PersonalProfile,
} from "./personal-targets";

const base: PersonalProfile = {
  sex: "male",
  age: 30,
  heightCm: 180,
  weightKg: 80,
  activity: "moderate",
  goal: "maintain",
};

describe("computePersonalTargets (#6 — Mifflin-St Jeor)", () => {
  it("matches the hand-computed Mifflin reference case", () => {
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800+1125-150+5 = 1780
    // TDEE = 1780 * 1.55 = 2759 → maintain → 2759
    const t = computePersonalTargets(base)!;
    expect(t.kcal).toBe(2759);
    expect(t.protein_g).toBe(112); // 80 * 1.4
    expect(t.fat_g).toBe(Math.round((2759 * 0.25) / 9));
    // carbs close the energy equation
    expect(t.carbs_g).toBe(
      Math.round((t.kcal - t.protein_g * 4 - t.fat_g * 9) / 4),
    );
  });

  it("female sedentary lose hits the 1200 floor when TDEE-400 dips below it", () => {
    const t = computePersonalTargets({
      sex: "female",
      age: 60,
      heightCm: 150,
      weightKg: 45,
      activity: "sedentary",
      goal: "lose",
    })!;
    expect(t.kcal).toBeGreaterThanOrEqual(1200);
  });

  it("gain adds energy and raises protein to 1.6 g/kg", () => {
    const gain = computePersonalTargets({ ...base, goal: "gain" })!;
    const maintain = computePersonalTargets(base)!;
    expect(gain.kcal).toBe(maintain.kcal + 300);
    expect(gain.protein_g).toBe(128); // 80 * 1.6
  });

  it("rejects out-of-range inputs (no nonsense targets ever)", () => {
    expect(computePersonalTargets({ ...base, age: 7 })).toBeNull();
    expect(computePersonalTargets({ ...base, heightCm: 90 })).toBeNull();
    expect(computePersonalTargets({ ...base, weightKg: 600 })).toBeNull();
    expect(computePersonalTargets({ ...base, age: NaN })).toBeNull();
  });
});
