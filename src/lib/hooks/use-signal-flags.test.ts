import { describe, it, expect } from "vitest";
import { stepDensityFromFlags } from "./use-signal-flags";

describe("stepDensityFromFlags (W5 pacing density)", () => {
  it("is `default` when neither pacing flag is set", () => {
    expect(stepDensityFromFlags({})).toBe("default");
    // unrelated flags don't change the density.
    expect(stepDensityFromFlags({ budgetSensitive: true })).toBe("default");
  });

  it("is `verbose` when only verbose is set", () => {
    expect(stepDensityFromFlags({ verbose: true })).toBe("verbose");
  });

  it("is `terse` when only terse is set", () => {
    expect(stepDensityFromFlags({ terse: true })).toBe("terse");
  });

  it("lets `terse` win if both are somehow set (errs toward less clutter)", () => {
    expect(stepDensityFromFlags({ terse: true, verbose: true })).toBe("terse");
  });

  it("treats explicit false as unset", () => {
    expect(stepDensityFromFlags({ terse: false, verbose: false })).toBe(
      "default",
    );
  });
});
