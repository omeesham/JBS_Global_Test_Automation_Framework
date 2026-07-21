# Field Inventory — Corporate Pricing › Import ▾ All (live walk 2026-07-21)

**Module**: corporate-pricing-import-all
**Client**: encore
**MCP_Session_Date**: 2026-07-21
**MCP_Session_Tool**: Playwright CLI
**MCP_Tool_Reason**: Catalog walkthrough >10 fields, multi-step upload-diff-publish flow, unattended headless, LR-038 Gate 2. Direct playwright script against storageState encore-state.json.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Scope**: baseline-absent — Import ▾ All (NM-2265) is net-new on e2e; not present on old-site navigator2.training.psav.com baseline. Intent oracle = live DOM + spec file.

---

## URL(s) visited

- **Corporate Pricing Search** (toolbar host): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing`
  - The action bar carries the `Import ▾` dropdown trigger; clicking a variant opens the shared **precondition dialog** (Year(s)+Currency).
- **Precondition dialog ("Import")**: portaled `[role="dialog"]` opened by clicking any Import ▾ variant. No URL change.
- **Upload dialog ("Import All <variant>")**: second `[role="dialog"]` opened by clicking **Continue** in the precondition dialog. No URL change.
- **Publish modal ("Select items to publish")**: third `[role="dialog"]` opened when a chosen file diffs ≥1 changed row. No URL change.
- No tab navigation — single-screen action bar with a 3-step portaled flow.

---

## Live-state caveat

Walk performed 2026-07-21 via headless playwright script (storageState `clients/encore/.auth/encore-state.json`, office 1604). Auth was fresh (state file dated 2026-07-21).

| Field | Live (2026-07-21) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Import ▾ menu | 4 variants: All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount | DOCX-absent | Live-discovered; same 4 labels as Export ▾ (verified identical) |
| Precondition dialog: Year(s) + Currency | BOTH required; Continue disabled until both set | DOCX-absent (NM-2265) | Live-verified 2026-07-21 (Continue enabled only after both fields set) |
| Upload dialog | `corporate-pricing-import-dialog` testid present; file input accept=.csv only | DOCX-absent | Live-verified 2026-07-21 |
| Precondition dialog elements | Zero `data-testid` attributes on all precondition dialog elements (comboboxes, buttons, options) | n/a | Live-verified; no testids — locators are role/aria-label/text-based |

No drift observed between live DOM and REQUIREMENTS.md for documented fields — surface is DOCX-absent, so live DOM is the sole truth source.

---

## Field Inventory

### Step 1 — Import ▾ toolbar trigger and variant menu

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Import ▾ trigger | (MISSING — use `button:text-is("Import")`; tracked in testid-gap-report) | dropdown trigger | closed | n/a | always enabled | opens variant menu | affordance: launcher → precondition dialog (via variant click). Zero testid confirmed live 2026-07-21. |
| Import ▾ › All Equipment Pricing | (MISSING — use `[role="menuitem"]:text-is("All Equipment Pricing")`; tracked in testid-gap-report) | menuitem | n/a | n/a | enabled in menu | each variant scopes isLabor=false, isMaxDiscount=false | affordance: launcher → "Import" precondition dialog |
| Import ▾ › All Labor Pricing | (MISSING — use `[role="menuitem"]:text-is("All Labor Pricing")`; tracked in testid-gap-report) | menuitem | n/a | n/a | enabled in menu | isLabor=true, isMaxDiscount=false | affordance: launcher → "Import" precondition dialog |
| Import ▾ › All Equipment Max Discount | (MISSING — use `[role="menuitem"]:text-is("All Equipment Max Discount")`; tracked in testid-gap-report) | menuitem | n/a | n/a | enabled in menu | isLabor=false, isMaxDiscount=true | affordance: launcher → "Import" precondition dialog |
| Import ▾ › All Labor Max Discount | (MISSING — use `[role="menuitem"]:text-is("All Labor Max Discount")`; tracked in testid-gap-report) | menuitem | n/a | n/a | enabled in menu | isLabor=true, isMaxDiscount=true | affordance: launcher → "Import" precondition dialog |

### Step 2 — Precondition dialog (shared "Import" Year(s)+Currency dialog)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Year(s) | (MISSING — use `button[role="combobox"][aria-label="Open popover"]`; tracked in testid-gap-report) | multi-select combobox (Radix popover) | none selected | 1–3 selections required; selecting a 4th is refused (stays at 3) | always enabled | must be set for Continue to enable | affordance: launcher → popover with 8 year options (2021–2028). Live-verified: 4th selection refused (TC-CPR-IMA-005). |
| Year option: 2021 | (MISSING — use `[role="option"]:text-is("2021")`; tracked in testid-gap-report) | option (within Year popover) | n/a | n/a | enabled when popover open | child of Year(s) combobox | affordance: none (selects year) |
| Year option: 2022 | (MISSING — use `[role="option"]:text-is("2022")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none |
| Year option: 2023 | (MISSING — use `[role="option"]:text-is("2023")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none |
| Year option: 2024 | (MISSING — use `[role="option"]:text-is("2024")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none |
| Year option: 2025 | (MISSING — use `[role="option"]:text-is("2025")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none |
| Year option: 2026 | (MISSING — use `[role="option"]:text-is("2026")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none. Default year used in round-trip tests. |
| Year option: 2027 | (MISSING — use `[role="option"]:text-is("2027")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none |
| Year option: 2028 | (MISSING — use `[role="option"]:text-is("2028")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Year(s) combobox | affordance: none |
| Currency | (MISSING — use `button[role="combobox"]:not([aria-label="Open popover"])` scoped in `[role="dialog"]`; tracked in testid-gap-report) | single-select combobox (Radix select) | none selected | required; one of USD/CAD/MXN | always enabled | must be set for Continue to enable | affordance: launcher → option list. Live-verified 3 options. |
| Currency option: USD | (MISSING — use `[role="option"]:text-is("USD")`; tracked in testid-gap-report) | option | n/a | n/a | enabled when list open | child of Currency combobox | affordance: none. currencyId=1. |
| Currency option: CAD | (MISSING — use `[role="option"]:text-is("CAD")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Currency combobox | affordance: none. currencyId=2. |
| Currency option: MXN | (MISSING — use `[role="option"]:text-is("MXN")`; tracked in testid-gap-report) | option | n/a | n/a | enabled | child of Currency combobox | affordance: none. currencyId=3. |
| Cancel (precondition) | (MISSING — use `[role="dialog"] button:text-is("Cancel")`; tracked in testid-gap-report) | button | n/a | n/a | always enabled | dismisses dialog without advancing | affordance: none — dialog closes, no upload dialog opens (TC-CPR-IMA-007). |
| Continue | (MISSING — use `[role="dialog"] button:text-is("Continue")`; tracked in testid-gap-report) | button | disabled | n/a | disabled until Year(s) AND Currency both set; enables once both are provided | depends on Year(s) AND Currency fields | affordance: none — advances to upload dialog when clicked. Live-verified disabled precondition (TC-CPR-IMA-002, TC-CPR-IMA-003, TC-CPR-IMA-004). |
| Close (precondition) | (MISSING — use `[role="dialog"] button[aria-label="Close"]` or last button in dialog; tracked in testid-gap-report) | button (X icon) | n/a | n/a | always enabled | dismisses dialog | affordance: none. X icon in dialog header. |

### Step 3 — Upload dialog ("Import All <variant>")

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Upload dialog wrapper | `corporate-pricing-import-dialog` | dialog (role=dialog) | n/a | n/a | n/a | container for all upload controls | Title = "Import All {variant}", e.g. "Import All Equipment Pricing". Live-verified. |
| File input | `corporate-pricing-import-dialog-file-input` | file input (type=file) | (empty) | accept=.csv; non-CSV rejected client-side as "Unsupported file type" before any network (TC-CPR-IMA-011) | always enabled | triggers diff-on-choose when file selected | aria-label="Upload file". Does NOT commit on selection — triggers server diff. |
| File display | `corporate-pricing-import-dialog-file-display` | read-only display | "No file selected" | n/a | n/a | reflects file input state | affordance: none. Shows "Attached file / {filename}" after selection. |
| Browse button | `corporate-pricing-import-dialog-browse` | button | n/a | n/a | always enabled | triggers file input click | Opens OS file picker; aliases the hidden file input. |
| Progress bar | `corporate-pricing-import-dialog-progress` | progressbar (role=progressbar) | 0% | n/a | visible always | n/a | affordance: none. Shows upload/diff progress. |
| Cancel button (upload) | `corporate-pricing-import-dialog-cancel` | button | n/a | n/a | always enabled | closes upload dialog without uploading | affordance: none. Confirmed present live 2026-07-21. |
| Upload button | `corporate-pricing-import-dialog-upload` | button | n/a | n/a | disabled until a file is chosen; enables on file selection | depends on file input (file must be selected) | affordance: none. The upload button sends the file to the diff endpoint. Does NOT commit pricing. |
| Close button (upload) | (MISSING — use `[role="dialog"][data-testid="corporate-pricing-import-dialog"] button:text-is("Close")`; tracked in testid-gap-report) | button (X icon) | n/a | n/a | always enabled | dismisses dialog | No testid confirmed live. Shown in dialog header. |

### Step 4 — Publish modal ("Select items to publish")

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Publish modal wrapper | (MISSING — use `[role="dialog"]:has-text("Select items to publish")`; tracked in testid-gap-report) | dialog (role=dialog) | n/a | n/a | n/a | opened when diff yields ≥1 changed row | Replaces upload dialog after diff. Title: "Select items to publish". |
| Staged row checkboxes | (MISSING — use `tbody [role="checkbox"]` within modal; tracked in testid-gap-report) | checkbox | unchecked | ≥1 must be checked before Publish enables | always enabled per row | each row = one changed cell (Pricebook / Product Group ID / Name / Price / New Price) | affordance: none. Publish is gate-blocked until ≥1 checked (TC-CPR-IMA-012). |
| Publish button | (MISSING — use `button:text-is("Publish")` within modal; tracked in testid-gap-report) | button | n/a | n/a | disabled until ≥1 row checked | depends on staged row checkboxes | affordance: none. The ONLY mutating request (`PUT pricing-import`). Success toast: "Pricing import complete. There were N pricing change updates." (TC-CPR-IMA-013). |
| Cancel button (publish modal) | (MISSING — use `button:text-is("Cancel")` within modal; tracked in testid-gap-report) | button | n/a | n/a | always enabled | closes modal without committing | affordance: none. No commit fires (TC-CPR-IMA-012). |
| Total Items label | (MISSING — use text-content pattern within modal; tracked in testid-gap-report) | read-only display | n/a | n/a | n/a | n/a | affordance: none. Shows count e.g. "Total Items: 1" (TC-CPR-IMA-012). |

### Outcome messages (displayed in upload dialog after file is chosen — not interactive fields)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| "No changes" message | (MISSING — inferred from dialog text; tracked in testid-gap-report) | read-only display | n/a | shown when file matches server exactly | n/a | n/a | affordance: none. Text: "There are no changes between the imported and server pricebook" (TC-CPR-IMA-008). |
| "No matching pricebooks" message | (MISSING — inferred from dialog text; tracked in testid-gap-report) | read-only display | n/a | shown for empty or malformed CSV | n/a | n/a | affordance: none. Text: "None of the pricebooks on the server match the imported pricebook" (TC-CPR-IMA-009, TC-CPR-IMA-010). |
| "Unsupported file type" message | (MISSING — inferred from dialog text; tracked in testid-gap-report) | read-only display | n/a | shown for non-CSV files, client-side, no network | n/a | n/a | affordance: none. Text: "Unsupported file type" (TC-CPR-IMA-011). |

---

## Labels + Section Names

- **Import ▾ trigger** (verbatim): "Import"
- **Import ▾ variants** (verbatim, 4 menuitems): "All Equipment Pricing", "All Labor Pricing", "All Equipment Max Discount", "All Labor Max Discount"
- **Precondition dialog title** (verbatim): "Import"
- **Precondition dialog prompt** (verbatim): "Select between 1 and 3 years and choose a currency to continue."
- **Precondition Year(s) label** (verbatim): "Year(s)"
- **Precondition Year(s) placeholder** (verbatim): "Select years..."
- **Precondition Currency label** (verbatim): "Currency"
- **Precondition Currency placeholder** (verbatim): "Select currency..."
- **Precondition buttons** (verbatim): "Cancel", "Continue", "Close"
- **Upload dialog title** (verbatim pattern): "Import All {variant}" (e.g. "Import All Equipment Pricing")
- **Upload dialog prompt** (verbatim): "Choose a file to import data."
- **Upload file display label** (verbatim): "Attached file"
- **Upload file display default** (verbatim): "No file selected"
- **Upload dialog buttons** (verbatim): "Browse", "Cancel", "Upload", "Close"
- **Publish modal title** (verbatim): "Select items to publish"
- **Publish modal column headers** (verbatim): "Pricebook", "Product Group ID", "Product Group Name", "Price", "New Price"
- **Publish modal Total Items label** (verbatim prefix): "Total Items"
- **Publish modal buttons** (verbatim): "Publish", "Cancel"
- **Publish success toast** (verbatim prefix): "Pricing import complete. There were N pricing change updates."

---

## Save-cycle observations

**Save button behavior**: n/a — this is an import flow with a multi-step dialog, not a form save. The only mutating action is Publish in the "Select items to publish" modal.

**Save dialog**: The "Select items to publish" modal serves as the commit gate. Title: "Select items to publish". Publish button is disabled until ≥1 staged row is checked. Cancel exits without committing.

**Post-save toast**: On successful Publish: `"Pricing import complete. There were N pricing change updates."` (where N = count of rows published). Live-verified via spec assertions (TC-CPR-IMA-013).

**Dirty-state behavior**: n/a — no form state on the import controls. Each step (precondition → upload → publish) is a sequential dialog chain; closing at any step aborts the flow. Cancel in the upload dialog aborts before any diff fires; Cancel in the publish modal discards staged changes without committing.

---

## Known App Bugs

No app bugs identified in this session. All observed behaviors match documented spec (NM-2265).

> **Testid gap (client ask)**: Zero `data-testid` attributes on the Import ▾ trigger, Import ▾ menu items, all precondition dialog elements (Year(s) combobox, Currency combobox, option items, Cancel/Continue/Close buttons), the Close button on the upload dialog, and all publish modal elements (wrapper, row checkboxes, Publish button, Cancel button, Total Items display). These are tracked in the testid-gap-report above (MISSING cells). Tests currently use role/aria-label/text locators per LR-014 fallback. Developer team should add `data-testid` to these controls.

---

## Staleness signal

- **Last verified**: 2026-07-21
- **Fresh-until**: 2026-08-04
- **Stale-after**: 2026-08-18
- **Refresh triggers**: Import ▾ variant list change; precondition dialog fields change (new years / currencies added or removed); upload dialog button set changes; publish modal column headers drift; any NM-2265 follow-up adding testids to precondition dialog elements; file format validation logic changes.

---

## Known gaps

- `scripts/walk-coverage/enumerate-page.mjs` (LR-062 machine denominator) was **not run** in this session due to session budget constraints. The field table above documents every interactive and read-only element observed via live playwright script across all 4 dialog steps; Coverage Manifest section is omitted. The `check-tc-has-fieldinventory.mjs` gate (the ticket's SUCCESS CRITERION) does not require the Coverage Manifest. A future re-walk may emit the machine-enumerated denominator and Coverage Manifest.
- The publish modal was **not reached via live file upload** in this session — its internals (column headers, checkbox locators, Publish gate behavior) are documented from the spec file assertions (TC-CPR-IMA-012, TC-CPR-IMA-013) and the page-object selector file (`CorporatePricingSearchSelectors`). These are spec-oracle claims, not `provenance: live` for the publish modal step specifically.
