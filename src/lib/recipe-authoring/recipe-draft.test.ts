import { describe, expect, it } from "vitest";
import {
  appendBlankIngredient,
  appendBlankStep,
  commitDraft,
  defaultRecipeDraft,
  nextIngredientId,
  removeStepAt,
  reorderSteps,
} from "./recipe-draft";
import { userRecipeSchema } from "@/types/user-recipe";

describe("defaultRecipeDraft", () => {
  it("returns a fresh object every call (no shared mutable state)", () => {
    const a = defaultRecipeDraft();
    const b = defaultRecipeDraft();
    a.title = "mutated";
    expect(b.title).toBe("");
  });

  it("seeds one blank ingredient + one blank step", () => {
    const d = defaultRecipeDraft();
    expect(d.ingredients).toHaveLength(1);
    expect(d.steps).toHaveLength(1);
    expect(d.steps[0].stepNumber).toBe(1);
  });

  it("uses sensible defaults for required fields", () => {
    const d = defaultRecipeDraft();
    expect(d.temperature).toBe("hot");
    expect(d.skillLevel).toBe("beginner");
    expect(d.serves).toBe(2);
  });
});

describe("nextIngredientId", () => {
  it("starts at i-1 when list is empty", () => {
    expect(nextIngredientId([])).toBe("i-1");
  });

  it("increments past the highest numeric suffix", () => {
    expect(
      nextIngredientId([
        { id: "i-1", name: "", quantity: "", isOptional: false },
        { id: "i-3", name: "", quantity: "", isOptional: false },
        { id: "i-7", name: "", quantity: "", isOptional: false },
      ]),
    ).toBe("i-8");
  });

  it("ignores non-numeric ids when computing the max", () => {
    expect(
      nextIngredientId([
        { id: "i-2", name: "", quantity: "", isOptional: false },
        { id: "imported-from-seed", name: "", quantity: "", isOptional: false },
      ]),
    ).toBe("i-3");
  });
});

describe("appendBlankIngredient / appendBlankStep", () => {
  it("appends an ingredient with the next id", () => {
    const before = [
      { id: "i-1", name: "salt", quantity: "1 tsp", isOptional: false },
    ];
    const after = appendBlankIngredient(before);
    expect(after).toHaveLength(2);
    expect(after[1].id).toBe("i-2");
    expect(after[1].name).toBe("");
  });

  it("appends a step with stepNumber === length + 1", () => {
    const before = [{ stepNumber: 1, instruction: "do thing" }];
    const after = appendBlankStep(before);
    expect(after).toHaveLength(2);
    expect(after[1].stepNumber).toBe(2);
  });
});

describe("removeStepAt", () => {
  it("removes the step at the given index and renumbers remaining", () => {
    const before = [
      { stepNumber: 1, instruction: "a" },
      { stepNumber: 2, instruction: "b" },
      { stepNumber: 3, instruction: "c" },
    ];
    const after = removeStepAt(before, 1);
    expect(after.map((s) => s.instruction)).toEqual(["a", "c"]);
    expect(after.map((s) => s.stepNumber)).toEqual([1, 2]);
  });

  it("returns a copy when index is out-of-bounds", () => {
    const before = [{ stepNumber: 1, instruction: "a" }];
    const after = removeStepAt(before, 5);
    expect(after).toEqual(before);
    expect(after).not.toBe(before);
  });

  it("handles removing the last step", () => {
    const after = removeStepAt(
      [
        { stepNumber: 1, instruction: "a" },
        { stepNumber: 2, instruction: "b" },
      ],
      1,
    );
    expect(after).toEqual([{ stepNumber: 1, instruction: "a" }]);
  });
});

describe("reorderSteps", () => {
  it("reorders + renumbers", () => {
    const before = [
      { stepNumber: 1, instruction: "a" },
      { stepNumber: 2, instruction: "b" },
      { stepNumber: 3, instruction: "c" },
    ];
    const after = reorderSteps(before, 0, 2);
    expect(after.map((s) => s.instruction)).toEqual(["b", "c", "a"]);
    expect(after.map((s) => s.stepNumber)).toEqual([1, 2, 3]);
  });

  it("returns a copy when from === to", () => {
    const before = [{ stepNumber: 1, instruction: "a" }];
    expect(reorderSteps(before, 0, 0)).toEqual(before);
  });

  it("returns a copy when indices are out-of-bounds", () => {
    const before = [{ stepNumber: 1, instruction: "a" }];
    expect(reorderSteps(before, 0, 5)).toEqual(before);
    expect(reorderSteps(before, -1, 0)).toEqual(before);
  });
});

describe("commitDraft", () => {
  it("fills in id / slug / timestamps when missing", () => {
    const draft = defaultRecipeDraft();
    draft.title = "My Best Curry";
    draft.dishName = "My Best Curry";
    draft.cuisineFamily = "indian";
    draft.description = "A curry.";
    draft.prepTimeMinutes = 10;
    draft.cookTimeMinutes = 20;
    draft.ingredients = [
      { id: "i-1", name: "salt", quantity: "1 tsp", isOptional: false },
    ];
    const committed = commitDraft(draft, "2026-05-02T00:00:00.000Z");
    expect(committed.slug).toBe("my-best-curry");
    expect(committed.id).toMatch(/^rec-my-best-curry-\d+$/);
    expect(committed.createdAt).toBe("2026-05-02T00:00:00.000Z");
    expect(committed.updatedAt).toBe("2026-05-02T00:00:00.000Z");
  });

  it("preserves existing id / slug / createdAt on edit", () => {
    const draft = defaultRecipeDraft();
    draft.id = "rec-existing";
    draft.slug = "existing";
    draft.createdAt = "2025-01-01T00:00:00.000Z";
    draft.title = "Existing";
    draft.dishName = "Existing";
    draft.cuisineFamily = "x";
    draft.description = "x";
    const committed = commitDraft(draft, "2026-05-02T00:00:00.000Z");
    expect(committed.id).toBe("rec-existing");
    expect(committed.slug).toBe("existing");
    expect(committed.createdAt).toBe("2025-01-01T00:00:00.000Z");
    // updatedAt always refreshes on commit.
    expect(committed.updatedAt).toBe("2026-05-02T00:00:00.000Z");
  });

  it("falls back to dishName === title when dishName is empty", () => {
    const draft = defaultRecipeDraft();
    draft.title = "Test";
    draft.dishName = "";
    draft.cuisineFamily = "x";
    draft.description = "x";
    const committed = commitDraft(draft);
    expect(committed.dishName).toBe("Test");
  });

  it("produces a recipe that passes userRecipeSchema validation when the draft is complete", () => {
    const draft = defaultRecipeDraft();
    draft.title = "Test";
    draft.dishName = "Test";
    draft.cuisineFamily = "indian";
    draft.description = "A test.";
    draft.prepTimeMinutes = 5;
    draft.cookTimeMinutes = 10;
    draft.ingredients = [
      { id: "i-1", name: "salt", quantity: "1 tsp", isOptional: false },
    ];
    draft.steps = [{ stepNumber: 1, instruction: "do thing" }];
    const committed = commitDraft(draft);
    expect(() => userRecipeSchema.parse(committed)).not.toThrow();
  });

  it("falls back to slug='untitled' when title is empty", () => {
    const draft = defaultRecipeDraft();
    draft.title = "";
    draft.dishName = "x";
    draft.cuisineFamily = "x";
    draft.description = "x";
    const committed = commitDraft(draft);
    expect(committed.slug).toBe("untitled");
  });
});

// W23 stress loops on the pure draft helpers.
describe("recipe-draft — stress: long-content", () => {
  it("nextIngredientId stays correct on a 100-ingredient list", () => {
    const ingredients = Array.from({ length: 100 }, (_, i) => ({
      id: `i-${i + 1}`,
      name: "x",
      quantity: "1",
      isOptional: false,
    }));
    expect(nextIngredientId(ingredients)).toBe("i-101");
  });

  it("reorderSteps stays sequential after 50-step shuffle", () => {
    const steps = Array.from({ length: 50 }, (_, i) => ({
      stepNumber: i + 1,
      instruction: `step ${i + 1}`,
    }));
    const reordered = reorderSteps(steps, 0, 49);
    expect(reordered.map((s) => s.stepNumber)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1),
    );
    // Step that was at index 0 is now at the end.
    expect(reordered[49].instruction).toBe("step 1");
  });
});

describe("recipe-draft — stress: race-condition", () => {
  it("commitDraft is deterministic when given a fixed `now`", () => {
    const draft = defaultRecipeDraft();
    draft.title = "Test";
    draft.dishName = "Test";
    draft.cuisineFamily = "x";
    draft.description = "x";
    draft.prepTimeMinutes = 5;
    draft.cookTimeMinutes = 10;
    const now = "2026-05-02T00:00:00.000Z";
    // The id includes Date.now() — pin the input so the id is
    // deterministic too. (commitDraft uses Date.now() only when
    // draft.id is missing AND a `now` param doesn't override the
    // id-generation; this test pins the timestamp side.)
    const c1 = commitDraft({ ...draft, id: "fixed-id" }, now);
    const c2 = commitDraft({ ...draft, id: "fixed-id" }, now);
    expect(c1).toEqual(c2);
  });
});

describe("recipe-draft — stress: poisoned-data", () => {
  it("nextIngredientId handles an empty-string id gracefully", () => {
    expect(
      nextIngredientId([
        { id: "", name: "x", quantity: "1", isOptional: false },
      ]),
    ).toBe("i-1");
  });

  it("removeStepAt handles negative indices defensively", () => {
    const before = [{ stepNumber: 1, instruction: "a" }];
    expect(removeStepAt(before, -1)).toEqual(before);
  });
});
