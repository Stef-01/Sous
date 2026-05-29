import { describe, expect, it } from "vitest";
import { topTagsByCount } from "./tag-cloud";
import type { Article } from "@/types/content";

const a = (id: string, ...tags: string[]): Article =>
  ({
    id,
    category: "articles",
    isPlaceholder: true,
    slug: id,
    kicker: "k",
    title: "t",
    excerpt: "e",
    coverImageUrl: "/x.png",
    body: ["b"],
    authorId: "auth",
    readMinutes: 1,
    tags,
    createdAt: "2026-01-01T00:00:00Z",
  }) as Article;

describe("topTagsByCount", () => {
  it("returns an empty array for no articles", () => {
    expect(topTagsByCount([], 5)).toEqual([]);
  });

  it("returns an empty array for articles with no tags", () => {
    expect(topTagsByCount([a("1"), a("2")], 5)).toEqual([]);
  });

  it("counts each tag occurrence across articles", () => {
    const articles = [
      a("1", "stanford", "parent-mode"),
      a("2", "stanford"),
      a("3", "parent-mode", "fiber"),
    ];
    const result = topTagsByCount(articles, 5);
    const map = Object.fromEntries(result.map((t) => [t.tag, t.count]));
    expect(map).toEqual({ stanford: 2, "parent-mode": 2, fiber: 1 });
  });

  it("sorts by count desc, then tag asc as a tiebreaker", () => {
    const articles = [
      a("1", "stanford", "fiber"),
      a("2", "fiber", "stanford"),
      a("3", "behaviour", "stanford"),
    ];
    const result = topTagsByCount(articles, 5);
    // stanford (3) > fiber (2) > behaviour (1)
    expect(result.map((t) => t.tag)).toEqual([
      "stanford",
      "fiber",
      "behaviour",
    ]);
  });

  it("breaks count ties alphabetically", () => {
    // Two tags both at count 2 — the alpha-earlier wins.
    const articles = [a("1", "zeta", "alpha"), a("2", "alpha", "zeta")];
    const result = topTagsByCount(articles, 2);
    expect(result.map((t) => t.tag)).toEqual(["alpha", "zeta"]);
  });

  it("respects the limit", () => {
    const articles = [a("1", "a", "b", "c", "d", "e", "f", "g")];
    expect(topTagsByCount(articles, 3)).toHaveLength(3);
  });

  it("is case-sensitive (tags are stored as-is)", () => {
    // Stanford and stanford count separately — the upstream catalog
    // is responsible for normalising tag casing if it cares.
    const articles = [a("1", "Stanford"), a("2", "stanford")];
    const result = topTagsByCount(articles, 5);
    expect(result.map((t) => t.tag).sort()).toEqual(["Stanford", "stanford"]);
  });
});
