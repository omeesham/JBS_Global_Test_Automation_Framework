# Discount Optimization — Special Rate Exemptions by Service Type Test Plan

**Module**: discount-optimization (tab 2 — Special Rate Exemptions by Service Type)
**Test Cases**: specs_planning/test-cases/setup/discount-optimization/discount_optimization_exemption_test_cases.md
**Location Under Test**: 1604 (Parker Palm Springs)
**Updated**: 2026-08-11
**Implemented**: not yet (pending generation)
**Discovery basis**: live walk of office 1604 on 2026-08-11; every interactive control on the page was enumerated and accounted for.
**Baseline**: baseline-absent (tab 2 does not exist on the legacy Navigator site; confirmed by old-site baseline artifact dated 2026-08-10)

> **Surface model**: Tab 2 ("Special Rate Exemptions by Service Type") is an editable grid on the same route as Tab 1 (`/navigator/locations/1604/settings/discount-optimization-settings`). Switching tabs does not change the URL. The tab carries a `Search by service type` text input, `Cancel` and `Save` buttons, and a two-column table (`Service Type`, `Exempt`). The API `GET /navigator/api/discount/optimization/service-types?skipPagination=true` returns all rows on load (29 at time of enumeration); filtering is client-side. The parent surface takes roughly 22 seconds to first paint — every automation step that waits for content must use a content condition (rows visible in the DOM), never a fixed timeout and never `networkidle`. Tabs carry no stable test IDs (auto-generated Radix ids); the tab is selected by visible text and accessible role. Source: machine enumeration `reports/walk-coverage/dop-tab2.json` (2026-08-11) and field inventory dated 2026-08-11. Ticket NM-3340 (open, Blocker) will change the service-type membership list — no test hardcodes a row count or a specific service-type set.

---

## Selector Mapping (alias → live selector)

| Alias | Element | Live selector | Stability |
|---|---|---|---|
| `tabExemptions` | Tab 2 trigger | `[role="tab"]:text-is("Special Rate Exemptions by Service Type")` | text-anchored |
| `panelExemptions` | Tab 2 panel | `[role="tabpanel"]:visible` (scoped after tab activation) | role-anchored |
| `txtSearch` | Search input | `input[placeholder="Search by service type"]` | placeholder-anchored |
| `btnCancel` | Cancel button (tab 2) | `button:text-is("Cancel")` (scoped inside panel) | text-anchored |
| `btnSave` | Save button (tab 2) | `button:text-is("Save")` (scoped inside panel) | text-anchored |
| `tblRows` | Data rows | `tbody tr` (scoped inside panel) | structural |
| `colHeaderServiceType` | Column header | `th:text-is("Service Type")` | text-anchored |
| `colHeaderExempt` | Column header | `th:text-is("Exempt")` | text-anchored |
| `chkExempt(name)` | Per-row Exempt checkbox | `[role="checkbox"][aria-label*="Exempt ${name}"]` | label-anchored |
| (service API) | Service types endpoint | request URL contains `/navigator/api/discount/optimization/service-types` | URL-anchored (network) |

Page route: navigate to `/navigator/locations/1604/settings/discount-optimization-settings`, wait for the tab list to render (content condition), then click `tabExemptions`.

**No `radix-*` id selectors.** The auto-generated Radix ids observed in the enumeration (e.g., `radix-_r_v_-content-serviceTypeExemptions`) change between renders and must not appear in any automation file.

---

## Scenario: TC-DOP-EXM-001 — Tab activates and surface renders with expected columns and rows

1. Navigate to `/navigator/locations/1604/settings/discount-optimization-settings`.
2. Wait for `[role="tablist"]` to be visible (content condition; do not use `networkidle` or a fixed wait — the surface takes ~22 s to paint).
3. Click `tabExemptions`; wait for `panelExemptions` to be visible and `tblRows` count to be > 0.
4. Assert: `colHeaderServiceType` is visible inside the panel.
5. Assert: `colHeaderExempt` is visible inside the panel.
6. Assert: `tblRows` count > 0 (rows rendered; do not assert exact count — NM-3340 will change membership).
7. Assert: `btnCancel` is visible inside the panel.
8. Assert: `btnSave` is visible inside the panel.

---

## Scenario: TC-DOP-EXM-002 — Save is disabled in pristine state

1. Activate tab 2 (TC-DOP-EXM-001 precondition).
2. Assert: `btnSave` has `disabled` attribute or `aria-disabled="true"` (no changes pending).

---

## Scenario: TC-DOP-EXM-010 — Search filters rows; clearing restores the full list; no-match shows empty state

1. Activate tab 2; record `baselineCount = tblRows.count()`.
2. Fill `txtSearch` with `"HSIA"`.
3. Assert: `tblRows.count() <= baselineCount` (list narrowed).
4. Assert: every visible row's "Service Type" cell text contains `"HSIA"` (case-insensitive).
5. Clear `txtSearch` (fill with `""`).
6. Assert: `tblRows.count() === baselineCount` (full list restored).
7. Fill `txtSearch` with `"ZZZNO-MATCH-99999"`.
8. Assert: `tblRows.count() === 0` (empty state; or assert empty-state indicator visible if the table is replaced by a message element).
9. Clear `txtSearch`.
10. Assert: `tblRows.count() === baselineCount` (full list restored again).

---

## Scenario: TC-DOP-EXM-011 — Search is case-insensitive

1. Activate tab 2; record `baselineRows`.
2. Fill `txtSearch` with `"EQUIPMENT"` (uppercase).
3. Capture `countUpper = tblRows.count()`; assert > 0.
4. Clear `txtSearch`; fill with `"equipment"` (lowercase).
5. Assert: `tblRows.count() === countUpper` (same result set).
6. Clear `txtSearch`.

---

## Scenario: TC-DOP-EXM-020 — Save cycle: pristine disabled → enabled by valid change → persists after reload; Cancel discards

1. Activate tab 2; assert `btnSave` disabled.
2. Read `originalState = chkExempt("Equipment Rental").getAttribute("aria-checked")`.
3. Click `chkExempt("Equipment Rental")`; assert `aria-checked` changed to opposite value; assert `btnSave` enabled.
4. Click `btnCancel`; assert `chkExempt("Equipment Rental") aria-checked === originalState`; assert `btnSave` disabled (Cancel discarded the change).
5. Click `chkExempt("Equipment Rental")` again to the opposite of `originalState`; assert `btnSave` enabled.
6. Click `btnSave`; wait for `btnSave` to become disabled (save accepted, form pristine again) — use a content condition, not a fixed timeout.
7. Reload the page; activate tab 2; wait for rows.
8. Assert: `chkExempt("Equipment Rental") aria-checked` equals the value that was saved in step 5 (change persisted).
9. Restore: click `chkExempt("Equipment Rental")` back to `originalState`; click `btnSave`; wait for Save to go disabled (data restored).

---

## Scenario: TC-DOP-EXM-021 — Cancel discards multiple simultaneous changes

1. Activate tab 2.
2. Record `stateA = chkExempt("Equipment Rental").getAttribute("aria-checked")`.
3. Record `stateB = chkExempt("Digital Branding").getAttribute("aria-checked")`.
4. Toggle both checkboxes; assert both changed; assert `btnSave` enabled.
5. Click `btnCancel`.
6. Assert: `chkExempt("Equipment Rental") aria-checked === stateA` (first change discarded).
7. Assert: `chkExempt("Digital Branding") aria-checked === stateB` (second change discarded).
8. Assert: `btnSave` disabled.

---

## Environment Notes

- **Wait discipline**: The parent surface takes ~22 seconds to first paint. Every step that waits for tab-2 content must use a Playwright `expect` poll or `waitFor` with a content condition (e.g., `tblRows.count() > 0`). Never use `page.waitForTimeout()` or `waitForLoadState('networkidle')` on this page.
- **Tab selection**: Select the tab by `[role="tab"]:text-is("Special Rate Exemptions by Service Type")`. Do not use any `radix-*` generated id.
- **Mutation discipline**: TC-DOP-EXM-020 is the only case that writes to the live environment. It must restore the original value in its final step. No other case modifies data.
- **NM-3340 impact**: When NM-3340 lands, the service-type membership list will change. Any case that uses a specific service-type name (e.g., "Equipment Rental") should verify that row still exists before asserting on it; the row-count baseline must always be read dynamically from the DOM, never hardcoded.
- **Exempt column assertion**: Cases use `aria-checked` on the Radix checkbox element. If the column renders as a non-checkbox indicator (e.g., an SVG icon), update assertions to use the appropriate DOM attribute after live confirmation.
- **Automation account permissions**: TC-DOP-EXM-020 requires write permission. If the automation account does not have permission to save changes on this tab, mark TC-DOP-EXM-020 as Manual with reason "write permission not confirmed for automation account."

---

## Coverage Map

| TC ID | Anchor | Surface families covered | Priority | Type |
|---|---|---|---|---|
| TC-DOP-EXM-001 | TC-DOP-EXM-001 | surface loads / structural | High | Initialization / Structural |
| TC-DOP-EXM-002 | TC-DOP-EXM-001 | save-cycle / pristine | High | Behavioural |
| TC-DOP-EXM-010 | TC-DOP-EXM-010 | result-fidelity (QUICK), empty-vol (QUICK) | High | Behavioural / Search |
| TC-DOP-EXM-011 | TC-DOP-EXM-010 | result-fidelity (QUICK) | Medium | Behavioural / Search |
| TC-DOP-EXM-020 | TC-DOP-EXM-020 | persistence (QUICK) | High | Behavioural / Save-cycle |
| TC-DOP-EXM-021 | TC-DOP-EXM-020 | save-cycle / Cancel | Medium | Behavioural / Save-cycle |

All three anchors resolve:
- **TC-DOP-EXM-001** → TC-DOP-EXM-001, TC-DOP-EXM-002 (2 cases)
- **TC-DOP-EXM-010** → TC-DOP-EXM-010, TC-DOP-EXM-011 (2 cases)
- **TC-DOP-EXM-020** → TC-DOP-EXM-020, TC-DOP-EXM-021 (2 cases)
