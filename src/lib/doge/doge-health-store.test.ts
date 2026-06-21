import { describe, it, expect } from "vitest";
import { buildDogeHealthPayload } from "./doge-health-store";
import type { PetHealthStat } from "@/lib/nutrition/pet-screen-data";

const STATS: PetHealthStat[] = [
  { key: "energy", label: "Energy", pct: 27 },
  { key: "mood", label: "Mood", pct: 40 },
  { key: "hydration", label: "Hydration", pct: 100 },
  { key: "protein", label: "Protein", pct: 30 },
  { key: "fiber", label: "Fiber", pct: 14 },
  { key: "vitamins", label: "Vitamins", pct: 22 },
];

describe("buildDogeHealthPayload", () => {
  it("maps each stat to label/pct + a FontAwesome icon for the game", () => {
    const p = buildDogeHealthPayload(STATS, "peckish", 1234);
    expect(p.stats).toEqual([
      { label: "Energy", pct: 27, fa: "bolt" },
      { label: "Mood", pct: 40, fa: "heart" },
      { label: "Hydration", pct: 100, fa: "droplet" },
      { label: "Protein", pct: 30, fa: "drumstick-bite" },
      { label: "Fiber", pct: 14, fa: "leaf" },
      { label: "Vitamins", pct: 22, fa: "shield-halved" },
    ]);
    expect(p.updatedAt).toBe(1234);
  });

  it("carries a status line per mood", () => {
    expect(buildDogeHealthPayload(STATS, "thriving", 0).status).toMatch(
      /thriving/i,
    );
    expect(buildDogeHealthPayload(STATS, "asleep", 0).status).toMatch(/nap/i);
  });

  it("exposes the raw mood enum so the game can key its thriving celebration", () => {
    expect(buildDogeHealthPayload(STATS, "thriving", 0).mood).toBe("thriving");
    expect(buildDogeHealthPayload(STATS, "hungry", 0).mood).toBe("hungry");
  });

  it("never invents stats — only what was passed", () => {
    expect(buildDogeHealthPayload([], "content", 0).stats).toEqual([]);
  });

  it("carries the meals eaten today (defaulting to none)", () => {
    expect(buildDogeHealthPayload(STATS, "content", 0).meals).toEqual([]);
    expect(
      buildDogeHealthPayload(STATS, "content", 0, ["Pho", "Caesar Salad"])
        .meals,
    ).toEqual(["Pho", "Caesar Salad"]);
  });

  it("forwards a metric's exact detail (value/target/unit) when present", () => {
    const withDetail: PetHealthStat[] = [
      {
        key: "protein",
        label: "Protein",
        pct: 60,
        detail: { value: 30, target: 50, unit: "g" },
      },
    ];
    expect(buildDogeHealthPayload(withDetail, "content", 0).stats).toEqual([
      {
        label: "Protein",
        pct: 60,
        fa: "drumstick-bite",
        detail: { value: 30, target: 50, unit: "g" },
      },
    ]);
  });

  it("omits detail entirely for metrics without a clean number", () => {
    const p = buildDogeHealthPayload(STATS, "content", 0);
    expect(p.stats.every((s) => !("detail" in s))).toBe(true);
  });
});
