import { describe, expect, it } from "vitest";

import {
  importedNutrition,
  resolveImportDate,
  toFoodLogs,
  toInventoryDrafts,
} from "./apply-import";
import type { ImportPayload } from "@/types/import-bridge";

// Required macro panel, shared by every imported row.
const nut = { calories: 120, protein_g: 5, carbs_g: 10, fat_g: 4 };

describe("toInventoryDrafts", () => {
  it("normalizes keys, keeps display names + nutrition, collects raw names", () => {
    const payload = {
      kind: "pantry",
      items: [
        {
          name: "Olive Oil",
          quantity: 1,
          unit: "bottle",
          category: "oils",
          ...nut,
        },
        { name: "Brown Rice", quantity: 2, unit: "kg", ...nut },
      ],
    } satisfies Extract<ImportPayload, { kind: "pantry" }>;
    const { drafts, names } = toInventoryDrafts(payload);
    expect(drafts).toHaveLength(2);
    expect(drafts[0]).toMatchObject({
      key: "olive oil",
      name: "Olive Oil",
      quantity: 1,
      unit: "bottle",
      nutrition: { calories: 120, protein_g: 5, carbs_g: 10, fat_g: 4 },
    });
    expect(names).toEqual(["Olive Oil", "Brown Rice"]);
  });

  it("de-dupes by normalized key (last quantity wins)", () => {
    const payload = {
      kind: "groceries",
      items: [
        { name: "eggs", quantity: 6, ...nut },
        { name: "Eggs", quantity: 12, ...nut },
      ],
    } satisfies Extract<ImportPayload, { kind: "groceries" }>;
    const { drafts, names } = toInventoryDrafts(payload);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].quantity).toBe(12);
    expect(names).toEqual(["eggs"]); // first-seen raw name mirrored once
  });
});

describe("resolveImportDate", () => {
  const now = new Date("2026-06-16T12:00:00.000Z");

  it("maps today / undefined / empty to now", () => {
    expect(resolveImportDate(undefined, now)).toEqual(now);
    expect(resolveImportDate("today", now)).toEqual(now);
    expect(resolveImportDate("", now)).toEqual(now);
  });

  it("maps yesterday to now minus one day", () => {
    expect(resolveImportDate("yesterday", now).getDate()).toBe(15);
  });

  it("parses an explicit date and falls back on garbage", () => {
    expect(resolveImportDate("2026-01-02", now).getUTCFullYear()).toBe(2026);
    expect(resolveImportDate("whenever", now)).toEqual(now);
  });
});

describe("importedNutrition", () => {
  it("rounds calories and passes macros through", () => {
    const n = importedNutrition(
      {
        name: "burrito",
        calories: 650.4,
        protein_g: 30,
        carbs_g: 70,
        fat_g: 24,
      },
      "off:x",
      "2026-06-16T00:00:00.000Z",
    );
    expect(n.calories).toBe(650);
    expect(n.protein_g).toBe(30);
    expect(n.totalCarbs_g).toBe(70);
    expect(n.totalFat_g).toBe(24);
  });

  it("fills every required micro with an honest zero + third-party provenance", () => {
    const n = importedNutrition({ name: "x", ...nut }, "off:x", "T");
    for (const k of [
      "calcium_mg",
      "iron_mg",
      "vitaminD_mcg",
      "vitaminA_mcg_rae",
      "potassium_mg",
      "omega3_g",
      "zinc_mg",
      "magnesium_mg",
      "vitaminB12_mcg",
      "choline_mg",
      "addedSugar_g",
      "saturatedFat_g",
      "sodium_mg",
      "fiber_g",
    ] as const) {
      expect(n[k]).toBe(0);
    }
    expect(n.provenance).toBe("third-party");
    expect(n.confidence).toBe("approximated");
  });
});

describe("toFoodLogs", () => {
  const now = new Date("2026-06-16T12:00:00.000Z");

  it("builds diary-loggable branded foods with defaults", () => {
    const payload = {
      kind: "nutrition",
      date: "yesterday",
      entries: [
        { name: "Oatmeal", ...nut },
        { name: "Latte", brand: "Cafe", servings: 2, ...nut },
      ],
    } satisfies Extract<ImportPayload, { kind: "nutrition" }>;
    const { logs, date } = toFoodLogs(payload, now);
    expect(logs).toHaveLength(2);
    expect(logs[0].servings).toBe(1); // default
    expect(logs[0].food.brand).toBe("Imported"); // default brand
    expect(logs[0].food.barcode).toMatch(/^import-oatmeal-0$/);
    expect(logs[1].servings).toBe(2);
    expect(logs[1].food.brand).toBe("Cafe");
    expect(date.getDate()).toBe(15); // yesterday
  });
});
