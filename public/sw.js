/*
 * Sous service worker — offline-resilient app shell.
 *
 * Strategy:
 *  - Navigations: network-first, fall back to a cached offline page when the
 *    network is unreachable (so a backgrounded PWA never shows a dead tab).
 *  - Static assets (_next/static, food images, icons, fonts): cache-first with
 *    background refresh (stale-while-revalidate) for instant repeat loads.
 *  - API (/api/*) and cross-origin requests: passed straight through, never
 *    cached — stale recipe/AI responses would be worse than an honest failure.
 *
 * Hand-rolled (no build-time PWA plugin) so it stays Turbopack-safe and fully
 * inspectable. Bump VERSION to invalidate all caches on the next activation.
 */

const VERSION = "sous-v1";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const STATIC_ASSET = /\.(?:css|js|woff2?|png|svg|jpg|jpeg|webp|avif|ico)$/;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin → passthrough
  if (url.pathname.startsWith("/api")) return; // never cache API responses

  // Navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r || Response.error()),
      ),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/food_images") ||
    url.pathname.startsWith("/icons") ||
    STATIC_ASSET.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
