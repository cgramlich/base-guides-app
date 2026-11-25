# The first screen: "My base" (0.28.0)

Built 2026-11-25 on the branch `first-screen` from Chris's two decision cards of 2026-11-25:
the job ("the website is where a family decides; the app is what they carry on the way and on
the ground"), first build "My base first screen only", look "Yes, match the website", stores
"Stay a web app for now", paid lookups "Free data first, then a cap".

The code is the section `FIRST SCREEN` of the app script in `index.html` (it opens with the rules
in plain English), the block `FIRST SCREEN LOOK` in the `<style>` block, `LIVE_DATA_COST` in
`CONFIG`, `BRANCH_TONES` beside `BRANCH_COLORS`, and the script under the launch mark.

## What the Home tab shows

**With a My base** (the two MY BASE stores, unchanged):
- a hero in the website's guide-hero style: the branch's ground colour, the name in Playfair
  Display, a bar and a dot in the branch's mark colour, branch and state;
- local time at the base (the guide record's time zone);
- weather: temperature, forecast, high, low, chance of precipitation, named "National Weather
  Service"; weather alerts under the hero (every alert's name always shown; with more than one,
  the notices open on a tap);
- "Drive time from where you are now": a button, never automatic;
- the next step of the move: the first PCS checklist step not ticked, with its part and date, when
  a move date is set on the Plan tab; else a plain "Set your move date" link to Plan;
- three actions: Open the guide; Ask a question about this base (opens the guide with the Ask field
  ready, sends nothing); Places near the base (opens the Map tab on this base);
- Saved bases as a short list (five at most, then a link to the Saved tab), with the Saved tab's
  sentence and sign-in line under it;
- "Browse all bases" and "Change my base".

**Without one:** the coin, then one question, "Where are you headed?", with a search-as-you-type
picker (BASE SEARCH, so the Joint Base San Antonio hub is hidden as on the list; eight matches at
most), one line saying what a pick does, and "Browse all bases". A pick sets My base.

**Browse all bases** is the list Home was through 0.27, whole, with a way back.

## Which backend calls it makes, and when

| Call | When | Provider (backend `main.py`, read 2026-11-25) |
|---|---|---|
| `/api/bases` (the index) | at launch, as before | the app's own data |
| `/api/bases/<slug>` (the guide record) | when the screen opens on a base | the app's own data; kept by the service worker |
| `/api/weather` | when the screen opens on a base whose place is known | National Weather Service, free |
| `/api/directions` | only on the drive time tap, after the phone gives a location | OSRM public server, free |
| `/api/places/*` | never from this screen; the Map tab makes it after "Places near the base" | Google, paid |
| `/api/ai/relay` | never from this screen; the guide's Ask box makes it when a question is sent | paid |

`LIVE_DATA_COST` marks each lookup free or paid. Marked paid, the weather waits for a tap on "Show
the weather" (checked by flipping the mark in a test).

## What changed outside the screen

- `sw.js`: `VERSION` 0.28.0, and the rule for "the app document". It compared the path with `/`
  only; on GitHub Pages the app is served from `/base-guides-app/`, so the address the installed app
  opens was never answered from the cache and the app did not open without a connection. It now
  compares with the worker's own scope. Found by the offline check below.
- The top bar and the tab bar take the first screen's ground while it is up (`data-screen="first"`
  on `<html>`); they are unchanged on every other tab.
- The coin and its line are a small left-aligned row (56px coin) instead of a centred 96px coin.
- Back on a guide says where it goes: "Home" or "Find a base". The Home tab always returns to the
  first screen and opens it at its top.
- `LocalTime` (the guide) now reads the clock from the hook the first screen uses; its output is
  the same.

## Checks (2026-11-25, Chromium, 360, 390 and 768 px wide)

- Babel standalone transform of the app script: passes.
- Browser checks, 196 of 196 passed: no base; with a base; signed out; signed in against a
  stand-in account service; a move date set, not set, and every step ticked; drive time tapped
  against a stand-in directions answer; location refused; the backend unreachable with and without
  what the phone kept; two weather alerts; no forecast; weather marked paid; branch tones; a dark
  phone; the launch mark in both states (the HTML alone draws the same boxes as the app); tap
  targets at least 44 x 44 with 8px between small neighbours; no sideways scroll; no page or
  console errors.
- Every paid backend call was refused by the test harness before leaving the browser. The screen
  made no request to `/api/ai`, `/api/places` or `/api/directions` and never asked for the phone's
  location, except on the taps that ask for them.
- Offline after one visit, with the real service worker, 8 of 8 passed: the app opens, the base
  shows its name, tone, local time from the cached record, the weather says "Could not load",
  the cached guide opens.

NOT checked: a real phone; the installed app on a home screen; iOS Safari; the pre-push audit
(its checker is on Chris's machine). The check scripts ran from a session scratch folder and are
not in this repo.

## Open points for Chris

- MY BASE's sentence says "My base is the base you are at now"; this screen asks "Where are you
  headed?" and makes the answer My base. The two wordings disagree; the screen does not show the
  older sentence, and the store is unchanged.
- The whole guide record is fetched to read a time zone and a place. A smaller backend route was
  left out on purpose (see `useGuideRecord`).
