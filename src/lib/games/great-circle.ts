/**
 * Great-circle distance helpers for Cuisine Compass.
 *
 * Standard haversine implementation. Returns distance in
 * kilometres between two lat/lng points on a sphere of Earth's
 * mean radius (6371 km). Accurate to ±0.5% for any pair of
 * points on Earth, which is well below the precision the game
 * UX needs (scores are bucketed in 100km / 500km bands).
 *
 * Pure / dependency-free / deterministic.
 */

const EARTH_RADIUS_KM = 6371;

export interface LatLng {
  lat: number;
  lng: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Pure: validate that a point is a finite (lat, lng) pair
 *  inside the geographic bounds. */
export function isValidLatLng(point: LatLng): boolean {
  if (!point) return false;
  const { lat, lng } = point;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/** Pure: great-circle distance between two points in km.
 *  Returns NaN when either point is invalid (caller decides
 *  fallback). */
export function haversineKm(a: LatLng, b: LatLng): number {
  if (!isValidLatLng(a) || !isValidLatLng(b)) return Number.NaN;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

/** Pure: midpoint along the great-circle path between two
 *  points. Used to position the distance label between the
 *  guess pin and the answer pin during the reveal animation. */
export function greatCircleMidpoint(a: LatLng, b: LatLng): LatLng {
  if (!isValidLatLng(a) || !isValidLatLng(b)) {
    return { lat: 0, lng: 0 };
  }
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const Bx = Math.cos(lat2) * Math.cos(dLng);
  const By = Math.cos(lat2) * Math.sin(dLng);
  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) ** 2 + By ** 2),
  );
  const lng3 = toRad(a.lng) + Math.atan2(By, Math.cos(lat1) + Bx);
  return {
    lat: (lat3 * 180) / Math.PI,
    lng: (((lng3 * 180) / Math.PI + 540) % 360) - 180, // wrap to [-180, 180]
  };
}
