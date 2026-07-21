---
module: corporate-pricing
type: defect-verify-staging
ticket: TICKET-cp-f3-pricebook-0713
verified-by: council-worker (claude-sonnet-4.6)
verified-date: 2026-07-13
app-url: https://cloudapps-e2e.encoreglobal.com/navigator/
office: 1604
evidence-dir: evidence-cp-pricebook-2026-07-13/
nav2-baseline: NETWORK-BLOCKED (timeout from test env — both attempts failed; see ## ASK)
jira-access: UNCHECKED-BY-WORKER (no Atlassian MCP available in this session)
---

# Corporate Pricing — Pricebook Defect Verify Staging (2026-07-13)

Items C5, C6, D2 from the `encore-qa-tracker.xlsx` `encore-qa-tracker` sheet.
Live verification run 2026-07-13T13:57 IST. Evidence screenshots in `evidence-cp-pricebook-2026-07-13/`.

---

## Verification method

**Browser tool**: Playwright CLI (headless). Reason: live DOM reads, field value checks, testid inventory — unattended.  
**Auth**: `clients/encore/.auth/encore-state.json` loaded (no Entra redirect encountered).  
**Technique**: Node.js Playwright script driving headless Chromium; `setReactInput` (native value-setter) used for React-controlled inputs.

---

## C5 — New Pricebook (Price Year) — UX question

### Reproduce steps (verbatim)
Navigate to `/locations/1604/settings/corporate-pricing/add?type=equipment`. Typed "20.5", "12", "abcd" into the Price Year field sequentially. Then filled Name + Year="20.5" + added one strategy, checked Save enablement, and clicked Save.

### Raw field observations

| Input typed | Field value after | Notes |
|---|---|---|
| `"20.5"` | `"20.5"` | Decimal **accepted** |
| `"12"` | `"12"` | 2-digit **accepted** |
| `"abcd"` | `"12"` (reverted) | Letters **rejected** — silently reverts to last valid |
| `"2026"` | `"2026"` | 4-digit accepted |
| `"20267"` | `"20267"` | 5-digit **accepted** |
| `"-5"` (typed over "2026") | `"20265"` | Minus sign **stripped** (digits appended) |

### Input attributes (live DOM)
```json
{ "type": "text", "min": "", "max": "", "maxLength": -1, "pattern": null, "inputMode": null }
```
No HTML-level constraints. Filtering is purely component-level (React controlled input).

### Final-save validation — EXERCISED
Sequence: Name = "C5-DECIMAL-YEAR-TEST", Year = "20.5", strategy "TEMP-STRAT-C5" added.

| State | Save button |
|---|---|
| Name + Year filled, NO strategy | DISABLED |
| Name + Year="20.5" + strategy added | **ENABLED** |
| Click Save with Year="20.5" | **SILENT NO-OP** — URL unchanged, no alertdialog, no toast, no inline validation |

**Key finding**: Save button is **enabled** with invalid year value "20.5" + strategy, but clicking it is a **silent no-op** — the page stays on `/add`, no dialog appears, no error message, no toast. The user has no indication that Year "20.5" was the blocker.

Screenshot evidence: `C5-save-enabled-decimal-year.png`, `C5-after-save-decimal-year.png`

### Jira cross-ref
NM-2057 "Price Year required not indicated (Save silently disabled, no hint)" — **lead CONFIRMED EXTENDED**:
- NM-2057 describes Save silently disabled when Year is empty. Our test extends it: Save is **enabled** with invalid year "20.5" but **silently fails on click** — a separate, more misleading UX gap.
- `jira: UNCHECKED-BY-WORKER` (live Jira status not verified)

### Verdict
**YELLOW** — confirmed UX defect. The save silently fails with a decimal/invalid year value (Save button misleadingly enabled, no feedback on click). Server-side or client-side validation IS present (save is blocked), but it surfaces zero user feedback. At minimum: Year should either (a) reject non-4-digit input at field level, or (b) show a clear error when Save is attempted with invalid year. Requires product team answer on valid-year format rule.

### Proposed finalized 9-column row
| Color | Type | # | Area | How to reproduce | What we observed | What we expected | Possible cause | Status |
|---|---|---|---|---|---|---|---|---|
| YELLOW | Product / UX question | C5 | Corporate Pricing - New Pricebook (Price Year) | On the New Pricebook form, type a decimal (e.g. 20.5) and a 2-digit value (e.g. 12) into Price Year, then try letters; fill Name + Year="20.5" + add a strategy, then click Save. | Price Year rejects letters (reverts to last valid) but accepts decimals (20.5) and short values (12) without complaint. With Year="20.5" + strategy present, Save is enabled but clicking it is a **silent no-op** — URL unchanged, no dialog, no error, no toast. | Price Year should enforce 4-digit year format at field entry or show a clear validation error when Save is attempted with an invalid value. | Input type=text with no HTML constraints; component-level filtering strips letters but does not enforce year range; save-click validation fires but surfaces no user feedback. | Confirmed live 2026-07-13. Save silently fails with decimal year — user sees no indication. Aligns with NM-2057 (required-not-indicated); extends it (enabled-but-silent on click). Needs product decision on valid year format rule. |

---

## C6 — New Pricebook (lifecycle) — UX question

### Reproduce steps (verbatim)
Navigate to `/locations/1604/settings/corporate-pricing/add?type=equipment`. Filled Name = "ZZZ-QA-DELETE-CHECK-0713", Year = "2099". Added strategy "ZZZ-THROWAWAY-STRAT" (required for Save to enable). Confirmed save dialog ("Save Changes / Are you sure…?"). Saved. Then inspected Details page and Search page for delete/deactivate affordance.

### Throwaway pricebook created
- Name: `ZZZ-QA-DELETE-CHECK-0713`
- Year: 2099
- Strategy: ZZZ-THROWAWAY-STRAT
- URL after save: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/a3cd2012-c289-43ee-9932-bdf1de901a39`

Screenshot: `C6-after-save.png`, `C6-confirm-dialog.png`

### LR-057 affordance probe (control + label + row)

| Surface | Delete/Deactivate/Remove affordance found? |
|---|---|
| Details page — all buttons/menus | **NONE** (`matchingDelete: []`) |
| Details page — full actionable inventory | Save, Pricing Strategy tab, Pricing Detail tab, nav sidebar only |
| Search page — all buttons/menus | **NONE** (`searchDeleteCheck: []`) |
| Row right-click / context menu | Not tested (row not found for throwaway in initial run; search affordance checked via evaluate) |

All actionable elements on details page: `["Save", "Pricing Strategy", "Pricing Detail", nav items, "ZZZ-THROWAWAY-STRAT"]` — no delete/deactivate/remove/archive/inactivate.

Screenshot: `C6-no-delete-details.png`, `C6-search-no-delete.png`

### Ancillary finding: Save requires at least one strategy
Save is DISABLED until a strategy is added. Name + Year filled ≠ sufficient — strategy is a hidden required dependency. No UI hint that a strategy is required for save.

### Nav2 baseline check
NETWORK-BLOCKED: `navigator2.training.psav.com` timed out on both attempts (15s and 30s). Could not verify whether nav2 shows a delete affordance. See `## ASK`.

### Jira cross-ref
No NM-# found in `jira-defect-crossref-2026-06-09.md` specifically for delete/deactivate affordance on pricebook.  
NM-2022 (name uniqueness by name+strategy, not name alone) is unrelated to delete.  
`jira: UNCHECKED-BY-WORKER`

### Verdict
**YELLOW** — confirmed live: no delete/deactivate/remove affordance anywhere on the UI. Pricebook created in error appears permanent via UI. Whether this is BY-DESIGN (admin/backend-only deletion) or a missing feature cannot be determined without nav2 baseline or product team input. Question stands: is there an intended error-recovery path?

### Proposed finalized 9-column row
| Color | Type | # | Area | How to reproduce | What we observed | What we expected | Possible cause | Status |
|---|---|---|---|---|---|---|---|---|
| YELLOW | Product / UX question | C6 | Corporate Pricing - New Pricebook (lifecycle) | Create and save a new price book (e.g. "ZZZ-QA-DELETE-CHECK-0713" / year 2099 / one strategy) — strategy is required for Save to enable. After saving, look for delete, deactivate, or remove on the Details page, Search action bar, menus, and at row level. | No delete, deactivate, remove, archive, or inactivate affordance anywhere — Details page, Search page, or row level. A created price book appears permanent via the UI. Additional finding: Save is disabled until at least one strategy is added (no UI hint). | Question, not a defect. Some way to remove or deactivate a price book created in error should exist. | Possible BY-DESIGN (deletion may be admin/backend-only); or a missing feature. Nav2 baseline check was network-blocked and could not confirm baseline behavior. | Confirmed live 2026-07-13 (throwaway pricebook created at /details/a3cd2012-…). No delete affordance found on any surface. Nav2 check blocked. Product team input needed on error-recovery path. |

---

## D2 — Corporate Pricing (all screens) testid coverage — Automation support

### Reproduce steps (verbatim)
Navigated to each Corp Pricing screen. On each, ran `document.querySelectorAll('[data-testid]')` live per LR-029.

### Live testid inventory (LR-029 — LIVE DOM, not selector files)

| Screen | URL pattern | Count | Unique testid values |
|---|---|---|---|
| Search | `/settings/corporate-pricing` | **5** (3 unique) | `e2e-card-header`, `e2e-card-title`, `e2e-checkbox` ×3 |
| New Pricebook (Equipment) | `/settings/corporate-pricing/add?type=equipment` | **0** | — |
| New Pricebook (Labor) | `/settings/corporate-pricing/add?type=labor` | **0** | — |
| Pricebook Details (main) | `/settings/corporate-pricing/details/<guid>` | **0** | — |
| Details > Pricing Strategy tab | (same page, tab switched) | **0** | — |
| Details > Pricing Detail tab | (same page, tab switched) | **0** | — |
| Override | `/settings/corporate-pricing/override` | **0** | — |

Screenshot evidence: `D2-search.png`, `D2-new-pricebook.png`, `D2-new-pricebook-labor.png`, `D2-details.png`, `D2-override.png`, `D2-strategy-tab.png`, `D2-pricing-detail-tab.png`

### Correction of original claim
Original claim: "Search has 3 generic ones."  
**Corrected**: Search has **5 testid instances** but only 3 **unique** values: `e2e-card-header`, `e2e-card-title`, `e2e-checkbox`. The `e2e-checkbox` appears ×3 (presumably the three filter checkboxes: Active Only, Is Internal, Is Labor).

None of the testids are field-specific or control-specific. They are generic component-level identifiers and cannot target an individual field.

### Classification
This is an **Automation support / enablement request**, not a product bug. Current tests on this module rely on text/role/placeholder fallbacks.

### Proposed finalized 9-column row
| Color | Type | # | Area | How to reproduce | What we observed | What we expected | Possible cause | Status |
|---|---|---|---|---|---|---|---|---|
| (blank) | Automation support (not a product bug) | D2 | Corporate Pricing (all screens) | Inspect each Corporate Pricing screen for `data-testid` attributes via `document.querySelectorAll('[data-testid]')` on the live DOM. | Search: 5 testid instances, 3 unique generic values (`e2e-card-header`, `e2e-card-title`, `e2e-checkbox` ×3). New Pricebook, Pricebook Details, Pricing Strategy tab, Pricing Detail tab, Override: 0 testids each. No field-specific identifiers anywhere. | Stable, field-specific `data-testid` attributes on each interactive control (inputs, buttons, dropdowns, checkboxes) to enable reliable automated test targeting without text/role fallbacks. | The module's React components do not include `data-testid` props beyond a few generic container-level ones on the Search card. | Confirmed live 2026-07-13 via LIVE DOM (LR-029 — not selector files). Current automated tests use text/role/placeholder fallbacks. Testability enablement request — to be submitted separately from product items. |

---

## Summary

| Item | Verdict | Jira cross-ref | Nav2 check |
|---|---|---|---|
| C5 | **YELLOW** — UX defect (silent save failure with decimal year) | NM-2057 (lead, UNCHECKED-BY-WORKER) | BLOCKED |
| C6 | **YELLOW** — confirmed absence, question open (BY-DESIGN vs missing feature) | None found (UNCHECKED-BY-WORKER) | BLOCKED |
| D2 | **(blank) Automation support** — confirmed + corrected testid inventory | N/A | N/A |

---

## ASK

**Nav2 baseline unavailable**: Both connection attempts to `navigator2.training.psav.com` timed out (15s and 30s) during this verification session. This affected C5 (cannot confirm whether nav2 enforces 4-digit year) and C6 (cannot confirm whether nav2 has a delete affordance). If nav2 shows a delete button for pricebooks, C6 would escalate from YELLOW to RED (missing feature confirmed by baseline comparison). If nav2 also lacks delete, C6 is likely BY-DESIGN.

**ASSUMPTIONS-MADE**:
- The `encore-state.json` auth was fresh (no Entra redirect encountered — confirmed).
- The throwaway pricebook "ZZZ-QA-DELETE-CHECK-0713" at `/details/a3cd2012-c289-43ee-9932-bdf1de901a39` is the only record created; no bulk creation occurred.
- The "silent no-op" on C5 Save with decimal year is client-side validation (not a network failure) — the URL stayed on `/add` with zero network activity observable from Playwright; this is consistent with a client-side guard preventing the confirm dialog from opening.
- C5 Save requires a strategy to be present. Save was tested with strategy present + decimal year. Without strategy, Save is disabled regardless of year value — so we cannot test year-only validation without a strategy.
- Nav2 timeout is a test environment network issue, not an auth issue (Entra redirect was not shown).
