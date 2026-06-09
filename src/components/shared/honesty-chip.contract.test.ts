import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FOOD_FIRST_HEDGE } from "@/lib/therapeutics/claim-contract";

const SRC = readFileSync(
  resolve(process.cwd(), "src/components/shared/honesty-chip.tsx"),
  "utf8",
);

describe("HonestyChip — single-source hedge contract", () => {
  it("the canonical hedge constant is a non-empty clinician-plan caveat", () => {
    expect(FOOD_FIRST_HEDGE.length).toBeGreaterThan(0);
    expect(FOOD_FIRST_HEDGE.toLowerCase()).toContain("clinician");
  });

  it("imports FOOD_FIRST_HEDGE and renders it (copy can't drift)", () => {
    expect(SRC).toMatch(/import\s*\{\s*FOOD_FIRST_HEDGE\s*\}/);
    expect(SRC).toMatch(/\{FOOD_FIRST_HEDGE\}/);
  });

  it("does not hardcode the hedge text as a literal (forces single source of truth)", () => {
    expect(SRC).not.toContain("not a replacement for your clinician");
  });

  it("is styled as a neutral caveat, NOT brand green", () => {
    expect(SRC).toMatch(/bg-neutral-100/);
    expect(SRC).not.toMatch(/nourish-green/);
  });
});
