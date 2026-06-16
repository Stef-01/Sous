import { describe, expect, it } from "vitest";

import {
  hashString,
  selectEligiblePulse,
  volunteeredPulses,
  type PulseLedger,
} from "./pulse-scheduler";
import { pulsesForAnchor } from "@/data/pulses";

const NOW = "2026-06-16T12:00:00.000Z";
const DEVICE = "device-abc";
const daysAgo = (n: number) =>
  new Date(Date.parse(NOW) - n * 86_400_000).toISOString();

const ledger = (over: Partial<PulseLedger> = {}): PulseLedger => ({
  shown: [],
  answered: [],
  dismissed: [],
  onboardingDoneAt: null,
  ...over,
});

describe("hashString", () => {
  it("is deterministic and non-negative", () => {
    expect(hashString("a:b")).toBe(hashString("a:b"));
    expect(hashString("x")).toBeGreaterThanOrEqual(0);
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});

describe("selectEligiblePulse — guardrails", () => {
  it("surfaces a pulse from a clean ledger", () => {
    const p = selectEligiblePulse("deck-exhaust", ledger(), NOW, DEVICE);
    expect(p).not.toBeNull();
    expect(pulsesForAnchor("deck-exhaust").map((x) => x.id)).toContain(p!.id);
  });

  it("stays quiet for 7 days after onboarding", () => {
    expect(
      selectEligiblePulse(
        "deck-exhaust",
        ledger({ onboardingDoneAt: daysAgo(3) }),
        NOW,
        DEVICE,
      ),
    ).toBeNull();
    expect(
      selectEligiblePulse(
        "deck-exhaust",
        ledger({ onboardingDoneAt: daysAgo(8) }),
        NOW,
        DEVICE,
      ),
    ).not.toBeNull();
  });

  it("allows at most one pulse per day", () => {
    const shownToday = ledger({
      shown: [{ pulseId: "budget", at: "2026-06-16T08:00:00.000Z" }],
    });
    expect(
      selectEligiblePulse("deck-exhaust", shownToday, NOW, DEVICE),
    ).toBeNull();
  });

  it("enforces a ≥72h gap between pulses", () => {
    const twoDays = ledger({ shown: [{ pulseId: "budget", at: daysAgo(2) }] });
    expect(
      selectEligiblePulse("deck-exhaust", twoDays, NOW, DEVICE),
    ).toBeNull();
    const fourDays = ledger({ shown: [{ pulseId: "budget", at: daysAgo(4) }] });
    expect(
      selectEligiblePulse("deck-exhaust", fourDays, NOW, DEVICE),
    ).not.toBeNull();
  });

  it("caps at 2 pulses per trailing week", () => {
    const twoThisWeek = ledger({
      shown: [
        { pulseId: "budget", at: daysAgo(4) },
        { pulseId: "pacing", at: daysAgo(5) },
      ],
    });
    expect(
      selectEligiblePulse("deck-exhaust", twoThisWeek, NOW, DEVICE),
    ).toBeNull();
  });

  it("never re-surfaces answered or dismissed pulses", () => {
    const anchor = "deck-exhaust";
    const all = pulsesForAnchor(anchor).map((p) => p.id);
    const exhausted = ledger({ answered: all.slice(), dismissed: [] });
    expect(selectEligiblePulse(anchor, exhausted, NOW, DEVICE)).toBeNull();
    const dismissed = ledger({ dismissed: all.slice() });
    expect(selectEligiblePulse(anchor, dismissed, NOW, DEVICE)).toBeNull();
  });

  it("returns null for an anchor with no live candidates", () => {
    // plan-consent only fires on plan-open; deck-exhaust pulses are separate.
    const onlyPlan = ledger({
      answered: pulsesForAnchor("deck-exhaust").map((p) => p.id),
    });
    expect(
      selectEligiblePulse("deck-exhaust", onlyPlan, NOW, DEVICE),
    ).toBeNull();
  });

  it("is deterministic for a given device + day", () => {
    const a = selectEligiblePulse("deck-exhaust", ledger(), NOW, DEVICE);
    const b = selectEligiblePulse("deck-exhaust", ledger(), NOW, DEVICE);
    expect(a?.id).toBe(b?.id);
  });
});

describe("volunteeredPulses", () => {
  it("orders unanswered first and drops dismissed", () => {
    const led = ledger({ answered: ["budget"], dismissed: ["pacing"] });
    const list = volunteeredPulses(led).map((p) => p.id);
    expect(list).not.toContain("pacing");
    // budget (answered) sinks below the unanswered ones
    expect(list.indexOf("budget")).toBe(list.length - 1);
  });
});
