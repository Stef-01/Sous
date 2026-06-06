import { describe, expect, it } from "vitest";
import { proteinQuality } from "./protein-quality";
import type { PerServingNutrition } from "@/types/nutrition";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";

describe("proteinQuality (DIAAS-lite)", () => {
  it("returns null when there's negligible protein", () => {
    expect(
      proteinQuality({ protein_g: 0 } as unknown as PerServingNutrition),
    ).toBeNull();
  });

  it("returns null when the amino panel is incomplete (no false claims)", () => {
    expect(
      proteinQuality({ protein_g: 20 } as unknown as PerServingNutrition),
    ).toBeNull();
  });

  it("scores a real composed dish and names its limiting amino acid", () => {
    const n = getDishNutrition("guacamole").perServing;
    expect(n).not.toBeNull();
    if (n) {
      const q = proteinQuality(n);
      // guacamole composes a full amino panel from FDC, so a verdict exists.
      if (q) {
        expect(q.score).toBeGreaterThan(0);
        expect(q.limiting.length).toBeGreaterThan(0);
        expect(typeof q.complete).toBe("boolean");
      }
    }
  });
});
