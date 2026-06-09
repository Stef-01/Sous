import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = readFileSync(
  resolve(process.cwd(), "src/components/shared/nutrition-ring-card.tsx"),
  "utf8",
);

describe("NutritionRingCard compact — source contract (R7 prerequisite)", () => {
  it("declares a compact prop defaulting to false (byte-identical for existing callers)", () => {
    expect(SRC).toMatch(/compact\s*=\s*false/);
    expect(SRC).toMatch(/compact\?:\s*boolean/);
  });

  it("gates the nutrient-dense badge behind !compact", () => {
    expect(SRC).toMatch(/!compact\s*&&\s*isNutrientDense\(nutrition\)/);
  });

  it("gates the nutrient-dense badge + Daily targets + Key nutrients + Complete summary behind !compact (4 gates)", () => {
    // Each gate is `!compact && …` (some carry an extra condition before the
    // body, e.g. `!compact && keyRows.length > 0 && (`), so count the prefix.
    const gates = SRC.match(/!compact\s*&&/g) ?? [];
    expect(gates.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps the ring + footnote OUTSIDE any compact gate (always rendered)", () => {
    expect(SRC).toMatch(/<MacroRing /);
    expect(SRC).toMatch(/% of FDA Daily Value · an estimate\./);
  });
});
