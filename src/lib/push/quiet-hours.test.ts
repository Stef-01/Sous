import { describe, expect, it } from "vitest";
import {
  buildPreferenceToggles,
  DEFAULT_QUIET_HOURS,
  gateDelivery,
  isInQuietHours,
  type UserPushPreferences,
} from "./quiet-hours";

const basePrefs = (
  overrides: Partial<UserPushPreferences> = {},
): UserPushPreferences => ({
  optedOutAll: false,
  optedOutIntents: new Set(),
  ...overrides,
});

describe("isInQuietHours", () => {
  it("non-wrapping window: 9-17 captures 10am", () => {
    expect(
      isInQuietHours({
        localHour: 10,
        window: { startHour: 9, endHour: 17 },
      }),
    ).toBe(true);
  });

  it("non-wrapping window: 9-17 excludes 17 itself (exclusive end)", () => {
    expect(
      isInQuietHours({
        localHour: 17,
        window: { startHour: 9, endHour: 17 },
      }),
    ).toBe(false);
  });

  it("wrapping window: 22-7 captures 23", () => {
    expect(isInQuietHours({ localHour: 23, window: DEFAULT_QUIET_HOURS })).toBe(
      true,
    );
  });

  it("wrapping window: 22-7 captures 5am", () => {
    expect(isInQuietHours({ localHour: 5, window: DEFAULT_QUIET_HOURS })).toBe(
      true,
    );
  });

  it("wrapping window: 22-7 excludes 12 noon", () => {
    expect(isInQuietHours({ localHour: 12, window: DEFAULT_QUIET_HOURS })).toBe(
      false,
    );
  });

  it("zero-width window never matches", () => {
    expect(
      isInQuietHours({
        localHour: 12,
        window: { startHour: 12, endHour: 12 },
      }),
    ).toBe(false);
  });
});

describe("gateDelivery", () => {
  it("opted-out-all blocks every intent", () => {
    const out = gateDelivery({
      intent: "rhythm-nudge",
      localHour: 10,
      prefs: basePrefs({ optedOutAll: true }),
    });
    expect(out.deliver).toBe(false);
    if (!out.deliver) expect(out.reason).toBe("opted-out-all");
  });

  it("opted-out for specific intent blocks just that one", () => {
    const out = gateDelivery({
      intent: "rhythm-nudge",
      localHour: 10,
      prefs: basePrefs({ optedOutIntents: new Set(["rhythm-nudge"]) }),
    });
    expect(out.deliver).toBe(false);
    if (!out.deliver) expect(out.reason).toBe("opted-out-intent");
  });

  it("blocks during quiet hours by default", () => {
    const out = gateDelivery({
      intent: "rhythm-nudge",
      localHour: 23,
      prefs: basePrefs(),
    });
    expect(out.deliver).toBe(false);
    if (!out.deliver) expect(out.reason).toBe("quiet-hours");
  });

  it("urgent intent bypasses quiet hours", () => {
    const out = gateDelivery({
      intent: "rhythm-nudge",
      localHour: 23,
      prefs: basePrefs({ urgentIntents: new Set(["rhythm-nudge"]) }),
    });
    expect(out.deliver).toBe(true);
  });

  it("delivers in active hours when not opted out", () => {
    const out = gateDelivery({
      intent: "rhythm-nudge",
      localHour: 10,
      prefs: basePrefs(),
    });
    expect(out.deliver).toBe(true);
  });

  it("custom quiet window overrides default", () => {
    const out = gateDelivery({
      intent: "rhythm-nudge",
      localHour: 10,
      prefs: basePrefs({
        quietHours: { startHour: 9, endHour: 11 },
      }),
    });
    expect(out.deliver).toBe(false);
  });
});

describe("buildPreferenceToggles", () => {
  it("returns five intents with default enabled state", () => {
    const out = buildPreferenceToggles({ prefs: basePrefs() });
    expect(out).toHaveLength(5);
    expect(out.every((t) => t.enabled)).toBe(true);
  });

  it("disables intents when opted-out-all", () => {
    const out = buildPreferenceToggles({
      prefs: basePrefs({ optedOutAll: true }),
    });
    expect(out.every((t) => !t.enabled)).toBe(true);
  });

  it("disables only the per-intent opt-outs", () => {
    const out = buildPreferenceToggles({
      prefs: basePrefs({
        optedOutIntents: new Set(["pod-reveal"]),
      }),
    });
    const podReveal = out.find((t) => t.intent === "pod-reveal");
    const rhythmNudge = out.find((t) => t.intent === "rhythm-nudge");
    expect(podReveal?.enabled).toBe(false);
    expect(rhythmNudge?.enabled).toBe(true);
  });
});
