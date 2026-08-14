# GROUND TRUTH — Rutvik's manual replication, 2026-08-14

**Status**: Owner-observed. This outranks both RCA seats. Where a seat's conclusion contradicts
anything below, the seat is wrong until it produces live evidence that overturns this.

**Source**: Rutvik ran the scenario by hand in a real browser and supplied a screenshot. The
screenshot itself lives in the chat transcript, not on disk; the facts below are a transcription of
what it shows. Transcribed by the dispatcher, not inferred.

---

## What he did

> "when i tap and fill the %, and i click on history = prompt did appear"

1. Opened Service Charge for office 1604.
2. Tapped a **Service Charge Percentage** cell and filled a value.
3. Clicked the **Service Charge History** tab.
4. The unsaved-changes prompt **appeared**.

## What the screen showed

**URL** (browser address bar, verbatim):

```
cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
```

**The dialog** — an IN-PAGE modal, not a native browser dialog:

- Title: `Unsaved changes`
- Body: `Are you sure you want to leave this view? Any unsaved changes will be lost.`
- Buttons: `Stay` and `Discard` (plus an `X` close control top-right)
- Rendered as a dark centred overlay card over the dimmed page — consistent with a Radix/Angular
  component, NOT `window.confirm` / `beforeunload`

**Page chrome visible behind the dialog** (all verbatim):

- Page heading, top bar: `Service Charge` — **no office name appended**
- Office context line: `Local Office :   1604 - Parker Palm Springs` — **office name IS present**
- Left sidebar header: `1604   Parker Palm Springs`
- Tabs: `Basic Information` (active) and `Service Charge History`
- `Save` button, top right, rendered in a dimmed/disabled-looking state
- Table columns: `Service Type` and `Service Charge Percentage`
- Sample rows: `APP Downloaded 0.00 %`, `App Quality Assurance 0.00 %`,
  `Audio Conferencing 24.00 %`, `Cancellation Fee 0.00 %`

---

## Consequences for the three failing tests

### TC-SVC-BAS-022 — the guard EXISTS

The application is not missing an unsaved-changes guard. It fires on **in-app tab navigation** and
renders as an **in-page modal**. The spec drove `page.goBack()` instead — browser-history navigation,
which the artifacts show walked to `about:blank`. Any theory claiming "the app has no navigation
guard" is refuted. The open question is now narrower: does the guard fire ONLY on in-app navigation,
or also on browser-back, and if the latter, in what form?

### TC-SVC-HIS-015 — the artifact seat's app-bug reading is CONTRADICTED

Seat A concluded the app renders `Local Office :` with the office name missing, and classified it as
an application defect in the NM-3300 family. Rutvik's screen shows
`Local Office :   1604 - Parker Palm Springs` — name present. Therefore the missing name that the
test observed is most likely a **read-timing or wrong-element problem in the test**, not an
application defect. That flips the classification and it must be re-examined, not defended.

### TC-SVC-HIS-001 — partially consistent, still open

The top-bar heading does read `Service Charge` with no office name, which is consistent with Seat A's
observation. What remains unproven is whether the office name is SUPPOSED to be in that heading. That
is a specification question (NM-3300 / old-site baseline), not something the artifacts can settle.

---

## Standing instruction to both seats

Test this observation BEFORE any self-generated hypothesis. Do not explain it away. If your evidence
genuinely contradicts it, produce the live capture that does so — and say plainly that you are
contradicting the owner's manual observation.

---

## Second replication — letters typed into a percentage field (added 2026-08-14, later same day)

**Source**: Rutvik typed by hand in a real browser on office **1607** (Stonewall Jackson Hotel and
Convention Center) and supplied two screenshots. Transcribed here, not inferred.

**What he did**: clicked the **App Quality Assurance** percentage cell (showing `0.00 %`), typed
letters, then moved focus to the next row's cell (**App Quality Assurance – M**).

**What the screenshots show**:

1. While the field is focused, it contains the literal text `0avbb` — the letters are ACCEPTED into
   the field and remain visible. They are not blocked at the keystroke.
2. The field is drawn with a **red border** and a **red circular error icon** immediately to its
   right. The app is signalling that the value is invalid.
3. After focus moved to the next row's cell, the first field **still shows `0avbb`, still red, still
   carrying the error icon**. The invalid state survives blur; the value is NOT silently stripped or
   reset to zero.
4. The **Save** button is greyed out (disabled) in both screenshots.

**What this settles**: the application rejects alphabetic input correctly and visibly. Any conclusion
that the app "silently strips letters and resets the field to 0", or that it accepts invalid input
without signalling, is refuted by this replication.

**What this opens**: the automated test reads `aria-invalid` as `false` for the same scenario. Since
the red border and error icon are driven by the invalid state, a live-typed field should report it.
The open question is therefore about our INPUT METHOD, not the app: the test sets the value with a
single bulk fill, while the owner typed character by character. A validator that runs on keystrokes
never fires for a bulk value-set. That hypothesis must be proven by capturing the attribute both ways
on the live app before any test change is made.

---

## Third replication — a typed value is wiped ONLY during the settle window after reload (added 2026-08-14, evening)

**Source**: Rutvik replicated by hand after two full-run failures (a Save that never enabled; a
34-saved-but-24-read-back). His replication steps, verbatim:

> "when a fresh reload occurs, in the first few seconds of the fields being enabled, if u type, and
> go out, it goes blank, u have to maybe wait until the fields are stable!"

**What this settles**:

1. The wipe is **NOT random**. It is a race against page initialization: the fields become ENABLED
   before the page is actually READY, and anything typed inside that early window is discarded on
   blur. Typing after the page has settled sticks.
2. It reproduces for a **human typing by hand** — so it is not an artifact of synthetic/automated
   input. A real user who navigates to Service Charge and types within the first seconds loses their
   input silently. That stands as a user-facing concern for Encore regardless of what we change in
   the tests.
3. Every automation measurement fits it: the 10-attempt probe (7/10 wiped — it always typed
   immediately after enable), the live walk's 1-of-3 keyboard control, and both full-run failures
   (every test navigates fresh in beforeEach and types straight away — whichever test draws a
   slow-settling reload loses).

**What this opens (the one remaining measurement)**: WHERE is the boundary, and WHAT observable
signal marks "settled"? "Enabled" is proven to be the wrong readiness signal; the fix needs the right
one (a specific late network response, a mutation-quiet window, or a fixed worst-case delay) so the
page object can wait for READY in one place — no sleeps scattered through tests, and no retry loops
that would hide the user-facing data-loss window from Encore.
