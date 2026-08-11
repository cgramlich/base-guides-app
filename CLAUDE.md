# CLAUDE.md - Base Guides Frontend

Auto-read by Claude Code at session start. Keep it current.

**Doc currency (see starter spec §5):** keep this file + the architecture doc in step
with the code in the SAME session you change code. Don't hardcode the version here
(point to `APP_VERSION` + `/health`); update the doc body when the architecture changes;
write a DATED entry in the app's Log folder for EVERY work session:
`C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\Base Guides Log\`.
Rule: `CG Apps\Forever Apps\forever-apps-starter-spec.md` section 5.

## Code readability (Chris's directive 2026-08-10) - part of "done"
This code has to be readable by three people who were not in the room when it was
written: a human AUDITOR reconstructing what the system does, a REGULATOR asking
"show me where that rule is implemented", and a DEVELOPER JOINING COLD. If any of
them has to ask "why is this here?", the code has failed - whether or not it works.
Treat this as part of the definition of done, alongside "it compiles" and "it is
deployed". It is not polish to add later.

- **Comment the WHY and the RULE, never the WHAT.** The test: a good comment is still
  true after someone rewrites the implementation. If it only narrates the current
  lines, delete it.
- **Every business rule is stated in plain English beside the code enforcing it**, so a
  reviewer reads the rule and sees the code without inferring it from the logic. Say
  where the rule comes from (policy, a decision Chris made) and date it. The accuracy
  rules matter most here: unverified content is labelled, `pending` sections never
  render as fact, and provenance travels with the section.
- **Non-obvious decisions record the road not taken** - what was rejected and why - so a
  later session doesn't "fix" a deliberate choice. On-demand per-base fetch instead of
  bundling content is the standing example (it is the fix for the Touch Stay crash, not
  an oversight).
- **Anything surprising gets a WARNING comment** where someone would trip over it:
  load-bearing quirks, footguns, things that fail silently.
- **Files open with an orientation block** (what this file is, what it owns, what it
  deliberately does not do), and long files are split into labelled banner sections
  (`CONFIG`, `DATA FETCH`, `SECTION RENDERERS`, `AI Q&A`). Matters most in `index.html`,
  which is the entire app.
- **Names are the documentation**; explicit over clever, always. Don't golf.
- **Dead code is deleted, not commented out.** Git remembers.

Guard the opposite failure just as hard: NOT a comment per line, NOT the code restated
in English, NOT ceremonial docblocks, NOT commit-message content in comments (who
changed what and when is git's job). Noise buries signal and teaches the reader to skip
comments, including the one that mattered. Restructure unclear code rather than
apologizing for it in a comment.

Full standard (the authority, read it):
`C:\Users\cjgra\Dropbox\My AI\CG Apps\Forever Apps\CODE-READABILITY-STANDARD.md`

## Pre-push audit gate (never bypass)
`git push` runs the shared checker `C:\Users\cjgra\portfolio-audit\portfolio_audit.py`
through `.git\hooks\pre-push`. Backend checks BLOCK the push; the frontend checks are
advisory (print-only) for now. Run it ad hoc any time with `--all`.

It exists because these specific failures actually happened:
- a model that was routed but had no price entry took PriorityCaptain's AI relay fully
  offline;
- a duplicate dict key made FitnessCaptain meter Sonnet 5 at Haiku's rate, so the budget
  breaker sailed past roughly 3x the real spend;
- a typo in a Railway numeric variable crash-loops a backend at import.

`--no-verify` is NOT an acceptable workaround - it is already against Chris's standing
rule. If the gate is wrong, fix the checker; don't push around it.

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

## Rebranding / swapping artwork (BUILD PRINCIPLE - applies to all Forever Apps)
Brand assets are a **drop-in swap**, never hardcoded, so any app re-skins fast:
- **Names/text:** `APP_NAME`, `BRAND` in the config block (top of the babel script).
- **Image assets:** routed through the `ASSETS` object (e.g. `ASSETS.logoMark`) - repoint or replace in place; don't inline image paths in components.
- **Icon set (fixed filenames at repo root):** replace these same-named files - `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`, `logo-mark.png` (in-app coin, transparent bg).
- **Colors:** CSS `:root` palette (`--bg`, `--accent`, ...) + `BRANCH_COLORS`.
- **Icon generation:** logo -> icon set via Pillow (navy square + white "coin" treatment for a light-background logo). Keep the generation approach repeatable for the next app.
RULE: route every brand string/color/asset path through config + standard filenames - never inline.

## Reference docs (read for full context; keep in sync)
- Scope + architecture:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\Base Guides Architecture & Design\base-guides-scope-and-architecture.md`
- Coverage catalog:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\Base Guides Architecture & Design\base-coverage-list-v1.md`
- Content schema:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Base Guides\MilHousing-Base-Guide-Schema-v0.1.md`
- Forever Apps starter spec:
  `C:\Users\cjgra\Dropbox\My AI\CG Apps\Forever Apps\forever-apps-starter-spec.md`
