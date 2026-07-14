/* lessico service worker — network-first so the app auto-updates online,
   with a cached copy as an offline fallback. Scores live in localStorage and
   are never touched by this. */
const CACHE = "lessico-shell-v1";

self.addEventListener("install", () => {
  // Take over as soon as the new worker is ready — no waiting for old tabs.
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                     // never intercept the GitHub API writes
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // only same-origin app files
  e.respondWith((async () => {
    try {
      // Network-first: always try to get the freshest copy when online.
      const fresh = await fetch(req);
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      // Offline (or network failed): fall back to whatever we cached last.
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
