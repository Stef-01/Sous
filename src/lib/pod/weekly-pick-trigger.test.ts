import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCK_HOUR,
  evaluateWeeklyPickTrigger,
  weeklyPickToken,
} from "./weekly-pick-trigger";

const DAY_MS = 24 * 60 * 60 * 1000;

// Pick a known Monday for tests: 2026-05-11 was a Monday.
const MONDAY_8AM = new Date("2026-05-11T08:00:00");
const MONDAY_10AM = new Date("2026-05-11T10:00:00");
const TUESDAY_8AM = new Date("2026-05-12T08:00:00");

// ── evaluateWeeklyPickTrigger — non-Monday + non-admin ──

describe("evaluateWeeklyPickTrigger — gates", () => {
  it("not admin → skip", () => {
    expect(
      evaluateWeeklyPickTrigger({
        now: MONDAY_8AM,
        lastPickedAt: null,
        isAdmin: false,
      }).trigger,
    ).toBe("skip");
  });

  it("not Monday → skip", () => {
    expect(
      evaluateWeeklyPickTrigger({
        now: TUESDAY_8AM,
        lastPickedAt: null,
        isAdmin: true,
      }).trigger,
    ).toBe("skip");
  });

  it("Sunday → skip", () => {
    const sunday = new Date("2026-05-10T08:00:00");
    expect(
      evaluateWeeklyPickTrigger({
        now: sunday,
        lastPickedAt: null,
        isAdmin: true,
      }).trigger,
    ).toBe("skip");
  });
});

// ── evaluateWeeklyPickTrigger — fire paths ────────────────

describe("evaluateWeeklyPickTrigger — fire paths", () => {
  it("Monday morning + admin + no prior pick → fire", () => {
    const out = evaluateWeeklyPickTrigger({
      now: MONDAY_8AM,
      lastPickedAt: null,
      isAdmin: true,
    });
    expect(out.trigger).toBe("fire");
    expect(out.reason).toContain("no current-week pick");
  });

  it("Monday + admin + previous-week pick → fire (cron semantic)", () => {
    const lastWeek = new Date(MONDAY_8AM.getTime() - 7 * DAY_MS);
    const out = evaluateWeeklyPickTrigger({
      now: MONDAY_8AM,
      lastPickedAt: lastWeek,
      isAdmin: true,
    });
    expect(out.trigger).toBe("fire");
    expect(out.reason).toContain("previous week");
  });

  it("Monday before lockHour + admin + this-Monday pick → fire (override)", () => {
    // pick made at 6am, view at 8am, lockHour=9 → fire (override window)
    const earlyPick = new Date("2026-05-11T06:00:00");
    const out = evaluateWeeklyPickTrigger({
      now: MONDAY_8AM,
      lastPickedAt: earlyPick,
      isAdmin: true,
    });
    expect(out.trigger).toBe("fire");
    expect(out.reason).toContain("override");
  });

  it("invalid lastPickedAt → fire (re-pick)", () => {
    const bad = new Date("not-a-date");
    const out = evaluateWeeklyPickTrigger({
      now: MONDAY_8AM,
      lastPickedAt: bad,
      isAdmin: true,
    });
    expect(out.trigger).toBe("fire");
  });
});

// ── evaluateWeeklyPickTrigger — locked ────────────────────

describe("evaluateWeeklyPickTrigger — locked past cutoff", () => {
  it("Monday past lockHour + admin + this-Monday pick → skip", () => {
    const earlyPick = new Date("2026-05-11T06:00:00");
    const out = evaluateWeeklyPickTrigger({
      now: MONDAY_10AM,
      lastPickedAt: earlyPick,
      isAdmin: true,
    });
    expect(out.trigger).toBe("skip");
    expect(out.reason).toContain("locked");
  });

  it("custom lockHour=12 → 10am still inside override", () => {
    const earlyPick = new Date("2026-05-11T06:00:00");
    const out = evaluateWeeklyPickTrigger({
      now: MONDAY_10AM,
      lastPickedAt: earlyPick,
      isAdmin: true,
      lockHour: 12,
    });
    expect(out.trigger).toBe("fire");
  });

  it("DEFAULT_LOCK_HOUR is 9", () => {
    expect(DEFAULT_LOCK_HOUR).toBe(9);
  });
});

// ── weeklyPickToken — race-condition guard ────────────────

describe("weeklyPickToken", () => {
  it("Monday → returns token for that Monday's date", () => {
    expect(weeklyPickToken(MONDAY_8AM)).toBe("pick-2026-05-11");
  });

  it("Tuesday-of-same-week → returns previous Monday's token (race-safe)", () => {
    expect(weeklyPickToken(TUESDAY_8AM)).toBe("pick-2026-05-11");
  });

  it("Sunday → walks back to previous Monday", () => {
    const sunday = new Date("2026-05-17T08:00:00");
    expect(weeklyPickToken(sunday)).toBe("pick-2026-05-11");
  });

  it("Monday morning → same token regardless of hour", () => {
    expect(weeklyPickToken(MONDAY_8AM)).toBe(weeklyPickToken(MONDAY_10AM));
  });

  it("two admins on same Monday → identical token (first claim wins)", () => {
    const adminA = MONDAY_8AM;
    const adminB = new Date("2026-05-11T08:00:30"); // 30s later
    expect(weeklyPickToken(adminA)).toBe(weeklyPickToken(adminB));
  });

  it("different Mondays → different tokens", () => {
    const nextMonday = new Date("2026-05-18T08:00:00");
    expect(weeklyPickToken(MONDAY_8AM)).not.toBe(weeklyPickToken(nextMonday));
  });
});
