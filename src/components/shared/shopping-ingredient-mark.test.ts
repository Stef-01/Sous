import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ShoppingIngredientMark } from "./shopping-ingredient-mark";

function renderMark(
  props: React.ComponentProps<typeof ShoppingIngredientMark>,
): string {
  return renderToStaticMarkup(
    React.createElement(ShoppingIngredientMark, props),
  );
}

describe("ShoppingIngredientMark", () => {
  it("uses the ingredient icon library for known grocery rows", () => {
    const html = renderMark({ name: "150 g ground beef, 95% lean / 5% fat" });

    expect(html).toContain('data-shopping-ingredient-mark="icon"');
    expect(html).toContain('data-ingredient-label="beef"');
    expect(html).toContain('data-ingredient-family="protein"');
  });

  it("keeps the legacy aisle emoji fallback for unknown grocery rows", () => {
    const html = renderMark({ name: "mystery pantry pebble" });

    expect(html).toContain('data-shopping-ingredient-mark="emoji"');
    expect(html).toContain('data-ingredient-label="aisle-fallback"');
    expect(html).not.toContain('data-ingredient-label="ingredient"');
  });

  it("mutes bought row visuals without adding a second checked state", () => {
    const html = renderMark({
      name: "lemons, optional, squeeze",
      bought: true,
    });

    expect(html).toContain("opacity-45");
    expect(html).toContain("grayscale");
    expect(html).toContain('data-ingredient-label="citrus"');
    expect(html).not.toContain("bg-[var(--nourish-green)]");
  });
});
