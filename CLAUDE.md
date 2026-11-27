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

**Website first (Chris, 2026-11-24):** a tool is built on milspoliving.com first and comes to the app
only when a family needs it in their pocket (saved bases, checklist, offline guides, alerts). Rank,
Compare and Plan stay on the website; the app links to them (`WEBSITE_TOOLS` in index.html).

**Names and small rules from auditor round 3 (Chris's cards 2026-11-24; app 0.27.0):**
- One name per thing, the website's (`NAMES` in index.html): "MilSpo Minute", "Find a base" (the list of bases
  and the way back from a guide), "PCS checklist" (the Plan tab's screen), "Compare bases". The five tab labels
  are unchanged; the tab redesign is a separate, unapproved proposal.
- A guide part is named by its TYPE where the website has a name for it (`SECTION_NAMES_BY_TYPE`): "Housing
  allowance (BAH)", "Schools near the base", "Questions families ask"; other types keep the stored title.
- Every tappable thing is at least 44 x 44 px, 8px from a small neighbour (`TAP TARGETS` in the style block).
- The HTML holds a launch mark inside `#root` (wordmark and Home hero) so the first paint is not blank while the
  script compiles. Its words are a COPY of `APP_NAME`, `BRAND`, `HOME_TAGLINE`, `ASSETS.logoMark`;
  `checkLaunchMark` logs `[LAUNCH] ... differ` when a rename changed one side only.
- One search rule for Home and the PCS checklist's "Moving to" (`BASE SEARCH`, `PlanBaseField`).
- My base and Saved stay two things; each screen says so in one sentence (`MY_BASE_EXPLAINED`, `savedExplained`).
- Saved shows "Compare bases on the website" once two saved bases have a guide (`CompareSavedLink`); the app
  still builds no Compare of its own.

**Lists and empty tabs (Chris, 2026-11-24):** every list of bases is ordered by tier then name
(`guideTier`, a mirror of the website's `src/lib/guide-tiers.ts`; change both together). The Map
and Guide tabs with no base open show the saved bases or the tier 1 bases (`PickABase`), never a
chip grid or a stub. Details: `docs/app-look.md`.

## Coordinates
- Repo: `C:\Users\cjgra\base-guides-app` (outside Dropbox, like dining-log-app).
- The ENTIRE app is one file: `index.html`. Deliverable file name is exactly `index.html`.
- Config block at the top of the `<script type="text/babel">`: `APP_NAME`,
  `BRAND`, `APP_VERSION`, `API_BASE_DEFAULT`. **Renaming the app = one-line change**
  to `APP_NAME` (display name is independent of the permanent bundle ID).
- appId (permanent, when published): `com.baseguides.app`.
- Data source: `API_BASE_DEFAULT` empty => reads `data/bases/*.json`. Set it to the
  backend URL to switch to the API (same JSON shape).
- Accounts (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` in the config block): the SAME
  Supabase project as milspoliving.com, so the app and the website are one account and
  saved bases (`public.saved_bases`) show in both. **The key is the switch:** empty key =
  accounts OFF (no "Sign in" anywhere; saved bases on the device exactly as before). It is
  Supabase's PUBLISHABLE key, made for browsers; every table it can see is closed by row
  level security to the signed-in user's own rows. Secret keys still never reach the
  client. Full notes, the Supabase dashboard step and the test procedure:
  `docs/app-accounts.md`.

## Account (sign in by emailed code, or an optional password) - the rules in one place
Chris's cards 2026-11-24: "Yes, account then look" (account only, no restyle), "6-digit
code", "Yes, both now" (Delete my account, Apple rule 5.1.1(v)), "No social logins"; 2026-11-26
"Sign-in" ("Code now, password next") and 2026-11-27 "Do next" (the password), "Pay grade" ("One
pay grade that can be edited with changes like a promotion"), "Match" (app and website keep the one
grade). The contract with the website for both: `docs/app-accounts.md`.
- Sign-in is a code emailed by Supabase Auth (length is a Supabase setting, 8 on 2026-11-24; the app accepts 6 to 10 digits) (`signInWithOtp` with no
  `emailRedirectTo`, then `verifyOtp` type `email`). NOT a link: a store app cannot rely on
  a link opening the app, and a link completes only on the device that asked. No Apple/Google
  (deliberate: it also avoids the Sign in with Apple rule).
  WARNING: the Supabase "Magic Link" email template must print `{{ .Token }}` or readers
  get a link and no code (`docs/app-accounts.md`).
- PASSWORD (optional, from 0.30.0): the code stays the main way in; nobody is asked for a password.
  Set or changed only while signed in (account screen, Password row: "Set a password" / "Change",
  `updateUser`); signed in with "Use a password instead" (`signInWithPassword`), landing where the
  code lands. No reset flow: "Forgot it? Sign in with a code, then set a new one." At least 12
  characters (`PASSWORD_MIN_CHARS`, said beside every box and enforced by the form; Supabase's own
  minimum 12 and leaked-password protection were set by Chris 2026-11-27), Show/Hide,
  autocomplete current-password / new-password. "Change" offers an OPTIONAL current-password box
  ("Forgot it? Leave this empty: you signed in with a code."), sent as `current_password` only when
  filled (Chris's card "Forgot flow", 2026-11-27: Supabase's "require current password" is off); if
  Supabase still asks for it, the box comes back as required; a refusal for an old session reads "Sign in
  again with a code, then change it.", a leaked one "That password has appeared in a data leak.
  Choose another." A wrong password never says which part was wrong. Supabase does not tell a
  client whether an account has a password, so the website and the app keep the SAME flag: every
  successful set or change sends `data: { password_set: true }`, and the row reads
  `user.user_metadata.password_set` ("Set" + Change, else "Not set" + Set a password). Only when
  the key is absent does a session opened with a password count (`sessionUsedPassword`, the
  token's amr). NEVER logged, never in an address.
- The words on the sign-in screen are the website's (`SIGN_IN_TEXT`, version
  `SIGN_IN_SCREEN_VERSION`, `2026-11-27-b` = `-d` plus "Use a password instead" and "We email you a code.
  A password is optional." (Chris's card "Sign-in line", 2026-11-27; was "No password: we email you a code.";
  `-a` was the same with a semicolon, never released); `-d` = `-c` with "then MilSpo Minute"
  (no "the"); `-c` = the website's `-b` plus the optional First name box), with "link" changed to "code".
  Public text says only that MilSpo Living is "affiliated with MilHousing Network"
  (`PUBLISHER_LINE`), nothing about ownership or company structure (Chris 2026-11-23).
- THE HEADER RULE (Chris, 2026-11-24, after testing): the top bar must make the state obvious.
  Signed out: person icon + "Sign in". Signed in: person icon + "Hi <first name>", or "Hi there"
  when no name is stored. The address is never in the top bar (it is on the account screen).
  While the session loads the entry keeps the signed-out look.
- The first name is OPTIONAL, asked on the sign-in screen above the address (decision card "On
  the sign-in screen"). Contract with the website: `profiles.first_name` (text, null, 40 max),
  `rpc('set_first_name', { name })` (answers the stored name, null when blank), and the name as
  `signInWithOtp` metadata `data.first_name` (a trigger copies it at account creation). After a
  code is accepted the typed name is sent once through `set_first_name` when the profile has
  none. The account screen's Name row ("What should we call you?" + Save, or the name + Change)
  writes only through the function; missing function = "Not available yet". Never logged.
- Saved bases: one facade (`useSavedBases`, `toggleSavedBase`) over two stores - the device
  list (`bg_saved`, as before) or the account's rows. Merge rule on first sign-in: account
  rows stay, device bases are added while there is room (up to 3), nothing is deleted from
  the account, the device list is then cleared. Cap of 3 in the account (the database
  trigger is the guarantee); the device list is not capped.
- My base (Chris 2026-11-24): one current base per account in `profiles.current_base_slug`,
  written only through `set_current_base`; one facade (`useMyBase`, `setMyBase`) over the device
  value (`bg_my_base`) or the account's; copied up once at sign-in, then the account wins. Shown
  on Home, the guide screen and the account screen; first in the website Compare link. Nothing
  else uses it. Details in `docs/app-accounts.md`.
- Delete my account calls the website's database functions `request_account_deletion` /
  `cancel_account_deletion` (30 days, nothing sent while it waits); until that migration
  is applied the button answers "Not available yet".
- PAY GRADE (Chris 2026-11-27; section PAY GRADE in index.html): ONE grade per reader, in
  `profiles.pay_grade`, written only through `rpc('set_pay_grade', { g })`; one facade (`usePayGrade`,
  `setPayGrade`) over the device value (`bg_pay_grade`) or the account's. At sign-in the account's
  grade wins, a grade only the phone has is copied up once, then the device copy is cleared (as My
  base). A missing column or function = "Not available yet. Your pay grade stays on this phone."
  The list is a COPY of the website's `PAY_GRADES` (src/lib/pay-grade-rules.ts; change both).
  Shown and changed on the account screen (Pay grade row) and the guide's housing allowance card:
  with a grade, "Your rate, E-5" with dependents and without, and "Change grade"; without one, the
  calculator as before and "Set your pay grade to see your rate". Only figures from the backend's
  `/api/bah` table are shown; a grade the table lacks (O-8 to O-10, O-1E to O-3E) says so and links
  the DoD calculator. ROAD NOT TAKEN: the rule until 2026-11-27, "pay grade stays on the phone,
  never in the account".
- Logs: `[ACCOUNT]`, `[SAVED]`, `[PAYGRADE]`, masked address, never a code, a password or a grade.
- Store builds (Capacitor, appId `com.baseguides.app`, same pattern as
  `menucaptain-native-build`): nothing here depends on a URL callback, so the code flow
  works unchanged inside the wrapper; supabase-js must be vendored with React when the
  wrapper precompiles the app (it is a CDN script tag today).

## Pinned CDN libraries
React, ReactDOM, Babel standalone and Leaflet from cdnjs; `@supabase/supabase-js` from
jsdelivr at an exact version (the `<script>` tag in `<head>`). `sw.js` caches each as an
immutable asset, so bump the version in BOTH the tag and `sw.js` `CRITICAL_ASSETS`.

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
The base's long-form story is NOT in the base JSON: it is fetched on demand from the backend
(`/api/bases/<slug>/story`, the same story milspoliving.com shows, from the shared database) and
drawn as a `story` section after the decision (`killer`) section. Its figures arrive filled by the
database; one that could not be filled reads "[figure missing]" and the section shows a notice.
A section the website converted to advice (`"advice": true`, `"confirm_with"`, no `verified`) shows
"Our advice. Confirm with <who>." in place of a date, never as checked (`SrcLine` in `index.html`).

## The first screen (Home tab), from 0.28
Chris's decision cards 2026-11-25: the job is "the website is where a family decides; the app is
what they carry on the way and on the ground"; first build "My base first screen only"; look "Yes,
match the website"; paid lookups "Free data first, then a cap"; stores "Stay a web app for now".
- **With a My base** (the two MY BASE stores, unchanged): a hero in the website's guide-hero style
  (branch tone from `BRANCH_TONES`, the website's table), local time, weather, "Drive time from where
  you are now" as a button, the next step of the move (the first PCS checklist step not ticked) or
  "Set your move date", three actions (open the guide; ask a question, which opens the guide with the
  Ask field ready and sends nothing; places near the base, which opens the Map tab), then saved bases.
- **Without one:** one question, "Where are you headed?", with the BASE SEARCH picker; a pick sets
  My base. "Browse all bases" opens the list Home used to be (`BrowseAllBases`, kept whole).
- **Rules stated in the code** (section FIRST SCREEN in `index.html`): no paid lookup without a tap
  (`LIVE_DATA_COST` in CONFIG says which lookups are free; today weather = National Weather Service
  and directions = OSRM are free, places = Google and the AI relay are paid); the Ask box is not
  called from this screen; location is asked only at the drive time tap; a value that could not
  load says so.
- **Launch mark:** with a base, a script under the mark draws that base's hero at first paint from
  `bg_first_screen` (a copy the screen keeps on the phone; deleted when the reader has no base). Its
  markup is a COPY of the hero in `MyBaseFirstScreen`; change both together.
- **NOT built, on purpose** (same cards; each needs its own go-ahead): the guide kept in the pocket,
  Near me, the shared checklist, reminders, a tab redesign, the other screens in the website's look.
- Checks and how they were run: `docs/first-screen.md`.

## Ask about this base: where the chips come from
The app sends `want_sections: true` to the backend's `/api/ai/relay` (backend 0.4.0) and shows a
"From this guide" chip for each section the backend says the answer used (`namedChips`). When the
answer used none, or the model did not say, NO chip is shown (Chris, decision card 2026-11-26,
"App chips"). The older word-matching guess (`sourceChips`) is kept only for a backend that sends
no `sections` list.

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
- **Names/text:** `APP_NAME`, `BRAND`, `HOME_TAGLINE` in the config block (top of the babel script), AND the
  launch mark in the HTML inside `#root`, which carries a copy of each (the app logs when they differ). `APP_NAME` is
  the wordmark in the top bar; `BRAND` is the coin over the first screen's question and the sign-in words.
- **Image assets:** routed through the `ASSETS` object (e.g. `ASSETS.logoMark`) - repoint or replace in place; don't inline image paths in components.
- **Icon set (fixed filenames at repo root):** replace these same-named files - `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`, `logo-mark.png` (in-app coin, transparent bg).
- **Colors:** the token layer at the top of the `<style>` block ("THE NEW LOOK", Navy and Gold,
  Chris 2026-11-24): a light set `--nl-*` and a dark set `--nd-*`; the mode copies one into `--n-*`;
  today's names (`--bg`, `--text`, `--accent`, ...) point at `--n-*`, so a re-skin is a new pair of
  sets. WARNING: `--accent` is the INK, not the gold (the kit's rule; gold reads 4.06:1 on white);
  gold is for small details only, named `--n-accent` / `--n-accent-flat`. Plus `BRANCH_COLORS`
  (the 3px rule over a base's name).
- **The website's look (first screen only so far):** the block "FIRST SCREEN LOOK" in the `<style>`
  block: tokens `--w-*` (light set `--wl-*`, dark set `--wd-*`) and roles `w-label`, `w-caption`,
  `w-display`, `w-btn-primary`, `w-btn-secondary`, `w-btn-quiet`, taken from milspoliving.com's
  `globals.css`; faces Playfair Display 500, Archivo 400/600, IBM Plex Mono 400 (second fonts link).
  The rest of the app follows screen by screen (Chris's card 2026-11-25); a screen moves over by
  using these tokens and roles. While the first screen is up, `<html data-screen="first">` points
  the shell's `--n-*` tokens at this look so the top bar and the tab bar sit on its ground.
  `BRANCH_TONES` is the website's branch colour table (hero ground and mark).
- **Light or dark:** `<html data-mode="light|dark">`, set before first paint by the head script and
  kept by `applyLook` (section LOOK): the phone's setting unless the reader chose in the Appearance
  row under the account screen (device setting `bg_look_mode`, never the account's). One rule squares
  every corner; the circles kept are listed beside it. Fonts: Instrument Serif (headings), Outfit
  (body, wordmark), Crimson Pro (long-form reading). Details and the test record: `docs/app-look.md`.
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
