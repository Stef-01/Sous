import { describe, it, expect } from "vitest";
import { isHomeChefEnabled } from "./flag";

describe("isHomeChefEnabled", () => {
  it("is OFF by default (no env)", () => {
    expect(isHomeChefEnabled({})).toBe(false);
  });

  it("is ON only for the exact string 'true'", () => {
    expect(
      isHomeChefEnabled({ NEXT_PUBLIC_SOUS_HOME_CHEF_ENABLED: "true" }),
    ).toBe(true);
  });

  it("stays OFF for other truthy-looking values", () => {
    for (const v of ["1", "yes", "TRUE", "on", "", "false"]) {
      expect(isHomeChefEnabled({ NEXT_PUBLIC_SOUS_HOME_CHEF_ENABLED: v })).toBe(
        false,
      );
    }
  });
});
