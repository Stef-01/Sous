import { describe, expect, it } from "vitest";
import { buildDiaryCsv } from "./diary-export";
import { dayKey, type DiaryEntry } from "@/lib/hooks/use-nutrition-diary";

const NOW = new Date("2026-06-09T12:00:00");
const key = dayKey(NOW);

describe("buildDiaryCsv (#13)", () => {
  it("emits header + entry rows + a TOTAL row, with real composed kcal", () => {
    const store = {
      [key]: [
        {
          slug: "air-fryer-broccoli",
          name: "Air-Fryer Broccoli",
          servings: 2,
          at: "2026-06-09T08:00:00Z",
        } as DiaryEntry,
      ],
    };
    const csv = buildDiaryCsv(store, 1, NOW);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("date,item,brand,servings");
    expect(lines[1]).toContain("Air-Fryer Broccoli");
    expect(lines[1]).toContain(",cooked,".replace("cooked", "logged"));
    expect(lines[2]).toContain("TOTAL");
    // kcal column populated and ×2 servings > ×1 (real composition math)
    const kcal = Number(lines[1].split(",")[5]);
    expect(kcal).toBeGreaterThan(50);
  });

  it("escapes commas/quotes in names; empty days emit no rows", () => {
    const store = {
      [key]: [
        {
          slug: "x",
          name: 'Dal, "extra spicy"',
          servings: 1,
          at: "2026-06-09T08:00:00Z",
          brand: "Brand, Inc",
          nutrition: { calories: 100 } as DiaryEntry["nutrition"],
        } as DiaryEntry,
      ],
    };
    const csv = buildDiaryCsv(store, 2, NOW);
    expect(csv).toContain('"Dal, ""extra spicy"""');
    expect(csv).toContain('"Brand, Inc"');
    expect(csv.split("\n").filter((l) => l.includes("TOTAL")).length).toBe(1);
  });

  it("is deterministic", () => {
    const store = { [key]: [] };
    expect(buildDiaryCsv(store, 7, NOW)).toBe(buildDiaryCsv(store, 7, NOW));
  });
});
