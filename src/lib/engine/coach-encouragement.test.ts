import { describe, it, expect } from "vitest";
import {
  getEncouragement,
  type CoachContext,
} from "./coach-encouragement";

describe("coach-encouragement", () => {
  const baseContext: CoachContext = {
    completedCooks: 5,
    currentStreak: 2,
    lastCookDate: new Date().toISOString(),
    cuisinesCovered: ["indian", "italian"],
  };

  it("returns first-cook message when completedCooks is 1", () => {
    const result = getEncouragement({ ...baseContext, completedCooks: 1 });
    expect(result).not.toBeNull();
    expect(result!.trigger).toBe("first-cook");
    expect(result!.tone).toBe("celebrate");
  });

  it("returns streak-3 message at 3-day streak", () => {
    const result = getEncouragement({ ...baseContext, currentStreak: 3 });
    expect(result).not.toBeNull();
    expect(result!.trigger).toBe("streak-3");
  });

  it("returns streak-7 message at 7-day streak", () => {
    const result = getEncouragement({ ...baseContext, currentStreak: 7 });
    expect(result).not.toBeNull();
    expect(result!.trigger).toBe("streak-7");
  });

  it("returns post-abandon message when last cook was abandoned", () => {
    const result = getEncouragement({
      ...baseContext,
      lastCookAbandoned: true,
    });
    expect(result).not.toBeNull();
    expect(result!.trigger).toBe("post-abandon");
    expect(result!.tone).toBe("gentle");
  });

  it("returns new-cuisine message for first time cooking a cuisine", () => {
    const result = getEncouragement({
      ...baseContext,
      currentCuisine: "korean",
    });
    expect(result).not.toBeNull();
    expect(result!.trigger).toBe("new-cuisine");
    expect(result!.message).toContain("Korean");
  });

  it("does NOT return new-cuisine for already-covered cuisine", () => {
    const result = getEncouragement({
      ...baseContext,
      currentCuisine: "indian",
    });
    // Should not trigger new-cuisine since "indian" is in cuisinesCovered
    expect(result?.trigger).not.toBe("new-cuisine");
  });

  it("returns return-after-absence when 3+ days since last cook", () => {
    const threeDaysAgo = new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const result = getEncouragement({
      ...baseContext,
      lastCookDate: threeDaysAgo,
    });
    expect(result).not.toBeNull();
    expect(result!.trigger).toBe("return-after-absence");
    expect(result!.tone).toBe("warm");
  });

  it("returns null when no special moment detected", () => {
    const result = getEncouragement(baseContext);
    expect(result).toBeNull();
  });

  it("first-cook takes priority over streak", () => {
    const result = getEncouragement({
      ...baseContext,
      completedCooks: 1,
      currentStreak: 3,
    });
    expect(result!.trigger).toBe("first-cook");
  });
});
