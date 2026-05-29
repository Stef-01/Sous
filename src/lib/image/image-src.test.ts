import { describe, expect, it } from "vitest";
import { imageSrc } from "./image-src";

// Note: env-var-driven branches can't be flipped after module load
// (process.env reads are top-level). These tests exercise the
// fallback path only — the R2-active path is covered by manual smoke
// when the founder sets the env var.

describe("imageSrc — fallback (no R2_BASE_URL)", () => {
  it("returns local paths unchanged", () => {
    expect(imageSrc("/food_images/butter_chicken.png")).toBe(
      "/food_images/butter_chicken.png",
    );
  });

  it("returns content paths unchanged", () => {
    expect(imageSrc("/content/carbs-are-not-the-enemy/hero.webp")).toBe(
      "/content/carbs-are-not-the-enemy/hero.webp",
    );
  });

  it("passes through absolute http URLs", () => {
    expect(imageSrc("https://example.com/x.jpg")).toBe(
      "https://example.com/x.jpg",
    );
  });

  it("passes through data URIs", () => {
    expect(imageSrc("data:image/png;base64,xxx")).toBe(
      "data:image/png;base64,xxx",
    );
  });

  it("passes through blob URLs (camera capture)", () => {
    expect(imageSrc("blob:abc")).toBe("blob:abc");
  });

  it("returns empty string unchanged", () => {
    expect(imageSrc("")).toBe("");
  });
});
