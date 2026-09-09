// public/sw.js

const CACHE_NAME = "cbt-exam-portal-v2";

// Core static assets needed to boot the app offline
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install: Cache core shell immediately and activate without waiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Fail-safe: don't abort install if one optional icon is missing
        console.warn("Pre-cache warning:", err);
        return self.skipWaiting();
      })
  );
});

// Activate: Purge old cache versions instantly and take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: High-Performance Cache Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only intercept standard GET requests
  if (request.method !== "GET") return;

  // 2. Never cache dynamic translation APIs or external RPCs
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("mymemory") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // 3. Stale-While-Revalidate / Cache-First for static assets & pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Background network refresh
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed (offline)
          return null;
        });

      // If cached locally, return it immediately (0ms); otherwise wait for network
      return (
        cachedResponse ||
        networkFetch.then((res) => {
          if (res) return res;
          // Fallback to cached root if navigating between pages offline
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Network offline", {
            status: 503,
            statusText: "Offline",
          });
        })
      );
    })
  );
});