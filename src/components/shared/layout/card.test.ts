import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./card";

function renderCard(props: React.ComponentProps<typeof Card>): string {
  return renderToStaticMarkup(React.createElement(Card, props));
}

describe("Card", () => {
  it("renders the standard padded white card by default", () => {
    const html = renderCard({ children: "Dinner" });

    expect(html).toContain("<div");
    expect(html).toContain("bg-white");
    expect(html).toContain("shadow-[var(--shadow-card)]");
    expect(html).toContain("p-[var(--card-pad)]");
    expect(html).toContain("border-radius:var(--radius-md)");
  });

  it("supports semantic card elements and image-forward cards without padding", () => {
    const html = renderCard({
      as: "article",
      radius: "lg",
      padded: false,
      className: "overflow-hidden",
      children: "Recipe",
    });

    expect(html).toContain("<article");
    expect(html).toContain("overflow-hidden");
    expect(html).not.toContain("p-[var(--card-pad)]");
    expect(html).toContain("border-radius:var(--radius-lg)");
  });

  it("keeps the radius token when callers pass additional inline style", () => {
    const html = renderCard({
      radius: "sm",
      style: { color: "red" },
      children: "Styled",
    });

    expect(html).toContain("color:red");
    expect(html).toContain("border-radius:var(--radius-sm)");
  });
});
