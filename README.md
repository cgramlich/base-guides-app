# Base Guides

Living guides to U.S. military bases - by **MilSpo Living** (MilSpo Life LLC).
A single-file React PWA on the Forever Apps / MenuCaptain stack. One app, all bases,
content fetched per-base on demand.

## Run it locally
It's a static single-file app. Serve the folder (a server is needed so `fetch()` and
the service worker work - opening the file via `file://` will not load the data):

```
python -m http.server 8000
```

Then open http://localhost:8000/ and tap **Fort Campbell**.

## Structure
```
index.html              the entire app (config block at top of the babel script)
sw.js                   service worker (offline shell + per-base data cache)
manifest.json           PWA manifest
data/bases/index.json   the base list (Home screen)
data/bases/<slug>.json  one base guide, fetched on demand (schema-keyed)
```

## Status
- [x] Frontend skeleton: base list -> per-base detail (on-demand fetch), offline
      shell, update banner, bottom nav (Home/Guide/Map/Search).
- [x] Fort Campbell seeded (incl. drafted TN/KY two-state decision).
- [ ] Icons (icon-192/512, maskable) - add PNGs at repo root.
- [ ] Backend repo `base-guides-backend` (FastAPI): serves base JSON + proxies
      Google Places / Maps / Weather / Claude (keys server-side).
- [ ] Supabase project + schema (base content read model); GRANT to service_role.
- [ ] Live layer: Google Places "near me", maps/drive-time, weather alerts, AI Q&A.
- [ ] Capacitor wrap (`build.js` -> www, Android + iOS), push notifications.

## Owner setup still needed (external)
- Supabase project (URL + keys).
- API keys: Google Maps Platform (Places + Directions), Anthropic (AI Q&A).
- Railway service for the backend; GitHub repo + Pages (or chosen host) for this app.
```
