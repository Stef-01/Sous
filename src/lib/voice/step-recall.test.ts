import { describe, expect, it } from "vitest";
import {
  classifyStepRecallIntent,
  recallFromSteps,
  type StepRecallStep,
} from "./step-recall";

const recipe: StepRecallStep[] = [
  { instruction: "Heat oil in a pan over medium heat." },
  { instruction: "Add chopped onions and cook until translucent." },
  { instruction: "Add garlic and bloom the spices for 30 seconds." },
  { instruction: "Pour in tomatoes and a generous pinch of salt." },
  { instruction: "Simmer for 15 minutes, then taste and adjust." },
];

// ── classifyStepRecallIntent ──────────────────────────────

describe("classifyStepRecallIntent — did-i", () => {
  it("'did I add salt' → did-i / salt", () => {
    expect(classifyStepRecallIntent("did I add salt")).toEqual({
      kind: "did-i",
      keyword: "salt",
    });
  });

  it("'have I added salt' → did-i / salt", () => {
    expect(classifyStepRecallIntent("have I added salt")).toEqual({
      kind: "did-i",
      keyword: "salt",
    });
  });

  it("'did we put in the garlic' → did-i / garlic", () => {
    expect(classifyStepRecallIntent("did we put in the garlic")).toEqual({
      kind: "did-i",
      keyword: "garlic",
    });
  });

  it("trailing 'yet' is stripped", () => {
    expect(classifyStepRecallIntent("did I add salt yet")).toEqual({
      kind: "did-i",
      keyword: "salt",
    });
  });

  it("trailing '?' is preserved as plain text but doesn't break match", () => {
    expect(classifyStepRecallIntent("did I add salt?").kind).toBe("did-i");
  });

  it("multi-word keyword ('olive oil') survives", () => {
    expect(classifyStepRecallIntent("did I add olive oil")).toEqual({
      kind: "did-i",
      keyword: "olive oil",
    });
  });
});

describe("classifyStepRecallIntent — what-next", () => {
  it("'what's next' → what-next / no anchor", () => {
    expect(classifyStepRecallIntent("what's next")).toEqual({
      kind: "what-next",
      keyword: "",
    });
  });

  it("'what is next' → what-next / no anchor", () => {
    expect(classifyStepRecallIntent("what is next").kind).toBe("what-next");
  });

  it("'what now' → what-next", () => {
    expect(classifyStepRecallIntent("what now").kind).toBe("what-next");
  });

  it("'what's next after the blooming step' → afterKeyword=blooming", () => {
    const out = classifyStepRecallIntent("what's next after the blooming step");
    expect(out.kind).toBe("what-next");
    expect(out.afterKeyword).toBe("blooming");
  });

  it("'what comes next after onions' → afterKeyword=onions", () => {
    const out = classifyStepRecallIntent("what comes next after onions");
    expect(out.afterKeyword).toBe("onions");
  });

  it("anchor without 'the'", () => {
    const out = classifyStepRecallIntent("what's next after garlic");
    expect(out.afterKeyword).toBe("garlic");
  });
});

describe("classifyStepRecallIntent — should-i", () => {
  it("'should I add salt' → should-i / salt", () => {
    expect(classifyStepRecallIntent("should I add salt")).toEqual({
      kind: "should-i",
      keyword: "salt",
    });
  });

  it("'do I need to add olive oil' → should-i / olive oil", () => {
    expect(classifyStepRecallIntent("do I need to add olive oil")).toEqual({
      kind: "should-i",
      keyword: "olive oil",
    });
  });

  it("'do I add salt now' → should-i / salt", () => {
    expect(classifyStepRecallIntent("do I add salt now")).toEqual({
      kind: "should-i",
      keyword: "salt",
    });
  });

  it("'am I supposed to add garlic' → should-i / garlic", () => {
    expect(classifyStepRecallIntent("am I supposed to add garlic")).toEqual({
      kind: "should-i",
      keyword: "garlic",
    });
  });
});

describe("classifyStepRecallIntent — unknown", () => {
  it("empty → unknown", () => {
    expect(classifyStepRecallIntent("").kind).toBe("unknown");
  });

  it("generic chat → unknown", () => {
    expect(classifyStepRecallIntent("hello").kind).toBe("unknown");
  });

  it("non-recall question → unknown", () => {
    expect(classifyStepRecallIntent("how long do I cook this").kind).toBe(
      "unknown",
    );
  });
});

// ── recallFromSteps — did-i path ──────────────────────────

describe("recallFromSteps — did-i", () => {
  it("found in earlier step → confident yes", () => {
    const intent = classifyStepRecallIntent("did I add onions");
    const out = recallFromSteps(recipe, intent, 3); // current step 4
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("yes");
    expect(out.speakable).toContain("step 2");
  });

  it("not yet (forward step has it) → confident not-yet", () => {
    const intent = classifyStepRecallIntent("did I add salt");
    const out = recallFromSteps(recipe, intent, 1); // current step 2
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("not yet");
    expect(out.speakable).toContain("step 4");
  });

  it("found in current step → still counts as 'yes'", () => {
    const intent = classifyStepRecallIntent("did I add salt");
    const out = recallFromSteps(recipe, intent, 3); // current step 4 (has salt)
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("yes");
  });

  it("ingredient not in any step → fallback", () => {
    const intent = classifyStepRecallIntent("did I add saffron");
    const out = recallFromSteps(recipe, intent, 2);
    expect(out.confident).toBe(false);
    expect(out.speakable.toLowerCase()).toContain("not sure");
  });

  it("empty steps list → fallback", () => {
    const intent = classifyStepRecallIntent("did I add salt");
    const out = recallFromSteps([], intent, 0);
    expect(out.confident).toBe(false);
  });
});

// ── recallFromSteps — what-next path ──────────────────────

describe("recallFromSteps — what-next (generic)", () => {
  it("describes the next step", () => {
    const intent = classifyStepRecallIntent("what's next");
    const out = recallFromSteps(recipe, intent, 1);
    expect(out.confident).toBe(true);
    expect(out.speakable).toContain("step 3");
    expect(out.speakable).toContain("garlic");
  });

  it("on last step → 'last step' message", () => {
    const intent = classifyStepRecallIntent("what's next");
    const out = recallFromSteps(recipe, intent, 4); // last
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("last step");
  });
});

describe("recallFromSteps — what-next (after anchor)", () => {
  it("'after the blooming step' → step 4", () => {
    const intent = classifyStepRecallIntent(
      "what's next after the blooming step",
    );
    const out = recallFromSteps(recipe, intent, 0);
    expect(out.confident).toBe(true);
    expect(out.speakable).toContain("step 4");
  });

  it("anchor not found in any step → fallback", () => {
    const intent = classifyStepRecallIntent("what's next after the saffron");
    const out = recallFromSteps(recipe, intent, 0);
    expect(out.confident).toBe(false);
  });

  it("anchor is the last step → 'last one' message", () => {
    const intent = classifyStepRecallIntent("what's next after simmer");
    const out = recallFromSteps(recipe, intent, 0);
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("last");
  });
});

// ── recallFromSteps — should-i path ───────────────────────

describe("recallFromSteps — should-i", () => {
  it("already in prior step → 'already added in step N'", () => {
    const intent = classifyStepRecallIntent("should I add onions");
    const out = recallFromSteps(recipe, intent, 3);
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("already");
    expect(out.speakable).toContain("step 2");
  });

  it("upcoming in future step → 'yes, in step N'", () => {
    const intent = classifyStepRecallIntent("should I add salt");
    const out = recallFromSteps(recipe, intent, 1);
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("step 4");
  });

  it("ingredient not in recipe → fallback", () => {
    const intent = classifyStepRecallIntent("should I add saffron");
    const out = recallFromSteps(recipe, intent, 1);
    expect(out.confident).toBe(false);
  });
});

// ── recallFromSteps — defensive ───────────────────────────

describe("recallFromSteps — defensive", () => {
  it("currentStepIndex out of range (negative) → clamped to 0", () => {
    const intent = classifyStepRecallIntent("did I add onions");
    const out = recallFromSteps(recipe, intent, -5);
    // Step 2 has onions, current clamped to 0; onions is forward → not yet
    expect(out.confident).toBe(true);
  });

  it("currentStepIndex out of range (huge) → clamped to last", () => {
    const intent = classifyStepRecallIntent("did I add salt");
    const out = recallFromSteps(recipe, intent, 999);
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("yes");
  });

  it("intent kind=unknown → fallback", () => {
    const out = recallFromSteps(recipe, { kind: "unknown", keyword: "" }, 0);
    expect(out.confident).toBe(false);
  });

  it("ingredient list per step is honoured", () => {
    const stepsWithIngs: StepRecallStep[] = [
      { instruction: "Cook the protein.", ingredients: ["chicken", "salt"] },
      { instruction: "Plate." },
    ];
    const intent = classifyStepRecallIntent("did I add chicken");
    const out = recallFromSteps(stepsWithIngs, intent, 0);
    expect(out.confident).toBe(true);
    expect(out.speakable.toLowerCase()).toContain("yes");
  });

  it("case-insensitive matching (recipe text is mixed case)", () => {
    const intent = classifyStepRecallIntent("did I add tomatoes");
    const out = recallFromSteps(recipe, intent, 4);
    expect(out.confident).toBe(true);
  });
});
