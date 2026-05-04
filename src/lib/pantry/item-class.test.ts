import { describe, expect, it } from "vitest";
import {
  ITEM_CLASSES,
  daysToExpiration,
  estimateExpiration,
  freshnessFraction,
  freshnessTier,
  groupByStorageZone,
  lookupItemClass,
} from "./item-class";

const NOW = new Date("2026-05-15T12:00:00");
const DAY_MS = 24 * 60 * 60 * 1000;

// ── ITEM_CLASSES catalog integrity ────────────────────────

describe("ITEM_CLASSES catalog", () => {
  it("has at least 20 starter classes", () => {
    expect(ITEM_CLASSES.length).toBeGreaterThanOrEqual(20);
  });

  it("every class has a non-empty slug", () => {
    for (const c of ITEM_CLASSES) {
      expect(c.slug.length).toBeGreaterThan(0);
    }
  });

  it("no duplicate slugs", () => {
    const slugs = ITEM_CLASSES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every shelfLife is positive", () => {
    for (const c of ITEM_CLASSES) {
      expect(c.defaultShelfLifeDays).toBeGreaterThan(0);
    }
  });

  it("every storageZone is valid", () => {
    const valid = new Set(["pantry", "fridge", "freezer"]);
    for (const c of ITEM_CLASSES) {
      expect(valid.has(c.storageZone)).toBe(true);
    }
  });
});

// ── lookupItemClass ──────────────────────────────────────

describe("lookupItemClass", () => {
  it("returns the def for a known slug", () => {
    expect(lookupItemClass("fresh-herb")?.label).toBe("Fresh herb");
  });

  it("case-insensitive lookup", () => {
    expect(lookupItemClass("FRESH-HERB")?.slug).toBe("fresh-herb");
  });

  it("trims whitespace", () => {
    expect(lookupItemClass("  citrus  ")?.slug).toBe("citrus");
  });

  it("unknown slug → null", () => {
    expect(lookupItemClass("klingon-spice")).toBeNull();
  });
});

// ── estimateExpiration ───────────────────────────────────

describe("estimateExpiration", () => {
  it("citrus + ingested-now → ~14 days from now", () => {
    const out = estimateExpiration("citrus", NOW);
    expect(out).not.toBeNull();
    if (out) {
      const expDate = new Date(out);
      const days = (expDate.getTime() - NOW.getTime()) / DAY_MS;
      expect(days).toBeCloseTo(14, 5);
    }
  });

  it("dry-pasta is long-shelf (~540 days)", () => {
    const out = estimateExpiration("dry-pasta", NOW);
    if (out) {
      const days = (new Date(out).getTime() - NOW.getTime()) / DAY_MS;
      expect(days).toBeCloseTo(540, 5);
    }
  });

  it("unknown class → null", () => {
    expect(estimateExpiration("klingon-class", NOW)).toBeNull();
  });

  it("invalid date → null", () => {
    expect(estimateExpiration("citrus", new Date("not-a-date"))).toBeNull();
  });
});

// ── daysToExpiration ─────────────────────────────────────

describe("daysToExpiration", () => {
  it("1 day in future → +1", () => {
    const exp = new Date(NOW.getTime() + 1 * DAY_MS).toISOString();
    expect(daysToExpiration(exp, NOW)).toBeCloseTo(1, 3);
  });

  it("expired 2 days ago → -2", () => {
    const exp = new Date(NOW.getTime() - 2 * DAY_MS).toISOString();
    expect(daysToExpiration(exp, NOW)).toBeCloseTo(-2, 3);
  });

  it("malformed ISO → null", () => {
    expect(daysToExpiration("not-a-date", NOW)).toBeNull();
  });
});

// ── freshnessFraction ────────────────────────────────────

describe("freshnessFraction", () => {
  it("just-ingested → 1.0", () => {
    expect(
      freshnessFraction({
        ingestedAt: NOW.toISOString(),
        expirationISO: new Date(NOW.getTime() + 10 * DAY_MS).toISOString(),
        now: NOW,
      }),
    ).toBeCloseTo(1, 3);
  });

  it("midpoint → 0.5", () => {
    const ingested = new Date(NOW.getTime() - 5 * DAY_MS);
    const exp = new Date(NOW.getTime() + 5 * DAY_MS);
    expect(
      freshnessFraction({
        ingestedAt: ingested.toISOString(),
        expirationISO: exp.toISOString(),
        now: NOW,
      }),
    ).toBeCloseTo(0.5, 3);
  });

  it("expired → 0", () => {
    expect(
      freshnessFraction({
        ingestedAt: new Date(NOW.getTime() - 20 * DAY_MS).toISOString(),
        expirationISO: new Date(NOW.getTime() - 10 * DAY_MS).toISOString(),
        now: NOW,
      }),
    ).toBe(0);
  });

  it("inverted dates → 0 (defensive)", () => {
    expect(
      freshnessFraction({
        ingestedAt: new Date(NOW.getTime() + 10 * DAY_MS).toISOString(),
        expirationISO: new Date(NOW.getTime() - 10 * DAY_MS).toISOString(),
        now: NOW,
      }),
    ).toBe(0);
  });
});

// ── freshnessTier ─────────────────────────────────────────

describe("freshnessTier", () => {
  it("0.7 → fresh", () => {
    expect(freshnessTier(0.7)).toBe("fresh");
  });

  it("0.4 → use-soon", () => {
    expect(freshnessTier(0.4)).toBe("use-soon");
  });

  it("0.1 → expiring", () => {
    expect(freshnessTier(0.1)).toBe("expiring");
  });

  it("0 → stale", () => {
    expect(freshnessTier(0)).toBe("stale");
  });

  it("NaN → stale (defensive)", () => {
    expect(freshnessTier(Number.NaN)).toBe("stale");
  });
});

// ── groupByStorageZone ───────────────────────────────────

describe("groupByStorageZone", () => {
  it("groups by zone using the class lookup", () => {
    const items = [
      { itemClass: "fresh-herb", name: "basil" },
      { itemClass: "dry-pasta", name: "spaghetti" },
      { itemClass: "frozen-protein", name: "frozen chicken" },
    ];
    const out = groupByStorageZone(items);
    expect(out.fridge.map((i) => i.name)).toEqual(["basil"]);
    expect(out.pantry.map((i) => i.name)).toEqual(["spaghetti"]);
    expect(out.freezer.map((i) => i.name)).toEqual(["frozen chicken"]);
  });

  it("unknown class defaults to pantry zone", () => {
    const items = [{ itemClass: "klingon-class", name: "??" }];
    expect(groupByStorageZone(items).pantry.length).toBe(1);
  });

  it("empty input → empty zones", () => {
    const out = groupByStorageZone([]);
    expect(out.pantry).toEqual([]);
    expect(out.fridge).toEqual([]);
    expect(out.freezer).toEqual([]);
  });
});
