// public/sw.js
const CACHE_NAME = "cbt-offline-v5";

// Core assets to boot the app instantly offline
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 1. Install: Pre-cache core shell immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: "reload" })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
});

// 2. Activate: Clear old caches and take instant control of all open clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. High-Performance Zero-Latency Fetch Router
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== "GET") return;

  // Let external translation APIs and external RPCs pass through untouched
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("mymemory") ||
    url.hostname.includes("lingva") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // FIX GAP 1: INSTANT NAVIGATION (Cache-First + Background Revalidate)
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        // Fetch fresh copy from network in the background
        const networkPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(req, networkRes.clone());
              cache.put("/", networkRes.clone());
            }
            return networkRes;
          })
          .catch(() => null);

        // Try local disk cache first (0ms Instant Load)
        const cached =
          (await cache.match(req)) ||
          (await cache.match("/")) ||
          (await cache.match("/index.html"));

        if (cached) return cached;

        // If not in cache yet (first open), wait for network
        const netRes = await networkPromise;
        if (netRes) return netRes;

        // FIX GAP 2: Safe offline fallback (never return Response.error)
        return new Response(
          `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#090d16;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;margin:0"><div style="text-align:center"><h2>Offline Mode</h2><p>Please open once with internet to sync papers.</p><button onclick="window.location.reload()" style="background:#2563eb;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:bold;cursor:pointer">Retry</button></div></body></html>`,
          { headers: { "Content-Type": "text/html" }, status: 200 }
        );
      })()
    );
    return;
  }

  // STATIC ASSETS (JS Chunks, CSS, KaTeX Fonts, WebP Diagrams)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(req, { ignoreSearch: true });

      if (cachedResponse) {
        // Revalidate in background silently
        fetch(req)
          .then((fresh) => {
            if (fresh && fresh.status === 200 && url.origin === self.location.origin) {
              cache.put(req, fresh.clone());
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If missing from cache, fetch and store
      try {
        const networkResponse = await fetch(req);
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          url.origin === self.location.origin
        ) {
          cache.put(req, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // FIX GAP 2: Safe fallbacks for missing assets when offline
        if (req.destination === "style") {
          return new Response("", { headers: { "Content-Type": "text/css" }, status: 200 });
        }
        if (req.destination === "script") {
          return new Response("/* offline */", {
            headers: { "Content-Type": "application/javascript" },
            status: 200
          });
        }
        if (req.destination === "image") {
          // Transparent 1x1 GIF fallback
          return new Response(
            new Uint8Array([
              0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80,
              0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04,
              0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01,
              0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
            ]),
            { headers: { "Content-Type": "image/gif" }, status: 200 }
          );
        }

        return new Response("", { status: 200, statusText: "Offline Safe" });
      }
    })()
  );
});