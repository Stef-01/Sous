import { describe, expect, it } from "vitest";
import {
  isRecentlySuppressed,
  KIDS_ATE_IT_STORAGE_KEY,
  parseStoredEntries,
  recentYesRate,
  type KidsAteItEntry,
} from "./use-kids-ate-it";

describe("KIDS_ATE_IT_STORAGE_KEY", () => {
  it("uses a versioned key", () => {
    expect(KIDS_ATE_IT_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("parseStoredEntries", () => {
  it("returns empty for null / malformed", () => {
    expect(parseStoredEntries(null)).toEqual([]);
    expect(parseStoredEntries("{not")).toEqual([]);
    expect(parseStoredEntries("{}")).toEqual([]);
  });

  it("filters out non-conforming entries silently", () => {
    const raw = JSON.stringify([
      {
        cookSessionId: "s1",
        recipeSlug: "pasta-carbonara",
        verdict: "yes",
        loggedAt: "2026-05-04T00:00:00Z",
      },
      { cookSessionId: "bad" }, // dropped
      {
        cookSessionId: "s2",
        recipeSlug: "moussaka",
        verdict: "maybe", // dropped
        loggedAt: "2026-05-04T00:00:00Z",
      },
    ]);
    const result = parseStoredEntries(raw);
    expect(result).toHaveLength(1);
    expect(result[0]!.recipeSlug).toBe("pasta-carbonara");
  });
});

describe("isRecentlySuppressed", () => {
  const now = new Date("2026-05-15T12:00:00Z").getTime();
  const baseEntry = (
    overrides: Partial<KidsAteItEntry> = {},
  ): KidsAteItEntry => ({
    cookSessionId: "s",
    recipeSlug: "moussaka",
    verdict: "no",
    loggedAt: "2026-05-10T12:00:00Z",
    ...overrides,
  });

  it("suppresses dishes with a recent 'no' inside the window", () => {
    expect(isRecentlySuppressed([baseEntry()], "moussaka", now)).toBe(true);
  });

  it("does not suppress when outside the window", () => {
    const old = baseEntry({ loggedAt: "2026-04-01T00:00:00Z" });
    expect(isRecentlySuppressed([old], "moussaka", now)).toBe(false);
  });

  it("ignores 'yes' and 'some' verdicts", () => {
    const yes = baseEntry({ verdict: "yes" });
    const some = baseEntry({ verdict: "some" });
    expect(isRecentlySuppressed([yes, some], "moussaka", now)).toBe(false);
  });

  it("only suppresses the matching slug", () => {
    expect(isRecentlySuppressed([baseEntry()], "pasta-carbonara", now)).toBe(
      false,
    );
  });
});

describe("recentYesRate", () => {
  it("returns 0 for empty log", () => {
    expect(recentYesRate([])).toBe(0);
  });

  it("returns the proportion of 'yes' over the lookback", () => {
    const entries: KidsAteItEntry[] = ["yes", "yes", "no", "some", "yes"].map(
      (v, i) => ({
        cookSessionId: `s${i}`,
        recipeSlug: "x",
        verdict: v as KidsAteItEntry["verdict"],
        loggedAt: "2026-05-04T00:00:00Z",
      }),
    );
    expect(recentYesRate(entries, 5)).toBe(0.6);
  });

  it("only considers the most-recent N entries", () => {
    const entries: KidsAteItEntry[] = [
      "no",
      "no",
      "no",
      "yes",
      "yes",
      "yes",
    ].map((v, i) => ({
      cookSessionId: `s${i}`,
      recipeSlug: "x",
      verdict: v as KidsAteItEntry["verdict"],
      loggedAt: "2026-05-04T00:00:00Z",
    }));
    // last 3 are all yes
    expect(recentYesRate(entries, 3)).toBe(1);
  });
});
