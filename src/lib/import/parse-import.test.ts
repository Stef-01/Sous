import { describe, expect, it } from "vitest";

import { extractJsonObject, parseImportText } from "./parse-import";

describe("extractJsonObject", () => {
  it("pulls JSON out of a ```json fence", () => {
    const text =
      'Here you go!\n```json\n{ "kind": "pantry" }\n```\nLet me know!';
    expect(extractJsonObject(text)).toBe('{ "kind": "pantry" }');
  });

  it("handles a bare fence without the json tag", () => {
    expect(extractJsonObject('```\n{ "a": 1 }\n```')).toBe('{ "a": 1 }');
  });

  it("slices first { to last } when there's surrounding prose", () => {
    expect(extractJsonObject('Sure: { "x": 1 } — done')).toBe('{ "x": 1 }');
  });

  it("returns null when there's no object", () => {
    expect(extractJsonObject("no json here")).toBeNull();
    expect(extractJsonObject("")).toBeNull();
  });
});

describe("parseImportText — pantry / groceries", () => {
  it("parses a clean pantry payload", () => {
    const r = parseImportText(
      '{ "kind": "pantry", "items": [{ "name": "Olive Oil", "quantity": 1, "unit": "bottle", "calories": 120, "protein_g": 0, "carbs_g": 0, "fat_g": 14 }] }',
    );
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.kind).toBe("pantry");
      expect(r.itemCount).toBe(1);
    }
  });

  it("coerces quoted numbers", () => {
    const r = parseImportText(
      '```json\n{ "kind": "groceries", "items": [{ "name": "rice", "quantity": "2", "unit": "kg", "calories": "215", "protein_g": 5, "carbs_g": 45, "fat_g": 2 }] }\n```',
    );
    expect(r.success).toBe(true);
    if (r.success && r.data.kind === "groceries") {
      expect(r.data.items[0].quantity).toBe(2);
    }
  });

  it("strips unknown keys instead of failing", () => {
    const r = parseImportText(
      '{ "kind": "pantry", "items": [{ "name": "eggs", "emoji": "🥚", "aisle": 4, "calories": 72, "protein_g": 6, "carbs_g": 0, "fat_g": 5 }] }',
    );
    expect(r.success).toBe(true);
  });

  it("requires full nutrition on pantry / groceries items too", () => {
    const r = parseImportText(
      '{ "kind": "pantry", "items": [{ "name": "eggs", "quantity": 12 }] }',
    );
    expect(r.success).toBe(false);
  });
});

describe("parseImportText — nutrition", () => {
  it("parses a food-log payload (required macros, optional extras omitted)", () => {
    const r = parseImportText(
      '{ "kind": "nutrition", "date": "today", "entries": [{ "name": "burrito", "calories": 650, "protein_g": 30, "carbs_g": 70, "fat_g": 24 }] }',
    );
    expect(r.success).toBe(true);
    if (r.success && r.data.kind === "nutrition") {
      expect(r.data.entries[0].calories).toBe(650);
      expect(r.data.entries[0].fiber_g).toBeUndefined(); // optional extra
    }
  });

  it("requires the full macro panel on each entry", () => {
    const missingMacros = parseImportText(
      '{ "kind": "nutrition", "entries": [{ "name": "mystery", "calories": 200 }] }',
    );
    expect(missingMacros.success).toBe(false);
    const noCalories = parseImportText(
      '{ "kind": "nutrition", "entries": [{ "name": "mystery" }] }',
    );
    expect(noCalories.success).toBe(false);
  });
});

describe("parseImportText — friendly errors", () => {
  it("flags a missing/invalid kind (wrong paste)", () => {
    const r = parseImportText('{ "items": [{ "name": "x" }] }');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toMatch(/kind/i);
  });

  it("flags non-JSON", () => {
    const r = parseImportText("the assistant said hello");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toMatch(/json/i);
  });

  it("flags truncated JSON", () => {
    const r = parseImportText('{ "kind": "pantry", "items": [');
    expect(r.success).toBe(false);
  });

  it("flags an empty list", () => {
    const r = parseImportText('{ "kind": "pantry", "items": [] }');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toMatch(/empty|nothing/i);
  });
});
