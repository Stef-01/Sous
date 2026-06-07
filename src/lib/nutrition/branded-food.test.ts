import { describe, expect, it } from "vitest";
import { mapOffProduct, parseServingGrams } from "./branded-food";

describe("parseServingGrams", () => {
  it("parses grams from OFF serving_size strings", () => {
    expect(parseServingGrams("110g")).toBe(110);
    expect(parseServingGrams("100 gram")).toBe(100);
    expect(parseServingGrams("1 cup (240 ml)")).toBe(240);
    expect(parseServingGrams(undefined)).toBe(100);
    expect(parseServingGrams("a handful")).toBe(100);
  });
});

describe("mapOffProduct", () => {
  it("maps a product to per-serving nutrition (scaled to serving size)", () => {
    const f = mapOffProduct({
      code: "123",
      product_name: "Greek Yogurt",
      brands: "Fage, Total",
      serving_size: "150g",
      nutriments: {
        "energy-kcal_100g": 100,
        proteins_100g: 10,
        carbohydrates_100g: 4,
        fat_100g: 5,
        sodium_100g: 0.05,
        "saturated-fat_100g": 3,
      },
    });
    expect(f).not.toBeNull();
    if (f) {
      expect(f.barcode).toBe("123");
      expect(f.name).toBe("Greek Yogurt");
      expect(f.brand).toBe("Fage"); // first brand only
      expect(f.servingSizeG).toBe(150);
      // per-serving = per-100g × 1.5
      expect(f.nutrition.calories).toBe(150);
      expect(f.nutrition.protein_g).toBe(15);
      expect(f.nutrition.sodium_mg).toBe(75); // 0.05 g × 1000 × 1.5
      expect(f.nutrition.provenance).toBe("third-party");
    }
  });

  it("returns null without a name, barcode, or calories", () => {
    expect(mapOffProduct({ code: "1", nutriments: {} })).toBeNull();
    expect(mapOffProduct({ product_name: "X", nutriments: {} })).toBeNull();
    expect(
      mapOffProduct({ code: "1", product_name: "X", nutriments: {} }),
    ).toBeNull();
  });
});
