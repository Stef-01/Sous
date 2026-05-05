import { describe, expect, it } from "vitest";
import { buildShareGrid } from "./share-grid";

const baseUrl = "https://soustogether.app/c/437";

describe("buildShareGrid — output shape", () => {
  it("includes the day-number header", () => {
    const out = buildShareGrid({
      dayNumber: 437,
      score: 4516,
      stars: 4,
      distanceKm: 82,
      shareUrl: baseUrl,
    });
    expect(out).toMatch(/Sous Compass · Day 437/);
  });

  it("renders score / max + stars on the second line", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 4516,
      stars: 4,
      distanceKm: 82,
      shareUrl: baseUrl,
    });
    expect(out).toMatch(/4516 \/ 5000/);
    expect(out).toMatch(/★★★★☆/);
  });

  it("emits exactly 5 emoji rows of 4 cells each", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 3000,
      stars: 3,
      distanceKm: 600,
      shareUrl: baseUrl,
    });
    const rows = out
      .split("\n")
      .filter((line) => /^[🟩🟨⬜]+$/.test(line.trim()));
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      // Each emoji is a single grapheme; for the canonical
      // squares all fit cleanly into 4 per row visually.
      const count = Array.from(row).length;
      expect(count).toBe(4);
    }
  });

  it("appends the share URL on the last line", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 1000,
      stars: 1,
      distanceKm: 1500,
      shareUrl: baseUrl,
    });
    expect(out.trim().split("\n").pop()).toBe(baseUrl);
  });
});

describe("buildShareGrid — distance buckets", () => {
  it("near-perfect distance (<100km) renders all green", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 4900,
      stars: 5,
      distanceKm: 50,
      shareUrl: baseUrl,
    });
    const greens = (out.match(/🟩/g) ?? []).length;
    expect(greens).toBe(20);
  });

  it("far miss (>8000km) renders mostly white cells", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 50,
      stars: 0,
      distanceKm: 12000,
      shareUrl: baseUrl,
    });
    const whites = (out.match(/⬜/g) ?? []).length;
    expect(whites).toBeGreaterThanOrEqual(15);
  });

  it("medium distance produces a green-yellow mix", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 3500,
      stars: 3,
      distanceKm: 300,
      shareUrl: baseUrl,
    });
    const greens = (out.match(/🟩/g) ?? []).length;
    const yellows = (out.match(/🟨/g) ?? []).length;
    expect(greens).toBeGreaterThan(0);
    expect(yellows).toBeGreaterThan(0);
  });

  it("non-finite distance renders mostly white (worst case)", () => {
    const out = buildShareGrid({
      dayNumber: 1,
      score: 0,
      stars: 0,
      distanceKm: Number.NaN,
      shareUrl: baseUrl,
    });
    const whites = (out.match(/⬜/g) ?? []).length;
    expect(whites).toBe(20);
  });
});

describe("buildShareGrid — total cell count invariant", () => {
  it("always emits exactly 20 emoji cells (5×4)", () => {
    for (const distanceKm of [0, 50, 200, 800, 2000, 5000, 10000, 20000]) {
      const out = buildShareGrid({
        dayNumber: 1,
        score: 1000,
        stars: 2,
        distanceKm,
        shareUrl: baseUrl,
      });
      const cells =
        (out.match(/🟩/g) ?? []).length +
        (out.match(/🟨/g) ?? []).length +
        (out.match(/⬜/g) ?? []).length;
      expect(cells).toBe(20);
    }
  });
});
