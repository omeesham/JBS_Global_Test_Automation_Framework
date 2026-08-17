# Walk evidence — Discount Optimization cross-tab dirty-state guard

**Date**: 2026-08-14
**Office**: 1604
**Environment**: `cloudapps-e2e.encoreglobal.com`
**Surface**: `/navigator/locations/1604/settings/discount-optimization-settings`
**Scope**: the four cross-tab transitions between Tab 1 (Discount Optimization) and Tab 2 (Special Rate
Exemptions by Service Type), in both directions and in both clean and dirty states.
**Method**: direct browser observation, read-only apart from deliberately-discarded form edits. No test
code involved in producing these observations.
**Related ticket**: NM-3066 (Unsaved-Changes popup displayed when switching tabs without modifications).

---

## Why this walk happened

Four cross-tab cases were required; only one existed (`1 → 2` with no changes). The other three assert
live dirty-state behaviour, and the behaviour had never been observed. Writing assertions from a guess
would have produced tests that encode an expectation rather than a fact — so the transitions were
measured first, and the cases written from the measurements.

---

## Results — all four transitions

| # | Start | Change made first | Action | Prompt? |
|---|---|---|---|---|
| A | Tab 1 | none | → Tab 2, then back to Tab 1 | **No**, in both directions |
| B | Tab 1 | Allow Special Rate toggled, **not saved** | → Tab 2 | **Yes** |
| C | Tab 2 | Exempt checkbox toggled, **not saved** | → Tab 1 | **Yes** |
| D | Tab 2 | none | → Tab 1 | **No** |

**The guard is symmetric.** Both dirty directions produce the same prompt, with the same wording, the
same buttons, and the same branch outcomes. Both clean directions are silent.

### The prompt

- **Mechanism**: in-page `[role="alertdialog"]`. **No native browser dialog fires** — a
  `page.on('dialog')` listener recorded nothing across every run. This distinction matters to anyone
  automating it.
- **Verbatim text**: `Unsaved changes` / `Are you sure you want to leave this view? Any unsaved changes
  will be lost.`
- **Buttons**: `Stay`, `Discard`

### Branch behaviour, each observed on its own fresh page load

| Direction | `Stay` | `Discard` |
|---|---|---|
| Tab 1 → Tab 2 (dirty) | remains on **Discount Optimization**; the dirty state survives | proceeds to **Special Rate Exemptions by Service Type**; the change is dropped |
| Tab 2 → Tab 1 (dirty) | remains on **Special Rate Exemptions by Service Type** | proceeds to **Discount Optimization**; the change is dropped |

Neither branch was chained onto the other — each ran from a freshly loaded page, so no residual dirty
flag could carry across and contaminate the next observation.

---

## The dirty-state oracle — why transition B is trustworthy

A first attempt at transition B reported "no prompt appeared". **That result was void**, and its own
evidence showed why: the Save button was still **disabled** at the moment it switched tabs, so nothing
had been changed and nothing should have prompted. It had failed to operate the control at all.

The cause was a wrong assumption about the grid technology — it probed for AG Grid controls
(`.ag-row`, `.ag-cell`, `[role="switch"]`), and this grid is a plain HTML table. See
`grid-census-discount-optimization-1604-2026-08-14.json`, where the same assumption was independently
disproven: `.ag-row` and `.ag-cell` both return **zero** elements.

The re-run therefore carried a mandatory oracle: **confirm the Save button is ENABLED before switching
tabs, or stop and report that dirty state was never achieved.** That oracle passed:

| Check | Value |
|---|---|
| Row used | `The Abbey Resort` |
| Allow Special Rate before | `Yes` |
| Allow Special Rate after | `No` |
| Save button before tab switch | **ENABLED** |
| Dirty state achieved | **Yes** |

The lesson generalises: *an absent prompt only means something if you can prove there was something to
prompt about.* Any future observation of a guard needs the same kind of oracle.

---

## How the Allow Special Rate control actually works

Worth recording, because it defeated one attempt outright.

The control is **not** a checkbox at rest. It renders as plain text — `Yes` or `No` — and takes **two
clicks** to change:

1. The **first click** activates the cell into edit mode; it becomes a real checkbox exposing
   `aria-checked`. The logical value does **not** change.
2. The **second click** toggles the value.

Selector observed: `button[aria-label="Allow Special Rate for <locationName>"]`. Note that the location
name must be read from that `aria-label` — the adjacent table cell holds a numeric ID (e.g. `1115`),
not the name.

---

## Cross-check against the grid census

`The Abbey Resort` is also the **first row** recorded by the independent grid census taken the same day
on the same office. Two separate observations, produced by different scripts, agree on the grid's first
row — a small but real consistency check on both.

---

## Observations

No behaviour defects. The dirty-state guard behaved correctly and consistently in every run, including
the clean directions that NM-3066 originally reported as falsely prompting — that symptom did **not**
reproduce here.

---

## What this evidence supports

Three test cases, all owned by the Tab 1 spec (`discount-optimization-locations.spec.ts`), joining the
existing `TC-DOP-OPT-065` (`1 → 2` clean):

| Case | Transition | Asserts |
|---|---|---|
| `TC-DOP-OPT-066` | `2 → 1`, clean | no prompt; lands on Tab 1 |
| `TC-DOP-OPT-067` | `1 → 2`, dirty | prompt appears; `Stay` holds on Tab 1; `Discard` proceeds to Tab 2 |
| `TC-DOP-OPT-068` | `2 → 1`, dirty | prompt appears; `Stay` holds on Tab 2; `Discard` proceeds to Tab 1 |

Every assertion above traces to a row in the results table — none is inferred.
