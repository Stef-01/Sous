import { describe, expect, it } from "vitest";
import {
  applyApproval,
  applyRejection,
  pendingCommunityRecipes,
  submitForCommunityReview,
} from "./admin-approval";
import type { UserRecipe } from "@/types/user-recipe";

function recipe(over: Partial<UserRecipe> = {}): UserRecipe {
  return {
    schemaVersion: 1,
    id: "rec-test-1",
    slug: "test-dish",
    title: "Test dish",
    dishName: "Test dish",
    cuisineFamily: "italian",
    flavorProfile: [],
    dietaryFlags: [],
    temperature: "hot",
    skillLevel: "beginner",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    serves: 2,
    heroImageUrl: null,
    description: "A test dish.",
    ingredients: [
      {
        id: "i-1",
        name: "salt",
        quantity: "1 tsp",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Cook it.",
        timerSeconds: null,
        mistakeWarning: null,
        quickHack: null,
        cuisineFact: null,
        donenessCue: null,
        imageUrl: null,
        attentionPointers: null,
      },
    ],
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
    source: "community",
    nourishApprovedAt: null,
    nourishApprovedBy: null,
    authorDisplayName: "Alex",
    ...over,
  };
}

describe("applyApproval", () => {
  it("flips source to nourish-verified", () => {
    const r = applyApproval(recipe(), {
      now: "2026-05-02T12:00:00Z",
      adminId: "stefan",
    });
    expect(r.source).toBe("nourish-verified");
  });

  it("stamps nourishApprovedAt + nourishApprovedBy", () => {
    const r = applyApproval(recipe(), {
      now: "2026-05-02T12:00:00Z",
      adminId: "stefan",
    });
    expect(r.nourishApprovedAt).toBe("2026-05-02T12:00:00Z");
    expect(r.nourishApprovedBy).toBe("stefan");
  });

  it("bumps updatedAt", () => {
    const r = applyApproval(recipe({ updatedAt: "2025-01-01T00:00:00Z" }), {
      now: "2026-05-02T12:00:00Z",
      adminId: "stefan",
    });
    expect(r.updatedAt).toBe("2026-05-02T12:00:00Z");
  });

  it("preserves every other field", () => {
    const original = recipe({ title: "My signature curry", serves: 4 });
    const r = applyApproval(original, {
      now: "2026-05-02T12:00:00Z",
      adminId: "stefan",
    });
    expect(r.title).toBe("My signature curry");
    expect(r.serves).toBe(4);
    expect(r.id).toBe(original.id);
    expect(r.authorDisplayName).toBe("Alex");
  });

  it("idempotent — second approval is a no-op on source", () => {
    const stamp = { now: "2026-05-02T12:00:00Z", adminId: "stefan" };
    const once = applyApproval(recipe(), stamp);
    const twice = applyApproval(once, stamp);
    expect(twice.source).toBe("nourish-verified");
    expect(twice.nourishApprovedAt).toBe(stamp.now);
  });
});

describe("applyRejection", () => {
  it("reverts source to user", () => {
    const r = applyRejection(recipe(), {
      now: "2026-05-02T12:00:00Z",
      adminId: "stefan",
    });
    expect(r.source).toBe("user");
  });

  it("clears nourishApprovedAt + nourishApprovedBy", () => {
    const r = applyRejection(
      recipe({
        source: "nourish-verified",
        nourishApprovedAt: "2026-04-15T00:00:00Z",
        nourishApprovedBy: "stefan",
      }),
      { now: "2026-05-02T12:00:00Z", adminId: "stefan" },
    );
    expect(r.nourishApprovedAt).toBe(null);
    expect(r.nourishApprovedBy).toBe(null);
  });

  it("bumps updatedAt", () => {
    const r = applyRejection(recipe({ updatedAt: "2025-01-01T00:00:00Z" }), {
      now: "2026-05-02T12:00:00Z",
      adminId: "stefan",
    });
    expect(r.updatedAt).toBe("2026-05-02T12:00:00Z");
  });

  it("idempotent — re-rejecting an already user recipe is safe", () => {
    const stamp = { now: "2026-05-02T12:00:00Z", adminId: "stefan" };
    const once = applyRejection(recipe(), stamp);
    const twice = applyRejection(once, stamp);
    expect(twice.source).toBe("user");
  });
});

describe("pendingCommunityRecipes", () => {
  it("filters to community-tagged recipes only", () => {
    const list: UserRecipe[] = [
      recipe({ id: "a", source: "community" }),
      recipe({ id: "b", source: "user" }),
      recipe({ id: "c", source: "nourish-verified" }),
      recipe({ id: "d", source: "community" }),
    ];
    expect(pendingCommunityRecipes(list).map((r) => r.id)).toEqual(["a", "d"]);
  });

  it("empty list → []", () => {
    expect(pendingCommunityRecipes([])).toEqual([]);
  });

  it("preserves input order", () => {
    const list = [
      recipe({ id: "z", source: "community" }),
      recipe({ id: "a", source: "community" }),
    ];
    expect(pendingCommunityRecipes(list).map((r) => r.id)).toEqual(["z", "a"]);
  });
});

describe("submitForCommunityReview", () => {
  it("flips a user recipe to community", () => {
    const r = submitForCommunityReview(recipe({ source: "user" }), {
      now: "2026-05-02T12:00:00Z",
      authorDisplayName: "Alex",
    });
    expect(r.source).toBe("community");
  });

  it("stamps authorDisplayName", () => {
    const r = submitForCommunityReview(recipe({ authorDisplayName: null }), {
      now: "2026-05-02T12:00:00Z",
      authorDisplayName: "Casey",
    });
    expect(r.authorDisplayName).toBe("Casey");
  });

  it("clears any prior approval stamps", () => {
    const r = submitForCommunityReview(
      recipe({
        source: "nourish-verified",
        nourishApprovedAt: "2026-04-15T00:00:00Z",
        nourishApprovedBy: "stefan",
      }),
      { now: "2026-05-02T12:00:00Z", authorDisplayName: "Alex" },
    );
    expect(r.nourishApprovedAt).toBe(null);
    expect(r.nourishApprovedBy).toBe(null);
  });

  it("bumps updatedAt", () => {
    const r = submitForCommunityReview(
      recipe({ updatedAt: "2025-01-01T00:00:00Z" }),
      { now: "2026-05-02T12:00:00Z", authorDisplayName: "Alex" },
    );
    expect(r.updatedAt).toBe("2026-05-02T12:00:00Z");
  });
});
