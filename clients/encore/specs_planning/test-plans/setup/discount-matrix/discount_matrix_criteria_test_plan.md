# Discount Matrix — Search Criteria Test Plan

**Module**: discount-matrix
**Submodule**: CRT
**Page**: Location Settings → Discount Matrix (`/locations/{office}/settings/discount-matrix`) — Search Criteria bar
**Test Entity**: Office 1604
**Governing Requirement**: NM-3530
**Updated**: 2026-08-25
**Total Scenarios**: 30
**Test Cases**: `discount_matrix_criteria_test_cases.md`

---

## 1. Purpose

Cover the criteria bar shared by all three Discount Matrix tabs: three dropdowns (Country,
Currency, Business Tier) that re-key the grid without saving, one saved numeric field
(GAV Discount Threshold, measured range 0–100), the bar's own Save button, the tab strip,
the header information control, and the left-panel collapse toggle.

## 2. Scope

**In scope**: option sets of all three dropdowns and every option exercised at least once;
threshold acceptance across its full measured range with boundary, malformed, negative and
empty inputs; the silent-rewrite behaviours the field applies to non-conforming input;
save/dirty lifecycle including net-zero undo; persistence through reload; re-query behaviour
per criteria axis; tab strip and chrome render.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| Company Matrix grid content | Owned by another ticket (NM-3343); the criteria bar's effect on the grid is asserted only as loading-and-settling, never as grid content |
| Max/min character cases | The bar has no free-text field; the threshold is numeric and its boundaries are value-based |
| Dropdown invalid-value injection | Requires DOM tampering; deferred to the deep pass |

## 3. Environment and data

Office 1604 on the standard test environment. The threshold field has **no assertable
default** — it holds whatever the last save left (measured `0%` and `15%` on the same day).
Every case reads the current value first and restores it afterwards. Dropdown option sets
were read live on 2026-08-25: Country ×4, Currency ×3, Business Tier ×3.

## Shared execution constraints

These bind every spec that runs against this page; they come from measured behaviour, not convention.

| Constraint | Consequence for execution |
|---|---|
| The page hydrates in stages; the criteria bar's threshold input resolves at t≈91–100s, Region Weekly Peaks data at tab-click +40s (~134s total) | Specs raise their per-test timeout ceilings and gate readiness on the loading-placeholder census reaching zero — never on row count, which reads 52 in both the loading and loaded states |
| The threshold input is a formatted numeric | It is typed character by character; a single programmatic fill silently writes a different number |
| Save disables optimistically on click | Persistence is proven only by reload-and-read; a disabled Save button proves nothing |
| Non-numeric entry corrupts the underlying form model | Every case that types a non-numeric value ends with a reload; retyping a good value is not a reliable repair |
| Office 1604 is live shared data | Every mutating case restores what it changed and proves the restore by reload; re-runs are idempotent |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-DSM-CRT-001 | The criteria bar loads with all four controls populated | Surface — render-state (QUICK) | Yes |
| TC-DSM-CRT-002 | Country offers the four supported countries | Field (Axis 1) | Yes |
| TC-DSM-CRT-003 | Currency offers the three supported currencies | Field (Axis 1) | Yes |
| TC-DSM-CRT-004 | Business Tier offers the three configured tiers | Field (Axis 1) | Yes |
| TC-DSM-CRT-005 | Save is disabled when nothing has been changed | Field (Axis 1) | Yes |
| TC-DSM-CRT-006 | Opening and dismissing a dropdown does not dirty the form | Field (Axis 1) | Yes |
| TC-DSM-CRT-007 | Changing Country re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-CRT-008 | Changing Currency re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-CRT-009 | Changing Business Tier re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-CRT-010 | The threshold accepts a whole number and renders it as a percentage | Field (Axis 1) | Yes |
| TC-DSM-CRT-011 | A saved threshold survives a reload | Field (Axis 1) | Yes — mutating, self-restoring |
| TC-DSM-CRT-012 | The tab strip offers three tabs with Company Matrix active | Surface — render-state (QUICK) | Yes |
| TC-DSM-CRT-013 | The header information control is available | Surface — render-state (QUICK) | Yes |
| TC-DSM-CRT-014 | The left panel can be collapsed and restored | Surface — render-state (QUICK) | Yes |
| TC-DSM-CRT-015 | The threshold accepts zero, the bottom of its range | Field (Axis 1) | Yes |
| TC-DSM-CRT-016 | The threshold accepts one hundred, the top of its range | Field (Axis 1) | Yes |
| TC-DSM-CRT-017 | One above the maximum is refused | Field (Axis 1) | Yes |
| TC-DSM-CRT-018 | A far out-of-range value is refused the same way | Field (Axis 1) | Yes |
| TC-DSM-CRT-019 | The threshold accepts one decimal place | Field (Axis 1) | Yes |
| TC-DSM-CRT-020 | Letters never reach the threshold field | Field (Axis 1) | Yes |
| TC-DSM-CRT-021 | A malformed number is silently changed to a different one | Field (Axis 1) | Yes |
| TC-DSM-CRT-022 | A negative value silently loses its minus sign | Field (Axis 1) | Yes |
| TC-DSM-CRT-023 | Leading zeros are dropped | Field (Axis 1) | Yes |
| TC-DSM-CRT-024 | Scientific notation is silently changed to a different number | Field (Axis 1) | Yes |
| TC-DSM-CRT-025 | Clearing the threshold falls back to zero percent | Field (Axis 1) | Yes |
| TC-DSM-CRT-026 | Undoing an edit returns Save to disabled | Field (Axis 1) | Yes |
| TC-DSM-CRT-027 | Selecting Mexico re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-CRT-028 | Selecting Bahamas re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-CRT-029 | Selecting MXN re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-CRT-030 | Selecting SVP Productions re-queries the grid | Surface — result-fidelity (QUICK) | Yes |
