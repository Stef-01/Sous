import { describe, expect, it } from "vitest";
import { sheetMotion } from "./sheet";

describe("sheetMotion (W7)", () => {
  it("rises on a spring normally", () => {
    const m = sheetMotion(false);
    expect(m.initial).toEqual({ y: "100%" });
    expect(m.transition).toMatchObject({ type: "spring" });
  });
  it("degrades to a quick fade under reduced motion", () => {
    const m = sheetMotion(true);
    expect(m.initial).toEqual({ opacity: 0 });
    expect(m.transition).toMatchObject({ duration: expect.any(Number) });
  });
});
