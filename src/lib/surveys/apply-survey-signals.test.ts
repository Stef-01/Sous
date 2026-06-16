import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getSignalFlags, persistSurveySignals } from "./apply-survey-signals";
import type { AggregatedSignals } from "./compute-survey-signals";

function mockLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    _store: store,
  };
}

let ls: ReturnType<typeof mockLocalStorage>;
beforeEach(() => {
  ls = mockLocalStorage();
  (globalThis as unknown as { window: unknown }).window = { localStorage: ls };
});
afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

const sig = (over: Partial<AggregatedSignals> = {}): AggregatedSignals => ({
  preferenceUpdates: {},
  flags: {},
  suppressedTags: [],
  ...over,
});

describe("persistSurveySignals", () => {
  it("merges preference deltas additively and clamps to ±1", () => {
    persistSurveySignals(sig({ preferenceUpdates: { spicy: 0.5 } }));
    persistSurveySignals(sig({ preferenceUpdates: { spicy: 0.7, thai: 0.4 } }));
    const prefs = JSON.parse(ls.getItem("sous-preferences")!);
    expect(prefs.spicy).toBe(1); // 0.5 + 0.7 clamped to 1
    expect(prefs.thai).toBe(0.4);
  });

  it("writes suppressed tags as strong negative seeds", () => {
    persistSurveySignals(sig({ suppressedTags: ["fish", "beef"] }));
    const prefs = JSON.parse(ls.getItem("sous-preferences")!);
    expect(prefs.fish).toBe(-1);
    expect(prefs.beef).toBe(-1);
  });

  it("merges named flags (readable via getSignalFlags)", () => {
    persistSurveySignals(sig({ flags: { budgetSensitive: true } }));
    persistSurveySignals(sig({ flags: { feltEasier: true } }));
    expect(getSignalFlags()).toEqual({
      budgetSensitive: true,
      feltEasier: true,
    });
  });

  it("stores effort tolerance as a bare string", () => {
    persistSurveySignals(sig({ effortTolerance: "minimal" }));
    expect(ls.getItem("sous-effort-tolerance")).toBe("minimal");
  });

  it("no-ops cleanly on an empty signal bundle", () => {
    persistSurveySignals(sig());
    expect(ls.getItem("sous-preferences")).toBeNull();
    expect(getSignalFlags()).toEqual({});
  });
});
