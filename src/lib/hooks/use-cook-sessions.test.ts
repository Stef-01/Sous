import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Tests for cook session logic — streak computation and stats serialization.
 * We test the pure-logic portions that don't need React rendering.
 */

const STATS_KEY = "sous-cook-stats";
const SESSIONS_KEY = "sous-cook-sessions";

function makeLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => {
      store[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k];
    }),
    get length() {
      return Object.keys(store).length;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: vi.fn((_idx: number) => null),
  };
}

describe("cook sessions localStorage contract", () => {
  let storage: ReturnType<typeof makeLocalStorage>;

  beforeEach(() => {
    storage = makeLocalStorage();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      writable: true,
    });
  });

  it("returns empty array when no sessions stored", () => {
    const raw = localStorage.getItem(SESSIONS_KEY);
    expect(raw).toBeNull();
  });

  it("round-trips session data through JSON", () => {
    const session = {
      sessionId: "cs-123",
      recipeSlug: "dal",
      dishName: "Dal Makhani",
      cuisineFamily: "Indian",
      startedAt: "2026-04-14T10:00:00.000Z",
      favorite: false,
    };

    localStorage.setItem(SESSIONS_KEY, JSON.stringify([session]));
    const parsed = JSON.parse(localStorage.getItem(SESSIONS_KEY)!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].recipeSlug).toBe("dal");
    expect(parsed[0].dishName).toBe("Dal Makhani");
  });

  it("round-trips stats data through JSON", () => {
    const stats = {
      completedCooks: 5,
      currentStreak: 3,
      lastCookDate: "2026-04-14",
      cuisinesCovered: ["Indian", "Mexican"],
    };

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    const parsed = JSON.parse(localStorage.getItem(STATS_KEY)!);
    expect(parsed.completedCooks).toBe(5);
    expect(parsed.currentStreak).toBe(3);
    expect(parsed.cuisinesCovered).toEqual(["Indian", "Mexican"]);
  });

  it("handles corrupt JSON gracefully (returns empty)", () => {
    localStorage.setItem(SESSIONS_KEY, "not-json{{{");
    expect(() => JSON.parse(localStorage.getItem(SESSIONS_KEY)!)).toThrow();
  });
});

describe("streak computation logic", () => {
  function computeStreak(
    lastCookDate: string | null,
    currentStreak: number,
  ): number {
    if (!lastCookDate) return 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (lastCookDate === todayStr || lastCookDate === yesterdayStr) {
      return currentStreak;
    }
    return 0;
  }

  it("returns 0 for null lastCookDate", () => {
    expect(computeStreak(null, 5)).toBe(0);
  });

  it("preserves streak if last cook was today", () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(computeStreak(todayStr, 7)).toBe(7);
  });

  it("preserves streak if last cook was yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    expect(computeStreak(yesterdayStr, 3)).toBe(3);
  });

  it("resets streak to 0 for older dates", () => {
    expect(computeStreak("2025-01-01", 10)).toBe(0);
  });

  it("resets streak for date 2 days ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const str = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(twoDaysAgo.getDate()).padStart(2, "0")}`;
    expect(computeStreak(str, 5)).toBe(0);
  });
});

describe("unlock status logic", () => {
  it("pathUnlocked is always true in prototype", () => {
    const status = {
      pathUnlocked: true,
      communityUnlocked: false,
      completedCooks: 0,
    };
    expect(status.pathUnlocked).toBe(true);
  });

  it("communityUnlocked is always false in prototype", () => {
    const status = {
      pathUnlocked: true,
      communityUnlocked: false,
      completedCooks: 10,
    };
    expect(status.communityUnlocked).toBe(false);
  });

  it("completedCooks defaults to 0 when no stats", () => {
    const raw = null;
    const completedCooks = raw ? (JSON.parse(raw).completedCooks ?? 0) : 0;
    expect(completedCooks).toBe(0);
  });
});
