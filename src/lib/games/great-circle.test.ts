import { describe, expect, it } from "vitest";
import {
  greatCircleMidpoint,
  haversineKm,
  isValidLatLng,
  type LatLng,
} from "./great-circle";

const NY: LatLng = { lat: 40.7128, lng: -74.006 };
const LONDON: LatLng = { lat: 51.5074, lng: -0.1278 };
const TOKYO: LatLng = { lat: 35.6762, lng: 139.6503 };
const BANGKOK: LatLng = { lat: 13.7563, lng: 100.5018 };

describe("isValidLatLng", () => {
  it("accepts valid points", () => {
    expect(isValidLatLng(NY)).toBe(true);
    expect(isValidLatLng({ lat: 0, lng: 0 })).toBe(true);
    expect(isValidLatLng({ lat: 90, lng: 180 })).toBe(true);
    expect(isValidLatLng({ lat: -90, lng: -180 })).toBe(true);
  });

  it("rejects out-of-range lat/lng", () => {
    expect(isValidLatLng({ lat: 91, lng: 0 })).toBe(false);
    expect(isValidLatLng({ lat: -91, lng: 0 })).toBe(false);
    expect(isValidLatLng({ lat: 0, lng: 181 })).toBe(false);
    expect(isValidLatLng({ lat: 0, lng: -181 })).toBe(false);
  });

  it("rejects non-finite values", () => {
    expect(isValidLatLng({ lat: Number.NaN, lng: 0 })).toBe(false);
    expect(isValidLatLng({ lat: 0, lng: Number.POSITIVE_INFINITY })).toBe(
      false,
    );
  });

  it("rejects null/undefined-shaped input", () => {
    expect(isValidLatLng(null as unknown as LatLng)).toBe(false);
  });
});

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(NY, NY)).toBeCloseTo(0, 1);
  });

  it("NY → London ≈ 5570 km (within 1%)", () => {
    const d = haversineKm(NY, LONDON);
    expect(d).toBeGreaterThan(5500);
    expect(d).toBeLessThan(5600);
  });

  it("Tokyo → Bangkok ≈ 4600 km (within 1%)", () => {
    const d = haversineKm(TOKYO, BANGKOK);
    expect(d).toBeGreaterThan(4550);
    expect(d).toBeLessThan(4700);
  });

  it("antipodal points ≈ 20015 km (half Earth's circumference)", () => {
    const a: LatLng = { lat: 0, lng: 0 };
    const b: LatLng = { lat: 0, lng: 180 };
    const d = haversineKm(a, b);
    expect(d).toBeGreaterThan(20000);
    expect(d).toBeLessThan(20030);
  });

  it("returns NaN for invalid points", () => {
    expect(Number.isNaN(haversineKm({ lat: 999, lng: 0 }, NY))).toBe(true);
  });

  it("is symmetric", () => {
    expect(haversineKm(NY, LONDON)).toBeCloseTo(haversineKm(LONDON, NY), 5);
  });
});

describe("greatCircleMidpoint", () => {
  it("midpoint NY–London is in the North Atlantic", () => {
    const m = greatCircleMidpoint(NY, LONDON);
    // Roughly 52°N, -41°W (mid-Atlantic on the great circle).
    expect(m.lat).toBeGreaterThan(45);
    expect(m.lat).toBeLessThan(58);
    expect(m.lng).toBeGreaterThan(-50);
    expect(m.lng).toBeLessThan(-35);
  });

  it("midpoint of identical points is that point", () => {
    const m = greatCircleMidpoint(NY, NY);
    expect(m.lat).toBeCloseTo(NY.lat, 4);
    expect(m.lng).toBeCloseTo(NY.lng, 4);
  });

  it("returns a (0, 0) fallback for invalid input", () => {
    const m = greatCircleMidpoint({ lat: 999, lng: 0 }, NY);
    expect(m).toEqual({ lat: 0, lng: 0 });
  });

  it("output longitude is wrapped into [-180, 180]", () => {
    const m = greatCircleMidpoint({ lat: 0, lng: 170 }, { lat: 0, lng: -170 });
    expect(m.lng).toBeGreaterThanOrEqual(-180);
    expect(m.lng).toBeLessThanOrEqual(180);
  });
});
