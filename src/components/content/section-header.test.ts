import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { SectionHeader } from "./section-header";

function html(node: Parameters<typeof renderToStaticMarkup>[0]): string {
  return renderToStaticMarkup(node);
}

describe("SectionHeader", () => {
  it("renders the title and the eyebrow caps", () => {
    const out = html(
      createElement(SectionHeader, { eyebrow: "Reels", title: "Watch" }),
    );
    expect(out).toContain("Watch");
    expect(out).toContain("Reels");
    expect(out).toContain("sous-label");
  });

  it("omits the eyebrow node when none is given", () => {
    const out = html(createElement(SectionHeader, { title: "Learn" }));
    expect(out).toContain("Learn");
    expect(out).not.toContain("sous-label");
  });

  it("renders an <a> when action.href is set", () => {
    const out = html(
      createElement(SectionHeader, {
        title: "Watch",
        action: { label: "See all", href: "/community/reels" },
      }),
    );
    expect(out).toContain("<a");
    expect(out).toContain('href="/community/reels"');
    expect(out).toContain("See all");
  });

  it("renders a <button> when action.onClick is set (no href)", () => {
    const out = html(
      createElement(SectionHeader, {
        title: "Watch",
        action: { label: "See all", onClick: () => {} },
      }),
    );
    expect(out).toContain("<button");
    expect(out).not.toContain("<a ");
  });

  it("renders no action node when action is omitted", () => {
    const out = html(createElement(SectionHeader, { title: "Ask" }));
    expect(out).not.toContain("<a");
    expect(out).not.toContain("<button");
  });
});
