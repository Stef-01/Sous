import { describe, expect, it } from "vitest";
import {
  buildDeviceInfo,
  classifyDeviceClass,
  classifyScreenBucket,
  redactForAnalytics,
} from "./device-info";

describe("classifyDeviceClass", () => {
  it("phone for iPhone-sized native screens", () => {
    expect(
      classifyDeviceClass({
        platform: "ios",
        screenWidth: 390,
        screenHeight: 844,
      }),
    ).toBe("phone");
  });

  it("tablet for iPad-sized native screens", () => {
    expect(
      classifyDeviceClass({
        platform: "ios",
        screenWidth: 820,
        screenHeight: 1180,
      }),
    ).toBe("tablet");
  });

  it("desktop for wide web screens", () => {
    expect(
      classifyDeviceClass({
        platform: "web",
        screenWidth: 1440,
        screenHeight: 900,
      }),
    ).toBe("desktop");
  });

  it("phone for narrow web screens", () => {
    expect(
      classifyDeviceClass({
        platform: "web",
        screenWidth: 375,
        screenHeight: 667,
      }),
    ).toBe("phone");
  });

  it("other for zero dimensions (SSR safe)", () => {
    expect(
      classifyDeviceClass({
        platform: "ios",
        screenWidth: 0,
        screenHeight: 0,
      }),
    ).toBe("other");
  });
});

describe("classifyScreenBucket", () => {
  it("buckets phones as small", () => {
    expect(classifyScreenBucket({ screenWidth: 390, screenHeight: 667 })).toBe(
      "small",
    );
  });

  it("buckets tablets as medium", () => {
    expect(classifyScreenBucket({ screenWidth: 820, screenHeight: 1024 })).toBe(
      "medium",
    );
  });

  it("buckets desktops as large", () => {
    expect(classifyScreenBucket({ screenWidth: 1440, screenHeight: 900 })).toBe(
      "large",
    );
  });
});

describe("buildDeviceInfo", () => {
  it("produces a well-formed report", () => {
    const out = buildDeviceInfo({
      platform: "ios",
      screenWidth: 390,
      screenHeight: 844,
      osLabel: "iOS 17",
      locale: "en-US",
    });
    expect(out.deviceClass).toBe("phone");
    expect(out.platform).toBe("ios");
    expect(out.osLabel).toBe("iOS 17");
    expect(out.locale).toBe("en-US");
  });

  it("defaults locale to en-US", () => {
    const out = buildDeviceInfo({
      platform: "web",
      screenWidth: 1024,
      screenHeight: 768,
    });
    expect(out.locale).toBe("en-US");
  });
});

describe("redactForAnalytics", () => {
  it("drops osLabel + collapses locale to language", () => {
    const out = redactForAnalytics({
      platform: "ios",
      deviceClass: "phone",
      screenBucket: "small",
      osLabel: "iOS 17.1.2",
      locale: "en-US",
    });
    expect(out.osLabel).toBeUndefined();
    expect(out.locale).toBe("en");
  });

  it("preserves coarse fields", () => {
    const out = redactForAnalytics({
      platform: "android",
      deviceClass: "tablet",
      screenBucket: "medium",
      locale: "fr-CA",
    });
    expect(out.platform).toBe("android");
    expect(out.deviceClass).toBe("tablet");
    expect(out.screenBucket).toBe("medium");
  });
});
