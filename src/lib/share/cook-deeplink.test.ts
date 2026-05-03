import { describe, expect, it } from "vitest";
import {
  buildCookDeeplink,
  buildSharePayload,
  sanitiseAuthorParam,
  sanitiseSlugForUrl,
} from "./cook-deeplink";

describe("sanitiseSlugForUrl", () => {
  it("passes already-slug-shaped strings through", () => {
    expect(sanitiseSlugForUrl("chana-masala")).toBe("chana-masala");
  });

  it("lowercases + replaces unsafe chars with hyphens", () => {
    expect(sanitiseSlugForUrl("Chana Masala (Easy)")).toBe("chana-masala-easy");
  });

  it("strips leading + trailing hyphens", () => {
    expect(sanitiseSlugForUrl("---chana---masala---")).toBe("chana-masala");
  });

  it("caps at 80 chars", () => {
    const long = "a".repeat(120);
    expect(sanitiseSlugForUrl(long).length).toBe(80);
  });

  it("returns empty string for non-string / null", () => {
    expect(sanitiseSlugForUrl("")).toBe("");
    expect(sanitiseSlugForUrl(null as unknown as string)).toBe("");
  });

  it("returns empty for emoji-only input", () => {
    expect(sanitiseSlugForUrl("🍝🥗")).toBe("");
  });
});

describe("sanitiseAuthorParam", () => {
  it("URL-encodes the result", () => {
    const result = sanitiseAuthorParam("Alex Doe");
    expect(result).toBe("Alex%20Doe");
  });

  it("preserves Unicode letters", () => {
    const result = sanitiseAuthorParam("Étienne");
    // %C3%89tienne — é encoded as UTF-8 bytes
    expect(result).toMatch(/%C3%89tienne/);
  });

  it("strips control + special characters", () => {
    expect(sanitiseAuthorParam("Alex<script>")).toBe("Alexscript");
  });

  it("caps at 40 chars before encoding", () => {
    const long = "A".repeat(60);
    const out = sanitiseAuthorParam(long);
    // 40 As, encoded letters stay as-is
    expect(out.length).toBe(40);
  });

  it("preserves apostrophes + hyphens", () => {
    expect(sanitiseAuthorParam("Mary-Jane O'Brien")).toBe(
      "Mary-Jane%20O'Brien",
    );
  });

  it("returns empty for non-string", () => {
    expect(sanitiseAuthorParam(null as unknown as string)).toBe("");
  });
});

describe("buildCookDeeplink", () => {
  it("builds a basic cook URL", () => {
    expect(buildCookDeeplink({ slug: "caesar-salad" })).toBe(
      "https://sous.app/cook/caesar-salad",
    );
  });

  it("appends author param when provided", () => {
    expect(
      buildCookDeeplink({
        slug: "caesar-salad",
        authorDisplayName: "Alex",
      }),
    ).toBe("https://sous.app/cook/caesar-salad?author=Alex");
  });

  it("URL-encodes the author param", () => {
    expect(
      buildCookDeeplink({
        slug: "caesar-salad",
        authorDisplayName: "Alex Doe",
      }),
    ).toBe("https://sous.app/cook/caesar-salad?author=Alex%20Doe");
  });

  it("ignores empty / whitespace-only author", () => {
    expect(
      buildCookDeeplink({
        slug: "caesar-salad",
        authorDisplayName: "   ",
      }),
    ).toBe("https://sous.app/cook/caesar-salad");
  });

  it("ignores null author", () => {
    expect(
      buildCookDeeplink({
        slug: "caesar-salad",
        authorDisplayName: null,
      }),
    ).toBe("https://sous.app/cook/caesar-salad");
  });

  it("respects custom origin", () => {
    expect(
      buildCookDeeplink({
        slug: "caesar-salad",
        origin: "http://localhost:3000",
      }),
    ).toBe("http://localhost:3000/cook/caesar-salad");
  });

  it("strips trailing slashes from origin", () => {
    expect(
      buildCookDeeplink({
        slug: "caesar-salad",
        origin: "https://sous.app/",
      }),
    ).toBe("https://sous.app/cook/caesar-salad");
  });

  it("returns null on empty slug", () => {
    expect(buildCookDeeplink({ slug: "" })).toBe(null);
  });

  it("returns null on slug that sanitises to empty", () => {
    expect(buildCookDeeplink({ slug: "🍝" })).toBe(null);
  });

  it("normalises mixed-case slug", () => {
    expect(buildCookDeeplink({ slug: "ChAnA-MaSaLa" })).toBe(
      "https://sous.app/cook/chana-masala",
    );
  });
});

describe("buildSharePayload", () => {
  it("returns null on empty slug", () => {
    expect(buildSharePayload({ slug: "", recipeTitle: "Test" })).toBe(null);
  });

  it("composes a 2-line text body for the clipboard", () => {
    const payload = buildSharePayload({
      slug: "caesar-salad",
      recipeTitle: "Caesar Salad",
    });
    expect(payload?.text).toBe(
      "Caesar Salad\nhttps://sous.app/cook/caesar-salad",
    );
  });

  it("includes author in the body when provided", () => {
    const payload = buildSharePayload({
      slug: "caesar-salad",
      recipeTitle: "Caesar Salad",
      authorDisplayName: "Alex",
    });
    expect(payload?.text).toBe(
      "Caesar Salad — shared by Alex\nhttps://sous.app/cook/caesar-salad?author=Alex",
    );
  });

  it("falls back to a default title when recipeTitle is empty", () => {
    const payload = buildSharePayload({
      slug: "caesar-salad",
      recipeTitle: "",
    });
    expect(payload?.title).toBe("Sous recipe");
  });

  it("matches the deeplink builder URL exactly", () => {
    const payload = buildSharePayload({
      slug: "caesar-salad",
      recipeTitle: "Caesar Salad",
      authorDisplayName: "Alex",
    });
    expect(payload?.url).toBe(
      buildCookDeeplink({
        slug: "caesar-salad",
        authorDisplayName: "Alex",
      }),
    );
  });
});
