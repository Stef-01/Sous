import { describe, expect, it } from "vitest";
import { getInitials } from "./expert-avatar";

describe("getInitials", () => {
  it("uses first + last word initials for multi-word names", () => {
    expect(getInitials("Venus Kalami")).toBe("VK");
    expect(getInitials("Cindy Zedeck")).toBe("CZ");
    // middle words are ignored — first and last only
    expect(getInitials("Mary Jane Watson")).toBe("MW");
  });

  it("uses the first two letters for a single-word name", () => {
    expect(getInitials("Madonna")).toBe("MA");
  });

  it("uppercases and tolerates messy whitespace", () => {
    expect(getInitials("  maya   adam  ")).toBe("MA");
  });

  it("falls back to '?' for an empty name", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });
});
