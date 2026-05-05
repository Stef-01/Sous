import { describe, expect, it } from "vitest";
import {
  CELEBRATED_CHALLENGES_STORAGE_KEY,
  hasCelebrated,
  markCelebrated,
  parseCelebratedChallenges,
  serializeCelebratedChallenges,
} from "./celebrated-challenges";

describe("CELEBRATED_CHALLENGES_STORAGE_KEY", () => {
  it("uses the v1 namespaced key", () => {
    expect(CELEBRATED_CHALLENGES_STORAGE_KEY).toBe(
      "sous-eco-celebrated-challenges-v1",
    );
  });
});

describe("parseCelebratedChallenges", () => {
  it("returns fresh on null/undefined/empty", () => {
    expect(parseCelebratedChallenges(null).slugs).toEqual([]);
    expect(parseCelebratedChallenges(undefined).slugs).toEqual([]);
    expect(parseCelebratedChallenges("").slugs).toEqual([]);
  });

  it("returns fresh on malformed JSON", () => {
    expect(parseCelebratedChallenges("{not json").slugs).toEqual([]);
  });

  it("returns fresh on non-object payload", () => {
    expect(parseCelebratedChallenges("[]").slugs).toEqual([]);
    expect(parseCelebratedChallenges("42").slugs).toEqual([]);
    expect(parseCelebratedChallenges("null").slugs).toEqual([]);
  });

  it("returns fresh on schema-version mismatch", () => {
    const stale = JSON.stringify({ v: 99, slugs: ["a"] });
    expect(parseCelebratedChallenges(stale).slugs).toEqual([]);
  });

  it("preserves valid slugs and dedupes / drops non-strings", () => {
    const raw = JSON.stringify({
      v: 1,
      slugs: ["spring-greens-2026", "spring-greens-2026", 42, null, "beyond"],
    });
    const parsed = parseCelebratedChallenges(raw);
    expect([...parsed.slugs].sort()).toEqual(["beyond", "spring-greens-2026"]);
  });
});

describe("hasCelebrated / markCelebrated", () => {
  it("hasCelebrated reflects the membership in the set", () => {
    const empty = parseCelebratedChallenges(null);
    expect(hasCelebrated({ state: empty, slug: "x" })).toBe(false);
    const next = markCelebrated({ state: empty, slug: "x" });
    expect(hasCelebrated({ state: next, slug: "x" })).toBe(true);
  });

  it("markCelebrated is idempotent", () => {
    const empty = parseCelebratedChallenges(null);
    const once = markCelebrated({ state: empty, slug: "x" });
    const twice = markCelebrated({ state: once, slug: "x" });
    expect(twice.slugs).toEqual(once.slugs);
  });

  it("markCelebrated returns a new object only when changed", () => {
    const empty = parseCelebratedChallenges(null);
    const once = markCelebrated({ state: empty, slug: "x" });
    const twice = markCelebrated({ state: once, slug: "x" });
    expect(twice).toBe(once); // reference equality on no-op
  });
});

describe("serializeCelebratedChallenges", () => {
  it("round-trips through parseCelebratedChallenges", () => {
    const empty = parseCelebratedChallenges(null);
    const next = markCelebrated({
      state: markCelebrated({ state: empty, slug: "b" }),
      slug: "a",
    });
    const raw = serializeCelebratedChallenges(next);
    const parsed = parseCelebratedChallenges(raw);
    expect(parsed.slugs).toEqual(["a", "b"]);
  });
});
