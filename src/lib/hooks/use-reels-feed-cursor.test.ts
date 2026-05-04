import { describe, expect, it } from "vitest";
import {
  buildInfiniteReelsFeed,
  deterministicShuffle,
  todaySeed,
} from "./use-reels-feed-cursor";
import type { Reel } from "@/types/content";

function r(id: string, createdAt: string): Reel {
  return {
    id,
    category: "reels",
    isPlaceholder: true,
    title: id,
    posterImageUrl: "",
    caption: "",
    creatorHandle: "",
    creatorName: "",
    durationSeconds: 30,
    likes: 0,
    createdAt,
  };
}

describe("buildInfiniteReelsFeed", () => {
  it("returns empty array for empty input", () => {
    expect(buildInfiniteReelsFeed([], "seed")).toEqual([]);
  });

  it("returns 3x catalog size", () => {
    const reels = [
      r("a", "2026-01-01"),
      r("b", "2026-01-02"),
      r("c", "2026-01-03"),
    ];
    expect(buildInfiniteReelsFeed(reels, "seed").length).toBe(9);
  });

  it("starts with newest-first chronological order", () => {
    const reels = [
      r("a", "2026-01-01"),
      r("b", "2026-01-02"),
      r("c", "2026-01-03"),
    ];
    const out = buildInfiniteReelsFeed(reels, "seed");
    expect(out.slice(0, 3).map((x) => x.id)).toEqual(["c", "b", "a"]);
  });

  it("is deterministic across calls", () => {
    const reels = [
      r("a", "2026-01-01"),
      r("b", "2026-01-02"),
      r("c", "2026-01-03"),
      r("d", "2026-01-04"),
      r("e", "2026-01-05"),
    ];
    const a = buildInfiniteReelsFeed(reels, "today");
    const b = buildInfiniteReelsFeed(reels, "today");
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it("changes order with different seeds", () => {
    const reels = [
      r("a", "2026-01-01"),
      r("b", "2026-01-02"),
      r("c", "2026-01-03"),
      r("d", "2026-01-04"),
      r("e", "2026-01-05"),
    ];
    const a = buildInfiniteReelsFeed(reels, "monday");
    const b = buildInfiniteReelsFeed(reels, "tuesday");
    // Middle (shuffled) section should differ between seeds.
    expect(a.slice(5, 10).map((x) => x.id)).not.toEqual(
      b.slice(5, 10).map((x) => x.id),
    );
  });
});

describe("deterministicShuffle", () => {
  it("returns the same items, just reordered", () => {
    const input = ["a", "b", "c", "d", "e"];
    const out = deterministicShuffle(input, "seed");
    expect([...out].sort()).toEqual([...input].sort());
  });

  it("does not mutate the input array", () => {
    const input = ["a", "b", "c"];
    const before = [...input];
    deterministicShuffle(input, "seed");
    expect(input).toEqual(before);
  });
});

describe("todaySeed", () => {
  it("returns YYYY-MM-DD format", () => {
    const seed = todaySeed(new Date("2026-05-04T10:00:00Z"));
    expect(seed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("is stable for the same calendar date", () => {
    const a = todaySeed(new Date(2026, 4, 4, 10));
    const b = todaySeed(new Date(2026, 4, 4, 23));
    expect(a).toBe(b);
  });
});
