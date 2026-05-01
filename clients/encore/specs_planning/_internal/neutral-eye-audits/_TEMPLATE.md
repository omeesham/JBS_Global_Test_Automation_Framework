# Neutral-Eye Audit — <Module>

**Date**: YYYY-MM-DD
**Auditor**: WATCHDOG
**Browser tool**: Claude in Chrome — <LR-038 reason: exploratory catalog, auth-heavy, user at machine>

---

## URL(s) visited

- `<full URL including query params>`

---

## Baseline diff (LR-045 / LR-ENC-001) — MANDATORY before e2e walk

Visit nav2 baseline FIRST at `https://navigator2.training.psav.com/#/setup/locationdetail/1604` (or per `LR-{CLIENT}-001` for non-Encore clients). Emit / consume `clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` per LR-013 spot-check pattern.

**Baseline scope**: `full` | `baseline-partial` | `baseline-absent` (record one per module).

| Field | Baseline behavior (nav2 — name= / id= attrs) | E2E behavior (this audit) | Divergence class |
|---|---|---|---|
| <!-- field --> | <!-- nav2 default + validation + dependency --> | <!-- e2e default + validation + dependency --> | <!-- regression-from-baseline \| intentional-UX-change \| baseline-absent --> |

If `baselineScope: baseline-absent` (e.g. ECT Settings, Local Office Settings as separate URL, Enable Multiday Pricing — net-new on e2e), record the row with `nav2 = (absent)` and `divergence = baseline-absent`. NOT a HALT per LR-ENC-001 architectural divergence.

Every `regression-from-baseline` row → file BUG-*.json per LR-034 with `baselineComparison: regression-from-baseline`.

---

## Field inventory

| Name | data-testid | Kind | Default | Constraint |
|---|---|---|---|---|
| <!-- field name --> | <!-- data-testid value or "(none)" --> | <!-- text\|number\|date\|checkbox\|dropdown\|textarea\|link\|button --> | <!-- rendered default or "(empty)" --> | <!-- e.g. required, min/max, pattern, read-only --> |

---

## Default values

Per-field rendered state observed on fresh page load (no prior edits):

| Field | Default rendered value | Notes |
|---|---|---|
| <!-- field name --> | <!-- exact text/value seen --> | <!-- e.g. "server-driven, varies by location" --> |

---

## Validation behavior

For each invalid input → describe: save button state / toast text / dialog text (verbatim):

| Field | Invalid input used | Save state | Toast / dialog text (verbatim) | aria-invalid |
|---|---|---|---|---|
| <!-- field --> | <!-- exact value typed --> | <!-- enabled\|disabled --> | <!-- exact message --> | <!-- true\|false\|N/A --> |

---

## Archetype probe results

Every ARCH-NNN from `bug-archetypes.md` was probed on this module. One row per archetype.

| Archetype | Reproduces? | Evidence | Action taken |
|---|---|---|---|
| <!-- ARCH-NNN — name --> | yes / no / N/A | <!-- live-DOM observation, network panel, BUG-{MODULE}-NNN.json --> | filed BUG-{MODULE}-NNN.json | flagged as discussion-item | not-applicable | drift recorded in §Diff |

If a NEW archetype was found during this audit not yet in `bug-archetypes.md`: list it here, AND append it to `bug-archetypes.md` at the next free ARCH-NNN BEFORE declaring DONE (acceptance criterion).

---

## Section names + labels

Exact rendered text as shown in the UI (copy-paste from DOM, no paraphrasing):

- **Section 1**: `<exact label>`
- **Section 2**: `<exact label>`
- *(add all)*

---

## Links + actions

| Element | Click → observed outcome |
|---|---|
| <!-- link/button label --> | <!-- what happened: navigation, modal, toast, nothing --> |

---

## Coverage depth grid (MANDATORY — before suggesting TCs)

For every interactive field in §Field inventory, the audit MUST verify the existing TC set against this grid (BVA + equivalence partitioning + cross-field + error-guessing — ISTQB standard). Mark each cell COVERED (cite TC ID) / GAP (suggest TC) / N-A (justify).

| Field type | Required TC coverage |
|---|---|
| **Numeric / ranged** (e.g. date offsets, percentages, currency) | default • min boundary • min-1 (one below min) • max boundary • max+1 (one above max) • mid-range valid • non-numeric input • empty/cleared • cross-field constraints (NM-* tickets) |
| **Required text** (e.g. Phone 1, Oracle Product) | default rendered value • empty/cleared (validation fires) • valid value (save+persist) • invalid format (if format constraint exists) • edit-then-cancel-via-Discard |
| **Optional text** (e.g. Phone 2, PO Number) | empty (no validation fires) • valid value (save+persist) |
| **Boolean checkbox** (e.g. Use Fulfillment, default-logo flags) | default state • toggle + save+persist • cascade effects (if any) • conditional disable from parent |
| **Dropdown / combobox** (e.g. Default Order Type, Currency) | default selection • full option count + first/last verified • change + save+persist |
| **Date** (if separate from offsets) | default • valid date (save+persist) • invalid date format • future/past constraints • cross-field |
| **Button** (e.g. Save, Default, Add) | default state (enabled/disabled) • click outcome verified • cascade (e.g. Save dialog opens, dialog text verbatim) |
| **Table / grid** (e.g. Section Configuration, Labor Cost Assumptions) | row count default • read-only column verification • edit one cell + save+persist • Add row + verify defaults • Default button reset |

Output a `## Coverage matrix` section in the findings doc with one row per field × required-TC. GAP count > 50 → escalate to user before authoring fixes.

---

## Suggested TCs (top-down layered)

Order: SMOKE → POSITIVE → NEGATIVE → UI → REGRESSION

| TC ID (suggested) | Type | Title | Priority | Notes |
|---|---|---|---|---|
| TC-XXX-001 | SMOKE | <!-- brief title --> | P0 | <!-- what to verify --> |
| TC-XXX-002 | POSITIVE | <!-- brief title --> | P1 | |
| TC-XXX-003 | NEGATIVE | <!-- brief title --> | P1 | |
| TC-XXX-004 | UI | <!-- brief title --> | P2 | |
| TC-XXX-005 | REGRESSION | <!-- brief title --> | P2 | |

---

## Diff vs our CSV

Comparison against existing `clients/encore/exports/<module>_test_cases.csv`:

| TC ID | Defect type | Evidence line | Fix |
|---|---|---|---|
| <!-- TC-XXX-NNN --> | <!-- wrong-value\|stale-default\|wrong-label\|missing-assertion\|wrong-constraint --> | <!-- exact CSV field + current value --> | <!-- what it should be --> |

_If no CSV exists yet for this module, write: "No existing CSV — this audit seeds the initial TC set."_

---

## Suspected APP bugs

| Module | Field | Observed behavior | Expected (per requirements) | BUG-*.json filename |
|---|---|---|---|---|
| <!-- module --> | <!-- field --> | <!-- what the app does --> | <!-- what docs say it should do --> | <!-- BUG-XXX-NNN.json or "TBD — verify with LR-034" --> |

_If none found: "No app bugs identified in this session."_
