# CLAUDE.md - Base Guides Frontend

Auto-read by Claude Code at session start. Keep it current.

## What this is
Base Guides frontend: a SINGLE-FILE HTML PWA (React via CDN + Babel standalone),
no build step. Part of the **MilSpo Living** brand (rebrand of MilHousing Network),
published under MilSpo Life LLC. One of the **Forever Apps**, built on the proven
MenuCaptain stack. Backend is a SEPARATE repo (`base-guides-backend`, FastAPI on
Railway - not yet created).

## The core architecture rule (why this app stays light)
The app ships with **NO base content**. Each base's guide is fetched **ON DEMAND**
(`data/bases/<slug>.json` now; backend API later) and cached by the service worker.
ONE app holds ALL bases; never load all bases into memory. This is the deliberate
fix for the Touch Stay crash (it loaded content client-side and choked) and the core
justification for the Pro subscription (a living, cloud-served service).

## Coordinates
- Repo: `C:\Users\cjgra\base-guides-app` (outside Dropbox, like dining-log-app).
- The ENTIRE app is one file: `index.html`. Deliverable file name is exactly `index.html`.
- Config block at the top of the `<script type="text/babel">`: `APP_NAME`,
  `BRAND`, `APP_VERSION`, `API_BASE_DEFAULT`. **Renaming the app = one-line change**
  to `APP_NAME` (display name is independent of the permanent bundle ID).
- appId (permanent, when published): `com.baseguides.app`.
- Data source: `API_BASE_DEFAULT` empty => reads `data/bases/*.json`. Set it to the
  backend URL to switch to the API (same JSON shape).

## PWA self-update mechanism (why version bumps matter)
On load, the app refetches `index.html` with `cache:"no-store"`, regexes out
`APP_VERSION`, compares, and shows an update banner if newer. Bump `APP_VERSION` on
EVERY user-facing change or installed users silently never update. Keep `VERSION` in
`sw.js` in lockstep. MAJOR.MINOR.PATCH; minor = feature, patch = fix.

## Content model
Base JSON is keyed to the schema: `CG Apps\Base Guides\MilHousing-Base-Guide-Schema-v0.1.md`.
Rendering is **schema-driven and generic** - a base's `sections[]` array drives the UI;
adding bases/sections needs NO code change. Section `type`s so far: `facts`, `prose`,
`killer`, `list`, `places_pending`, `pending`.

## How Chris works
- Plain-English feedback; you read the code and edit directly. Iterate freely.
- Ask before building: feature work gets a SHORT proposal + sign-off first. One step
  at a time; wait for confirmation.
- Debug logs-first: ask for console output / network response / screenshot before
  theorizing. Do not guess.
- Direct, no hedging. Production-ready, not demos.
- Commands handed to Chris: ONE per code block, never grouped, wait for output.
- Environment: Windows 11. Keep console/log output ASCII-safe (no emoji).

## Verify before delivering
- Single-file React via Babel standalone: run the JSX through Babel standalone to
  confirm it transforms cleanly BEFORE delivering, then content-grep each change.
- For automated edits, assert each anchor string appears EXACTLY ONCE before replacing.

## Reference docs (read for full context; keep in sync)
- Scope + architecture:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\Base Guides Architecture & Design\base-guides-scope-and-architecture.md`
- Coverage catalog:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\Base Guides Architecture & Design\base-coverage-list-v1.md`
- Content schema:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\MilHousing-Base-Guide-Schema-v0.1.md`
- Forever Apps starter spec:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Forever Apps\forever-apps-starter-spec.md`
