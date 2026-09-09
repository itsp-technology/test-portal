// public/sw.js
const CACHE_NAME = "cbt-offline-v3";

// Pre-cache root variants and static manifest
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// 1. Install & Force Pre-cache
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
            .catch(() => {
              // Ignore single asset error during initial build
            })
        )
      );
    })
  );
});

// 2. Activate & Claim Clients Immediately
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

// 3. Fetch Strategy: Cache-First for assets, Fallback to Shell on Navigation
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== "GET") return;

  // Don't intercept live translation calls or external APIs
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("mymemory") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Handle page navigations (opening the app or reloading offline)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          // OFFLINE: Return cached index.html or root
          const cache = await caches.open(CACHE_NAME);
          const cachedHome =
            (await cache.match("/")) ||
            (await cache.match("/index.html"));
          return cachedHome || Response.error();
        })
    );
    return;
  }

  // Handle JS, CSS, KaTeX fonts, and static files
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((networkRes) => {
          if (
            networkRes &&
            networkRes.status === 200 &&
            (url.origin === self.location.origin)
          ) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // If offline and requesting something unknown, return empty or cached root
          return Response.error();
        });
    })
  );
});