---
artifact: field-case-catalog
module: service-charge
client: encore
session_date: 2026-08-10
author_identity: GIVER
field_inventory: clients/encore/specs_planning/_internal/field-inventories/service-charge-basic-information-2026-08-10.md
walk_evidence: (not yet authored — e2e environment was degraded; live-drive was not completed)
baseline_artifact: (not yet authored — old-site baseline walk not yet completed)
jira_tickets: [NM-3344]
tc_band: TC-SVC-BAS-001.. (Basic Information), TC-SVC-HIS-001.. (History)
coverage_mode: quick
depth: L1 (QUICK) — L2/L3 deferred to a subsequent DEEP catalog
---

# Field-Case Catalog — Service Charge (2026-08-10)

Two axes per `docs/read_only_docs/CASE_GENERATION_STANDARD.md` + `field-case-generation.md`:
**Axis 1** = per-field-type cases (§2, `field-case-generation.md`).
**Axis 2** = surface-behavior cases (§3, LR-065), QUICK depth only.

**Governing inventory**: `service-charge-basic-information-2026-08-10.md` — 79 percentage inputs
(`service-charge-percentage-0..78`), one Save button (`service-charge-save`), read-only
Service Type label column.

**Sibling catalogs modelled on**: `service-charge-text-2026-08-03.md` and
`terms-conditions-2026-08-06.md`.

**Field-type classification**: all 79 percentage inputs are **Numeric / spinbutton** (§2).
`inputmode="decimal"`, always-visible inline inputs, no declarative constraints
(no `min`, `max`, `step`, `pattern`, `maxlength`). Validation is application-logic-enforced.

**QUICK run scope**: Axis 1 FCC for the percentage field type (one representative field used
for all boundary cases; full 79-field sweep is a spec-build decision, not catalog scope).
Axis 2 SBC QUICK for both BAS and HIS surfaces.

**Representative field**: `service-charge-percentage-8` (Audio Conferencing, default `24.00 %`)
is used for all Axis 1 cases as the canonical non-zero starting value. Cases that need a
zero-start use `service-charge-percentage-0` (APP Downloaded, default `0.00 %`).

**Environment note**: all inputs were `disabled` at walk time (degraded e2e environment).
Validation behaviour is unprobed. Cases marked `NEEDS-LIVE-CONFIRM` must be verified before
spec build begins.

---

## Axis 1 — Field-Type Cases (§2 Numeric/spinbutton template)

Applies to ALL 79 `service-charge-percentage-N` inputs (identical field type).
Cases exercised against the representative field unless otherwise noted.

### A. Positive cases

| TC | Case | §2 template row | Expected | Source |
|---|---|---|---|---|
| TC-SVC-BAS-001 | Edit a percentage to a valid mid-range value (e.g. `50.00`) and verify the field accepts it | Numeric/spinbutton — mid | Field accepts the input; value is readable; Save enables | inventory §2 field-type |
| TC-SVC-BAS-002 | Edit a percentage to `0.00` (minimum plausible value) and verify Save enables | Numeric/spinbutton — min | Field accepts `0.00`; Save enables | inventory §2 |
| TC-SVC-BAS-003 | Edit a percentage to `100.00` (maximum plausible value) and verify Save enables | Numeric/spinbutton — max | NEEDS-LIVE-CONFIRM: whether 100.00 is accepted; if max cap exists, what it is |
| TC-SVC-BAS-004 | Reload the page after a successful save and verify the saved value persists | Numeric/spinbutton — save-cycle (Tier 1 baseline) | Value reads back from DOM equal to the saved value | LR-019; §1 Tier 1 |

### B. BVA cases

| TC | Case | §2 template row | Expected | Source |
|---|---|---|---|---|
| TC-SVC-BAS-005 | Enter a value just below zero (e.g. `-0.01`) | Numeric/spinbutton — min-1 (negative) | NEEDS-LIVE-CONFIRM: whether the field rejects negative values; if so, whether `aria-invalid="true"` is set and the field is escapable (§2.1 oracle) |
| TC-SVC-BAS-006 | Enter a value just above 100 (e.g. `100.01`) | Numeric/spinbutton — max+1 | NEEDS-LIVE-CONFIRM: whether over-100 is rejected; if so, `aria-invalid="true"` announced and field escapable (§2.1 oracle) |
| TC-SVC-BAS-007 | Enter a value with 3 decimal places (e.g. `24.005`) | Numeric/spinbutton — decimal-step boundary | NEEDS-LIVE-CONFIRM: whether 3+ decimal places are accepted or truncated; exact behaviour (round, truncate, error) |
| TC-SVC-BAS-008 | Enter exactly `0.00` on a field that already holds `0.00` | Numeric/spinbutton — revert-to-original | Save remains disabled (LR-009 net-zero: editing to original value must not dirty the form) | LR-009 |

### C. Negative cases (§2.1 rejection-affordance oracle applies to all)

For every rejected value below: assert **(a)** a visible rejection signal
(`aria-invalid="true"`, inline error, tooltip, or toast) **AND** **(b)** a natural Tab/click
blur moves focus out of the field (escapable). Both must hold — a silent reject or a focus
trap is a defect surfaced by the test (§2.1).

| TC | Case | §2 template row | Expected | Source |
|---|---|---|---|---|
| TC-SVC-BAS-009 | Enter alphabetic text (e.g. `abc`) into a percentage field | Numeric/spinbutton — "abc" | NEEDS-LIVE-CONFIRM: whether the field prevents non-numeric entry at the input level, or whether it is accepted and then rejected on save/blur; `aria-invalid` state and escapability (§2.1) |
| TC-SVC-BAS-010 | Enter a malformed decimal (e.g. `1.2.3`) | Numeric/spinbutton — "1.2.3" | NEEDS-LIVE-CONFIRM: rejection signal and escapability (§2.1) |
| TC-SVC-BAS-011 | Enter a negative number (e.g. `-5`) | Numeric/spinbutton — "-5" if positive-only | NEEDS-LIVE-CONFIRM: whether negative values are blocked at input or on save; `aria-invalid` and escapability (§2.1) |
| TC-SVC-BAS-012 | Enter a leading-zero number (e.g. `024`) | Numeric/spinbutton — leading-zero | NEEDS-LIVE-CONFIRM: whether leading zeros are stripped, preserved, or rejected |
| TC-SVC-BAS-013 | Enter scientific notation (e.g. `2e1`) | Numeric/spinbutton — scientific notation | NEEDS-LIVE-CONFIRM: whether scientific notation is accepted, stripped, or rejected with a visible signal (§2.1) |
| TC-SVC-BAS-014 | Clear a percentage field completely (empty value) | Numeric/spinbutton — empty/cleared | NEEDS-LIVE-CONFIRM: whether empty is treated as 0.00, kept invalid, or rejected on save; `aria-invalid` state and escapability (§2.1) |
| TC-SVC-BAS-015 | Enter whitespace only (e.g. a space character) | Numeric/spinbutton — whitespace-only | NEEDS-LIVE-CONFIRM: whether whitespace is stripped to empty or treated as invalid; rejection signal and escapability (§2.1) |
| TC-SVC-BAS-016 | Paste a very long numeric string (e.g. 50 digits) | Numeric/spinbutton — very long input | NEEDS-LIVE-CONFIRM: whether the field truncates, caps, or rejects an excessively long number |

### D. Percent-suffix handling

The inventory records the displayed value as `24.00 %` (number, space, percent sign).
Whether the `%` suffix is typed by the user or appended by the app is not confirmed by the
walk (all inputs were disabled).

| TC | Case | §2 template row | Expected | Source |
|---|---|---|---|---|
| TC-SVC-BAS-017 | Observe whether the `%` suffix is present in the editable `input.value` when a field is enabled, and whether typing a `%` character causes an error or is silently stripped | Numeric/spinbutton — format suffix | UNKNOWN — resolve at spec-build time: confirm whether user must type the number only (suffix appended by app) or whether the raw `input.value` carries ` %` and must be cleared before typing |

### E. Save-cycle cases

| TC | Case | §2 template row | Expected | Source |
|---|---|---|---|---|
| TC-SVC-BAS-018 | Edit one percentage field from its default value; verify Save button enables | Numeric/spinbutton — save-cycle (dirty-state) | Save button transitions from `disabled` to `enabled` after any edit | inventory Save-cycle observations |
| TC-SVC-BAS-019 | Edit one percentage field then revert it exactly to its original value; verify Save button re-disables | Numeric/spinbutton — revert-to-original-disables-Save (LR-009) | Save returns to `disabled` — a net-zero edit must not leave the form dirty | LR-009 |
| TC-SVC-BAS-020 | Edit one percentage field, save, reload, verify the value persists (Tier 1 save verification) | Numeric/spinbutton — save-cycle new-fill | Post-reload DOM value matches saved value | §1 Tier 1; LR-019 |
| TC-SVC-BAS-021 | Edit one percentage field to a new value, then overwrite it with a second value before saving | Numeric/spinbutton — save-cycle edit overwrite | Second value is the one persisted after save+reload | §2 save-cycle |
| TC-SVC-BAS-022 | Navigate away from the page with unsaved changes and verify a dirty-state prompt appears | State-transition: Dirty → Navigate-Away-Prompt | NEEDS-LIVE-CONFIRM: whether an "Unsaved changes" dialog appears on full navigation away; if so, confirm dialog testid (LR-012 default: `dlgSaveChanges / btnSaveChangesConfirm` unless MCP-proven otherwise) | LR-012; Standard state-transition model |
| TC-SVC-BAS-023 | Edit multiple percentage fields and save all in one Save action | Numeric/spinbutton — save-cycle (bulk) | All edited values persist after reload; no partial-save behaviour | inventory §2 |

---

## Service Type Column — Read-Only Label

The `Service Type` column is a read-only label column. Even though it carries no editable
input, it requires a render assertion (QUICK L1 must-assert for `render-state`).

| TC | Case | Expected | Source |
|---|---|---|---|
| TC-SVC-BAS-024 | Verify the Service Type column renders the correct label for a representative row (e.g. row 8 = "Audio Conferencing") | `Service Type` label matches the inventory-catalogued name for that index; no truncation or placeholder text visible | inventory field table row 8 |
| TC-SVC-BAS-025 | Verify that clicking a Service Type label cell does not open any editor or dialog | `affordance: none` — label remains static | inventory Notes `affordance: none` |

---

## Save Button — Enablement and Dirty-State

| TC | Case | Expected | Source |
|---|---|---|---|
| TC-SVC-BAS-026 | On page load (no edits), verify Save button is disabled | `[data-testid="service-charge-save"]` has `disabled` attribute | inventory Save-cycle observations |
| TC-SVC-BAS-027 | After editing at least one percentage field, verify Save button enables | Save button loses `disabled` attribute | inventory Save-cycle observations (expected enabled after any edit) |

---

## Axis 2 — Surface-Behavior Cases (SBC), §3 families (LR-065)

### BAS — Basic Information Tab

The Basic Information tab presents a 79-row always-visible table with two columns
(`Service Type` label, `Service Charge Percentage` editable input) and a Save button.
There is no filter, search, sort control, or pagination control observed in the inventory.

| Family | Applicable | TC | QUICK must-assert |
|---|---|---|---|
| **render-state** | YES | TC-SVC-BAS-028 | Column headers render exactly: `Service Type` and `Service Charge Percentage` (two columns, verbatim) |
| **empty-vol** | YES | TC-SVC-BAS-029 | All 79 rows render; a content-anchored row (e.g. "Audio Conferencing") is readable without requiring scroll or pagination |
| **persistence** | YES | TC-SVC-BAS-030 | After a successful save, a page reload returns the edited values (Tier 1 verification — deferred until a full live-enabled save can be run) |
| **result-fidelity** | NO | — | `out-of-scope: result-fidelity=no filter or search control exists on this tab; all 79 rows are always displayed in their fixed order` |
| **pagination** | NO | — | `out-of-scope: pagination=inventory describes a 79-row table with no pager control; no paginator observed in page description` NEEDS-LIVE-CONFIRM: verify no pagination control is present when the page is enabled |
| **sorting** | NO | — | `out-of-scope: sorting=no sort affordance is described in the inventory; table rows are in a fixed application-defined order` NEEDS-LIVE-CONFIRM: verify no column-sort affordance exists when the page is enabled |
| **combination** | NO | — | `out-of-scope: combination=no filter, sort, or paginate dimensions exist on this surface to combine` |

**Surface_Family**: render-state (QUICK) — TC-SVC-BAS-028
**Surface_Family**: empty-vol (QUICK) — TC-SVC-BAS-029
**Surface_Family**: persistence (QUICK) — TC-SVC-BAS-030

### HIS — Service Charge History Tab

The History tab is a read-only audit grid. The walk was not completed (environment degraded);
only column headers were observed: `Service Type`, `Service Charge Percentage`, `Modified By`,
`Modified On`. No row data, no pagination/sort controls, and no filter controls were observed.

| Family | Applicable | TC | QUICK must-assert |
|---|---|---|---|
| **render-state** | YES | TC-SVC-HIS-001 | Column headers render exactly: `Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On` (four columns, verbatim) |
| **empty-vol** | YES | TC-SVC-HIS-002 | NEEDS-LIVE-CONFIRM: whether the History tab shows rows after a save on the Basic Information tab, or an "no results" message when no changes have been made; confirm the exact "no results" text if present |
| **result-fidelity** | YES | TC-SVC-HIS-003 | NEEDS-LIVE-CONFIRM: after saving a percentage change on BAS, verify that the History tab shows a new row with the correct `Service Type`, updated `Service Charge Percentage`, `Modified By` (automation user), and `Modified On` timestamp |
| **pagination** | UNKNOWN | — | `out-of-scope: pagination=History tab was not successfully walked; pagination control presence is unknown` NEEDS-LIVE-CONFIRM: whether a paginator exists on the History grid |
| **sorting** | UNKNOWN | — | `out-of-scope: sorting=History tab was not walked; sort affordance is unknown` NEEDS-LIVE-CONFIRM: whether column headers are sortable |
| **combination** | UNKNOWN | — | `out-of-scope: combination=cannot determine until pagination and sorting presence confirmed on live walk` |
| **persistence** | NO | — | `out-of-scope: persistence=History is a read-only audit log; no user-configurable surface state (sort, page size, filter) exists to persist across reload` |

**Surface_Family**: render-state (QUICK) — TC-SVC-HIS-001
**Surface_Family**: empty-vol (QUICK) — TC-SVC-HIS-002
**Surface_Family**: result-fidelity (QUICK) — TC-SVC-HIS-003

---

## L2/L3 DEEP deferral

The following are deferred to the DEEP catalog per LR-072 (this is a QUICK run):

- `deferred-to-DEEP: percentage-field cross-row BVA matrix (all 79 rows boundary-tested individually)`
- `deferred-to-DEEP: bulk-save pairwise combinations (multiple fields edited simultaneously, pairwise grid)`
- `deferred-to-DEEP: save-failed retry and network-error state-transition`
- `deferred-to-DEEP: History tab full walk including sort and pagination exhaustive coverage`
- `deferred-to-DEEP: persistence family exhaustive (sort/page-size survive reload + browser-back)`
- `deferred-to-DEEP: volume stress (History grid with many rows)`
- `deferred-to-DEEP: tab-switch dirty-state behaviour (switching from BAS to HIS with unsaved edits)`

---

## NEEDS-LIVE-CONFIRM summary

| Count | Tag location |
|---|---|
| 1 | TC-SVC-BAS-003 (max cap value) |
| 1 | TC-SVC-BAS-005 (negative BVA) |
| 1 | TC-SVC-BAS-006 (over-100 BVA) |
| 1 | TC-SVC-BAS-007 (3-decimal-place BVA) |
| 1 | TC-SVC-BAS-009 (alpha input) |
| 1 | TC-SVC-BAS-010 (malformed decimal) |
| 1 | TC-SVC-BAS-011 (negative number) |
| 1 | TC-SVC-BAS-012 (leading zero) |
| 1 | TC-SVC-BAS-013 (scientific notation) |
| 1 | TC-SVC-BAS-014 (empty/cleared) |
| 1 | TC-SVC-BAS-015 (whitespace) |
| 1 | TC-SVC-BAS-016 (very long input) |
| 1 | TC-SVC-BAS-017 (% suffix handling — also UNKNOWN) |
| 1 | TC-SVC-BAS-022 (navigate-away dirty prompt) |
| 1 | TC-SVC-BAS-029 (pagination absence confirmation) |
| 1 | TC-SVC-BAS-030 (sorting absence confirmation) |
| 1 | TC-SVC-HIS-002 (History empty/no-results message) |
| 1 | TC-SVC-HIS-003 (History row after save) |
| 1 | TC-SVC-HIS (pagination presence) |
| 1 | TC-SVC-HIS (sorting presence) |

**Total NEEDS-LIVE-CONFIRM tags in this catalog**: 20

---

## Totals

- **Axis 1 FCC cases**: 27 (`TC-SVC-BAS-001..027`)
- **Axis 2 SBC BAS cases**: 3 (`TC-SVC-BAS-028..030`) + 4 families out-of-scope
- **Axis 2 SBC HIS cases**: 3 (`TC-SVC-HIS-001..003`) + 4 families out-of-scope or unknown
- **Net new cases**: **33**
- **NEEDS-LIVE-CONFIRM count**: 20
- **Expected to fail before live environment stabilises**: all 20 NEEDS-LIVE-CONFIRM cases require environment access before final expected-result can be filled in
