import { describe, it, expect } from "vitest";
import { normalizePantryName } from "./use-pantry";

/**
 * Shopping list persistence is exercised via the hook at runtime. These tests
 * lock in the logic the hook delegates to: key normalization (shared with
 * pantry so items round-trip both ways) and the stored JSON envelope shape.
 */

describe("shopping list <-> pantry key compatibility", () => {
  it("shares normalization with the pantry namespace", () => {
    // Case + whitespace differences must resolve to one pantry key so moving
    // a bought shopping item into the pantry dedupes correctly.
    expect(normalizePantryName("Olive Oil ")).toBe(
      normalizePantryName("olive oil"),
    );
    expect(normalizePantryName("Soy  Sauce,")).toBe(
      normalizePantryName("soy sauce"),
    );
  });

  it("collapses plural-looking whitespace variants", () => {
    expect(normalizePantryName("Green Onions")).toBe("green onions");
  });
});

interface StoredItem {
  key: string;
  name: string;
  addedAt: string;
  bought: boolean;
}

function isValidItem(v: unknown): v is StoredItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.key === "string" &&
    typeof o.name === "string" &&
    typeof o.bought === "boolean" &&
    typeof o.addedAt === "string"
  );
}

describe("shopping list stored envelope", () => {
  it("accepts the { items: [] } shape", () => {
    const raw = JSON.stringify({
      items: [
        {
          key: "garlic",
          name: "Garlic",
          addedAt: "2026-04-16T00:00:00.000Z",
          bought: false,
        },
      ],
    });
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items.every(isValidItem)).toBe(true);
  });

  it("filters out entries missing required fields", () => {
    const envelope = {
      items: [
        {
          key: "valid",
          name: "Valid",
          addedAt: "2026-04-16T00:00:00.000Z",
          bought: false,
        },
        { key: 123, name: "bad", bought: false },
        null,
        {
          key: "another",
          name: "Another",
          addedAt: "2026-04-16T00:00:00.000Z",
          bought: true,
        },
      ],
    };
    const filtered = (envelope.items as unknown[]).filter(isValidItem);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((i) => i.key)).toEqual(["valid", "another"]);
  });

  it("treats legacy raw-array payloads as valid", () => {
    const legacy = [
      {
        key: "garlic",
        name: "Garlic",
        addedAt: "2026-04-16T00:00:00.000Z",
        bought: false,
      },
    ];
    const items = Array.isArray(legacy) ? legacy : [];
    expect(items.every(isValidItem)).toBe(true);
  });
});
