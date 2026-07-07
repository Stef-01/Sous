import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SectionKicker } from "./section-kicker";

function renderKicker(
  props: React.ComponentProps<typeof SectionKicker>,
): string {
  return renderToStaticMarkup(React.createElement(SectionKicker, props));
}

describe("SectionKicker", () => {
  it("renders an h2 default label with the roomy size", () => {
    const html = renderKicker({ children: "Recipes" });

    expect(html).toContain("<h2");
    expect(html).toContain("font-bold");
    expect(html).toContain("uppercase");
    expect(html).toContain("text-[11px]");
    expect(html).toContain("tracking-[0.12em]");
    expect(html).toContain("text-[var(--nourish-subtext)]");
  });

  it("supports compact paragraph kickers", () => {
    const html = renderKicker({
      as: "p",
      size: "10px",
      children: "Your kitchen",
    });

    expect(html).toContain("<p");
    expect(html).toContain("text-[10px]");
    expect(html).toContain("tracking-[0.16em]");
  });

  it("supports green and caller-supplied classes", () => {
    const html = renderKicker({
      variant: "green",
      className: "px-1",
      children: "Sourced from",
    });

    expect(html).toContain("text-[var(--nourish-green)]");
    expect(html).toContain("px-1");
  });
});
