# The app's look: Navy and Gold (slice 2, 0.23.0)

Built 2026-11-24 on the branch `app-new-look` from Chris's decision cards of 2026-11-24 ("Yes,
account then look": the look comes after the account slice and must not touch it; "Navy and
Gold": the colourway). The source is the MenuCaptain redesign, `menucaptain-native-build`
`www/index.html`, the block "THE NEW LOOK" (Stage 1 releases 1.593.0 to 1.595.x), which carries
Media's round 2 kit. Every colour value is the kit's; nothing was invented.

The code is the `<style>` block of `index.html` (it opens with the orientation comment and the
rules in plain English), the head script under it (the mode before first paint) and the section
`LOOK` of the app script (`applyLook`, `LookChooser`).

## What changed, by screen

Everywhere: navy ink (#131b2e) on white by day, the app's navy ground (#121621) with light text at
night, following the phone. Square corners. Instrument Serif headings (one weight, 400), Outfit body
text (MenuCaptain's body face) and an Outfit small-caps wordmark; Crimson Pro stays for long-form
reading (a section's prose, the story, an answer). Buttons solid ink or an ink outline. Fields are
underlines (--faint at rest, ink while typing), labels in sentence case. Gold only as small details:
the tab bar's dot, the rule beside a pull-quote.

- Top bar: the wordmark `BASE GUIDES` left, the account entry (person icon + "Sign in" / "Hi
  <name>") right, in ink. No title under it; each screen has its own.
- Tab bar: on the page ground with a hairline top, 11px sentence-case labels, the active tab in
  ink with a 4px gold dot under it.
- Home: the MilSpo Living coin at 96px, the tagline as italic serif in --dim, an underline search
  field, underline selects, outlined chips (the chosen one solid ink), serif state headings (26px),
  and the bases as hairline rows running the full width (serif name 20px, the branch and state as
  the --dim second line, "Guide ready" / "Coming soon" / "OCONUS" as hairline labels). The branch
  colour stripe on each row is gone with the box.
- Guide: the base's name in serif (38px) under a 3px rule in the branch's colour (the one
  coloured edge kept), the tagline in Crimson Pro --dim, the ask box as an underline field and an
  ink "Ask" button, sections as serif rows (20px) with ink icons, quiet --soft boxes for the
  worked-out things (a place's details, the story's by-the-numbers box, rent vs buy, the housing
  figures), the BAH switch as an ink outline with the chosen side solid, the feedback block as
  hairlines. Notices ("Live ... appear here once the key is connected") are hairline notices in
  ink. A weather alert keeps red (a warning).
- Map: unchanged Leaflet; the attribution keeps the kit's fixed colours (white at 80%, #646b78
  text, black links) so it reads on the light tiles in both modes; the gold base marker stays.
- Plan: serif title (38px), underline date and base fields, the timeline as hairline rows with
  ink checkboxes, the realtor bridge as a hairline block with an ink button.
- Saved: serif title, the same rows as Home.
- Account / sign-in: serif titles, underline fields (first name above the address, then the code
  step, unchanged in order and behaviour), "Send me a code" and "Sign in" solid ink, "Sign out"
  an ink outline, "Delete my account" a red outline, the confirm box a red hairline box. Under
  the screen, in every account state, the Appearance row: Match my phone / Light / Dark.

## Decisions made in this slice (reasonable calls; say if any should change)

- No preview switch: the app has no members yet, so the release is the look; the old dark-only
  palette is gone (git remembers it). There were no `data-theme` palettes in this app to remove.
- Body text is Outfit, matching MenuCaptain's body face (the kit's), not DM Sans; Crimson Pro is
  kept for long-form reading because the kit has no long-form page. Fraunces and DM Sans are no
  longer loaded; the Google Fonts request names Instrument Serif, Outfit and Crimson Pro. `sw.js`
  caches Google Fonts by host, so it needed no change for that.
- The Appearance row lives under the account screen (the app has no settings screen). It is
  drawn by `App`, outside `AccountScreen`, so the account code is untouched and it shows whether
  the reader is signed in or out. It is a device setting (`bg_look_mode`), never the account's.
- Sizes from the kit: page titles 38px (the kit's hello line), section and row names 20px, card
  headings 22px, group headings 26px, tab labels 11px, the wordmark 11px at 0.42em.
- The branch colour survives as the 3px rule over a base's name on the guide; the stripe on the
  rows went with the boxes (the kit has no tinted edges).
- `.btn-gold` keeps its class name (the screens carry it) but is the solid ink button; the
  comment beside it says so.

## What to check on the preview

Preview: `base-guides-app-git-app-new-look-cg-forever-apps.vercel.app` (Vercel builds the branch).

1. Phone in light mode and in dark mode: Home, a guide (Fort Campbell), Map, Plan, Saved, Sign in.
   The page should match the phone; the Appearance row under Sign in should switch it and the
   choice should survive a reload. "Match my phone" should follow the phone again.
2. The sign-in flow end to end (a real code): first name above the address, then the code step,
   "Hi <name>" in the top bar, the account screen, Sign out. Nothing in it changed but the look.
3. The installed (Home Screen) app: the status bar clock should be dark on the white ground and
   light at night (the meta is set by `applyLook`; the app reads it as it opens).
4. The map's attribution and zoom buttons readable in both modes.

## Test record (2026-11-24, Playwright, Chromium, 390x844 at 2x and 1280x900)

Local static server; the backend's guide data served from `data/bases/*.json` in the test (the
backend refuses a localhost origin), the live layer answered 503, the story 404. Both colour
schemes emulated. Screens: home, guide (Fort Campbell, with the BAH section open and the ask field
focused), map, plan (a move date and base set), saved (one base saved), sign-in (signed out), the
Appearance row switched and back, the Guide tab's empty state; home at 1280px in both modes.

- Babel standalone transform of the app script: clean.
- Console errors: none (only the test's own 503s as failed resources).
- Horizontal overflow: none on any screen, either mode.
- The tab bar's active dot: 4x4px, round, the brass gradient, under the active tab, every screen.
- Headings: every h1/h2/h3, screen title, base name, state heading, ask title, account heading
  and the tagline computed in Instrument Serif; both fonts loaded.
- Contrast sweep of every visible text node against its ground (4.5:1, 3:1 for large text):
  0 failures on every screen in both modes (1485 text nodes on Home). Placeholders are --faint
  (3.07:1 light, 5.63:1 dark): the kit's value for placeholders, not loosened.
- The first-name box sits above the email box on the sign-in screen (checked by position).
- theme-color meta: #fff by day, #121621 at night.

Screenshots: `/tmp/claude-0/-home-user/28f4d996-b9d2-5a0d-8247-293372a09df0/scratchpad/app-look-shots/`
(named `<screen>-<mode>.png`, `home-<mode>-desktop.png`), not in the repo.
