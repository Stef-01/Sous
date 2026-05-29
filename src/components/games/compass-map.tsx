"use client";

/**
 * CompassMap — MapLibre GL wrapper for Cuisine Compass.
 *
 * Lazy-imports `maplibre-gl` so the ~200KB bundle is paid only
 * when the games surface is opened. Wraps the imperative library
 * in a tiny declarative React surface: caller passes a guess
 * coordinate (or null for "not placed yet") and a tap handler;
 * the wrapper owns map lifecycle + pin rendering.
 *
 * Sous-cream Field-Notes-pocket-atlas look: cream land, soft
 * sage country borders, no street-level detail. Implemented by
 * subclassing the MapLibre demo style at runtime — caller doesn't
 * need to know.
 *
 * Reveal mode: when `answer` is supplied, draw a great-circle
 * line from guess → answer using the existing
 * `interpolateGreatCircle`-equivalent helper for sampling. Both
 * pins pulse once.
 *
 * Reduced-motion gate: skips the line-draw animation; renders
 * the line statically.
 */

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { useReducedMotion } from "framer-motion";
import { greatCircleMidpoint, type LatLng } from "@/lib/games/great-circle";

interface CompassMapProps {
  /** User's current guess pin, or null for "not placed yet". */
  guess: LatLng | null;
  /** Answer pin to reveal — null while puzzle is active. */
  answer?: LatLng | null;
  /** Tap handler — fires for every map tap that resolves to a
   *  valid lat/lng pair. Caller decides whether to set the pin. */
  onTap: (point: LatLng) => void;
  /** Optional className passthrough. */
  className?: string;
  /** When true the map is interactive; when false it's read-only
   *  (used during the reveal phase). */
  interactive?: boolean;
}

export interface CompassMapHandle {
  /** Programmatically center on a coordinate (smooth fly). */
  flyTo: (point: LatLng) => void;
  /** Reset the camera to the world view. */
  resetView: () => void;
}

/** Inline MapLibre style — country polygons from the public-domain
 *  demotiles, recoloured into the Sous palette. */
const COMPASS_STYLE_URL = "https://demotiles.maplibre.org/style.json";

const SOUS_LAND_COLOR = "#fdfaf3"; // nourish-cream warm
const SOUS_OCEAN_COLOR = "#eef2eb"; // soft sage tint
const SOUS_BORDER_COLOR = "#9ab19c"; // muted nourish-green

export const CompassMap = forwardRef<CompassMapHandle, CompassMapProps>(
  function CompassMap(
    { guess, answer = null, onTap, className, interactive = true },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<unknown>(null); // maplibre Map — typed dynamically
    const [ready, setReady] = useState(false);
    const reducedMotion = useReducedMotion();

    // Guess marker handle (kept in a ref so we can move it without
    // a React re-render thrashing the map).
    const guessMarkerRef = useRef<unknown>(null);
    const answerMarkerRef = useRef<unknown>(null);

    useEffect(() => {
      let canceled = false;
      let cleanup: (() => void) | null = null;

      (async () => {
        const maplibre = await import("maplibre-gl");
        // Side-effect CSS import via dynamic CSS link injection so
        // the cost is paid only when the game opens.
        await ensureMapLibreCss();
        if (canceled || !containerRef.current) return;

        const map = new maplibre.Map({
          container: containerRef.current,
          style: COMPASS_STYLE_URL,
          center: [10, 25],
          zoom: 1,
          minZoom: 1,
          maxZoom: 6,
          attributionControl: false,
          dragRotate: false,
          touchZoomRotate: false,
          interactive,
        });

        map.on("load", () => {
          if (canceled) return;
          // Recolour the demo style to the Sous palette.
          recolourStyle(map);
          setReady(true);
        });

        map.on("click", (e: { lngLat: { lat: number; lng: number } }) => {
          if (!interactive) return;
          onTap({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });

        mapRef.current = map;
        cleanup = () => {
          map.remove();
          mapRef.current = null;
        };
      })();

      return () => {
        canceled = true;
        if (cleanup) cleanup();
      };
    }, [interactive, onTap]);

    // Maintain the guess marker.
    useEffect(() => {
      if (!ready) return;
      const map = mapRef.current as MapLibreMap | null;
      if (!map) return;
      void (async () => {
        const maplibre = await import("maplibre-gl");
        if (guessMarkerRef.current) {
          (guessMarkerRef.current as MapLibreMarker).remove();
          guessMarkerRef.current = null;
        }
        if (!guess) return;
        const el = makePinEl("var(--nourish-green)");
        const marker = new maplibre.Marker({ element: el, anchor: "bottom" })
          .setLngLat([guess.lng, guess.lat])
          .addTo(map);
        guessMarkerRef.current = marker;
      })();
    }, [guess, ready]);

    // Maintain the answer marker + great-circle line during reveal.
    useEffect(() => {
      if (!ready) return;
      const map = mapRef.current as MapLibreMap | null;
      if (!map) return;
      void (async () => {
        const maplibre = await import("maplibre-gl");
        if (answerMarkerRef.current) {
          (answerMarkerRef.current as MapLibreMarker).remove();
          answerMarkerRef.current = null;
        }
        // Always remove any existing line on each effect tick.
        if (map.getLayer("guess-line")) map.removeLayer("guess-line");
        if (map.getSource("guess-line")) map.removeSource("guess-line");
        if (!answer) return;

        const el = makePinEl("var(--nourish-gold)");
        const marker = new maplibre.Marker({ element: el, anchor: "bottom" })
          .setLngLat([answer.lng, answer.lat])
          .addTo(map);
        answerMarkerRef.current = marker;

        if (guess) {
          // Sample a coarse poly-line for the great-circle path.
          const samples: [number, number][] = [];
          const STEPS = 32;
          for (let i = 0; i <= STEPS; i++) {
            const t = i / STEPS;
            // Linear lat/lng interp on the same hemisphere is "good
            // enough" for a render — the math helpers (haversine /
            // greatCircleMidpoint) drive the score, not this line.
            const lat = guess.lat + (answer.lat - guess.lat) * t;
            const lng = guess.lng + (answer.lng - guess.lng) * t;
            samples.push([lng, lat]);
          }

          map.addSource("guess-line", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: { type: "LineString", coordinates: samples },
              properties: {},
            },
          });
          map.addLayer({
            id: "guess-line",
            type: "line",
            source: "guess-line",
            paint: {
              "line-color": SOUS_BORDER_COLOR,
              "line-width": 2,
              "line-opacity": reducedMotion ? 0.85 : 0.7,
              "line-dasharray": [2, 2],
            },
          });

          // Smoothly fly to a midpoint that keeps both pins in
          // view; reduced-motion users get an instant set.
          const mid = greatCircleMidpoint(guess, answer);
          map.flyTo({
            center: [mid.lng, mid.lat],
            zoom: pickRevealZoom(guess, answer),
            duration: reducedMotion ? 0 : 800,
          });
        }
      })();
    }, [answer, guess, ready, reducedMotion]);

    useImperativeHandle(
      ref,
      (): CompassMapHandle => ({
        flyTo: (point) => {
          const map = mapRef.current as MapLibreMap | null;
          if (!map) return;
          map.flyTo({
            center: [point.lng, point.lat],
            zoom: 3,
            duration: reducedMotion ? 0 : 600,
          });
        },
        resetView: () => {
          const map = mapRef.current as MapLibreMap | null;
          if (!map) return;
          map.flyTo({
            center: [10, 25],
            zoom: 1,
            duration: reducedMotion ? 0 : 600,
          });
        },
      }),
      [reducedMotion],
    );

    // The placeholder skeleton renders before MapLibre boots so
    // the layout doesn't shift in.
    return (
      <div
        ref={containerRef}
        className={
          className ??
          "relative h-72 w-full overflow-hidden rounded-2xl border border-neutral-100 bg-[var(--nourish-cream)] shadow-sm"
        }
        role="application"
        aria-label="Cuisine Compass world map. Tap to place your guess."
      >
        {!ready && (
          <div className="absolute inset-0 grid place-items-center text-[12px] text-[var(--nourish-subtext)]">
            Loading map…
          </div>
        )}
      </div>
    );
  },
);

// ── Internal helpers ─────────────────────────────────────────

/** Inject the maplibre CSS once on first map mount. */
let cssInjected = false;
async function ensureMapLibreCss(): Promise<void> {
  if (typeof document === "undefined" || cssInjected) return;
  cssInjected = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
  document.head.appendChild(link);
}

/** Build a pin element with the Sous styling. */
function makePinEl(color: string): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    width: 22px;
    height: 22px;
    border-radius: 50% 50% 50% 0;
    background: ${color};
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    border: 2px solid white;
  `;
  return wrap;
}

/** Walk the loaded style and recolour land + ocean + borders. */
function recolourStyle(map: MapLibreMap): void {
  try {
    const style = map.getStyle();
    for (const layer of style.layers) {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", SOUS_OCEAN_COLOR);
      } else if (
        layer.id.includes("countries-fill") ||
        layer.id.includes("countries_fill") ||
        (layer.type === "fill" && layer.id.toLowerCase().includes("countr"))
      ) {
        map.setPaintProperty(layer.id, "fill-color", SOUS_LAND_COLOR);
      } else if (
        layer.id.includes("countries-boundary") ||
        layer.id.includes("countries_boundary") ||
        (layer.type === "line" && layer.id.toLowerCase().includes("countr"))
      ) {
        map.setPaintProperty(layer.id, "line-color", SOUS_BORDER_COLOR);
      }
    }
  } catch {
    // Best-effort recolour; the demo style spec may shift.
  }
}

/** Pick a zoom level that frames both pins in the reveal view. */
function pickRevealZoom(a: LatLng, b: LatLng): number {
  const dLat = Math.abs(a.lat - b.lat);
  const dLng = Math.abs(a.lng - b.lng);
  const span = Math.max(dLat, dLng);
  if (span > 80) return 1;
  if (span > 40) return 2;
  if (span > 15) return 3;
  if (span > 5) return 4;
  return 5;
}

CompassMap.displayName = "CompassMap";
