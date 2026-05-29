import { describe, expect, it } from "vitest";
import { EAT_OUT_DISHES, EAT_OUT_VENUES } from "./eat-out-fixtures";
import { eatOutDishSchema, eatOutVenueSchema } from "@/types/eat-out";

describe("EAT_OUT_VENUES", () => {
  it("has at least 4 venues per the Sprint J target", () => {
    expect(EAT_OUT_VENUES.length).toBeGreaterThanOrEqual(4);
  });

  it("all entries validate against the Zod schema", () => {
    for (const v of EAT_OUT_VENUES) {
      const result = eatOutVenueSchema.safeParse(v);
      if (!result.success) {
        throw new Error(
          `${v.slug}: ${result.error.issues
            .map((i) => `${i.path.join(".")}=${i.message}`)
            .join("; ")}`,
        );
      }
      expect(result.success).toBe(true);
    }
  });

  it("venue slugs are unique", () => {
    const slugs = new Set<string>();
    for (const v of EAT_OUT_VENUES) {
      expect(slugs.has(v.slug)).toBe(false);
      slugs.add(v.slug);
    }
  });
});

describe("EAT_OUT_DISHES", () => {
  it("has at least 8 dishes per the Sprint J target", () => {
    expect(EAT_OUT_DISHES.length).toBeGreaterThanOrEqual(8);
  });

  it("all entries validate against the Zod schema", () => {
    for (const d of EAT_OUT_DISHES) {
      const result = eatOutDishSchema.safeParse(d);
      if (!result.success) {
        throw new Error(
          `${d.slug}: ${result.error.issues
            .map((i) => `${i.path.join(".")}=${i.message}`)
            .join("; ")}`,
        );
      }
      expect(result.success).toBe(true);
    }
  });

  it("every dish joins to an existing venue", () => {
    const venueSlugs = new Set(EAT_OUT_VENUES.map((v) => v.slug));
    for (const d of EAT_OUT_DISHES) {
      expect(venueSlugs.has(d.venueSlug)).toBe(true);
    }
  });

  it("dish slugs are unique", () => {
    const slugs = new Set<string>();
    for (const d of EAT_OUT_DISHES) {
      expect(slugs.has(d.slug)).toBe(false);
      slugs.add(d.slug);
    }
  });
});
