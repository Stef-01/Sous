import { describe, expect, it } from "vitest";
import type { LlmCallEntry } from "./llm-spend";
import {
  appendLlmCall,
  buildLlmCallEntry,
  freshLlmSpendStorage,
  LLM_SPEND_MAX_ENTRIES,
  LLM_SPEND_SCHEMA_VERSION,
  parseStoredLlmSpend,
} from "./llm-spend-storage";

const baseEntry = (overrides: Partial<LlmCallEntry> = {}): LlmCallEntry => ({
  id: "e-1",
  surface: "voice-conversation",
  calledAt: "2026-05-03T10:00:00Z",
  tokensBilled: 100,
  costMicroUsd: 1_000,
  outcome: "ok",
  ...overrides,
});

describe("freshLlmSpendStorage", () => {
  it("returns an empty payload at the current schema version", () => {
    const fresh = freshLlmSpendStorage(new Date("2026-05-03T12:00:00Z"));
    expect(fresh.schemaVersion).toBe(LLM_SPEND_SCHEMA_VERSION);
    expect(fresh.entries).toEqual([]);
    expect(fresh.updatedAt).toBe("2026-05-03T12:00:00.000Z");
  });
});

describe("parseStoredLlmSpend", () => {
  it("returns fresh on null/undefined input", () => {
    expect(parseStoredLlmSpend(null).entries).toEqual([]);
    expect(parseStoredLlmSpend(undefined).entries).toEqual([]);
  });

  it("returns fresh on malformed JSON", () => {
    expect(parseStoredLlmSpend("{not json").entries).toEqual([]);
  });

  it("returns fresh on schema-version mismatch", () => {
    const stale = JSON.stringify({
      schemaVersion: 99,
      entries: [],
      updatedAt: "2026-05-03T12:00:00.000Z",
    });
    expect(parseStoredLlmSpend(stale).entries).toEqual([]);
  });

  it("returns fresh on inner-entry corruption", () => {
    const corrupt = JSON.stringify({
      schemaVersion: LLM_SPEND_SCHEMA_VERSION,
      entries: [{ id: "1", surface: "not-a-real-surface" }],
      updatedAt: "2026-05-03T12:00:00.000Z",
    });
    expect(parseStoredLlmSpend(corrupt).entries).toEqual([]);
  });

  it("round-trips a valid payload", () => {
    const valid = JSON.stringify({
      schemaVersion: LLM_SPEND_SCHEMA_VERSION,
      entries: [baseEntry()],
      updatedAt: "2026-05-03T12:00:00.000Z",
    });
    const parsed = parseStoredLlmSpend(valid);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].surface).toBe("voice-conversation");
  });
});

describe("appendLlmCall", () => {
  it("adds an entry to an empty storage", () => {
    const storage = freshLlmSpendStorage(new Date("2026-05-03T12:00:00Z"));
    const next = appendLlmCall(
      storage,
      baseEntry(),
      new Date("2026-05-03T12:01:00Z"),
    );
    expect(next.entries).toHaveLength(1);
    expect(next.updatedAt).toBe("2026-05-03T12:01:00.000Z");
  });

  it("does not mutate the input storage", () => {
    const storage = freshLlmSpendStorage(new Date("2026-05-03T12:00:00Z"));
    appendLlmCall(storage, baseEntry());
    expect(storage.entries).toHaveLength(0);
  });

  it("trims to LLM_SPEND_MAX_ENTRIES dropping oldest first", () => {
    const storage = freshLlmSpendStorage();
    let acc = storage;
    // Push max+5 entries with monotonic timestamps. Oldest 5
    // should be dropped after trim.
    for (let i = 0; i < LLM_SPEND_MAX_ENTRIES + 5; i++) {
      const ts = new Date(2026, 4, 3, 0, 0, i).toISOString();
      acc = appendLlmCall(acc, baseEntry({ id: `e-${i}`, calledAt: ts }));
    }
    expect(acc.entries).toHaveLength(LLM_SPEND_MAX_ENTRIES);
    // First retained entry should be `e-5` (the oldest 5 dropped).
    expect(acc.entries[0].id).toBe("e-5");
  });

  it("sorts by calledAt ascending so out-of-order appends still trim oldest", () => {
    const storage = freshLlmSpendStorage();
    const newer = appendLlmCall(
      storage,
      baseEntry({ id: "newer", calledAt: "2026-05-03T15:00:00Z" }),
    );
    const both = appendLlmCall(
      newer,
      baseEntry({ id: "older", calledAt: "2026-05-03T10:00:00Z" }),
    );
    expect(both.entries[0].id).toBe("older");
    expect(both.entries[1].id).toBe("newer");
  });
});

describe("buildLlmCallEntry", () => {
  it("produces a valid entry with sensible defaults", () => {
    const entry = buildLlmCallEntry({
      surface: "viral-search",
      tokensBilled: 250,
      costMicroUsd: 4_500,
      outcome: "ok",
      now: new Date("2026-05-03T12:00:00Z"),
    });
    expect(entry.surface).toBe("viral-search");
    expect(entry.tokensBilled).toBe(250);
    expect(entry.costMicroUsd).toBe(4_500);
    expect(entry.outcome).toBe("ok");
    expect(entry.calledAt).toBe("2026-05-03T12:00:00.000Z");
    // Default id is time-based + surface for uniqueness.
    expect(entry.id).toContain("viral-search");
  });

  it("clamps negative tokens / cost to zero", () => {
    const entry = buildLlmCallEntry({
      surface: "pantry-vision",
      tokensBilled: -10,
      costMicroUsd: -500,
      outcome: "error",
    });
    expect(entry.tokensBilled).toBe(0);
    expect(entry.costMicroUsd).toBe(0);
  });

  it("floors fractional values (caller might pass unrounded)", () => {
    const entry = buildLlmCallEntry({
      surface: "voice-conversation",
      tokensBilled: 99.7,
      costMicroUsd: 1_999.4,
      outcome: "ok",
    });
    expect(entry.tokensBilled).toBe(99);
    expect(entry.costMicroUsd).toBe(1_999);
  });

  it("respects an explicit id override", () => {
    const entry = buildLlmCallEntry({
      surface: "pod-agentic-pick",
      tokensBilled: 100,
      costMicroUsd: 1_000,
      outcome: "ok",
      id: "custom-test-id",
    });
    expect(entry.id).toBe("custom-test-id");
  });
});
