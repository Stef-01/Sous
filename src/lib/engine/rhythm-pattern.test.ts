import { describe, expect, it } from "vitest";
import { MIN_NOTIFY_CONFIDENCE, inferRhythmPattern } from "./rhythm-pattern";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const DAY_MS = 24 * 60 * 60 * 1000;

function fixtureSession(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: "cs-x",
    recipeSlug: "x",
    dishName: "X",
    cuisineFamily: "italian",
    startedAt: "2026-01-01T00:00:00Z",
    completedAt: "2026-01-01T01:00:00Z",
    rating: 4,
    favorite: false,
    ...over,
  };
}

/** Build a session whose completedAt falls on a specific local
 *  day-of-week + hour, `daysAgo` days before `now`. */
function sessionAt(
  now: Date,
  daysAgo: number,
  hour: number,
): CookSessionRecord {
  const ts = new Date(now.getTime() - daysAgo * DAY_MS);
  ts.setHours(hour, 0, 0, 0);
  return fixtureSession({
    sessionId: `cs-${daysAgo}-${hour}`,
    completedAt: ts.toISOString(),
  });
}

// ── empty / cold-start ─────────────────────────────────────

describe("inferRhythmPattern — empty / cold-start", () => {
  it("empty history → confidence 0, typicalHour -1", () => {
    const out = inferRhythmPattern([]);
    expect(out.confidence).toBe(0);
    expect(out.typicalHour).toBe(-1);
  });

  it("empty history → typicalDays empty", () => {
    expect(inferRhythmPattern([]).typicalDays).toEqual([]);
  });

  it("session without completedAt → ignored", () => {
    const out = inferRhythmPattern([
      fixtureSession({ completedAt: undefined }),
    ]);
    expect(out.confidence).toBe(0);
  });

  it("session with invalid completedAt → ignored", () => {
    const out = inferRhythmPattern([
      fixtureSession({ completedAt: "not-a-date" }),
    ]);
    expect(out.confidence).toBe(0);
  });

  it("future-dated session → ignored (bad data guard)", () => {
    const now = new Date("2026-05-15T18:00:00");
    const future = new Date(now.getTime() + DAY_MS).toISOString();
    const out = inferRhythmPattern(
      [fixtureSession({ completedAt: future })],
      now,
    );
    expect(out.confidence).toBe(0);
  });
});

// ── single-day pattern ────────────────────────────────────

describe("inferRhythmPattern — single-day pattern", () => {
  // Tuesday May 12 2026 = day-of-week 2
  const tuesday = new Date("2026-05-12T18:00:00");

  it("8 cooks all on Tuesdays → typicalDays = [2]", () => {
    const sessions = Array.from({ length: 8 }, (_, i) =>
      sessionAt(tuesday, i * 7, 18),
    );
    const out = inferRhythmPattern(sessions, tuesday);
    expect(out.typicalDays).toEqual([2]);
  });

  it("8 same-day cooks → high confidence (~1.0)", () => {
    const sessions = Array.from({ length: 8 }, (_, i) =>
      sessionAt(tuesday, i * 7, 18),
    );
    const out = inferRhythmPattern(sessions, tuesday);
    expect(out.confidence).toBeCloseTo(1.0, 2);
  });

  it("typicalHour reflects the cook hour", () => {
    const sessions = Array.from({ length: 6 }, (_, i) =>
      sessionAt(tuesday, i * 7, 18),
    );
    const out = inferRhythmPattern(sessions, tuesday);
    expect(out.typicalHour).toBe(18);
  });
});

// ── multi-day pattern ─────────────────────────────────────

describe("inferRhythmPattern — multi-day pattern", () => {
  const now = new Date("2026-05-15T18:00:00"); // Friday

  it("twin pattern (Tue + Sat) → both days returned", () => {
    const sessions: CookSessionRecord[] = [];
    // 4 Tuesdays
    for (let i = 0; i < 4; i++) sessions.push(sessionAt(now, 3 + 7 * i, 18));
    // 4 Saturdays
    for (let i = 0; i < 4; i++) sessions.push(sessionAt(now, 6 + 7 * i, 18));
    const out = inferRhythmPattern(sessions, now);
    expect(out.typicalDays).toContain(2); // Tuesday
    expect(out.typicalDays).toContain(6); // Saturday
  });

  it("scattered (1 cook per day across 7 days) → wide / no clear winner", () => {
    const sessions: CookSessionRecord[] = [];
    for (let i = 0; i < 7; i++) sessions.push(sessionAt(now, i, 18));
    const out = inferRhythmPattern(sessions, now);
    expect(out.confidence).toBeLessThanOrEqual(0.4);
  });
});

// ── confidence floor ──────────────────────────────────────

describe("inferRhythmPattern — confidence", () => {
  const now = new Date("2026-05-15T18:00:00");

  it("3 cooks all on Tuesday → high confidence (1.0) but caller must still gate", () => {
    const sessions = [
      sessionAt(now, 3, 18), // Tue
      sessionAt(now, 10, 18), // Tue
      sessionAt(now, 17, 18), // Tue
    ];
    const out = inferRhythmPattern(sessions, now);
    expect(out.confidence).toBeCloseTo(1.0, 2);
  });

  it("MIN_NOTIFY_CONFIDENCE is exposed for callers", () => {
    expect(MIN_NOTIFY_CONFIDENCE).toBe(0.6);
  });

  it("scattered pattern → confidence below MIN_NOTIFY", () => {
    const sessions: CookSessionRecord[] = [];
    for (let i = 0; i < 7; i++) sessions.push(sessionAt(now, i, 18));
    expect(inferRhythmPattern(sessions, now).confidence).toBeLessThan(
      MIN_NOTIFY_CONFIDENCE,
    );
  });

  it("single-day-dominated pattern → confidence above MIN_NOTIFY", () => {
    const sessions: CookSessionRecord[] = [
      sessionAt(now, 3, 18),
      sessionAt(now, 10, 18),
      sessionAt(now, 17, 18),
      sessionAt(now, 24, 18),
      sessionAt(now, 31, 18),
      sessionAt(now, 1, 18), // one off-day
    ];
    expect(inferRhythmPattern(sessions, now).confidence).toBeGreaterThanOrEqual(
      MIN_NOTIFY_CONFIDENCE,
    );
  });
});

// ── typicalHour / recency weighting ────────────────────────

describe("inferRhythmPattern — typicalHour", () => {
  const now = new Date("2026-05-15T18:00:00");

  it("all cooks at the same hour → that hour wins", () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      sessionAt(now, i * 7, 19),
    );
    expect(inferRhythmPattern(sessions, now).typicalHour).toBe(19);
  });

  it("recency weighting: recent 19h cooks beat older 12h cooks", () => {
    const sessions: CookSessionRecord[] = [
      // 4 ancient cooks at 12h (>60d ago — get floor weight)
      sessionAt(now, 100, 12),
      sessionAt(now, 110, 12),
      sessionAt(now, 120, 12),
      sessionAt(now, 130, 12),
      // 2 recent cooks at 19h (within window — full weight)
      sessionAt(now, 7, 19),
      sessionAt(now, 14, 19),
    ];
    // Recent 19h: 2 × 1.0 = 2.0; ancient 12h: 4 × 0.25 = 1.0. 19h wins.
    expect(inferRhythmPattern(sessions, now).typicalHour).toBe(19);
  });

  it("no completed sessions → typicalHour -1", () => {
    expect(inferRhythmPattern([]).typicalHour).toBe(-1);
  });
});

// ── streakHistory ─────────────────────────────────────────

describe("inferRhythmPattern — streakHistory", () => {
  const now = new Date("2026-05-15T20:00:00");

  it("returns 28 entries, day 0 = today", () => {
    const out = inferRhythmPattern([], now);
    expect(out.streakHistory.length).toBe(28);
    expect(out.streakHistory[0]?.day).toBe(0);
    expect(out.streakHistory[27]?.day).toBe(27);
  });

  it("today cook → day=0 marked cooked", () => {
    const out = inferRhythmPattern([sessionAt(now, 0, 18)], now);
    expect(out.streakHistory[0]?.cooked).toBe(true);
  });

  it("3-day-ago cook → day=3 marked cooked", () => {
    const out = inferRhythmPattern([sessionAt(now, 3, 18)], now);
    expect(out.streakHistory[3]?.cooked).toBe(true);
    expect(out.streakHistory[0]?.cooked).toBe(false);
  });

  it("cook 30+ days ago → not in the 28-day window", () => {
    const out = inferRhythmPattern([sessionAt(now, 30, 18)], now);
    expect(out.streakHistory.every((d) => !d.cooked)).toBe(true);
  });

  it("multiple cooks same day → still single 'cooked' entry", () => {
    const out = inferRhythmPattern(
      [sessionAt(now, 5, 12), sessionAt(now, 5, 19)],
      now,
    );
    expect(out.streakHistory[5]?.cooked).toBe(true);
  });
});

// ── determinism + immutability ────────────────────────────

describe("inferRhythmPattern — determinism", () => {
  it("same inputs → bit-identical output", () => {
    const now = new Date("2026-05-15T18:00:00");
    const sessions = [
      sessionAt(now, 3, 18),
      sessionAt(now, 10, 18),
      sessionAt(now, 17, 18),
    ];
    const a = inferRhythmPattern(sessions, now);
    const b = inferRhythmPattern(sessions, now);
    expect(a).toEqual(b);
  });

  it("does not mutate the input array", () => {
    const sessions: CookSessionRecord[] = [
      fixtureSession({ completedAt: "2026-05-01T18:00:00.000Z" }),
    ];
    const sessionsBefore = JSON.parse(JSON.stringify(sessions));
    inferRhythmPattern(sessions);
    expect(sessions).toEqual(sessionsBefore);
  });
});
