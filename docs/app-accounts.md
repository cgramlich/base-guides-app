# The app's account: what was built, what Chris must do, how to test

Built 2026-11-24 on the branch `app-same-account` from Chris's decision cards of 2026-11-24
("Yes, account then look", "6-digit code", "Yes, both now", "No social logins") and the
website's finished accounts slice (website repo, branch `accounts-slice-1`:
`src/lib/account.ts`, `account-settings.ts`, `saved-bases*.ts`, `docs/accounts-build.md`).
The code is in `index.html`, sections `ACCOUNT`, `SAVED BASES` and `ACCOUNT SCREENS`.

Wording rule for every public text (Chris, 2026-11-23; memory section 152): the app says only
that MilSpo Living is "affiliated with MilHousing Network" (`PUBLISHER_LINE`), nothing about
ownership or company structure.

## What a reader gets

- The top bar makes the state obvious (Chris's rule, 2026-11-24, after the first test): a person
  icon and "Sign in" when signed out; the person icon and "Hi Chris" (the first name) when signed
  in, "Hi there" while no name is stored. The address is not in the top bar; it is on the account
  screen. Tapping the entry opens the account screen. While the stored session is still being
  read at launch the entry keeps the signed-out look and swaps once the session is known.
  Nothing is offered on an empty screen: the Saved screen offers "Sign in to keep them on every
  device" only under a list with something in it.
- Sign-in by a code emailed by Supabase Auth (its length is a Supabase Auth setting, 8 on 2026-11-24; the app accepts 6 to 10 digits): an OPTIONAL "First name" box above the address
  (decision card "On the sign-in screen", 2026-11-24), the address and "Send me a code", then the
  code field (numeric keypad, one-time-code autofill) and "Sign in". An optional password (from
  0.30.0, section "The password" below). No social sign-in. The first code makes the account.
- The account screen: the name (a "Name" row: "What should we call you?" with Save when the
  account has none - the one-line prompt an account made before the name existed sees - or the
  name and "Change"), email, role (Member / Editor / Owner, from `public.profiles`), the saved
  bases with Remove, "Sign out" (this device only), "Delete my account".
- Saved bases kept in the account once signed in, the same `public.saved_bases` rows the website
  reads, so a base saved in the app or on milspoliving.com shows in both. Signed out, or with
  accounts off, saved bases stay on the device exactly as before.

Not in this slice: any restyle, the ranked list, the checklist ticks, the alert choices, a
privacy screen (the app has none; the sign-in screen links the website's policy page).

## The switch

Accounts are ON when `SUPABASE_PUBLISHABLE_KEY` in the config block of `index.html` is set and
OFF when it is `""`. Off: no "Sign in" anywhere, nothing reaches Supabase, the device list is the
only list. The key is Supabase's publishable key, made for browsers; the two tables it can see
are closed by row level security to the signed-in user's own rows (website migration
`20261123210000_accounts_slice_1.sql`). If supabase-js fails to load from the CDN, accounts are
off for that visit and the rest of the app is unchanged.

ROAD NOT TAKEN: proxying auth through the Railway backend. It would add a hop and a session
store for no security gain; the backend's "keys never reach the client" rule is about secret
keys and still holds.

## Why a code and not the website's link

The website signs in with an emailed link that opens `/auth/callback` on the site. A store app
(Capacitor wrapper, appId `com.baseguides.app`, later) cannot rely on an emailed link opening the
app, and a link completes only on the device that asked for it (the PKCE verifier lives there).
A code is typed wherever the reader is: the web, the installed PWA, the native builds. Same
Supabase Auth, same user, same session storage (supabase-js keeps it in localStorage).

Calls: `signInWithOtp({ email, options: { shouldCreateUser: true, data: { first_name } } })` with NO
`emailRedirectTo` (the `data` is left out when no name was typed), then
`verifyOtp({ email, token, type: 'email' })`. Supabase allows one code
request per address every 60 seconds; that answer is "We sent you a code less than a minute
ago". A wrong, expired or reused code answers "That code did not work. Check the digits or ask
for a new code." The code is never logged; log lines carry a masked address (`c***@gmail.com`).

## Chris's step in the Supabase dashboard (before the first test)

WARNING: without this step readers get an email with a link and NO code, and the app cannot
sign them in.

Project base-guides, left menu Authentication, Emails, Templates, **Magic Link**. The template
must print the code. Add a line such as:

```
<p>Your sign-in code: <strong>{{ .Token }}</strong></p>
```

Keep `{{ .ConfirmationURL }}` in the same template if the website's link sign-in should keep
working from the same email (both can be in one message: the website's reader presses the link,
the app's reader types the code). If the app is the only reader of that template, the link line
can go. Subject suggestion: "Your MilSpo Living sign-in code".

Also under Authentication, Providers, Email: "Enable email provider" on (it is). Under
Authentication, Rate Limits: the built-in mailer sends 2 emails an hour per project; the
website's build notes (`docs/accounts-build.md`, dashboard step 3) describe the Resend SMTP
switch that lifts it. The app shares that setting; nothing app-specific to set.

No redirect URL is needed for the app: the code flow never leaves it.

## Saved bases: the facade and the merge rule

`useSavedBases()` gives the screens `{ slugs, inAccount }`, `toggleSavedBase(slug)` is the one
action. Behind it:

- the DEVICE list, browser storage `bg_saved` (an array of slugs), when signed out, when
  accounts are off, or while the account list has not loaded yet;
- the ACCOUNT list, `public.saved_bases`, when signed in and loaded.

Names are looked up from the base list the app already loads (`/api/bases`); a slug the list
does not know (saved on the website for a base the app has no guide for) shows as its slug on
the account screen.

Merge rule (the website's `saved-bases-account.ts`; Chris approved the plan 2026-11-23): when
the account's list first loads on a device with its own list, the account's bases stay; a device
base the account lacks is added while there is room (up to 5, in the device order); nothing is
deleted from the account; the device list is then cleared. Logged as
`[ACCOUNT] saved bases merged: account=N device=M added=K`. Signing out therefore leaves the
device with no saved bases; signing in brings them back.

Cap: an account keeps at most 5 saved bases (the website's limit, because its compare page shows
at most 3 side by side). The app refuses a 6th with "Your account keeps up to 5 saved bases. Remove one
first." The database trigger `saved_bases_limit` is the guarantee; a write the database refuses
is logged (`[SAVED]`) and the list is read again. The device list is NOT capped (Chris's card:
saved bases stay on-device exactly as today when accounts are off); a longer device list is
merged as far as it fits.

## The first name (Chris, 2026-11-24)

The website's name slice, built in parallel, adds one column and one function; the app codes
against this contract:

| Piece | What it is |
| --- | --- |
| `public.profiles.first_name` (text, null, at most 40 characters) | Read with the profile (`select('*')`, the account's own row). |
| `supabase.rpc('set_first_name', { name })` | Trims, caps at 40 and stores the name; answers the stored name, null when blank. |
| `signInWithOtp(..., options.data.first_name)` | The typed name as user metadata; a database trigger copies it into the profile when the account is made. |

The app sends the typed name both ways: as metadata with the code request, and once more through
`set_first_name` right after a code is accepted when the profile has no name yet (an existing
account typing a name for the first time, or a trigger that did not copy it). The Name row on the
account screen writes only through `set_first_name`. Until the website's migration is applied
the function is missing and the row answers "Not available yet", exactly like the delete
functions; sign-in itself is not affected. `FIRST_NAME_MAX_CHARS` (40) caps the boxes so the
stored name is what was typed. Log lines say that a name was saved for a masked address and
never carry the name.

The sign-in screen's version moved to `2026-11-24-c` for the new box: a reader who signed up on
`-b` was never asked for a name and sees the prompt on the account screen instead.

## My base (Chris, 2026-11-24)

The one base the reader calls theirs, so the app can greet them with it and fill it into their own
tools instead of asking them to find their base every time (decision card "Yes, website and app").
The website's migration `profiles_current_base` is the contract for both:

| Piece | What it is |
| --- | --- |
| `public.profiles.current_base_slug` (text, null = none listed, slug shape `^[a-z0-9-]{1,80}$`) | Read with the profile (`select('*')`, the account's own row). |
| `supabase.rpc('set_current_base', { slug })` | A slug sets it, null clears it; answers the stored value. Signed-in readers only, their own row only. |

RULE: one current base per account, set only by the account holder, no history. It is shown
back to its owner (the Home row, the guide screen's button, the account screen's row) and filled
into the reader's own tools (the website's Compare link puts it first, then saved bases). Nothing
else uses it. ROAD NOT TAKEN: a flag on a saved base; the saved list is a capped shortlist and the
current base need not be among the five.

Two stores behind one facade (`useMyBase`, `setMyBase`), as for saved bases: the device value
(`bg_my_base`, `{slug, name}`) while signed out or before the profile is read; the account value
once it is. On a sign-in a device value with no account value is copied up once through the
function (`[ACCOUNT] my base copied up from this device: ok`), then the account wins and the
device value is cleared, so signing out leaves the device with no base listed. Until the
website's migration is applied the function is missing and the app answers "My base is not
available yet", like the name and delete functions.

Where it shows: Home, one row under the hero ("My base: Fort Hood" opens the guide; "No base
listed. Add your base" turns on a picking mode where every card gets a one-tap "This is my
base"); the guide screen, a "This is my base" button beside the bookmark (pressed again it clears,
and the notice names the base it replaced); the account screen, a "My base" row with Change and
Clear, or "Add your base" with a search box.

## The password (optional; Chris 2026-11-26 "Code now, password next", 2026-11-27 "Do next")

The shared contract with the website (2026-11-27). The code stays the main way in; nobody is asked
for a password to use anything.

| Piece | What it is |
| --- | --- |
| Sign-in screen, "Use a password instead" | Address + password, `signInWithPassword({ email, password })`; lands where a code sign-in lands. "Forgot it? Sign in with a code, then set a new one." (there is no reset flow). |
| Account screen, Password row | "Not set" + "Set a password" (new password only), or "Set" + "Change" (new, and an OPTIONAL current box with "Forgot it? Leave this empty: you signed in with a code.", sent as `current_password` only when filled; Chris's card "Forgot flow", 2026-11-27). Every successful set or change also sends `data: { password_set: true }`. |
| Rules | At least 12 characters (`PASSWORD_MIN_CHARS`, said beside every box, enforced by the form), at most 72 (Supabase's limit), Show/Hide, autocomplete `current-password` / `new-password`. |
| Answers | Wrong: "That email and password do not match. Try again or sign in with a code." (never which part). Leaked (`weak_password`, reason `pwned`): "That password has appeared in a data leak. Choose another." Old session (`reauthentication_needed`): "Sign in again with a code, then change it." Current password demanded: "Enter your current password too." and the box appears. |

Chris's Supabase settings (2026-11-27, dashboard, not code): minimum length 12, leaked password
protection on; "secure password change" may be on. A fresh code sign-in passes the reauthentication
check, so a FIRST password set right after one needs nothing else.

WARNING: Supabase does not tell a client whether an account has a password, so the website and the
app keep the same flag in the user's metadata: `user_metadata.password_set`, written `true` with
every successful set or change. The row reads it: true = "Set" + "Change", otherwise "Not set" + "Set
a password". Only when the key is absent (a password set outside both clients, in the dashboard) does
a session opened with a password (the access token's `amr` claim) count as "Set". If the project
demands the current password, the form asks for it after the first refusal.

A password is never logged, never put in an address, and the boxes are emptied after every try.

## The pay grade (Chris 2026-11-27, card "Pay grade": "One pay grade that can be edited with changes like a promotion.")

ROAD NOT TAKEN: the rule until 2026-11-27, "a pay grade stays on the device, never in the account".

| Piece | What it is |
| --- | --- |
| `public.profiles.pay_grade` (text, null) | Read with the profile (`select('*')`); a row without the key means the column is not there yet. |
| `supabase.rpc('set_pay_grade', { g })` | Sets the caller's own row, null clears, answers the stored value. The website's migration `profiles_pay_grade`, applied by the lead. |
| The grades | E-1 to E-9, W-1 to W-5, O-1E to O-3E, O-1 to O-10: a copy of the website's `PAY_GRADES` (`src/lib/pay-grade-rules.ts`). |

Two stores behind one facade (`usePayGrade`, `setPayGrade`): the device (`bg_pay_grade`) while signed
out, before the profile is read, or while the column or function is missing ("Not available yet.
Your pay grade stays on this phone."); the account once the row is read. At sign-in the account's
grade wins, a grade only the phone has is copied up once (`[ACCOUNT] pay grade copied up from this
device: ok`), then the device copy is cleared. The log never carries the grade.

Where it shows: the account screen's "Pay grade" row (Change / Add your pay grade, and where it is
kept), and the guide's housing allowance card: with a grade, "Your rate, E-5" with dependents and
without (the app does not know which applies) and "Change grade"; without one, the calculator as
before with "Set your pay grade to see your rate". ACCURACY: every figure is a row of the backend's
`/api/bah` table; the backend's table stops at O-7 and leaves out O-1E to O-3E, so those grades read
"This table has no rate for O-8. Check the official DoD calculator." and no figure is derived.

## Delete my account (Apple rule 5.1.1(v); Chris 2026-11-23: 30 days, nothing sent while it waits)

The website's delete slice, built in parallel, adds two database functions and one column; the
app codes against this contract:

| Call | What it does |
| --- | --- |
| `supabase.rpc('request_account_deletion')` | Records the request for `auth.uid()`; returns the timestamp. |
| `supabase.rpc('cancel_account_deletion')` | Withdraws it. |
| `profiles.deletion_requested_at` (timestamptz, null when none) | The pending request, read with the profile. |

Screen: the button "Delete my account", then a confirm sheet ("Your account and your saved bases
are removed 30 days from today. Nothing is sent to you while it waits. You can cancel any time
before then by signing in."), then "Deletion requested on <date>. Your account is removed on
<date + 30 days>." with "Cancel deletion". Until the migration is applied, Postgres answers
"function does not exist" (or PostgREST `PGRST202`) and the screen says "Not available yet"; the
profile read uses `select('*')` so a missing column cannot fail it.

## Test procedure (Chris, on a phone and a laptop)

Do not send a code to any address but your own. Every account made while testing is a test
account: delete it in Supabase, Authentication, Users, before the store release.

1. Do the dashboard step above first.
2. Open the app, save one or two bases with the bookmark. Open Saved: "Saved on this phone only.
   Sign in to keep them on every device".
3. Press it (or the person icon). Enter your own address, press "Send me a code". The screen
   moves to the code step.
4. Open the email on any device, type the code, press "Sign in". The account screen shows
   your address, "Member", and the bases from step 2, now in the account. The console (Safari
   or Chrome remote debugging) shows `[ACCOUNT] saved bases merged: account=0 device=2 added=2`.
5. On milspoliving.com (a preview with accounts on), sign in with the same address: the same
   bases are there. Remove one on the website; the app shows it gone after a relaunch (or sign
   out and in).
6. Save a 6th base in the app: "Your account keeps up to 5 saved bases. Remove one first."
7. "Sign out": the top bar shows "Sign in" again and Saved is empty on this device. Sign in
   again: the bases are back.
7a. The name: sign in with "Chris" in the First name box; the top bar reads "Hi Chris" and the
   account screen's Name row shows Chris with "Change". Sign out, sign in with the box empty on
   an account that has no name: "Hi there" and the prompt "What should we call you?"; type a
   name, Save: "Hi <name>". On milspoliving.com the same account shows the same name. If the
   website's name migration is not applied yet, Save says "Not available yet."
8. A second code asked within 60 seconds: "We sent you a code less than a minute ago". A wrong
   code: "That code did not work".
9. "Delete my account", confirm: the pending sentence with the two dates and "Cancel deletion".
   If the website's delete migration is not applied yet: "Not available yet." Cancel it after
   the test, or delete the test user in the dashboard.

10. Password (0.30.0): signed in by code, account screen, Password, "Set a password", a 12-character
   password, Save: "Your password is set." Sign out, "Use a password instead", sign in with it: the
   account screen. A wrong one: "That email and password do not match...". "Change": current + new.
   Try a well-known leaked password (for example "password1234"): the leak sentence.
11. Pay grade (0.30.0, after the website's migration): signed out, set E-5 on a guide's housing
   allowance card, sign in: the account screen's Pay grade row shows E-5 "Kept in your account";
   milspoliving.com shows the same grade on My move. Change it on the website; the app shows it after
   a relaunch. Before the migration: "Not available yet. Your pay grade stays on this phone."

## Tests run on this branch (2026-11-24)

- The JSX of `index.html` run through Babel standalone 7.23.6 in Node: clean. No new non-ASCII
  text (the five pre-existing lines with a degree sign or a middle dot are untouched).
- Playwright (Chromium, 390 px, the file served locally, the base list from the repo's own
  `data/bases/index.json`):
  - with the real key and the real supabase-js from the CDN: no console errors on load, the
    Sign in entry, the sign-in screen with every sentence of `SIGN_IN_TEXT`, the two steps (the
    code step hidden until a code is sent), the screen version on the element, no horizontal
    overflow, the bad-address message with nothing sent;
  - with a fake `window.supabase` in place of the CDN script (so no mailbox or network): the
    code step after "Send me a code", a wrong code refused, a right code signing in, the
    account screen (address, Member, three bases), the merge log and the cleared device list,
    the save past the cap refused, Remove writing through, a refused insert reloading the list, the
    delete confirm sheet, the pending state with the dates, cancel, sign out emptying this
    device, "Not available yet" when the functions are missing, the too-soon message, a masked
    address and no code in any log line;
  - with the key emptied: no Sign in entry, the device save and the Saved screen as before.
  Screenshots: `app-account-shots/` in the session's scratchpad folder.
- Not tested here: a real code round trip (needs a mailbox and the dashboard step), the
  website's delete functions against the real database, the Capacitor wrapper.
- 2026-11-24, the first name (0.22.0), the same Babel and Playwright set-up: the signed-out top
  bar (icon + "Sign in"), the name box above the email box (optional, 40 characters, given-name
  autofill), the typed name as `signInWithOtp` metadata (none when blank), "Hi Chris" with a
  profile that carries `first_name`, "Hi there" without one, the Name row's Change and Save
  through `set_first_name`, the one `set_first_name` call after a sign-in that typed a name into
  an account without one, "Not available yet." with the function missing (sign-in still
  completes), no name and no full address in any log line, no console errors. Screenshots:
  `app-name-shots/` in the session's scratchpad folder. Not tested: the real trigger and
  function against the database (the website's migration).

The repository has no unit test runner; none was added.

## Tests run for 0.30.0 (2026-11-27, password and pay grade)

- Babel standalone 7.23.6 transform of the app script: clean. No new non-ASCII text.
- Playwright (Chromium, 390 px, the file served locally on port 3270; the base list and Fort Hood's
  guide from the repo, Fort Hood's real `/api/bah` table fetched once and served to the page), 98 of
  98 passed: the sign-in screen with the real supabase-js (version `2026-11-27-b`, the first line "We
  email you a code. A password is optional." (Chris's card "Sign-in line", 2026-11-27), "Use a password
  instead", the 12-character rule: Sign in disabled at 11, enabled at 12, Show/Hide, autocomplete,
  maxlength 72; nothing submitted); the pay grade on the device (set from the card, the table's E-5
  figures, kept over a reload, O-8 with no figure, removed); with a stand-in supabase-js (no network,
  no mailbox): password sign-in wrong and right, "Change" sending `current_password` when the box is
  filled and none when it is left empty, a first
  password sent without it, `data.password_set: true` sent with every set and change, the row read
  from `user_metadata.password_set` (true over a code session = "Set" + Change with the optional
  current box; false = "Not set" even over a password session), the leak and reauthentication sentences, the
  current password asked after a refusal, the pay grade copied up / account wins / column missing / function missing, no
  password or grade in any log line, no console errors from the app.
- At 320 and 390 px: the account screen's password form takes the card's full width, each Show
  button sits beside its box, at least 44 x 44 and inside the screen, with no sideways scroll; the
  sign-in screen's Show the same.
- Not tested here: the real Supabase password calls and settings, the website's pay grade migration.
