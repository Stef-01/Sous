import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  parseDeckProgress,
  effectiveSeen,
  deckDayStamp,
  markDeckSeen,
  resetDeckSeen,
  EMPTY_DECK_PROGRESS,
  __resetDeckProgressForTests,
} from "./use-deck-progress";

const KEY = "sous-deck-progress-v1";

function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => map.clear(),
  };
}

describe("parseDeckProgress", () => {
  it("returns the empty progress for null / non-JSON", () => {
    expect(parseDeckProgress(null)).toEqual(EMPTY_DECK_PROGRESS);
    expect(parseDeckProgress("{not json")).toEqual(EMPTY_DECK_PROGRESS);
  });

  it("parses a stored value and drops non-string slugs", () => {
    const p = parseDeckProgress(
      JSON.stringify({
        date: "2026-06-17",
        hash: "h",
        seen: ["a", 2, "b", null, "c"],
      }),
    );
    expect(p).toEqual({ date: "2026-06-17", hash: "h", seen: ["a", "b", "c"] });
  });

  it("falls back for missing / wrong-typed fields", () => {
    expect(
      parseDeckProgress(JSON.stringify({ date: 5, hash: {}, seen: "x" })),
    ).toEqual(EMPTY_DECK_PROGRESS);
  });
});

describe("deckDayStamp", () => {
  it("formats the local calendar day as zero-padded YYYY-MM-DD", () => {
    expect(deckDayStamp(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(deckDayStamp(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("effectiveSeen (the day + filter scoping)", () => {
  const prog = { date: "2026-06-17", hash: "h1", seen: ["a", "b"] };

  it("returns the seen set when both day and hash match", () => {
    expect(effectiveSeen(prog, "h1", "2026-06-17")).toEqual(["a", "b"]);
  });

  it("returns empty when the day differs (rollover → a fresh deck)", () => {
    expect(effectiveSeen(prog, "h1", "2026-06-18")).toEqual([]);
  });

  it("returns empty when the hash differs (filters changed → fresh deck)", () => {
    expect(effectiveSeen(prog, "h2", "2026-06-17")).toEqual([]);
  });

  it("returns a referentially-stable empty array on the no-match path", () => {
    // keeps the deck memo from recomputing every render
    expect(effectiveSeen(prog, "h2", "2026-06-17")).toBe(
      effectiveSeen(prog, "h3", "2026-06-17"),
    );
  });
});

describe("deck-progress store", () => {
  let store: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    store = makeStorage();
    vi.stubGlobal("window", { localStorage: store });
    __resetDeckProgressForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accumulates swiped slugs for the current day + hash", () => {
    markDeckSeen("h1", "alpha");
    markDeckSeen("h1", "beta");
    const stored = parseDeckProgress(store.getItem(KEY));
    expect(stored).toEqual({
      date: deckDayStamp(),
      hash: "h1",
      seen: ["alpha", "beta"],
    });
  });

  it("is idempotent for a repeated slug", () => {
    markDeckSeen("h1", "alpha");
    markDeckSeen("h1", "alpha");
    expect(parseDeckProgress(store.getItem(KEY)).seen).toEqual(["alpha"]);
  });

  it("starts a fresh set when the hash changes (no stale leak across decks)", () => {
    markDeckSeen("h1", "alpha");
    markDeckSeen("h2", "gamma");
    const stored = parseDeckProgress(store.getItem(KEY));
    expect(stored.hash).toBe("h2");
    expect(stored.seen).toEqual(["gamma"]);
  });

  it("resetDeckSeen clears the set for the current day + hash", () => {
    markDeckSeen("h1", "alpha");
    markDeckSeen("h1", "beta");
    resetDeckSeen("h1");
    const stored = parseDeckProgress(store.getItem(KEY));
    expect(stored.seen).toEqual([]);
    expect(stored.hash).toBe("h1");
  });
});
