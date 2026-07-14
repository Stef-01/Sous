import { describe, expect, it } from "vitest";
import { eatOutDishHref, resolveEatOutDeepLink } from "./deep-link";

describe("Eat Out saved-dish deep links", () => {
  it("builds a stable venue and dish destination", () => {
    expect(
      eatOutDishHref("zareens-palo-alto", "zareens-chicken-tikka-masala"),
    ).toBe(
      "/eat-out?venue=zareens-palo-alto&dish=zareens-chicken-tikka-masala",
    );
  });

  it("resolves a dish only inside its real venue", () => {
    expect(
      resolveEatOutDeepLink(
        "zareens-palo-alto",
        "zareens-chicken-tikka-masala",
      ),
    ).toEqual({
      venueSlug: "zareens-palo-alto",
      dishSlug: "zareens-chicken-tikka-masala",
    });
    expect(
      resolveEatOutDeepLink("orens-hummus", "zareens-chicken-tikka-masala"),
    ).toBeNull();
  });

  it("rejects incomplete or unknown destinations", () => {
    expect(
      resolveEatOutDeepLink(null, "zareens-chicken-tikka-masala"),
    ).toBeNull();
    expect(resolveEatOutDeepLink("missing", "missing")).toBeNull();
  });
});
