/* Base Guides service worker - offline shell + per-base data cache.
   ===========================================================================
   Mirrors the MenuCaptain pattern. The one rule that matters most: never trap a
   user on a stale build.
   - app document (index.html) -> NETWORK-FIRST (in-app version check keeps working;
     cached copy only served when the network truly fails).
   - per-base data (data/bases/* and /api/bases/*) -> network-first, fall back to
     last-good cache (a base you've opened reads offline). Only GETs are cached.
   - immutable assets (cdnjs libs, Google Fonts, our images) -> cache-first.
   - OSM map tiles -> cache-first, size-capped (passive offline maps).
   VERSION is kept in lockstep with APP_VERSION in index.html.
*/
const VERSION = "0.18.0";                      // keep in lockstep with APP_VERSION
const SHELL_CACHE = "bg-shell-" + VERSION;
const ASSET_CACHE = "bg-assets-" + VERSION;
const DATA_CACHE  = "bg-data-v1";              // base guides; un-versioned so it
                                               // survives app updates
const TILE_CACHE  = "bg-tiles-v1";
const TILE_MAX    = 400;
const SHELL_URL   = "index.html";

const CRITICAL_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.6/babel.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const assets = await caches.open(ASSET_CACHE);
    await Promise.allSettled(CRITICAL_ASSETS.map((u) => assets.add(u)));
    try {
      const shell = await caches.open(SHELL_CACHE);
      const r = await fetch(SHELL_URL, { cache: "no-store" });
      if (r && r.ok) await shell.put(SHELL_URL, r.clone());
    } catch (e) { /* offline at install - fill on first online load */ }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE &&
                         k !== DATA_CACHE && k !== TILE_CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "clearCache" || (data && data.type === "clearCache")) {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    })());
  }
});

function isImmutableAsset(url) {
  if (url.hostname === "cdnjs.cloudflare.com") return true;
  if (url.hostname === "fonts.googleapis.com") return true;
  if (url.hostname === "fonts.gstatic.com") return true;
  if (url.origin === self.location.origin &&
      /\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(url.pathname)) return true;
  return false;
}

async function shellNetworkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(SHELL_URL, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(SHELL_URL);
    return cached || Response.error();
  }
}

async function dataNetworkFirst(req) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const fresh = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw e;
  }
}

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const over = keys.length - max;
  for (let i = 0; i < over; i++) await cache.delete(keys[i]);
}

async function cacheTile(req) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === "opaque")) {
      await cache.put(req, fresh.clone());
      trimCache(TILE_CACHE, TILE_MAX);
    }
    return fresh;
  } catch (e) {
    return cached || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === "opaque")) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    return cached || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  const isAppDoc = url.origin === self.location.origin &&
                   (url.pathname === "/" || /\/index\.html$/.test(url.pathname));
  if (isAppDoc && (req.mode === "navigate" || !url.search)) {
    event.respondWith(shellNetworkFirst(req));
    return;
  }

  // Per-base guide data + BAH rate tables -> keep last-good for offline.
  if (url.pathname.indexOf("/data/bases/") !== -1 ||
      url.pathname.indexOf("/api/bases") !== -1 ||
      url.pathname.indexOf("/api/bah") !== -1) {
    event.respondWith(dataNetworkFirst(req));
    return;
  }

  if (url.hostname === "tile.openstreetmap.org") {
    event.respondWith(cacheTile(req));
    return;
  }
  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(req, ASSET_CACHE));
    return;
  }
  // everything else -> default network
});
