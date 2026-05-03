import { describe, expect, it } from "vitest";
import { seedToRecipeDraft } from "./seed-fork";
import { userRecipeSchema } from "@/types/user-recipe";
import { commitDraft } from "./recipe-draft";
import type { StaticDishData } from "@/data/guided-cook-steps";

function seed(overrides: Partial<StaticDishData> = {}): StaticDishData {
  return {
    name: "Caesar Salad",
    slug: "caesar-salad",
    description: "Crisp romaine lettuce tossed with creamy Caesar dressing.",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: "/food_images/caesar.png",
    flavorProfile: ["fresh", "umami"],
    temperature: "cold",
    ingredients: [
      {
        id: "i-romaine",
        name: "romaine lettuce",
        quantity: "2 heads",
        isOptional: false,
        substitution: null,
      },
      {
        id: "i-parmesan",
        name: "parmesan",
        quantity: "1/2 cup",
        isOptional: false,
        substitution: "pecorino",
      },
    ],
    steps: [
      {
        phase: "cook",
        stepNumber: 1,
        instruction: "Toast the croutons.",
        timerSeconds: 480,
        mistakeWarning: "Don't burn them.",
        quickHack: "Tear bread by hand.",
        cuisineFact: "Caesar salad was invented in Tijuana.",
        donenessCue: "Golden, not brown.",
        imageUrl: null,
      },
      {
        phase: "cook",
        stepNumber: 2,
        instruction: "Whisk the dressing.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
      },
    ],
    ...overrides,
  };
}

describe("seedToRecipeDraft — basic conversion", () => {
  it("prefixes title with 'My '", () => {
    expect(seedToRecipeDraft(seed()).title).toBe("My Caesar Salad");
  });

  it("preserves dishName as the seed's display name", () => {
    expect(seedToRecipeDraft(seed()).dishName).toBe("Caesar Salad");
  });

  it("preserves cuisineFamily, prep/cook times, description", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.cuisineFamily).toBe("italian");
    expect(draft.prepTimeMinutes).toBe(10);
    expect(draft.cookTimeMinutes).toBe(10);
    expect(draft.description).toContain("romaine");
  });

  it("preserves flavorProfile and heroImageUrl", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.flavorProfile).toEqual(["fresh", "umami"]);
    expect(draft.heroImageUrl).toBe("/food_images/caesar.png");
  });

  it("defaults dietaryFlags to empty + serves to 2", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.dietaryFlags).toEqual([]);
    expect(draft.serves).toBe(2);
  });

  it("drops id/slug/createdAt/updatedAt — commitDraft fills them", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.id).toBeUndefined();
    expect(draft.slug).toBeUndefined();
    expect(draft.createdAt).toBeUndefined();
    expect(draft.updatedAt).toBeUndefined();
  });
});

describe("seedToRecipeDraft — ingredient renumbering", () => {
  it("resets ingredient ids to canonical i-<n>", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.ingredients.map((i) => i.id)).toEqual(["i-1", "i-2"]);
  });

  it("preserves ingredient name / quantity / optional / substitution", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.ingredients[1]).toEqual({
      id: "i-2",
      name: "parmesan",
      quantity: "1/2 cup",
      isOptional: false,
      substitution: "pecorino",
    });
  });
});

describe("seedToRecipeDraft — step filtering + renumbering", () => {
  it("filters steps to phase=cook and renumbers 1..N", () => {
    const seedWithMixedPhases: StaticDishData = {
      ...seed(),
      steps: [
        {
          phase: "cook",
          stepNumber: 1,
          instruction: "Cook 1",
          timerSeconds: null,
          mistakeWarning: null,
          quickHack: null,
          cuisineFact: null,
          donenessCue: null,
          imageUrl: null,
        },
        ...seed().steps,
      ],
    };
    const draft = seedToRecipeDraft(seedWithMixedPhases);
    expect(draft.steps.length).toBe(3);
    expect(draft.steps.map((s) => s.stepNumber)).toEqual([1, 2, 3]);
  });

  it("preserves step instruction + timer + chip fields", () => {
    const draft = seedToRecipeDraft(seed());
    expect(draft.steps[0].instruction).toBe("Toast the croutons.");
    expect(draft.steps[0].timerSeconds).toBe(480);
    expect(draft.steps[0].mistakeWarning).toBe("Don't burn them.");
    expect(draft.steps[0].quickHack).toBe("Tear bread by hand.");
    expect(draft.steps[0].cuisineFact).toBe(
      "Caesar salad was invented in Tijuana.",
    );
    expect(draft.steps[0].donenessCue).toBe("Golden, not brown.");
  });

  it("falls back to a single empty step when seed has no cook steps", () => {
    const empty: StaticDishData = { ...seed(), steps: [] };
    const draft = seedToRecipeDraft(empty);
    expect(draft.steps.length).toBe(1);
    expect(draft.steps[0].stepNumber).toBe(1);
    expect(draft.steps[0].instruction).toBe("");
  });
});

describe("seedToRecipeDraft — coercion to schema enums", () => {
  it("preserves recognised temperature values", () => {
    expect(seedToRecipeDraft(seed({ temperature: "hot" })).temperature).toBe(
      "hot",
    );
    expect(seedToRecipeDraft(seed({ temperature: "cold" })).temperature).toBe(
      "cold",
    );
    expect(
      seedToRecipeDraft(seed({ temperature: "room-temp" })).temperature,
    ).toBe("room-temp");
  });

  it("defaults unknown temperature to hot", () => {
    expect(
      seedToRecipeDraft(seed({ temperature: "lukewarm" })).temperature,
    ).toBe("hot");
  });

  it("preserves recognised skill level", () => {
    expect(seedToRecipeDraft(seed({ skillLevel: "advanced" })).skillLevel).toBe(
      "advanced",
    );
  });

  it("defaults unknown skillLevel to intermediate", () => {
    expect(seedToRecipeDraft(seed({ skillLevel: "easy" })).skillLevel).toBe(
      "intermediate",
    );
  });
});

describe("seedToRecipeDraft — round-trip through commitDraft", () => {
  it("commitDraft + safeParse succeeds on the converted fork", () => {
    const draft = seedToRecipeDraft(seed());
    const committed = commitDraft(draft);
    const result = userRecipeSchema.safeParse(committed);
    expect(result.success).toBe(true);
  });
});
