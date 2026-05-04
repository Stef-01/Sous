import { describe, expect, it } from "vitest";
import type { CharityChargeEntry } from "./charity-ledger";
import {
  appendCharityCharge,
  buildCharityChargeEntry,
  CHARITY_LEDGER_MAX_ENTRIES,
  CHARITY_LEDGER_SCHEMA_VERSION,
  freshCharityLedgerStorage,
  parseStoredCharityLedger,
  updateCharityChargeStatus,
} from "./charity-ledger-storage";

const baseEntry = (
  overrides: Partial<CharityChargeEntry> = {},
): CharityChargeEntry => ({
  id: "c-1",
  stripeChargeId: "ch_test_1",
  eventSlug: "spring-bake-sale-2026",
  nonprofitSlug: "no-kid-hungry",
  amountMicroUsd: 5_000_000,
  chargedAt: "2026-05-03T10:00:00Z",
  status: "succeeded",
  ...overrides,
});

describe("freshCharityLedgerStorage", () => {
  it("returns an empty ledger at the current schema version", () => {
    const fresh = freshCharityLedgerStorage(new Date("2026-05-03T12:00:00Z"));
    expect(fresh.schemaVersion).toBe(CHARITY_LEDGER_SCHEMA_VERSION);
    expect(fresh.entries).toEqual([]);
  });
});

describe("parseStoredCharityLedger", () => {
  it("returns fresh on null/malformed/schema-mismatch input", () => {
    expect(parseStoredCharityLedger(null).entries).toEqual([]);
    expect(parseStoredCharityLedger("{not json").entries).toEqual([]);
    const stale = JSON.stringify({
      schemaVersion: 99,
      entries: [],
      updatedAt: "2026-05-03T12:00:00.000Z",
    });
    expect(parseStoredCharityLedger(stale).entries).toEqual([]);
  });

  it("returns fresh on inner-entry corruption", () => {
    const corrupt = JSON.stringify({
      schemaVersion: CHARITY_LEDGER_SCHEMA_VERSION,
      entries: [{ id: "x", status: "fake-status" }],
      updatedAt: "2026-05-03T12:00:00.000Z",
    });
    expect(parseStoredCharityLedger(corrupt).entries).toEqual([]);
  });

  it("round-trips a valid payload", () => {
    const valid = JSON.stringify({
      schemaVersion: CHARITY_LEDGER_SCHEMA_VERSION,
      entries: [baseEntry()],
      updatedAt: "2026-05-03T12:00:00.000Z",
    });
    const parsed = parseStoredCharityLedger(valid);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].nonprofitSlug).toBe("no-kid-hungry");
  });
});

describe("appendCharityCharge", () => {
  it("appends without mutating the input", () => {
    const storage = freshCharityLedgerStorage();
    const next = appendCharityCharge(storage, baseEntry());
    expect(next.entries).toHaveLength(1);
    expect(storage.entries).toHaveLength(0);
  });

  it("trims to LLM_SPEND_MAX_ENTRIES dropping oldest first", () => {
    let acc = freshCharityLedgerStorage();
    for (let i = 0; i < CHARITY_LEDGER_MAX_ENTRIES + 3; i++) {
      const ts = new Date(2026, 4, 3, 0, 0, i).toISOString();
      acc = appendCharityCharge(
        acc,
        baseEntry({ id: `c-${i}`, chargedAt: ts }),
      );
    }
    expect(acc.entries).toHaveLength(CHARITY_LEDGER_MAX_ENTRIES);
    expect(acc.entries[0].id).toBe("c-3");
  });

  it("sorts out-of-order appends by chargedAt ascending", () => {
    const a = freshCharityLedgerStorage();
    const b = appendCharityCharge(
      a,
      baseEntry({ id: "newer", chargedAt: "2026-05-03T15:00:00Z" }),
    );
    const c = appendCharityCharge(
      b,
      baseEntry({ id: "older", chargedAt: "2026-05-03T10:00:00Z" }),
    );
    expect(c.entries[0].id).toBe("older");
  });
});

describe("updateCharityChargeStatus", () => {
  it("updates an entry's status when id matches", () => {
    let acc = freshCharityLedgerStorage();
    acc = appendCharityCharge(acc, baseEntry({ id: "c-1", status: "pending" }));
    const next = updateCharityChargeStatus(acc, "c-1", "succeeded");
    expect(next.entries[0].status).toBe("succeeded");
  });

  it("is a no-op for unknown ids", () => {
    const acc = appendCharityCharge(freshCharityLedgerStorage(), baseEntry());
    const next = updateCharityChargeStatus(acc, "nope", "refunded");
    expect(next.entries[0].status).toBe("succeeded");
  });
});

describe("buildCharityChargeEntry", () => {
  it("constructs a valid entry with sensible defaults", () => {
    const entry = buildCharityChargeEntry({
      stripeChargeId: "ch_real",
      eventSlug: "summer-2026",
      nonprofitSlug: "feeding-america",
      amountMicroUsd: 10_000_000,
      status: "succeeded",
      now: new Date("2026-05-03T12:00:00Z"),
    });
    expect(entry.stripeChargeId).toBe("ch_real");
    expect(entry.amountMicroUsd).toBe(10_000_000);
    expect(entry.chargedAt).toBe("2026-05-03T12:00:00.000Z");
  });

  it("clamps negative amounts to zero", () => {
    const entry = buildCharityChargeEntry({
      stripeChargeId: "ch_test",
      eventSlug: "x",
      nonprofitSlug: "y",
      amountMicroUsd: -5,
      status: "pending",
    });
    expect(entry.amountMicroUsd).toBe(0);
  });
});
