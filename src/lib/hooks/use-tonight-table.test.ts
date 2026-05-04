import { describe, expect, it } from "vitest";
import { parseStoredTonightTable } from "./use-tonight-table";

describe("parseStoredTonightTable", () => {
  it("returns empty selection on null / undefined / empty string", () => {
    expect(parseStoredTonightTable(null).selectedIds).toEqual([]);
    expect(parseStoredTonightTable(undefined).selectedIds).toEqual([]);
    expect(parseStoredTonightTable("").selectedIds).toEqual([]);
  });

  it("returns empty selection on non-JSON", () => {
    expect(parseStoredTonightTable("{not-json").selectedIds).toEqual([]);
  });

  it("returns empty selection on JSON null / array / primitive", () => {
    expect(parseStoredTonightTable("null").selectedIds).toEqual([]);
    expect(parseStoredTonightTable("[]").selectedIds).toEqual([]);
    expect(parseStoredTonightTable("42").selectedIds).toEqual([]);
  });

  it("returns empty selection on schemaVersion mismatch", () => {
    const raw = JSON.stringify({ schemaVersion: 99, selectedIds: ["mem-a"] });
    expect(parseStoredTonightTable(raw).selectedIds).toEqual([]);
  });

  it("returns empty selection when selectedIds isn't an array", () => {
    const raw = JSON.stringify({ schemaVersion: 1, selectedIds: "mem-a" });
    expect(parseStoredTonightTable(raw).selectedIds).toEqual([]);
  });

  it("filters non-string entries from selectedIds", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      selectedIds: ["mem-a", 42, null, "mem-b", ""],
    });
    expect(parseStoredTonightTable(raw).selectedIds).toEqual([
      "mem-a",
      "mem-b",
    ]);
  });

  it("preserves valid selectedIds round-trip", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      selectedIds: ["mem-a", "mem-b", "mem-c"],
    });
    expect(parseStoredTonightTable(raw).selectedIds).toEqual([
      "mem-a",
      "mem-b",
      "mem-c",
    ]);
  });

  it("returns a fresh object every call", () => {
    const a = parseStoredTonightTable(null);
    const b = parseStoredTonightTable(null);
    expect(a).not.toBe(b);
    expect(a.selectedIds).not.toBe(b.selectedIds);
  });
});
