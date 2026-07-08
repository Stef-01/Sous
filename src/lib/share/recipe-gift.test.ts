import { describe, expect, it } from "vitest";
import {
  buildRecipeGiftPath,
  buildRecipeGiftPayload,
  buildRecipeGiftUrl,
  clampGiftStars,
  normaliseGiftSenderName,
  normaliseRecipeGiftSource,
} from "./recipe-gift";

describe("normaliseGiftSenderName", () => {
  it("keeps simple first names and strips unsafe characters", () => {
    expect(normaliseGiftSenderName(" Alex<script> ")).toBe("Alexscript");
  });

  it("falls back to A friend when empty", () => {
    expect(normaliseGiftSenderName("   ")).toBe("A friend");
  });

  it("caps names at 24 characters", () => {
    expect(normaliseGiftSenderName("A".repeat(40))).toHaveLength(24);
  });
});

describe("clampGiftStars", () => {
  it("clamps stars into 0..5", () => {
    expect(clampGiftStars(undefined)).toBe(0);
    expect(clampGiftStars("-2")).toBe(0);
    expect(clampGiftStars("4")).toBe(4);
    expect(clampGiftStars(9)).toBe(5);
  });
});

describe("normaliseRecipeGiftSource", () => {
  it("keeps known non-PII source tags and falls back to win", () => {
    expect(normaliseRecipeGiftSource("friends")).toBe("friends");
    expect(normaliseRecipeGiftSource("pod")).toBe("pod");
    expect(normaliseRecipeGiftSource("unknown")).toBe("win");
    expect(normaliseRecipeGiftSource(undefined)).toBe("win");
  });
});

describe("buildRecipeGiftPath", () => {
  it("builds the canonical relative gift route", () => {
    expect(
      buildRecipeGiftPath({
        slug: "Chana Masala",
        fromName: "Alex Doe",
        stars: 4,
      }),
    ).toBe("/gift/chana-masala?from=Alex+Doe&stars=4");
  });

  it("marks non-win discovery sources without leaking user text", () => {
    expect(
      buildRecipeGiftPath({
        slug: "caesar-salad",
        fromName: "Bri",
        stars: 0,
        source: "friends",
      }),
    ).toBe("/gift/caesar-salad?from=Bri&src=friends");
  });

  it("returns null for invalid slugs", () => {
    expect(buildRecipeGiftPath({ slug: "", fromName: "Alex" })).toBeNull();
  });
});

describe("buildRecipeGiftUrl", () => {
  it("uses sous.app by default and strips trailing origin slashes", () => {
    expect(
      buildRecipeGiftUrl({
        slug: "caesar-salad",
        fromName: "Alex",
        origin: "http://localhost:3000/",
      }),
    ).toBe("http://localhost:3000/gift/caesar-salad?from=Alex");
  });
});

describe("buildRecipeGiftPayload", () => {
  it("composes share-sheet copy and analytics props from one source", () => {
    const payload = buildRecipeGiftPayload({
      slug: "caesar-salad",
      dishName: "Caesar Salad",
      fromName: "Alex",
      stars: 5,
      source: "pod",
      origin: "https://example.test",
    });

    expect(payload).toMatchObject({
      url: "https://example.test/gift/caesar-salad?from=Alex&stars=5&src=pod",
      title: "Alex cooked Caesar Salad",
      text: "Alex made Caesar Salad on Sous. Want to cook it too?",
      source: "pod",
      stars: 5,
      analytics: {
        dishSlug: "caesar-salad",
        source: "pod",
        hasSender: true,
        starCount: 5,
      },
    });
  });
});
