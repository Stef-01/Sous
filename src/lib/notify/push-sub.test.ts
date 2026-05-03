import { describe, expect, it } from "vitest";
import {
  formatNudgeText,
  formatRhythmIdentity,
  freshDefaultPushSubState,
  parseStoredPushSubState,
} from "./push-sub";
import { isPushNotifyEnabled } from "./push-flag";

// ── isPushNotifyEnabled ───────────────────────────────────

describe("isPushNotifyEnabled", () => {
  it("both VAPID keys present → true", () => {
    expect(
      isPushNotifyEnabled({
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: "abc",
        VAPID_PRIVATE_KEY: "xyz",
      }),
    ).toBe(true);
  });

  it("missing public key → false (stub mode)", () => {
    expect(isPushNotifyEnabled({ VAPID_PRIVATE_KEY: "xyz" })).toBe(false);
  });

  it("missing private key → false", () => {
    expect(isPushNotifyEnabled({ NEXT_PUBLIC_VAPID_PUBLIC_KEY: "abc" })).toBe(
      false,
    );
  });

  it("empty-string keys → false", () => {
    expect(
      isPushNotifyEnabled({
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: "",
        VAPID_PRIVATE_KEY: "xyz",
      }),
    ).toBe(false);
  });

  it("master switch 'false' → false even with keys", () => {
    expect(
      isPushNotifyEnabled({
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: "abc",
        VAPID_PRIVATE_KEY: "xyz",
        SOUS_PUSH_NOTIFY_ENABLED: "false",
      }),
    ).toBe(false);
  });

  it("master switch other strings (truthy) → true with keys", () => {
    expect(
      isPushNotifyEnabled({
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: "abc",
        VAPID_PRIVATE_KEY: "xyz",
        SOUS_PUSH_NOTIFY_ENABLED: "true",
      }),
    ).toBe(true);
  });

  it("empty env → false (cold-start safe)", () => {
    expect(isPushNotifyEnabled({})).toBe(false);
  });
});

// ── parseStoredPushSubState ───────────────────────────────

describe("parseStoredPushSubState", () => {
  it("null / empty → fresh default", () => {
    expect(parseStoredPushSubState(null)).toEqual(freshDefaultPushSubState());
    expect(parseStoredPushSubState(undefined)).toEqual(
      freshDefaultPushSubState(),
    );
    expect(parseStoredPushSubState("")).toEqual(freshDefaultPushSubState());
  });

  it("non-JSON → fresh default", () => {
    expect(parseStoredPushSubState("{not-json")).toEqual(
      freshDefaultPushSubState(),
    );
  });

  it("array / primitive → fresh default", () => {
    expect(parseStoredPushSubState("[]")).toEqual(freshDefaultPushSubState());
    expect(parseStoredPushSubState("42")).toEqual(freshDefaultPushSubState());
    expect(parseStoredPushSubState("null")).toEqual(freshDefaultPushSubState());
  });

  it("schema-version mismatch → fresh default", () => {
    expect(
      parseStoredPushSubState(
        JSON.stringify({ schemaVersion: 999, status: "subscribed" }),
      ),
    ).toEqual(freshDefaultPushSubState());
  });

  it("unknown status enum → fresh default", () => {
    expect(
      parseStoredPushSubState(
        JSON.stringify({ schemaVersion: 1, status: "garbage" }),
      ),
    ).toEqual(freshDefaultPushSubState());
  });

  it("happy path round-trip", () => {
    const state = {
      schemaVersion: 1,
      status: "subscribed" as const,
      endpoint: "https://push.example.com/abc",
      lastChangedAt: "2026-05-15T18:00:00.000Z",
    };
    expect(parseStoredPushSubState(JSON.stringify(state))).toEqual(state);
  });

  it("non-subscribed status drops endpoint to null (defensive)", () => {
    const state = {
      schemaVersion: 1,
      status: "idle",
      endpoint: "leftover-endpoint",
      lastChangedAt: "2026-05-15T18:00:00.000Z",
    };
    expect(parseStoredPushSubState(JSON.stringify(state)).endpoint).toBe(null);
  });
});

// ── formatNudgeText ───────────────────────────────────────

describe("formatNudgeText", () => {
  it("default: implementation-intention shape", () => {
    const text = formatNudgeText({
      dayLabel: "Tuesday",
      timeLabel: "5:30pm",
    });
    expect(text).toContain("Tuesday");
    expect(text).toContain("5:30pm");
    // implementation-intention shape: prompts a future plan
    expect(text.toLowerCase()).toContain("when");
    expect(text.toLowerCase()).toContain("cook");
  });

  it("missed-last-week: streak-forgiveness shape", () => {
    const text = formatNudgeText({
      dayLabel: "Tuesday",
      timeLabel: "5:30pm",
      missedLastWeek: true,
    });
    expect(text.toLowerCase()).toContain("just data");
    expect(text.toLowerCase()).not.toContain("broke");
    expect(text.toLowerCase()).not.toContain("missed your streak");
  });

  it("missed-last-week branch references the day", () => {
    const text = formatNudgeText({
      dayLabel: "Tuesday",
      timeLabel: "5:30pm",
      missedLastWeek: true,
    });
    expect(text).toContain("Tuesday");
  });
});

// ── formatRhythmIdentity ──────────────────────────────────

describe("formatRhythmIdentity", () => {
  it("under 4 weeks → null (not enough signal)", () => {
    expect(formatRhythmIdentity({ dayLabel: "Tuesday", weeksRunning: 3 })).toBe(
      null,
    );
    expect(formatRhythmIdentity({ dayLabel: "Tuesday", weeksRunning: 0 })).toBe(
      null,
    );
  });

  it("4 weeks → identity badge fires", () => {
    const text = formatRhythmIdentity({
      dayLabel: "Tuesday",
      weeksRunning: 4,
    });
    expect(text).not.toBe(null);
    expect(text).toContain("Tuesday");
    expect(text).toContain("4");
  });

  it("12 weeks → identity badge with weeks count", () => {
    const text = formatRhythmIdentity({
      dayLabel: "Tuesday",
      weeksRunning: 12,
    });
    expect(text).toContain("12 weeks running");
  });

  it("hourLabel slot adapts the night/morning copy", () => {
    const text = formatRhythmIdentity({
      dayLabel: "Saturday",
      weeksRunning: 6,
      hourLabel: "morning",
    });
    expect(text).toContain("Saturday-morning");
  });
});
