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

/*
 * Web Push — the hunger-window craving nudge. The server (/api/push/test or the
 * future cron) sends a JSON payload { title, body, image, url }; we show it as a
 * notification and deep-link the cook on tap. Inert until VAPID keys exist, so
 * this is safe to ship now.
 */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Sous", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Tonight's craving";
  const options = {
    body: data.body || "",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    image: data.image || undefined,
    data: { url: data.url || "/today" },
    tag: "sous-craving",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || "/today";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing tab if one is open; else open a new one.
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
