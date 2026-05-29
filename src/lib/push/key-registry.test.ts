import { describe, expect, it } from "vitest";
import {
  inspectAllPushChannels,
  inspectPushChannel,
  selectPushChannel,
} from "./key-registry";

describe("inspectPushChannel", () => {
  it("flags VAPID configured when both keys present", () => {
    const out = inspectPushChannel("web-vapid", {
      VAPID_PUBLIC_KEY: "pub",
      VAPID_PRIVATE_KEY: "priv",
    });
    expect(out.configured).toBe(true);
    expect(out.missingKeys).toEqual([]);
  });

  it("reports missing keys for VAPID partial", () => {
    const out = inspectPushChannel("web-vapid", {
      VAPID_PUBLIC_KEY: "pub",
    });
    expect(out.configured).toBe(false);
    expect(out.missingKeys).toEqual(["VAPID_PRIVATE_KEY"]);
  });

  it("flags APNs configured only when all three keys present", () => {
    const partial = inspectPushChannel("ios-apns", {
      APNS_TEAM_ID: "team",
      APNS_KEY_ID: "key",
    });
    expect(partial.configured).toBe(false);
    expect(partial.missingKeys).toEqual(["APNS_PRIVATE_KEY"]);

    const full = inspectPushChannel("ios-apns", {
      APNS_TEAM_ID: "team",
      APNS_KEY_ID: "key",
      APNS_PRIVATE_KEY: "p8",
    });
    expect(full.configured).toBe(true);
  });

  it("flags FCM with single key", () => {
    expect(
      inspectPushChannel("android-fcm", { FCM_SERVER_KEY: "x" }).configured,
    ).toBe(true);
    expect(inspectPushChannel("android-fcm", {}).configured).toBe(false);
  });

  it("treats empty-string keys as missing", () => {
    const out = inspectPushChannel("android-fcm", { FCM_SERVER_KEY: "" });
    expect(out.configured).toBe(false);
  });
});

describe("inspectAllPushChannels", () => {
  it("returns three statuses always", () => {
    const out = inspectAllPushChannels({});
    expect(out).toHaveLength(3);
    expect(out.map((s) => s.channel)).toEqual([
      "web-vapid",
      "ios-apns",
      "android-fcm",
    ]);
  });
});

describe("selectPushChannel", () => {
  const fullEnv = {
    VAPID_PUBLIC_KEY: "pub",
    VAPID_PRIVATE_KEY: "priv",
    APNS_TEAM_ID: "team",
    APNS_KEY_ID: "key",
    APNS_PRIVATE_KEY: "p8",
    FCM_SERVER_KEY: "fcm",
  };

  it("picks VAPID for web", () => {
    const out = selectPushChannel({ platform: "web", env: fullEnv });
    expect(out.channel).toBe("web-vapid");
    expect(out.ready).toBe(true);
  });

  it("picks APNs for ios", () => {
    const out = selectPushChannel({ platform: "ios", env: fullEnv });
    expect(out.channel).toBe("ios-apns");
    expect(out.ready).toBe(true);
  });

  it("picks FCM for android", () => {
    const out = selectPushChannel({ platform: "android", env: fullEnv });
    expect(out.channel).toBe("android-fcm");
    expect(out.ready).toBe(true);
  });

  it("returns ready=false when keys are missing for the picked channel", () => {
    const out = selectPushChannel({
      platform: "ios",
      env: { VAPID_PUBLIC_KEY: "x" }, // wrong channel keys
    });
    expect(out.channel).toBe("ios-apns");
    expect(out.ready).toBe(false);
    expect(out.rationale).toMatch(/missing keys/);
  });
});
