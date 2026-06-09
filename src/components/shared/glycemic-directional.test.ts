import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Phase 8 guard — glycemic load is DIRECTIONAL (low good → high bad), not a
 * strength, so it must stay OFF the evidence-tier grammar: importing
 * EvidenceTierBadge here would conflate "high glycemic = bad" with "strong
 * evidence = good". It also must not reintroduce the amber/orange band colours.
 */
const SRC = readFileSync(
  resolve(process.cwd(), "src/components/shared/glycemic-pill.tsx"),
  "utf8",
);

describe("glycemic-pill stays directional (Phase 8)", () => {
  it("does NOT import the evidence-tier badge", () => {
    expect(SRC).not.toMatch(/EvidenceTierBadge/);
  });
  it("no longer uses amber/orange band fills", () => {
    expect(SRC).not.toMatch(/bg-amber-100|bg-orange-100/);
  });
  it("shows the low-load 'good' signal via the sage tier-strong token", () => {
    expect(SRC).toMatch(/var\(--tier-strong\)/);
  });
});
