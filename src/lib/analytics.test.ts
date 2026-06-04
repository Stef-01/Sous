import { describe, expect, it } from "vitest";
import { track } from "./analytics";

describe("track — funnel analytics", () => {
  it("never throws and no-ops without a browser window (SSR / node tests)", () => {
    // window is undefined in the node test env → guarded no-op.
    expect(() => track("search_submitted")).not.toThrow();
    expect(() => track("results_viewed", { sides: 3 })).not.toThrow();
    expect(() =>
      track("cook_completed", { rating: 5, hasPhoto: true, cuisine: "indian" }),
    ).not.toThrow();
    expect(() =>
      track("plate_shared", { dishSlug: "fish-tacos" }),
    ).not.toThrow();
  });
});
