import { describe, expect, it } from "vitest";
import {
  buildDishMetadata,
  buildRecipeJsonLd,
  isoDuration,
  resolveDish,
  absoluteUrl,
  SITE_URL,
} from "./recipe";
import { getAvailableCookSlugs } from "@/data/guided-cook-steps";

// A slug that ships full guided-cook data (side).
const KNOWN_SIDE = "caesar-salad";

describe("isoDuration", () => {
  it("formats positive minutes as ISO-8601", () => {
    expect(isoDuration(10)).toBe("PT10M");
    expect(isoDuration(25)).toBe("PT25M");
  });
  it("rounds fractional minutes", () => {
    expect(isoDuration(10.4)).toBe("PT10M");
  });
  it("omits non-positive / invalid input", () => {
    expect(isoDuration(0)).toBeUndefined();
    expect(isoDuration(-5)).toBeUndefined();
    expect(isoDuration(NaN)).toBeUndefined();
  });
});

describe("absoluteUrl", () => {
  it("prefixes the site origin onto a repo-relative path", () => {
    expect(absoluteUrl("/food_images/x.png")).toBe(
      `${SITE_URL}/food_images/x.png`,
    );
  });
  it("leaves an already-absolute URL untouched", () => {
    expect(absoluteUrl("https://cdn.example.com/x.png")).toBe(
      "https://cdn.example.com/x.png",
    );
  });
});

describe("resolveDish", () => {
  it("resolves a known side with kind=side", () => {
    const r = resolveDish(KNOWN_SIDE);
    expect(r).not.toBeNull();
    expect(r!.kind).toBe("side");
    expect(r!.dish.name).toBe("Caesar Salad");
  });
  it("returns null for an unknown slug", () => {
    expect(resolveDish("definitely-not-a-real-dish-xyz")).toBeNull();
  });
});

describe("buildRecipeJsonLd", () => {
  it("returns null for an unknown slug", () => {
    expect(buildRecipeJsonLd("definitely-not-a-real-dish-xyz")).toBeNull();
  });

  it("emits a valid Schema.org Recipe for a known dish", () => {
    const ld = buildRecipeJsonLd(KNOWN_SIDE)!;
    expect(ld).not.toBeNull();
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Recipe");
    expect(ld.name).toBe("Caesar Salad");
    expect(typeof ld.description).toBe("string");
    expect(ld.recipeCategory).toBe("Side dish");
    expect(ld.url).toBe(`${SITE_URL}/cook/${KNOWN_SIDE}`);
    expect(ld.author).toEqual({ "@type": "Organization", name: "Sous" });
  });

  it("includes ingredients as quantity+name strings", () => {
    const ld = buildRecipeJsonLd(KNOWN_SIDE)!;
    const ingredients = ld.recipeIngredient as string[];
    expect(Array.isArray(ingredients)).toBe(true);
    expect(ingredients.length).toBeGreaterThan(0);
    expect(ingredients.some((s) => s.includes("Romaine lettuce"))).toBe(true);
    // every entry is a non-empty trimmed string
    for (const s of ingredients) {
      expect(s.length).toBeGreaterThan(0);
      expect(s).toBe(s.trim());
    }
  });

  it("includes ordered HowToStep instructions", () => {
    const ld = buildRecipeJsonLd(KNOWN_SIDE)!;
    const steps = ld.recipeInstructions as Array<Record<string, unknown>>;
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0]["@type"]).toBe("HowToStep");
    expect(typeof steps[0].text).toBe("string");
    expect(typeof steps[0].position).toBe("number");
  });

  it("emits ISO-8601 durations when the dish has times", () => {
    const ld = buildRecipeJsonLd(KNOWN_SIDE)!;
    // caesar-salad: 10 prep + 5 cook
    expect(ld.prepTime).toBe("PT10M");
    expect(ld.cookTime).toBe("PT5M");
    expect(ld.totalTime).toBe("PT15M");
  });

  it("uses an absolute image URL when the dish has a hero image", () => {
    const ld = buildRecipeJsonLd(KNOWN_SIDE);
    if (ld?.image) {
      const images = ld.image as string[];
      expect(images[0].startsWith("http")).toBe(true);
    }
  });

  it("produces JSON-serialisable output for every available cook slug", () => {
    for (const slug of getAvailableCookSlugs()) {
      const ld = buildRecipeJsonLd(slug);
      expect(ld, `expected JSON-LD for ${slug}`).not.toBeNull();
      // round-trips without throwing (no circular refs / undefined keys)
      expect(() => JSON.stringify(ld)).not.toThrow();
    }
  });
});

describe("buildDishMetadata", () => {
  it("returns null for an unknown slug (caller falls back to defaults)", () => {
    expect(buildDishMetadata("definitely-not-a-real-dish-xyz")).toBeNull();
  });

  it("builds dish-specific title + canonical + OG/Twitter for a known dish", () => {
    const meta = buildDishMetadata(KNOWN_SIDE)!;
    expect(meta).not.toBeNull();
    expect(String(meta.title)).toContain("Caesar Salad");
    expect(meta.alternates?.canonical).toBe(`/cook/${KNOWN_SIDE}`);
    expect(meta.openGraph?.title).toContain("Caesar Salad");
    expect((meta.twitter as { card?: string }).card).toBe(
      "summary_large_image",
    );
  });
});
