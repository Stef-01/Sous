import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  getDishPerServing,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";
import { GroceryNutritionPreview } from "./grocery-nutrition-preview";

function isCovered(slug: string): boolean {
  const nutrition = getDishPerServing(slug);
  return (
    !!nutrition.perServing && nutrition.coverage >= NUTRITION_COVERAGE_FLOOR
  );
}

describe("GroceryNutritionPreview", () => {
  it("renders inside the standard semantic card surface", () => {
    const covered = [
      "grilled-salmon",
      "masoor-dal",
      "tabbouleh",
      "pico-de-gallo",
    ].filter(isCovered);
    if (covered.length === 0) return;

    const html = renderToStaticMarkup(
      React.createElement(GroceryNutritionPreview, { recipeSlugs: covered }),
    );

    expect(html).toContain("<section");
    expect(html).toContain("shadow-[var(--shadow-card)]");
    expect(html).toContain("border-radius:var(--radius-lg)");
    expect(html).toContain("What these meals deliver");
    expect(html).toContain("Calories");
    expect(html).toContain("sous-meta");
    expect(html).toContain("mt-[var(--row-gap)]");
    expect(html).toContain("gap-[var(--space-2)]");
  });

  it("renders nothing when there is no backed nutrition data", () => {
    const html = renderToStaticMarkup(
      React.createElement(GroceryNutritionPreview, {
        recipeSlugs: ["not-a-real-dish-xyz"],
      }),
    );

    expect(html).toBe("");
  });
});
