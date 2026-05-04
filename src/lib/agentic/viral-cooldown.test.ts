import { describe, expect, it } from "vitest";
import {
  COOLDOWN_BACKOFF_DAYS,
  COOLDOWN_BASELINE_DAYS,
  DISMISSALS_BEFORE_BACKOFF,
  DISMISSALS_BEFORE_SUPPRESSION,
  advanceCooldown,
  evaluateCooldown,
  freshCooldownState,
} from "./viral-cooldown";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("freshCooldownState", () => {
  it("returns a clean cold-start state", () => {
    expect(freshCooldownState()).toEqual({
      lastShownAt: null,
      dismissalCount: 0,
    });
  });
});

// ── advanceCooldown ───────────────────────────────────────

describe("advanceCooldown", () => {
  const initial = freshCooldownState();
  const showAt = new Date("2026-05-15T18:00:00");

  it("'shown' event records timestamp", () => {
    const next = advanceCooldown(initial, { kind: "shown", at: showAt });
    expect(next.lastShownAt).toBe(showAt.toISOString());
    expect(next.dismissalCount).toBe(0);
  });

  it("'dismissed' increments dismissalCount", () => {
    const next = advanceCooldown(initial, { kind: "dismissed" });
    expect(next.dismissalCount).toBe(1);
  });

  it("'accepted' resets dismissalCount", () => {
    const post3 = { lastShownAt: showAt.toISOString(), dismissalCount: 3 };
    const next = advanceCooldown(post3, { kind: "accepted" });
    expect(next.dismissalCount).toBe(0);
    // lastShownAt preserved
    expect(next.lastShownAt).toBe(showAt.toISOString());
  });

  it("multiple dismissals stack", () => {
    let s = initial;
    s = advanceCooldown(s, { kind: "dismissed" });
    s = advanceCooldown(s, { kind: "dismissed" });
    s = advanceCooldown(s, { kind: "dismissed" });
    expect(s.dismissalCount).toBe(3);
  });

  it("non-mutating — input state unchanged", () => {
    const before = { lastShownAt: null, dismissalCount: 0 };
    advanceCooldown(before, { kind: "dismissed" });
    expect(before.dismissalCount).toBe(0);
  });
});

// ── evaluateCooldown — fire / hold ────────────────────────

describe("evaluateCooldown — cold start + reset paths", () => {
  const now = new Date("2026-05-15T18:00:00");

  it("cold start (no prior) → fire", () => {
    expect(evaluateCooldown(freshCooldownState(), now).fire).toBe(true);
  });

  it("invalid lastShownAt → fire (reset)", () => {
    expect(
      evaluateCooldown({ lastShownAt: "not-a-date", dismissalCount: 0 }, now)
        .fire,
    ).toBe(true);
  });
});

describe("evaluateCooldown — baseline window (7 days)", () => {
  const now = new Date("2026-05-15T18:00:00");

  it("shown 1 day ago → hold", () => {
    const lastShownAt = new Date(now.getTime() - 1 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 0 }, now).fire).toBe(
      false,
    );
  });

  it("shown 6 days ago + 0 dismissals → still hold (within baseline)", () => {
    const lastShownAt = new Date(now.getTime() - 6 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 0 }, now).fire).toBe(
      false,
    );
  });

  it("shown 7 days ago + 0 dismissals → fire (window elapsed)", () => {
    const lastShownAt = new Date(now.getTime() - 7 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 0 }, now).fire).toBe(
      true,
    );
  });
});

describe("evaluateCooldown — backoff window (14 days after 2 dismissals)", () => {
  const now = new Date("2026-05-15T18:00:00");

  it("8 days ago + 2 dismissals → hold (backoff window)", () => {
    const lastShownAt = new Date(now.getTime() - 8 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 2 }, now).fire).toBe(
      false,
    );
  });

  it("14 days ago + 2 dismissals → fire (backoff elapsed)", () => {
    const lastShownAt = new Date(now.getTime() - 14 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 2 }, now).fire).toBe(
      true,
    );
  });

  it("8 days ago + 1 dismissal → fire (still on baseline window)", () => {
    const lastShownAt = new Date(now.getTime() - 8 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 1 }, now).fire).toBe(
      true,
    );
  });
});

describe("evaluateCooldown — suppression (4+ dismissals)", () => {
  const now = new Date("2026-05-15T18:00:00");

  it("4 dismissals → off entirely regardless of window", () => {
    const lastShownAt = new Date(now.getTime() - 60 * DAY_MS).toISOString();
    expect(evaluateCooldown({ lastShownAt, dismissalCount: 4 }, now).fire).toBe(
      false,
    );
  });

  it("5 dismissals → still off", () => {
    expect(
      evaluateCooldown({ lastShownAt: null, dismissalCount: 5 }, now).fire,
    ).toBe(false);
  });
});

describe("evaluateCooldown — clock skew", () => {
  it("future lastShownAt → defensive hold", () => {
    const now = new Date("2026-05-15T18:00:00");
    const future = new Date(now.getTime() + 1 * DAY_MS).toISOString();
    expect(
      evaluateCooldown({ lastShownAt: future, dismissalCount: 0 }, now).fire,
    ).toBe(false);
  });
});

// ── exposed constants ─────────────────────────────────────

describe("constants", () => {
  it("plan-mandated values exposed", () => {
    expect(COOLDOWN_BASELINE_DAYS).toBe(7);
    expect(COOLDOWN_BACKOFF_DAYS).toBe(14);
    expect(DISMISSALS_BEFORE_BACKOFF).toBe(2);
    expect(DISMISSALS_BEFORE_SUPPRESSION).toBe(4);
  });
});
