import { describe, expect, it } from "vitest";
import { getDishTherapeuticProfile } from "./dish-therapeutic-profile";

describe("getDishTherapeuticProfile", () => {
  it("unions resolved ingredient classes + groups for a real dish", () => {
    const caesar = getDishTherapeuticProfile("caesar-salad");
    expect(caesar.therapeuticClasses).toContain("olive-oil");
    expect(caesar.foodGroups).toContain("fat-oil");
  });

  it("surfaces legume identity for a soy/legume dish", () => {
    const miso = getDishTherapeuticProfile("miso-soup");
    expect(miso.foodGroups).toContain("legume");
  });

  it("falls back to name+tags for a meal with no ingredient links", () => {
    // "Masoor Dal" is a meal (no guided-cook links) — its identity comes from
    // its own name resolving to red-lentils → legume.
    const masoor = getDishTherapeuticProfile("masoor-dal-meal", "Masoor Dal");
    expect(masoor.foodGroups).toContain("legume");

    const salmon = getDishTherapeuticProfile(undefined, "Grilled Salmon");
    expect(salmon.therapeuticClasses).toContain("oily-fish");
  });

  it("is empty for an undefined or unknown slug (safe fallback)", () => {
    expect(getDishTherapeuticProfile(undefined)).toEqual({
      foodGroups: [],
      therapeuticClasses: [],
    });
    expect(getDishTherapeuticProfile("no-such-dish")).toEqual({
      foodGroups: [],
      therapeuticClasses: [],
    });
  });
});
