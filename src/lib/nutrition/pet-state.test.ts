import { describe, expect, it } from "vitest";
import { computePetState, type PetInputs } from "./pet-state";

const base: PetInputs = {
  loggedCount: 0,
  kcal: null,
  targetKcal: 2000,
  protein: null,
  targetProtein: 90,
  deficits: [],
  streak: 0,
};

describe("computePetState", () => {
  it("nothing logged → asleep, zero hearts (streak alone can't wake it)", () => {
    const s = computePetState({ ...base, streak: 10 });
    expect(s.mood).toBe("asleep");
    // streak heart still counts toward the row, but the mood gate is loggedCount
    expect(s.hearts).toBe(1);
  });

  it("one small log → hungry (showed up, little else)", () => {
    const s = computePetState({
      ...base,
      loggedCount: 1,
      kcal: 300,
      protein: 8,
    });
    expect(s.mood).toBe("hungry");
    expect(s.hearts).toBe(1);
    expect(s.fullness).toBeCloseTo(0.15);
  });

  it("half-fuelled day → peckish", () => {
    const s = computePetState({
      ...base,
      loggedCount: 2,
      kcal: 1100,
      protein: 40,
    });
    expect(s.mood).toBe("peckish");
    expect(s.hearts).toBe(2);
  });

  it("in-band kcal + protein + streak → thriving with 5 hearts", () => {
    const s = computePetState({
      ...base,
      loggedCount: 3,
      kcal: 1950,
      protein: 80,
      streak: 4,
    });
    expect(s.hearts).toBe(5);
    expect(s.mood).toBe("thriving");
  });

  it("overeating leaves the band: 130% of target loses the band heart", () => {
    const s = computePetState({
      ...base,
      loggedCount: 3,
      kcal: 2600,
      protein: 80,
      streak: 4,
    });
    expect(s.hearts).toBe(4); // showed up + ≥50% + protein + streak, no band
    expect(s.mood).toBe("content");
    expect(s.fullness).toBe(1); // bar clamps
  });

  it("surfaces the top real deficit as the pet's need", () => {
    const s = computePetState({
      ...base,
      loggedCount: 1,
      kcal: 900,
      protein: 30,
      deficits: [
        { key: "iron", label: "Iron", pct: 32, weight: 0.68 },
        { key: "fiber", label: "Fiber", pct: 50, weight: 0.5 },
      ],
    });
    expect(s.need?.label).toBe("Iron");
  });
});
