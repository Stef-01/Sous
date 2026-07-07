import { describe, expect, it } from "vitest";
import {
  EMPTY_PROFILE_IDENTITY,
  PROFILE_IDENTITY_SCHEMA_VERSION,
  isProfileEmailValid,
  normalizeDisplayName,
  normalizeProfileEmail,
  parseStoredProfileIdentity,
  profileIdentityAuthorName,
  serializeProfileIdentity,
  type ProfileIdentity,
} from "./use-profile-identity";

describe("profile identity storage", () => {
  it("returns an empty identity for missing or malformed storage", () => {
    expect(parseStoredProfileIdentity(null)).toEqual(EMPTY_PROFILE_IDENTITY);
    expect(parseStoredProfileIdentity("")).toEqual(EMPTY_PROFILE_IDENTITY);
    expect(parseStoredProfileIdentity("{not-json")).toEqual(
      EMPTY_PROFILE_IDENTITY,
    );
  });

  it("rejects stale schema versions", () => {
    const stale = JSON.stringify({
      v: PROFILE_IDENTITY_SCHEMA_VERSION + 1,
      displayName: "Alex",
      email: "alex@example.com",
    });
    expect(parseStoredProfileIdentity(stale)).toEqual(EMPTY_PROFILE_IDENTITY);
  });

  it("round-trips a valid identity", () => {
    const profile: ProfileIdentity = {
      v: PROFILE_IDENTITY_SCHEMA_VERSION,
      displayName: "Alex Rivera",
      email: "alex@example.com",
      updatedAt: "2026-07-07T13:00:00.000Z",
    };
    expect(
      parseStoredProfileIdentity(serializeProfileIdentity(profile)),
    ).toEqual(profile);
  });

  it("normalizes display names and email", () => {
    expect(normalizeDisplayName("  Alex   Rivera  ")).toBe("Alex Rivera");
    expect(normalizeProfileEmail(" ALEX@Example.COM ")).toBe(
      "alex@example.com",
    );
  });

  it("drops invalid stored email rather than preserving bad profile state", () => {
    const raw = JSON.stringify({
      v: PROFILE_IDENTITY_SCHEMA_VERSION,
      displayName: "Alex",
      email: "not an email",
      updatedAt: "2026-07-07T13:00:00.000Z",
    });
    expect(parseStoredProfileIdentity(raw).email).toBe("");
  });

  it("treats blank email as valid because sign-in is still optional", () => {
    expect(isProfileEmailValid("")).toBe(true);
    expect(isProfileEmailValid("alex@example.com")).toBe(true);
    expect(isProfileEmailValid("alex")).toBe(false);
  });

  it("uses the display name for community attribution with a safe fallback", () => {
    expect(
      profileIdentityAuthorName({
        ...EMPTY_PROFILE_IDENTITY,
        displayName: "  Casey  ",
      }),
    ).toBe("Casey");
    expect(profileIdentityAuthorName(EMPTY_PROFILE_IDENTITY)).toBe(
      "A community cook",
    );
  });
});
