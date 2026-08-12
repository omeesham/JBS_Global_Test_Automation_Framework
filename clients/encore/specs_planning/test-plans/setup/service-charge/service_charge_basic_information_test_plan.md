# Service Charge — Basic Information Test Plan

**Module**: service-charge
**Submodule**: BAS
**Page**: Location Settings → Service Charge (`/settings/service-charge`) — Basic Information tab
**Test Entity**: Office 1604
**Updated**: 2026-08-10
**Total Scenarios**: 30
**Test Cases**: `service_charge_basic_information_test_cases.md`

---

## 1. Purpose

Cover the Service Charge Basic Information tab: a two-column table of 79 service types with editable
decimal percentage inputs, and a single Save button. Coverage spans field-input validation (Axis 1),
Save-cycle state transitions, and surface-behavior families (Axis 2 QUICK).

## 2. Scope

**In scope**: percentage field acceptance (valid, boundary, negative), Save enable/disable lifecycle,
net-zero revert, persistence after reload, multi-field save, column header and row-count assertions,
dirty-state navigate-away prompt.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| All 79 fields exercised individually | Spec build decision; catalog designates a representative field — the 79-field sweep is a spec-level concern |
| Column sorting | No sort control observed at walk time (NEEDS-LIVE-CONFIRM that none exists) |
| Pagination | No paginator observed; all 79 rows render at once (NEEDS-LIVE-CONFIRM) |
| Role-based access | Role gate scope not confirmed; deferred to DEEP |
| Cross-browser / responsive | Platform family deferred per Standard |

## 3. Environment

Office 1604 on the standard test environment. No special data setup required; 79 rows are present
by default. **Note**: the e2e environment was degraded at walk time (all inputs observed `disabled`,
`Local Office : -` header). Cases marked `NEEDS-LIVE-CONFIRM` require a live-enabled environment
before spec build begins.

## 4. Open Items — NEEDS-LIVE-CONFIRM (12 items)

The following items cannot be asserted until a live-enabled walk is completed. They are carried
forward from the case file as open items, not assumptions.

| # | Item |
|---|---|
| NLC-BAS-01 | Whether `100.00` is accepted or rejected (max boundary) |
| NLC-BAS-02 | Whether negative values are rejected and the rejection signal (`aria-invalid`, error message) |
| NLC-BAS-03 | Whether values above 100 are rejected and the rejection mechanism |
| NLC-BAS-04 | Whether three decimal places are accepted, truncated, or rejected |
| NLC-BAS-05 | Whether alphabetic input is blocked at entry or rejected on blur, and the signal |
| NLC-BAS-06 | Whether a malformed decimal (`1.2.3`) is rejected and focus is escapable |
| NLC-BAS-07 | Whether negative numbers are blocked at input or on blur |
| NLC-BAS-08 | Whether leading zeros are stripped, preserved, or rejected |
| NLC-BAS-09 | Whether scientific notation is accepted or rejected |
| NLC-BAS-10 | Whether an empty field is treated as `0.00`, invalid, or rejected on save |
| NLC-BAS-11 | Whether whitespace-only input is stripped or rejected |
| NLC-BAS-12 | Whether the `%` suffix is app-rendered (user types only the number) and whether typing `%` causes an error; whether `input.value` carries ` %` or a plain number |

Additionally:
- TC-SVC-BAS-022: whether a dirty-state navigate-away prompt fires (default dialog `dlgSaveChanges / btnSaveChangesConfirm` per LR-012 assumption — NEEDS-LIVE-CONFIRM)
- TC-SVC-BAS-029: confirm no pagination control is present when environment is stable
- TC-SVC-BAS-030: confirm no column sort affordance is present

## 5. Risks

1. The degraded e2e environment (all inputs `disabled`) blocks any assertion on validation behaviour.
   All `NEEDS-LIVE-CONFIRM` cases are unblocked only after a successful live walk.
2. The net-zero revert test (TC-SVC-BAS-008, TC-SVC-BAS-019) depends on knowing the field's
   original value — sourced from the field inventory (`24.00 %` for row 8, `0.00 %` for row 0).
3. The multi-field save test (TC-SVC-BAS-023) edits two rows and must restore both; the restore
   step is load-bearing to avoid polluting subsequent runs.

## 6. Scenarios

| TC | Scenario | Automatable |
|---|---|---|
| TC-SVC-BAS-001 | Editing a percentage field to a valid mid-range value is accepted | Yes |
| TC-SVC-BAS-002 | Editing a percentage field to 0.00 is accepted and enables Save | Yes |
| TC-SVC-BAS-003 | Editing a percentage field to 100.00 | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-004 | Saved percentage value persists after page reload | Yes |
| TC-SVC-BAS-005 | Entering a value just below zero (negative boundary) | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-006 | Entering a value just above 100 | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-007 | Entering a value with three decimal places | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-008 | Reverting an edited field to its original value keeps Save disabled | Yes |
| TC-SVC-BAS-009 | Entering alphabetic text into a percentage field | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-010 | Entering a malformed decimal value | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-011 | Entering a negative number into a percentage field | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-012 | Entering a leading-zero number | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-013 | Entering scientific notation | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-014 | Clearing a percentage field completely | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-015 | Entering whitespace only into a percentage field | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-016 | Pasting a very long numeric string into a percentage field | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-017 | The percent suffix is rendered by the application, not typed by the user | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-018 | Editing any percentage field enables the Save button | Yes |
| TC-SVC-BAS-019 | Reverting an edited percentage field to its original value disables Save | Yes |
| TC-SVC-BAS-020 | Saving an edited percentage field persists the new value after reload | Yes |
| TC-SVC-BAS-021 | Overwriting an edited value before saving persists the second value | Yes |
| TC-SVC-BAS-022 | Navigating away from the page with unsaved edits triggers a confirmation prompt | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-023 | Saving edits to multiple percentage fields in a single Save action | Yes |
| TC-SVC-BAS-024 | Service Type column renders correct labels | Yes |
| TC-SVC-BAS-025 | Clicking a Service Type label cell does not open any editor or dialog | Yes |
| TC-SVC-BAS-026 | Save button is disabled on page load with no edits | Yes |
| TC-SVC-BAS-027 | Save button enables after any percentage edit | Yes |
| TC-SVC-BAS-028 | Column headers render with correct labels | Yes |
| TC-SVC-BAS-029 | All 79 rows render and a named row is readable without scrolling | Yes — NEEDS-LIVE-CONFIRM |
| TC-SVC-BAS-030 | A saved value persists after page reload (surface persistence) | Yes — NEEDS-LIVE-CONFIRM |

## 7. Blocked scenarios

15 scenarios are currently blocked pending a live-enabled walk (NLC-BAS-01 through NLC-BAS-12
plus TC-SVC-BAS-022, TC-SVC-BAS-029, TC-SVC-BAS-030). None of these are expected to fail — they
simply cannot have their assertions finalised until the environment is stable and a walk is completed.

The remaining 15 scenarios are authored and have no unconfirmed behaviour blocking their spec structure, but **none have been executed**. Runtime verification is outstanding — the e2e environment was degraded at the time these cases were authored.

## 8. Coverage summary

| Area | Scenarios |
|---|---|
| Axis 1 positive / BVA | 001, 002, 003 |
| Axis 1 save-cycle persistence | 004, 020, 021 |
| Axis 1 BVA boundary negative | 005, 006, 007 |
| Axis 1 net-zero revert | 008, 019 |
| Axis 1 negative / rejection | 009, 010, 011, 012, 013, 014, 015, 016, 017 |
| Save state transitions | 018, 026, 027 |
| Multi-field save | 023 |
| Navigate-away dirty state | 022 |
| Render-state (Axis 2) | 024, 025, 028 |
| Empty-vol (Axis 2) | 029 |
| Persistence (Axis 2) | 030 |

Specs authored (no open items): 15. Blocked pending live walk: 15. Executed: 0 — runtime verification is outstanding; the e2e environment was degraded when these cases were authored.
