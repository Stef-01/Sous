import { describe, expect, it } from "vitest";
import { bucketBySlot, slotSummary } from "./tracking-cards";
import type { DiaryEntry } from "@/lib/hooks/use-nutrition-diary";

const entry = (hour: number, kcal: number, c = 0, f = 0, p = 0): DiaryEntry =>
  ({
    slug: `e${hour}`,
    name: `e${hour}`,
    servings: 1,
    at: new Date(2026, 5, 11, hour, 30).toISOString(),
    nutrition: {
      calories: kcal,
      totalCarbs_g: c,
      totalFat_g: f,
      protein_g: p,
    },
  }) as unknown as DiaryEntry;

describe("bucketBySlot", () => {
  it("uses the pickCurrentMeal boundaries (11 / 16)", () => {
    const slots = bucketBySlot([entry(8, 1), entry(12, 1), entry(19, 1)]);
    expect(slots.breakfast).toHaveLength(1);
    expect(slots.lunch).toHaveLength(1);
    expect(slots.dinner).toHaveLength(1);
  });

  it("boundary hours: 11 → lunch, 16 → dinner", () => {
    const slots = bucketBySlot([entry(11, 1), entry(16, 1)]);
    expect(slots.lunch).toHaveLength(1);
    expect(slots.dinner).toHaveLength(1);
    expect(slots.breakfast).toHaveLength(0);
  });
});

describe("slotSummary", () => {
  it("sums kcal × servings and splits macro calories 4/4/9", () => {
    // 50g carbs (200 kcal) + 10g fat (90 kcal) + 25g protein (100 kcal)
    const s = slotSummary([entry(8, 430, 50, 10, 25)]);
    expect(s).not.toBeNull();
    expect(s!.kcal).toBe(430);
    expect(s!.c).toBe(51); // 200/390
    expect(s!.f).toBe(23); // 90/390
    expect(s!.p).toBe(26); // 100/390
  });

  it("null when no entry carries nutrition AND the slug doesn't resolve", () => {
    const bare = { ...entry(8, 0), nutrition: undefined } as DiaryEntry;
    expect(slotSummary([bare])).toBeNull();
  });

  it("resolves a cooked seeded dish with no embedded nutrition (seed-first)", () => {
    // The auto-log path writes catalog dishes WITHOUT an embedded vector — the
    // slot card must still show their macros (seeded butter-chicken = 520 kcal).
    const cooked = {
      slug: "butter-chicken",
      name: "Butter Chicken",
      servings: 1,
      at: new Date(2026, 5, 11, 19, 0).toISOString(),
    } as unknown as DiaryEntry;
    const s = slotSummary([cooked]);
    expect(s).not.toBeNull();
    expect(s!.kcal).toBe(520);
  });
});
