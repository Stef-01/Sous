"use client";

import { useCallback, useEffect, useState } from "react";
import {
  mapWeatherCode,
  type WeatherSnapshot,
} from "@/lib/weather/weather-adapter";

/**
 * useWeather — the client weather signal behind weather-aware picks. OPT-IN: it
 * does nothing until the user flips the "Weather-aware picks" toggle (profile
 * sheet, rule 3). When on, it reads the device location once and fetches the
 * current conditions from Open-Meteo (free, no API key, CORS-open), caching the
 * snapshot for an hour. When off / denied / offline it returns null, so the deck
 * + craving brain see no weather signal and stay byte-identical (the lean app).
 */

const PREF_KEY = "sous-weather-enabled";
const PREF_EVENT = "sous-weather-pref-changed";
const CACHE_KEY = "sous-weather-cache-v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // refresh hourly

interface CachedWeather {
  snapshot: WeatherSnapshot;
  at: number;
}

function readCache(): WeatherSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWeather;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    const s = parsed.snapshot;
    if (s && typeof s.tempC === "number") return s;
    return null;
  } catch {
    return null;
  }
}

function writeCache(snapshot: WeatherSnapshot): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ snapshot, at: Date.now() }),
    );
  } catch {
    /* storage full / unavailable — weather is best-effort */
  }
}

function getPosition(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 30 * 60 * 1000 },
    );
  });
}

async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherSnapshot | null> {
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
}

export function useWeather() {
  const [enabled, setEnabledState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate the opt-in flag + keep it in sync across components/tabs */
  useEffect(() => {
    setMounted(true);
    const read = () => {
      try {
        setEnabledState(localStorage.getItem(PREF_KEY) === "true");
      } catch {
        /* private mode */
      }
    };
    read();
    // The profile-sheet toggle and the deck both call useWeather; a same-tab
    // custom event (+ the cross-tab storage event) keeps them in lock-step so
    // flipping the toggle reorders the live deck immediately.
    window.addEventListener(PREF_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(PREF_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- seed from cache + fetch live weather when opted in */
  useEffect(() => {
    if (!enabled) {
      setSnapshot(null);
      return;
    }
    const cached = readCache();
    if (cached) {
      setSnapshot(cached);
      return;
    }
    let cancelled = false;
    (async () => {
      const pos = await getPosition();
      if (!pos || cancelled) return;
      const w = await fetchWeather(pos.lat, pos.lon);
      if (cancelled || !w) return;
      writeCache(w);
      setSnapshot(w);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(PREF_KEY, next ? "true" : "false");
      if (!next) localStorage.removeItem(CACHE_KEY);
      // Notify any other useWeather instances in this tab (the deck).
      window.dispatchEvent(new Event(PREF_EVENT));
    } catch {
      /* private mode */
    }
  }, []);

  return {
    /** Current conditions, or null when off / unavailable. */
    snapshot: enabled ? snapshot : null,
    enabled,
    setEnabled,
    mounted,
  };
}
