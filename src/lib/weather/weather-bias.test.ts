import { describe, expect, it } from "vitest";
import {
  weatherTempLean,
  dishTempProfile,
  dishMatchesWeather,
} from "./weather-bias";

describe("weatherTempLean", () => {
  it("is neutral with no snapshot (the lean-app default)", () => {
    expect(weatherTempLean(null)).toBe("neutral");
    expect(weatherTempLean(undefined)).toBe("neutral");
  });

  it("hot → crave cold food", () => {
    expect(weatherTempLean({ tempC: 30, condition: "clear" })).toBe(
      "cold-food",
    );
    expect(weatherTempLean({ tempC: 24, condition: "cloud" })).toBe(
      "cold-food",
    );
  });

  it("cold / rain / snow → crave warm food", () => {
    expect(weatherTempLean({ tempC: 5, condition: "clear" })).toBe("warm-food");
    expect(weatherTempLean({ tempC: 18, condition: "rain" })).toBe("warm-food");
    expect(weatherTempLean({ tempC: 30, condition: "snow" })).toBe("warm-food");
  });

  it("the comfortable band is neutral", () => {
    expect(weatherTempLean({ tempC: 18, condition: "clear" })).toBe("neutral");
  });
});

describe("dishTempProfile", () => {
  it("reads cold dishes from tags + description", () => {
    expect(
      dishTempProfile({
        tags: ["Fresh", "Salad"],
        description: "A crisp green salad",
      }),
    ).toBe("cold");
    expect(
      dishTempProfile({ tags: [], description: "A chilled smoothie" }),
    ).toBe("cold");
  });

  it("reads warm dishes from tags + description", () => {
    expect(
      dishTempProfile({ tags: ["Hearty"], description: "A warming beef stew" }),
    ).toBe("warm");
    expect(dishTempProfile({ tags: ["Soup"], description: "" })).toBe("warm");
  });

  it("is neutral when there's no temperature signal or a tie", () => {
    expect(dishTempProfile({ tags: ["Savory"], description: "tacos" })).toBe(
      "neutral",
    );
    expect(dishTempProfile({ tags: ["Salad", "Soup"], description: "" })).toBe(
      "neutral",
    ); // 1 cold + 1 warm → tie
  });

  it("is empty-safe", () => {
    expect(dishTempProfile({})).toBe("neutral");
  });
});

describe("dishMatchesWeather", () => {
  it("matches a cold dish to hot weather and a warm dish to cold weather", () => {
    expect(dishMatchesWeather("cold-food", "cold")).toBe(true);
    expect(dishMatchesWeather("warm-food", "warm")).toBe(true);
  });
  it("does not match across the axis or when neutral", () => {
    expect(dishMatchesWeather("cold-food", "warm")).toBe(false);
    expect(dishMatchesWeather("warm-food", "cold")).toBe(false);
    expect(dishMatchesWeather("neutral", "cold")).toBe(false);
  });
});
