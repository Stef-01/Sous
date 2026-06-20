import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  goldForCook,
  goldForCheckin,
  goldForLog,
  clampToDailyCap,
  MAX_GOLD_PER_DAY,
} from "./gold-economy";

describe("goldForCook", () => {
  it("a single cook with no streak pays the base 25", () => {
    expect(
      goldForCook({ dishCount: 1, streak: 0, cooksAlreadyPaidToday: 0 }),
    ).toBe(25);
  });

  it("a combined plate adds +5 per extra dish, capped at +15", () => {
    expect(
      goldForCook({ dishCount: 2, streak: 0, cooksAlreadyPaidToday: 0 }),
    ).toBe(30);
    expect(
      goldForCook({ dishCount: 3, streak: 0, cooksAlreadyPaidToday: 0 }),
    ).toBe(35);
    expect(
      goldForCook({ dishCount: 4, streak: 0, cooksAlreadyPaidToday: 0 }),
    ).toBe(40); // 25+15
    expect(
      goldForCook({ dishCount: 9, streak: 0, cooksAlreadyPaidToday: 0 }),
    ).toBe(40); // still capped
  });

  it("streak bonuses: >=7 → +10, >=14 → +20, <7 → none", () => {
    expect(
      goldForCook({ dishCount: 1, streak: 6, cooksAlreadyPaidToday: 0 }),
    ).toBe(25);
    expect(
      goldForCook({ dishCount: 1, streak: 7, cooksAlreadyPaidToday: 0 }),
    ).toBe(35);
    expect(
      goldForCook({ dishCount: 1, streak: 14, cooksAlreadyPaidToday: 0 }),
    ).toBe(45);
  });

  it("the 4th+ cook of the day pays a flat 5 (no binge advantage)", () => {
    expect(
      goldForCook({ dishCount: 1, streak: 20, cooksAlreadyPaidToday: 3 }),
    ).toBe(5);
    expect(
      goldForCook({ dishCount: 9, streak: 20, cooksAlreadyPaidToday: 8 }),
    ).toBe(5);
  });
});

describe("goldForCheckin / goldForLog", () => {
  it("check-in pays 10", () => {
    expect(goldForCheckin()).toBe(10);
  });
  it("manual logs pay 3 up to 4/day, then 0", () => {
    expect(goldForLog(0)).toBe(3);
    expect(goldForLog(3)).toBe(3);
    expect(goldForLog(4)).toBe(0);
    expect(goldForLog(10)).toBe(0);
  });
});

describe("clampToDailyCap", () => {
  it("never lets a day exceed MAX_GOLD_PER_DAY", () => {
    expect(clampToDailyCap(25, 0)).toBe(25);
    expect(clampToDailyCap(25, MAX_GOLD_PER_DAY - 10)).toBe(10); // only 10 room left
    expect(clampToDailyCap(25, MAX_GOLD_PER_DAY)).toBe(0); // full
    expect(clampToDailyCap(25, MAX_GOLD_PER_DAY + 50)).toBe(0); // never negative
  });

  it("a one-day binge is hard-capped — you can't farm unlimited gold", () => {
    // 10 cooks in one day: first 3 full (25 each), the rest flat 5, capped.
    let dayTotal = 0;
    for (let i = 0; i < 10; i++) {
      const g = goldForCook({
        dishCount: 1,
        streak: 0,
        cooksAlreadyPaidToday: i,
      });
      dayTotal += clampToDailyCap(g, dayTotal);
    }
    expect(dayTotal).toBeLessThanOrEqual(MAX_GOLD_PER_DAY);
    expect(dayTotal).toBe(MAX_GOLD_PER_DAY); // 75 from 3 full cooks + overflow to the cap
  });

  it("consistency (streak) rewards a daily cook more than extra same-day cooks", () => {
    const firstDailyCook = goldForCook({
      dishCount: 1,
      streak: 14,
      cooksAlreadyPaidToday: 0,
    });
    const fourthSameDayCook = goldForCook({
      dishCount: 1,
      streak: 14,
      cooksAlreadyPaidToday: 3,
    });
    expect(firstDailyCook).toBe(45); // 25 + 20 streak bonus
    expect(fourthSameDayCook).toBe(5); // diminished — binging doesn't pay
    expect(firstDailyCook).toBeGreaterThan(fourthSameDayCook * 3);
  });
});

describe("the wall — gold modules import nothing from nutrition/XP/diary", () => {
  const FORBIDDEN = [
    "use-xp-system",
    "use-nutrition-diary",
    "pet-state",
    "use-cook-sessions",
    "use-cook-stats",
  ];
  for (const file of ["gold-economy.ts", "gold-ledger.ts"]) {
    it(`${file} stays on its side of the wall`, () => {
      const src = readFileSync(resolve(__dirname, file), "utf8");
      const imports = src.match(/from\s+["'][^"']+["']/g) ?? [];
      for (const imp of imports) {
        for (const f of FORBIDDEN) {
          expect(imp.includes(f), `${file} must not import ${f}`).toBe(false);
        }
      }
    });
  }
});
