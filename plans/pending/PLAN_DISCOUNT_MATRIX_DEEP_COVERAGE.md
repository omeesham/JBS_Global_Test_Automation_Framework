# PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE — DEEP-tier coverage for the Discount Matrix module

**Status**: Pending
**Priority**: P2
**Created**: 2026-08-20
**Identity**: OWNER
**Parent**: PLAN_DISCOUNT_MATRIX_AUTOMATION.md
**Depends on**: the quick-tier subplans that feed it (see `## Intake`)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: high
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**BrowserToolJustification**: n/a
**CoverageMode**: deep
**Skills**: /identity, /ultracoverage, /find-bugs, /rca, /final-q
**Jira**: NM-3343 · NM-2219

---

## Why this file exists

This is the **recipient file** for every `deferred-to-DEEP` row raised by the module's quick-tier
subplans. A deferral with no recipient is a phantom hand-off and blocks the deferring plan's closure, so
each child files its rows here as it closes.

It is a **backlog with evidence**, not a scheduled execution plan. Nothing here is worked until the
module owner schedules it. Each row names its own unlock so no future session has to re-derive why the
work stopped.

---

## Intake

| Child subplan | Filed | Rows below |
|---|---|---|
| SUBPLAN_DISCOUNT_MATRIX_COMPANY_MATRIX | 2026-08-20 | §1 |
| SUBPLAN_DISCOUNT_MATRIX_REGION_WEEKLY_PEAKS | not yet closed | — |
| SUBPLAN_DISCOUNT_MATRIX_LOCATION_ACTIVATION | not yet closed | — |

---

## §1 — Company Matrix tab (filed 2026-08-20)

Quick tier delivered 42 cases, `TC-DSM-CMX-001..042`, all automated and green. The rows below are what
that tier deliberately did **not** cover. Evidence for every row:
`clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md`.

### 1a — Surfaces never exercised

| # | Surface | Why quick tier stopped | Concrete unlock |
|---|---|---|---|
| D1 | **Add Tier — the commit half** | The dialog is walked (TC-030…TC-033) but every case stops before the confirm click. NM-3237's rejection is submit-time, so proving it needs a real submit. | An explicit decision to mutate office 1604, plus a cleanup path to delete whatever tier the submit creates. An owner call, not a technical blocker. |
| D2 | **Delete Tier** | Never exercised. NM-3239 (recalculation after deleting a split tier) and NM-3435 (duplicate-tier delete error) both live here. | Walk the delete confirmation affordance; the destructive step needs an explicit mutation decision. |
| D3 | **Import** | Never exercised. Server-side validated with a row-level error list per NM-2219 AC4; mutating by nature. | A decision on a safe office plus fixture files before any trial. |
| D4 | **Export while dirty** | NM-3256 — dirty the threshold, click Export, take Discard; reportedly aborts the download. | Drive the threshold dirty, click Export, take Discard, assert the download still completes. Non-mutating if Discard is taken, so cheap once sequenced. |
| D5 | **Permission gating** | NM-2219 AC6 disables editing when `!canEdit`; `ROLE_FUNCTION_REVENUEMGMT` Read(2) vs Edit(3). | A second, read-only test account. None is configured today. |
| D15 | **The "More information" launcher** | Present on the criteria bar in every walked state, but never opened — so its content is unknown and it carries no disposition beyond presence. Recorded honestly as `not walked` in the field inventory rather than claimed as probed. | Open it once on office 1604 and record the launcher content (dialog title, internals, whether it is purely informational). Non-mutating and cheap; it was simply never reached. |

### 1b — Surface families deferred from the L1 floor

Quick tier covers each applicable family at L1 must-assert depth only. DEEP owes the L2/L3 depth for:

| # | Family | What L1 already asserts | What DEEP owes |
|---|---|---|---|
| D6 | Volume / large result set | 9 tier rows on office 1604 | Behaviour at a materially larger tier count — an office with enough rows to force scrolling or virtualisation |
| D7 | Combination | Single-axis header changes, one at a time | Multi-axis combinations of Country × Currency × Business Tier, including combinations with no rows |
| D8 | Persistence | The threshold round-trips through save and reload | Cross-session and cross-tab persistence; whether one tab's save is visible to another without reload |
| D9 | Render state | Values render as text | Error/invalid render geometry actually **seen** — element screenshot or `boundingBox`, never inferred from `aria-invalid` |

### 1c — Open questions carried forward

| # | Question | Why it is not answerable at quick tier |
|---|---|---|
| D10 | **UI↔DB column mapping** — UI `Non-Peak / Standard / Peak` vs DB `NonPeak / Peak / SuperPeak` | Closed as far as the UI allows: the export payload uses the three UI names in the same order and all 189 cells match the grid. A true DB-internal check needs the API schema, which no UI walk can reach. |
| D11 | **Country dropdown option count is timing-sensitive** | One probe saw only `United States` while another had switched to `Mexico` minutes earlier. This matters because TC-002/003/004 **skip themselves** on a single-option dropdown — coverage can silently drop while the summary line stays green. Needs a deterministic readiness signal for the options list. |
| D12 | **The transient element that leaked into the validation sweep** | On roughly one run in three the page-wide sweep returned the page title `"Discount Matrix"` as a validation message. 405 probe samples across five reloads never reproduced it, so it is unidentified. The sweep is now scoped to the criteria bar, which makes the symptom moot but leaves the cause unknown. |
| D13 | **Save→navigate write loss (BUG-CANDIDATE)** | Measured: the form still reports unsaved changes until ~1551 ms after the Save click, and navigating inside that window silently cancels the write. Cannot be filed as a regression without a baseline comparison, and this module is `baselineScope: baseline-absent`. Unlock: reach nav2 via the repository's own unattended session mechanism (clients/encore/CLAUDE.md § "When encore needs fresh login session" — it covers nav2, and the account has no second factor), then compare. No human sign-in is required; the earlier "human-blocked" claim is withdrawn. |

### 1d — Blocked on tooling, not on scope

| # | Item | Status |
|---|---|---|
| D14 | **Per-field enumeration of the Edit Tier dialog** | **DONE at quick tier; one gap carried here.** The denominator itself is delivered: **21**, provenance `reports/walk-coverage/1604-discount-matrix.json`, both dialog branches `ok: true`, measured against a healthy 9-row grid, `cross-check --self-test` 18/18. See walk-evidence §13. What DEEP owes: the Edit Tier dialog's **21 percentage inputs collapse into a single `role:input:` entry carrying no `occurrences`**, so they contribute 1 to the denominator rather than 21. Cause is `enumerate-page.mjs`'s portal scan — it opens the first row's dialog, collapses every input into one `role:`-keyed entry with no ancestor path. Concrete unlock: give the portal scan a per-field key with an ancestor path, then re-run. Behaviour coverage of those 21 inputs is NOT missing — `TC-DSM-CMX-022` and the Edit Tier cases read all 21 values directly. Also still open, and sharper than PLAN_70 states it: whether PLAN_70's cause 3 (`type=null` + `inputmode=decimal`, no classifier rule) applies here **cannot be answered**, because the entry fails at selector derivation and never reaches the classifier. |

---

## Verification artifact

```bash
grep -c "^| D[0-9]" plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md
```

Expected `15` — D1 through D15, every row carrying a named unlock or an explicit reason it cannot be
answered at this tier.
