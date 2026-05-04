import { describe, expect, it } from "vitest";
import {
  activeDeviceTokens,
  dedupeDeviceTokens,
  DEVICE_TOKEN_STALE_DAYS,
  isDeviceTokenStale,
  removeDeviceToken,
  touchDeviceToken,
  upsertDeviceToken,
  type DeviceToken,
} from "./device-tokens";

const baseToken = (overrides: Partial<DeviceToken> = {}): DeviceToken => ({
  id: "d-1",
  channel: "ios-apns",
  token: "abc",
  registeredAt: "2026-04-01T10:00:00Z",
  lastSeenAt: "2026-05-03T10:00:00Z",
  label: "iPhone 15",
  ...overrides,
});

describe("isDeviceTokenStale", () => {
  it("returns false within freshness window", () => {
    expect(
      isDeviceTokenStale(baseToken(), new Date("2026-05-10T12:00:00Z")),
    ).toBe(false);
  });

  it("returns true past stale threshold", () => {
    expect(
      isDeviceTokenStale(baseToken(), new Date("2026-08-01T12:00:00Z")),
    ).toBe(true);
  });

  it("returns true on invalid lastSeenAt", () => {
    expect(isDeviceTokenStale({ lastSeenAt: "nope" }, new Date())).toBe(true);
  });

  it("respects custom threshold", () => {
    expect(
      isDeviceTokenStale(
        baseToken(),
        new Date("2026-05-10T12:00:00Z"),
        3, // 3 days
      ),
    ).toBe(true);
  });
});

describe("activeDeviceTokens", () => {
  it("filters out stale tokens", () => {
    const tokens = [
      baseToken({ id: "fresh", lastSeenAt: "2026-05-01T00:00:00Z" }),
      baseToken({ id: "stale", lastSeenAt: "2025-01-01T00:00:00Z" }),
    ];
    const out = activeDeviceTokens(tokens, new Date("2026-05-03T12:00:00Z"));
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("fresh");
  });

  it("uses DEVICE_TOKEN_STALE_DAYS by default", () => {
    expect(DEVICE_TOKEN_STALE_DAYS).toBeGreaterThanOrEqual(30);
  });
});

describe("dedupeDeviceTokens", () => {
  it("keeps the entry with the newer registeredAt for a duplicate token", () => {
    const tokens = [
      baseToken({
        id: "old",
        token: "shared",
        registeredAt: "2026-01-01T00:00:00Z",
      }),
      baseToken({
        id: "new",
        token: "shared",
        registeredAt: "2026-04-01T00:00:00Z",
      }),
    ];
    const out = dedupeDeviceTokens(tokens);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("new");
  });

  it("keeps distinct tokens untouched", () => {
    const tokens = [
      baseToken({ id: "a", token: "alpha" }),
      baseToken({ id: "b", token: "beta" }),
    ];
    expect(dedupeDeviceTokens(tokens)).toHaveLength(2);
  });
});

describe("upsertDeviceToken", () => {
  it("appends when id is new", () => {
    const out = upsertDeviceToken([baseToken()], baseToken({ id: "d-2" }));
    expect(out).toHaveLength(2);
  });

  it("replaces when id matches", () => {
    const out = upsertDeviceToken(
      [baseToken({ id: "d-1", label: "old" })],
      baseToken({ id: "d-1", label: "new" }),
    );
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe("new");
  });
});

describe("touchDeviceToken", () => {
  it("updates lastSeenAt for the matching id", () => {
    const tokens = [baseToken()];
    const now = new Date("2026-05-03T15:00:00Z");
    const out = touchDeviceToken(tokens, "d-1", now);
    expect(out[0].lastSeenAt).toBe(now.toISOString());
  });

  it("is a no-op for unknown ids", () => {
    const tokens = [baseToken()];
    const out = touchDeviceToken(tokens, "nope", new Date());
    expect(out[0].lastSeenAt).toBe(tokens[0].lastSeenAt);
  });
});

describe("removeDeviceToken", () => {
  it("filters out the matching id", () => {
    const tokens = [baseToken({ id: "d-1" }), baseToken({ id: "d-2" })];
    const out = removeDeviceToken(tokens, "d-1");
    expect(out.map((t) => t.id)).toEqual(["d-2"]);
  });
});
