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
