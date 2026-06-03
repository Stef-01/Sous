import { describe, expect, it } from "vitest";
import { getCuisineCompatibility } from "./cuisine-matrix";

describe("getCuisineCompatibility", () => {
  it("scores a self-pairing as 1.0", () => {
    expect(getCuisineCompatibility("italian", "italian")).toBe(1.0);
  });

  it("scores a forward affinity as 0.8", () => {
    // REGIONAL_AFFINITIES.indian includes "middle-eastern"
    expect(getCuisineCompatibility("indian", "middle-eastern")).toBe(0.8);
  });

  it("scores a reverse-only affinity as 0.75", () => {
    // west-african lists south-asian, but south-asian does NOT list west-african,
    // so the match comes from the reverse lookup.
    expect(getCuisineCompatibility("south-asian", "west-african")).toBe(0.75);
  });

  it("scores comfort-classic against an unrelated cuisine as 0.6", () => {
    expect(getCuisineCompatibility("comfort-classic", "japanese")).toBe(0.6);
  });

  it("falls back to 0.5 for distant cuisines", () => {
    expect(getCuisineCompatibility("japanese", "mexican")).toBe(0.5);
  });

  it("is case-insensitive", () => {
    expect(getCuisineCompatibility("Japanese", "JAPANESE")).toBe(1.0);
    expect(getCuisineCompatibility("INDIAN", "Middle-Eastern")).toBe(0.8);
  });
});
