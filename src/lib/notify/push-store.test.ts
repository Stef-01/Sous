import { describe, expect, it } from "vitest";
import { parseSubscription } from "./push-store";

describe("parseSubscription", () => {
  const valid = {
    endpoint: "https://push.example/abc",
    keys: { p256dh: "pkey", auth: "akey" },
    expirationTime: null,
  };

  it("accepts a well-formed browser subscription and drops extra fields", () => {
    const s = parseSubscription(valid);
    expect(s).toEqual({
      endpoint: "https://push.example/abc",
      keys: { p256dh: "pkey", auth: "akey" },
    });
  });

  it("rejects malformed input without throwing", () => {
    expect(parseSubscription(null)).toBeNull();
    expect(parseSubscription({})).toBeNull();
    expect(
      parseSubscription({ endpoint: "", keys: { p256dh: "a", auth: "b" } }),
    ).toBeNull();
    expect(parseSubscription({ endpoint: "x" })).toBeNull();
    expect(
      parseSubscription({ endpoint: "x", keys: { p256dh: "a" } }),
    ).toBeNull();
    expect(parseSubscription("not an object")).toBeNull();
  });
});
