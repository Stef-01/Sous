import { describe, it, expect } from "vitest";
import { DEMO_HOME_CHEF_BATCHES } from "./demo-batches";
import { HomeChefBatchSchema } from "@/types/home-chef";
import { STANFORD_VENUES } from "@/data/eat-out/stanford-demo";

describe("DEMO_HOME_CHEF_BATCHES", () => {
  it("has a non-trivial set of demo batches", () => {
    expect(DEMO_HOME_CHEF_BATCHES.length).toBeGreaterThanOrEqual(3);
  });

  it("every batch is schema-valid (incl. surplus < regular)", () => {
    for (const b of DEMO_HOME_CHEF_BATCHES) {
      const r = HomeChefBatchSchema.safeParse(b);
      expect(r.success, `${b.id} should be valid`).toBe(true);
    }
  });

  it("references only REAL eat-out venues + dishes (rule 7 — no invented recipes)", () => {
    const venueBySlug = new Map(STANFORD_VENUES.map((v) => [v.slug, v]));
    for (const b of DEMO_HOME_CHEF_BATCHES) {
      const venue = venueBySlug.get(b.restaurantSlug);
      expect(venue, `venue ${b.restaurantSlug} exists`).toBeTruthy();
      const dish = venue?.dishes.find((d) => d.slug === b.dishSlug);
      expect(
        dish,
        `dish ${b.dishSlug} exists at ${b.restaurantSlug}`,
      ).toBeTruthy();
    }
  });

  it("has unique batch ids", () => {
    const ids = DEMO_HOME_CHEF_BATCHES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
