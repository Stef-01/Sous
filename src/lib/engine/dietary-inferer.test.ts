import { describe, expect, it } from "vitest";
import {
  inferDietaryFlags,
  satisfiesDietaryRequirement,
} from "./dietary-inferer";

describe("inferDietaryFlags — empty / generic cases", () => {
  it("a clean salad is vegan + vegetarian + dairy-free + nut/shellfish-safe", () => {
    const result = inferDietaryFlags({
      tags: ["salad"],
      description:
        "Mixed greens with cucumber, tomato, olive oil, and lemon juice.",
    });
    expect(result).toContain("vegan");
    expect(result).toContain("vegetarian");
    expect(result).toContain("dairy-free");
    expect(result).toContain("nut-allergy");
    expect(result).toContain("shellfish-allergy");
  });

  it("returns sorted output for deterministic comparison", () => {
    const result = inferDietaryFlags({
      tags: [],
      description: "Plain steamed rice.",
    });
    const sorted = [...result].sort();
    expect(result).toEqual(sorted);
  });
});

describe("inferDietaryFlags — animal exclusions", () => {
  it("Caesar salad (parmesan, anchovy) is NOT vegan and NOT dairy-free", () => {
    const result = inferDietaryFlags({
      tags: ["salad", "italian"],
      description:
        "Crisp romaine with creamy Caesar dressing, shaved Parmesan, and crunchy garlic croutons. Contains anchovy.",
    });
    expect(result).not.toContain("vegan");
    expect(result).not.toContain("vegetarian");
    expect(result).not.toContain("dairy-free");
  });

  it("garlic bread (butter, bread) is dairy-violating + gluten-violating", () => {
    const result = inferDietaryFlags({
      tags: ["bread", "italian"],
      description: "Golden-toasted baguette slices brushed with garlic butter.",
    });
    expect(result).not.toContain("vegan");
    expect(result).not.toContain("dairy-free");
    expect(result).not.toContain("gluten-free");
  });

  it("a chicken dish is NOT vegan or vegetarian", () => {
    const result = inferDietaryFlags({
      tags: ["protein"],
      description: "Grilled chicken thighs with lemon.",
    });
    expect(result).not.toContain("vegan");
    expect(result).not.toContain("vegetarian");
  });

  it("a shrimp dish is NOT shellfish-allergy-safe", () => {
    const result = inferDietaryFlags({
      tags: [],
      description: "Garlic shrimp scampi.",
    });
    expect(result).not.toContain("shellfish-allergy");
  });
});

describe("inferDietaryFlags — gluten exclusions", () => {
  it("pasta dish is NOT gluten-free", () => {
    const result = inferDietaryFlags({
      tags: ["pasta"],
      description: "Hand-rolled pasta with tomato sauce.",
    });
    expect(result).not.toContain("gluten-free");
  });

  it("naan flatbread is NOT gluten-free", () => {
    const result = inferDietaryFlags({
      tags: ["bread", "indian"],
      description: "Soft, pillowy naan baked in a hot oven.",
    });
    expect(result).not.toContain("gluten-free");
  });

  it("steamed rice IS gluten-free", () => {
    const result = inferDietaryFlags({
      tags: ["rice"],
      description: "Plain basmati rice, steamed.",
    });
    expect(result).toContain("gluten-free");
  });
});

describe("inferDietaryFlags — nut exclusions", () => {
  it("almond-crusted dish is NOT nut-allergy-safe", () => {
    const result = inferDietaryFlags({
      tags: [],
      description: "Almond-crusted green beans.",
    });
    expect(result).not.toContain("nut-allergy");
  });

  it("a basic salad with no nuts IS nut-allergy-safe", () => {
    const result = inferDietaryFlags({
      tags: ["salad"],
      description: "Greens with vinaigrette.",
    });
    expect(result).toContain("nut-allergy");
  });
});

describe("inferDietaryFlags — tag-authored intent wins", () => {
  it("explicit `vegan` tag forces compatibility even if description has no signal", () => {
    const result = inferDietaryFlags({
      tags: ["vegan"],
      description: "Some dish.",
    });
    expect(result).toContain("vegan");
    expect(result).toContain("vegetarian"); // implied
  });

  it("explicit `gluten-free` tag forces compatibility", () => {
    const result = inferDietaryFlags({
      tags: ["gluten-free", "rice"],
      description: "Plain steamed rice.",
    });
    expect(result).toContain("gluten-free");
  });

  it("explicit tag overrides a description that mentions a violation term", () => {
    // Hypothetical: a chef tagged a dish vegan even though the
    // description mentions "cream" (presumably coconut cream).
    // Tag-authored intent wins.
    const result = inferDietaryFlags({
      tags: ["vegan"],
      description: "Coconut cream curry.",
    });
    expect(result).toContain("vegan");
  });
});

describe("inferDietaryFlags — vegan implies vegetarian", () => {
  it("if vegan is set, vegetarian is also set", () => {
    const result = inferDietaryFlags({
      tags: ["vegan"],
      description: "Tofu stir-fry.",
    });
    expect(result).toContain("vegan");
    expect(result).toContain("vegetarian");
  });
});

describe("satisfiesDietaryRequirement", () => {
  it("empty requirement is trivially satisfied", () => {
    expect(satisfiesDietaryRequirement([], [])).toBe(true);
    expect(satisfiesDietaryRequirement(["vegan"], [])).toBe(true);
  });

  it("single requirement matches single flag", () => {
    expect(satisfiesDietaryRequirement(["vegan"], ["vegan"])).toBe(true);
    expect(satisfiesDietaryRequirement(["vegetarian"], ["vegan"])).toBe(false);
  });

  it("must include every required flag", () => {
    const dish = ["vegan", "gluten-free"];
    expect(satisfiesDietaryRequirement(dish, ["vegan"])).toBe(true);
    expect(satisfiesDietaryRequirement(dish, ["vegan", "gluten-free"])).toBe(
      true,
    );
    expect(
      satisfiesDietaryRequirement(dish, [
        "vegan",
        "gluten-free",
        "nut-allergy",
      ]),
    ).toBe(false);
  });

  it("dish with extra flags still satisfies", () => {
    const dish = ["vegan", "vegetarian", "dairy-free", "gluten-free"];
    expect(satisfiesDietaryRequirement(dish, ["vegan"])).toBe(true);
  });
});
