import { describe, expect, it } from "vitest";
import { getWeatherAdapter, NOOP_WEATHER } from "./weather-adapter";

describe("weather adapter — dormant by default (W2 founder-gated stub)", () => {
  it("returns the no-op adapter when SOUS_WEATHER_ENABLED is unset", () => {
    expect(getWeatherAdapter()).toBe(NOOP_WEATHER);
  });

  it("the no-op adapter resolves null (no network, no signal)", async () => {
    expect(await NOOP_WEATHER.current(37.4, -122.1)).toBeNull();
  });
});
