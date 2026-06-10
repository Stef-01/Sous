import { describe, expect, it } from "vitest";
import { cleanFoodLine, extractFoodQuery } from "./extract-food-query";

describe("cleanFoodLine", () => {
  it("strips calorie/size tails (menu lines)", () => {
    expect(cleanFoodLine("Big Mac 590 cal")).toBe("Big Mac");
    expect(cleanFoodLine("Iced Latte 12 fl oz (180 cal)")).toBe("Iced Latte");
  });

  it("strips OCR junk characters and squeezes whitespace", () => {
    expect(cleanFoodLine("GREEK | YOGURT *")).toBe("GREEK YOGURT");
  });
});

describe("extractFoodQuery", () => {
  it("reads a package front: brand hero + product name wins", () => {
    const r = extractFoodQuery(
      "CHOBANI\nGreek Yogurt\nPlain Nonfat\nNET WT 5.3 OZ (150g)",
    );
    // Either the product line or brand is fine as the query; the product
    // name must rank first among multi-word candidates.
    expect(r.query).toBe("Greek Yogurt");
    expect(r.alternates).toContain("CHOBANI");
  });

  it("reads a cereal box: name beats slogan and pack size", () => {
    const r = extractFoodQuery(
      "KELLOGG'S\nCORN FLAKES\nThe Original & Best\nNET WT 18 OZ (1 LB 2 OZ) 510g",
    );
    expect(r.query).toBe("CORN FLAKES");
  });

  it("returns null on a pure nutrition-facts panel (nothing readable as a name)", () => {
    const r = extractFoodQuery(
      "Nutrition Facts\nServing Size 2/3 cup (55g)\nCalories 230\nTotal Fat 8g 10%\nSodium 160mg 7%\nProtein 3g",
    );
    expect(r.query).toBeNull();
    expect(r.alternates).toEqual([]);
  });

  it("reads a menu line with price/cals", () => {
    const r = extractFoodQuery("Chicken Caesar Salad 12.99\n720 cal");
    expect(r.query).toBe("Chicken Caesar Salad");
  });

  it("dedupes repeated lines and keeps alternates distinct", () => {
    const r = extractFoodQuery("OAT MILK\nOAT MILK\nBarista Edition");
    expect(r.query).toBe("OAT MILK");
    expect(r.alternates).toEqual(["Barista Edition"]);
  });
});
