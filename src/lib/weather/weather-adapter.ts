/**
 * Weather adapter (20-week plan W2, STRATEGY §6.2 — opt-in, founder-gated stub).
 *
 * Open-Meteo is free and needs no account, but live weather fetching stays OFF
 * until `SOUS_WEATHER_ENABLED=true`. The default impl is a no-op returning null,
 * so the context-fit reblend sees no weather signal and ranking is byte-
 * identical. Flipping the env var (one config edit, rule 12) lights up the live
 * adapter later — no rebuild.
 *
 * When enabled, a WeatherSnapshot would extend the context-fit input (a
 * tempC/condition field biasing the SAME temperature direction the season nudge
 * uses: cold+rain → warm sides ↑; hot → cold sides ↑). W2 ships only the
 * interface + the no-op + the env contract; the live fetch is intentionally
 * unwired and untested.
 */

export type WeatherCondition = "clear" | "rain" | "snow" | "cloud" | "unknown";

export interface WeatherSnapshot {
  tempC: number;
  condition: WeatherCondition;
}

export interface WeatherAdapter {
  current(lat: number, lon: number): Promise<WeatherSnapshot | null>;
}

/** Dormant default — no network, always null. The lean app uses this. */
export const NOOP_WEATHER: WeatherAdapter = {
  async current() {
    return null;
  },
};

/** Returns the live Open-Meteo adapter only when the env flag is set; otherwise
 *  the no-op. So nothing fetches weather until a founder flips the flag. */
export function getWeatherAdapter(): WeatherAdapter {
  return process.env.SOUS_WEATHER_ENABLED === "true"
    ? openMeteoAdapter()
    : NOOP_WEATHER;
}

/** Live Open-Meteo impl — dormant (only reached when SOUS_WEATHER_ENABLED).
 *  Intentionally not wired into the ranking or unit-tested live in W2. */
function openMeteoAdapter(): WeatherAdapter {
  return {
    async current(lat: number, lon: number): Promise<WeatherSnapshot | null> {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
          `&longitude=${lon}&current=temperature_2m,weather_code`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const json = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const tempC = json.current?.temperature_2m;
        if (typeof tempC !== "number") return null;
        return { tempC, condition: mapWeatherCode(json.current?.weather_code) };
      } catch {
        return null;
      }
    },
  };
}

/** Open-Meteo WMO weather codes → our coarse condition buckets. Exported so the
 *  client `useWeather` hook reuses the exact same mapping. */
export function mapWeatherCode(code: number | undefined): WeatherCondition {
  if (code == null) return "unknown";
  if (code === 0) return "clear";
  if (code >= 71 && code <= 77) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 1 && code <= 48) return "cloud";
  return "unknown";
}
