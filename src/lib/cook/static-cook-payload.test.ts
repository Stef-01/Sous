import { describe, expect, it } from "vitest";
import { getStaticCookData } from "@/data/guided-cook-steps";
import { formatStaticCookPayload } from "./static-cook-payload";

describe("formatStaticCookPayload", () => {
  it("matches the cook query shape for an offline catalog fallback", () => {
    const recipe = getStaticCookData("garlic-bread");
    expect(recipe).not.toBeNull();

    const payload = formatStaticCookPayload(recipe!);

    expect(payload.dish).toMatchObject({
      id: "garlic-bread",
      slug: "garlic-bread",
      name: "Garlic Bread",
    });
    expect(payload.ingredients).toEqual(recipe!.ingredients);
    expect(payload.steps).toHaveLength(recipe!.steps.length);
    expect(payload.steps[0]).toMatchObject({
      id: "garlic-bread-step-1",
      stepNumber: 1,
      attentionPointers: null,
    });
  });
});
