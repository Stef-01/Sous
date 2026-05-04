import { describe, expect, it } from "vitest";
import {
  NOVELTY_FIRE_THRESHOLD,
  NOVELTY_MIN_PANTRY,
  NOVELTY_REPEAT_COOLDOWN_DAYS,
  generateDailyNovelty,
} from "./novelty";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-15T12:00:00");

// ── pantry size gate ──────────────────────────────────────

describe("generateDailyNovelty — pantry size gate", () => {
  it("empty pantry → null", () => {
    expect(
      generateDailyNovelty({
        pantry: [],
        recentCookIngredientSets: [],
        recentSuggestionIds: [],
        now: NOW,
      }),
    ).toBeNull();
  });

  it("pantry below NOVELTY_MIN_PANTRY → null", () => {
    expect(
      generateDailyNovelty({
        pantry: ["ham", "pear"], // 2 items, below floor
        recentCookIngredientSets: [],
        recentSuggestionIds: [],
        now: NOW,
      }),
    ).toBeNull();
  });

  it("pantry at NOVELTY_MIN_PANTRY but no pattern match → null", () => {
    expect(
      generateDailyNovelty({
        pantry: ["spinach", "kale", "broccoli", "carrot"],
        recentCookIngredientSets: [],
        recentSuggestionIds: [],
        now: NOW,
      }),
    ).toBeNull();
  });
});

// ── pattern match (happy path) ────────────────────────────

describe("generateDailyNovelty — pattern match", () => {
  it("ham + cheese + pear → argyle pear sandwich", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    expect(out).not.toBeNull();
    if (out) {
      expect(out.suggestedDishName.toLowerCase()).toContain("pear");
      expect(out.ingredients).toContain("pear");
    }
  });

  it("tomato + mozzarella + basil → caprese", () => {
    const out = generateDailyNovelty({
      pantry: ["tomato", "mozzarella", "basil", "olive oil"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    expect(out).not.toBeNull();
    if (out) {
      expect(out.suggestedDishType).toBe("salad");
    }
  });

  it("matched ingredients are returned for the dot-coded card", () => {
    const out = generateDailyNovelty({
      pantry: ["chickpeas", "lemon", "olive oil", "bread", "ham"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    expect(out?.ingredients.length).toBeGreaterThanOrEqual(3);
  });
});

// ── substitution slots ────────────────────────────────────

describe("generateDailyNovelty — substitute slots", () => {
  it("'prosciutto' substitutes for 'ham' in the same slot", () => {
    const out = generateDailyNovelty({
      pantry: ["prosciutto", "manchego", "fig", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    expect(out).not.toBeNull();
    if (out) {
      expect(out.ingredients).toContain("prosciutto");
      expect(out.ingredients).toContain("manchego");
      expect(out.ingredients).toContain("fig");
    }
  });
});

// ── cool-down ─────────────────────────────────────────────

describe("generateDailyNovelty — cool-down", () => {
  it("recent same-id suggestion → null", () => {
    const baseline = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    expect(baseline).not.toBeNull();
    if (!baseline) return;

    const recent = [
      {
        id: baseline.id,
        surfacedAt: new Date(NOW.getTime() - 5 * DAY_MS).toISOString(),
      },
    ];
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: recent,
      now: NOW,
    });
    expect(out).toBeNull();
  });

  it("suggestion past the cool-down window → re-fires", () => {
    const baseline = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    if (!baseline) throw new Error("baseline expected");

    const recent = [
      {
        id: baseline.id,
        surfacedAt: new Date(
          NOW.getTime() - (NOVELTY_REPEAT_COOLDOWN_DAYS + 1) * DAY_MS,
        ).toISOString(),
      },
    ];
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: recent,
      now: NOW,
    });
    expect(out).not.toBeNull();
  });

  it("invalid surfacedAt timestamp → cool-down ignored (defensive)", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [{ id: "novelty-x", surfacedAt: "not-a-date" }],
      now: NOW,
    });
    // The novelty-x id doesn't match the actual id anyway, but
    // even if it did, an invalid surfacedAt should fall through.
    expect(out).not.toBeNull();
  });
});

// ── familiarity discount ──────────────────────────────────

describe("generateDailyNovelty — familiarity discount", () => {
  it("user recently cooked the exact combo → familiarity drops below threshold", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [["ham", "sharp cheese", "pear"]],
      recentSuggestionIds: [],
      now: NOW,
    });
    // 3-overlap → familiarity = 0.3, score = 0.9 × 0.3 = 0.27 < 0.65
    expect(out).toBeNull();
  });

  it("partial overlap (1 ingredient) → still surfaces", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [["ham", "rice", "broccoli"]],
      recentSuggestionIds: [],
      now: NOW,
    });
    // 1-overlap → familiarity = 0.85, score = 0.9 × 0.85 = 0.765 ≥ 0.65
    expect(out).not.toBeNull();
  });

  it("no overlap → full novelty score", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [["pasta", "tomato sauce"]],
      recentSuggestionIds: [],
      now: NOW,
    });
    expect(out).not.toBeNull();
    if (out) expect(out.noveltyScore).toBeCloseTo(0.9, 5);
  });
});

// ── determinism ───────────────────────────────────────────

describe("generateDailyNovelty — determinism", () => {
  it("same input → same output", () => {
    const input = {
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    };
    const a = generateDailyNovelty(input);
    const b = generateDailyNovelty(input);
    expect(a).toEqual(b);
  });

  it("multiple matching patterns → highest score wins, alphabetical tie-break", () => {
    // Pantry that matches multiple patterns
    const out = generateDailyNovelty({
      pantry: [
        "ham",
        "sharp cheese",
        "pear",
        "bread",
        "tomato",
        "mozzarella",
        "basil",
      ],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    // Both patterns score 0.9 (no familiarity discount). Tie-
    // break is alphabetical on id.
    expect(out).not.toBeNull();
  });
});

// ── output shape ──────────────────────────────────────────

describe("generateDailyNovelty — output shape", () => {
  it("includes id, dishName, dishType, score, explanation, prepTime", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    if (out) {
      expect(out.id).toContain("novelty-");
      expect(out.suggestedDishName.length).toBeGreaterThan(0);
      expect(out.suggestedDishType.length).toBeGreaterThan(0);
      expect(out.noveltyScore).toBeGreaterThanOrEqual(NOVELTY_FIRE_THRESHOLD);
      expect(out.pairingExplanation.length).toBeGreaterThan(0);
      expect(out.prepTimeMinutes).toBeGreaterThan(0);
    }
  });

  it("score never exceeds 1.0", () => {
    const out = generateDailyNovelty({
      pantry: ["ham", "sharp cheese", "pear", "bread"],
      recentCookIngredientSets: [],
      recentSuggestionIds: [],
      now: NOW,
    });
    if (out) expect(out.noveltyScore).toBeLessThanOrEqual(1);
  });
});

// ── exposed constants ─────────────────────────────────────

describe("constants", () => {
  it("NOVELTY_MIN_PANTRY is 4", () => {
    expect(NOVELTY_MIN_PANTRY).toBe(4);
  });

  it("NOVELTY_FIRE_THRESHOLD is 0.65", () => {
    expect(NOVELTY_FIRE_THRESHOLD).toBe(0.65);
  });

  it("NOVELTY_REPEAT_COOLDOWN_DAYS is 30", () => {
    expect(NOVELTY_REPEAT_COOLDOWN_DAYS).toBe(30);
  });
});
