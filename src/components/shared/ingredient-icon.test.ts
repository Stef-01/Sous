import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { IngredientIcon } from "./ingredient-icon";

function renderIcon(
  props: React.ComponentProps<typeof IngredientIcon>,
): string {
  return renderToStaticMarkup(React.createElement(IngredientIcon, props));
}

describe("IngredientIcon", () => {
  it("renders matched ingredients as stable family-toned marks", () => {
    const html = renderIcon({ name: "lemons, optional, squeeze" });

    expect(html).toContain('data-ingredient-family="fruit"');
    expect(html).toContain('data-ingredient-label="citrus"');
    expect(html).toContain("bg-amber-50");
    expect(html).toContain("ring-amber-100");
  });

  it("keeps a quiet fallback for unknown ingredients", () => {
    const html = renderIcon({ name: "mystery pantry pebble" });

    expect(html).toContain('data-ingredient-family="unknown"');
    expect(html).toContain('data-ingredient-label="ingredient"');
    expect(html).toContain("bg-neutral-50");
  });

  it("adds a compact checked overlay without changing the ingredient identity", () => {
    const html = renderIcon({ name: "ground beef", checked: true });

    expect(html).toContain('data-ingredient-family="protein"');
    expect(html).toContain('data-ingredient-label="beef"');
    expect(html).toContain("bg-[var(--nourish-green)]");
    expect(html).toContain("grayscale");
  });

  it("uses the requested size scale", () => {
    expect(renderIcon({ name: "avocado", size: "sm" })).toContain("h-8 w-8");
    expect(renderIcon({ name: "avocado", size: "md" })).toContain("h-10 w-10");
    expect(renderIcon({ name: "avocado", size: "lg" })).toContain("h-12 w-12");
  });
});
