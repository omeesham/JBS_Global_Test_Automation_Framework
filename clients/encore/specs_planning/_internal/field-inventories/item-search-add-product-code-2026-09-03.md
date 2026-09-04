# Field Inventory — Item Search: Add Product Code dialog (NM-2257)

**Module**: item-search-add-product-code
**Client**: encore
**MCP_Session_Date**: 2026-09-03
**MCP_Session_Tool**: Playwright CLI (`playwright-cli`)
**MCP_Tool_Reason**: Deterministic input-trials across three text boxes — headless, unattended, ~40 field probes with grep-over-disk snapshots. LR-038 v2 selects the CLI path; no visual/CSS question and no human-in-loop step.
**Author_Identity**: OWNER (split of the GIVER-authored `item-search-product-code-2026-08-31.md`; the machine enumeration and the field-length walk are cited below, not re-run)
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products (the dialog mounts over the searched grid with a row selected)
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Walk_Mode**: quick

Coverage_Ratio: 82/82 (100%) — the `dialog:add-product-code` machine denominator, every key dispositioned (see Coverage Manifest).
Completion_Record: reports/walk-coverage/isr-pcd--dialog-add-product-code.json (status=complete, elements=82)
Walk_State: module=item-search-add-product-code walked=[dialog:add-product-code]
CrossCheck: clean — no A△B review-set elements were flagged by the enumerator for this run; every key sits in the union denominator and is dispositioned.

> **Provenance — this artifact is a SPLIT, not a new walk.** The Add Product Code dialog was walked
> three times and this file carries all three records: the agent-driven census of 2026-08-31
> (snapshots `.playwright-cli/isr-2026-08-31/dlg-add-pc2.yml`, `caret-add-pc.yml`), the machine
> enumeration of 2026-09-01 (`enumerate-page.mjs` `preSteps` branch: search → row select → opener
> click, portal-aware scan), and the real-save walk of 2026-09-02 plus the field-length walk of
> 2026-09-03. Until 2026-09-04 all of it lived inside
> `item-search-product-code-2026-08-31.md`, which covered both toolbar dialogs. NM-2257 (Add) and
> NM-2255 (View) then split into separate deliverables, so the Add half was lifted here unchanged.
> The sibling file keeps the View dialog, its tabs and the availability button. Nothing was
> re-measured for the split, and no claim here is newer than its cited walk.

jira_tickets: [NM-2257, NM-2253, NM-1386, NM-1742, NM-1765, NM-1835]
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact)

---

## URL(s) visited

- Products page (office 1101) → search → row selected → toolbar:
  - **Add Product Code** → the "Add Product Code" dialog, single tab, a new-entry form scoped to the chosen segment.
  - **Add caret** → the five-segment menu (Item / Sub Class / Class / Sub Category / Category), each entry rescoping the form to that hierarchy level.

## Live-state caveat

The toolbar mounts only with a result row selected, so every reading here was taken after a search
and a row click. The dialog's ancestor chain reflects whichever row was selected when Add opened —
readings are structural (control type, default, validation, enable/disable), never bound to one
product's values.

## Coverage Manifest (machine-enumerated, 2026-09-01)

`dialog:add-product-code` — 82 elements, all dispositioned.

**80 of the 82** keys re-enumerate host-page substrate, shared dialog chrome and toolbar controls
already dispositioned in the sibling artifact's manifest; the dispositions are identical and are not
duplicated here. The **2 add-only** keys:

| Key | Type | Disposition |
|---|---|---|
| `role:combobox:Select product type` | combobox | covered-by-TC: TC-ISR-PCD-007 |
| `role:select:` | select, disabled at rest | covered-by-TC: TC-ISR-PCD-007 — the empty-name native select backing the cascade pair; its options populate on Product Type selection |

## Field Inventory

### Add Product Code — dialog, Item scope (snapshot dlg-add-pc2.yml)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Ancestor chain (Category → Sub Class) | `(none)` | read-only text sections | selected row's chain ("—" where absent) | n/a | static | n/a | |
| Name | `(none) — placeholder "Enter name"` | Plain text | empty, flagged invalid at rest | required; **max 50** (`maxlength=50`) | enabled | n/a | Error icon adjacent while empty. Typing stops at 50 (silent, `aria-invalid` stays false); bypassing the attribute to 60 flags invalid and holds Save disabled — measured 2026-09-03, see the field-lengths walk evidence. |
| Item Description | `(none) — placeholder "Enter item description"` | Plain text | empty, flagged invalid | required; **max 50** (`maxlength=50`) | enabled | n/a | Same two-layer limit as Name (2026-09-03). |
| Oracle Item Number | `(none) — placeholder "Enter oracle item number"` | Plain text | empty | optional; **max 10** (`maxlength=10`) | enabled | n/a | Not required per NM-1765. Typing stops at 10 (2026-09-03). |
| Product Type | `(none) — "Select product type"` | Dropdown / combobox (Radix) | placeholder | required | enabled | **cascade parent** for Service Type | 10 options: EQUIPMENT, CONSUMABLE, FREIGHT, LABOR, EXPENSE, SERVICE CHARGE, DAMAGE WAIVER, EVENT TECHNOLOGY SUPPORT, FEE, CABLES AND CONSUMABLE. The SET is fixed; the rendered ORDER is not — it differed between two live reads a day apart, so assertions compare membership, never sequence. |
| Service Type | `(none) — "Select service type"` | Cascading dropdown | placeholder | required | **disabled at rest**; enables on Product Type selection | filtered by the chosen Product Type (LABOR → a labor-specific list of 15+: Application Development, Operator Labor, Rigging Labor, Setup Charges, …) | Cascade proven live on both halves (enable + filter). |
| Product Organization | `(none) — "Open popover"` | Dropdown / multi-select popover | None | n/a | enabled | n/a | |
| Product Code ID | `(none)` | read-only text | "—" | n/a | static | n/a | Populated only after the record exists. |
| Save | `(none)` | *(action)* | disabled | validity-gated | disabled while required fields are incomplete | n/a | Real save proven 2026-09-02 — see Save-cycle observations. |
| Close (footer + X) | `(none)` | *(action)* | n/a | n/a | enabled | n/a | Dirty close (Product Type selected, Name typed) discards silently, no prompt — probed 2026-08-31, re-probed 2026-09-04 for TC-ISR-PCD-015. |

### Add segment caret menu (snapshot caret-add-pc.yml)

Lists Item · Sub Class · Class · Sub Category · Category. Selecting an entry rescopes the form and
renames the active tab. All five Add segments rescope correctly (verified 2026-09-01 alongside the
View menu's re-verification).

## Labels + Section Names

"Add Product Code" (dialog title) · the ancestor-chain section labels Category / Sub Category /
Class / Sub Class / Item · "Product Code ID" · the placeholders "Enter name", "Enter item
description", "Enter oracle item number", "Select product type", "Select service type" · footer
"Save" / "Close".

## Field-length contract (measured 2026-09-03)

Evidence: `clients/encore/specs_planning/_internal/walk-evidence-item-search-field-lengths-2026-09-03.md`.

| Field | Cap | Enforcement |
|---|---|---|
| Name | 50 | `maxlength=50` stops typing silently; the form model additionally flags invalid and holds Save disabled if the attribute is bypassed |
| Item Description | 50 | same two layers |
| Oracle Item Number | 10 | `maxlength=10` |

Governing requirement is **NM-1742** (product `Name` / `Description` → `NVARCHAR(50)`, keeping the
Oracle integration and the legacy product sync consistent with legacy column sizes). **NM-1386's
"256 characters" is stale** — QA raised the 50-character behaviour as NM-1835 and it was closed as a
rejection. Content / character-class validation is out of scope by owner ruling on that same ticket
(*"the current system allows anything… the field size is all that matters"*), so `.....` is a valid
value and no negative content case may be authored. Covered by TC-ISR-PCD-012 / 013 / 014.

**Positive control** for the second layer: the same scripted value-set at 20 characters cleared both
invalid flags and enabled Save, proving the over-length refusal is the app and not an input method
that never registered.

The **View** dialog carries the identical three limits; they are asserted here rather than there
because this is the dialog NM-2257 owns.

## Save-cycle observations

### Save button behavior

Disabled at rest and while any required field is incomplete. Enables once Name, Item Description,
Product Type and Service Type are all set.

### Save dialog

None — Add Product Code commits directly on click, with no confirmation dialog.

### Post-save toast

"Product created successfully." The dialog closes and the grid refreshes.

### Backend

`POST /navigator/api/product/create` → `{"success":true,"data":{"id":102184}}` (verified live
2026-09-02). Persistence is proven by an Any Field search-back on the created name, never by the
Save click's own return.

### Dirty-state behavior

Closing with unsaved edits discards them silently — no unsaved-changes prompt. Reopening shows an
empty form with Service Type locked again.

## Save & cleanup disposition (2026-09-02)

- **Covered** by TC-ISR-PCD-011 (Item segment): a completed form saves and is confirmed by
  search-back.
- **Cleanup**: there is no hard delete for a product code. The reversal is a deactivate (uncheck
  Active in the View dialog and Save), whose save round-trip was **not** exercised this pass, so the
  save cases leave their per-run-unique codes on 1101. This accumulation is accepted test residue on
  the fully-writable e2e environment (LR-ENC-007), stated here rather than hidden.
- **Segment coverage (LR-066)**: the Item Add segment is real-saved. The other four (Sub Class /
  Class / Sub Category / Category) each open their own hierarchy-level form — the active tab renames
  and the field set differs per level, probed 2026-09-02 with field counts growing Sub Class →
  Category — with its own Save, creating catalog-classification nodes rather than product codes.
  That is a catalog-management feature outside the whole NM-2253 Item Search epic, so they are
  **WAIVED with that stated reason and its probe evidence**, not silently narrowed. A future
  catalog-management effort could cover them.

## Observations

### Bugs / Defects

None. The 50-character limit is the intended behaviour per NM-1742, confirmed by NM-1835 being
closed as a rejection. NM-1386's contradictory "256 characters" line and its QA sign-off are a
**documentation** discrepancy, recorded here and in the field-lengths walk evidence, and deliberately
not filed as a defect.

### Suggestions / Improvements

- The over-length refusal shows no message — the field simply flags invalid. A short "maximum 50
  characters" hint would explain the silent truncation to a user who pasted a longer value.
- NM-1386 should be updated or annotated so its "256 characters" line stops being cited.

## Staleness signal

Re-walk when any of these change: the Product Type option set (10 at reading), the Service Type
cascade behaviour, the three `maxlength` attributes, the create endpoint path, or the absence of a
save-confirmation dialog. The dialog's own controls are stable; the option lists are data-driven and
are asserted by membership, not count.
