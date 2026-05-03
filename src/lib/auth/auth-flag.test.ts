import { describe, expect, it } from "vitest";
import { MOCK_USER_ID, isAuthEnabledIn } from "./auth-flag";

describe("isAuthEnabledIn — short-circuits", () => {
  it("returns false when CLERK_SECRET_KEY is unset", () => {
    expect(isAuthEnabledIn({})).toBe(false);
  });

  it("returns false when CLERK_SECRET_KEY is empty string", () => {
    expect(isAuthEnabledIn({ CLERK_SECRET_KEY: "" })).toBe(false);
  });

  it("returns false when CLERK_SECRET_KEY is undefined explicitly", () => {
    expect(isAuthEnabledIn({ CLERK_SECRET_KEY: undefined })).toBe(false);
  });
});

describe("isAuthEnabledIn — flag-driven", () => {
  it("returns true when CLERK_SECRET_KEY is set and override unset", () => {
    expect(isAuthEnabledIn({ CLERK_SECRET_KEY: "sk_test_abc" })).toBe(true);
  });

  it("returns false when SOUS_AUTH_ENABLED='false' regardless of key", () => {
    expect(
      isAuthEnabledIn({
        CLERK_SECRET_KEY: "sk_test_abc",
        SOUS_AUTH_ENABLED: "false",
      }),
    ).toBe(false);
  });

  it("returns true when SOUS_AUTH_ENABLED='true' (the default override)", () => {
    expect(
      isAuthEnabledIn({
        CLERK_SECRET_KEY: "sk_test_abc",
        SOUS_AUTH_ENABLED: "true",
      }),
    ).toBe(true);
  });

  it("treats SOUS_AUTH_ENABLED other-than-'false' as enabled", () => {
    // Defensive: only "false" disables. "0" / "no" / "off" do not.
    expect(
      isAuthEnabledIn({
        CLERK_SECRET_KEY: "sk_test_abc",
        SOUS_AUTH_ENABLED: "0",
      }),
    ).toBe(true);
    expect(
      isAuthEnabledIn({
        CLERK_SECRET_KEY: "sk_test_abc",
        SOUS_AUTH_ENABLED: "no",
      }),
    ).toBe(true);
  });
});

describe("MOCK_USER_ID", () => {
  it("is stable across the process", () => {
    expect(MOCK_USER_ID).toBe("mock-user-dev");
  });

  it("is non-empty", () => {
    expect(MOCK_USER_ID.length).toBeGreaterThan(0);
  });
});
