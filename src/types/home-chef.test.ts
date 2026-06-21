import { describe, it, expect } from "vitest";
import {
  HomeChefBatchSchema,
  batchDiscountPct,
  isBatchAvailable,
  type HomeChefBatch,
} from "./home-chef";

const valid: HomeChefBatch = {
  id: "b1",
  restaurantSlug: "zareens",
  restaurantName: "Zareen's",
  cuisine: "Pakistani-Indian",
  dishSlug: "zareens-chicken-biryani",
  dishName: "Chicken Biryani",
  surplusIngredients: ["weekend bone-in chicken"],
  regularPrice: 16,
  surplusPrice: 9,
  qtyAvailable: 6,
  pickupWindow: "6:00–7:30 PM today",
  perBatchNutrition: { kcal: 760, protein_g: 38, carbs_g: 82, fat_g: 30 },
};

describe("HomeChefBatchSchema", () => {
  it("accepts a well-formed batch", () => {
    expect(HomeChefBatchSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a surplus price that is not a discount", () => {
    const r = HomeChefBatchSchema.safeParse({ ...valid, surplusPrice: 16 });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toContain("surplusPrice");
    }
  });

  it("requires at least one surplus ingredient (the waste story)", () => {
    expect(
      HomeChefBatchSchema.safeParse({ ...valid, surplusIngredients: [] })
        .success,
    ).toBe(false);
  });

  it("rejects a negative quantity", () => {
    expect(
      HomeChefBatchSchema.safeParse({ ...valid, qtyAvailable: -1 }).success,
    ).toBe(false);
  });
});

describe("batchDiscountPct", () => {
  it("computes percent saved, rounded", () => {
    expect(batchDiscountPct({ regularPrice: 16, surplusPrice: 9 })).toBe(44);
    expect(batchDiscountPct({ regularPrice: 7, surplusPrice: 4 })).toBe(43);
  });
  it("is safe when regular price is zero", () => {
    expect(batchDiscountPct({ regularPrice: 0, surplusPrice: 0 })).toBe(0);
  });
});

describe("isBatchAvailable", () => {
  it("is true only with stock", () => {
    expect(isBatchAvailable({ qtyAvailable: 3 })).toBe(true);
    expect(isBatchAvailable({ qtyAvailable: 0 })).toBe(false);
  });
});
