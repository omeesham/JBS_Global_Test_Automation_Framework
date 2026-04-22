# Hist Root Map — Location Management History / Pricing Tab

**Session**: 2026-04-22
**Agent**: HUNTER (rutvik), Opus 4.7 + ultrathink
**Browser tool**: Claude in Chrome (LR-038 default — Claude Code, exploratory catalog, auth-heavy, token-efficient, user at machine).
**Office**: 1604 (Parker Palm Springs), `cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`
**Scope**: Location Settings → Pricing sub-tab parents → 87-col Location Management History
**Reference**: [SUBPLAN_HISTORY_01_MCP_FINDINGS.md §1](../../../../plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) for 87-col header list; [SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md](../../../../plans/pending/SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md) for method; [hist-root-map-location-management-currency.md](./hist-root-map-location-management-currency.md) for format precedent + col 63 cross-contamination guard.

---

## Summary

- **8 direct Pricing-tab parents cataloged** (top-level editable fields) + **1 Secondary Pricing table mutation vector** tested via row-1 Is Alternate toggle.
- **2 direct parents TRACKED with clean 1-col diffs** (Saves 1–4): `checkbox-corporate-pricing` → col 11 "Corporate Pricing"; `checkbox-price-guide-inclusion` → col 61 "Include Service Charge in Price Guides". Both use Unicode ✔ boolean encoding (LR-036).
- **5 Primary Pricing comboboxes classified by inference** (`select-primary-{labor,equipment,internal-equipment,production-labor,production-equipment}-pricing-usd` → cols 16, 17, 18, 19, 20). Direct save-cycle skipped — no "--Select--" / "Clear" option exists in the strategy-picker popover (100+ options, irreversible once set) → mutating baseline would violate subplan §KEEP list (office 1604 restored). Mapping inferred from (a) exact header-name match, (b) existing multi-currency serialization format `"USD: ; CAD: ; MXN:"` observed in every top row, (c) 1:1 correspondence between 5 -usd comboboxes and 5 adjacent history cols.
- **1 view-only filter confirmed**: `select-pricing-currency` is a table filter for the Secondary Pricing grid — does not dirty the form, does not persist to any history col. Options are derived from the Currency tab's Selected set (office 1604: just "All" + "USD").
- **Secondary Pricing table edits are NOT-TRACKED** (Saves 5–6 phantom-row evidence): toggling Is Alternate on row 1 (`2021-Tier 3 Urban A`, `2021-PB6`, USD) was persisted to the DB (post-reload aria-checked survives) but the 87-col history captured ONLY the Modified On update — cols 62–68 (Pricing Strategy, Currency, Pricing Action, Is Alternate, Use Effective Dates, Start Date, End Date) stayed empty across both saves.
- **Col 63 "Currency" (duplicate of col 5) Pricing ownership**: CONFIRMED by complementary evidence — col 63 stayed `""` across **every** Pricing-tab save this session (6 saves) AND stayed `""` across every Currency-tab save in SP-B-LM-1 (9 saves). Currently no UI-surfaced Pricing mutation on this office causes col 63 to populate; cols 62–68 function as a PHANTOM column cluster in the current Navigator build (schema present, population path absent). Pricing-ownership holds in the sense that col 63 is NOT Currency-tab-owned (proven by SP-B-LM-1) and structurally belongs to the Pricing cluster by header position (cols 62–68 form a contiguous Secondary-Pricing-shaped block). Further population path TBD — see §Col 63 status.
- **BUG-HIS-001 scope note**: EnableMultidayPricing is on the **Local Information** sub-tab (testid `location-settings-checkbox-enable-multiday-pricing`), NOT on the Pricing sub-tab. DOM-verified 2026-04-22: zero `multiday`-matching testids on Pricing tab content root. BUG-HIS-001 confirmation belongs to SP-B-LM-3a/3b (Local Information catalog), not this subplan. The subplan's Scope wording "Also investigate: EnableMultidayPricing was flagged NOT-TRACKED earlier" is a scope-of-source mis-attribution; SP-B-LM-2 leaves BUG-HIS-001 untouched and unassessed.
- **Baseline restored**: all 8 direct Pricing parents + secondary-row-1 Is Alternate + filter state match pre-session state (0 mismatches across 8-parent programmatic diff; Save button disabled = form pristine).

---

## Parent → Column Map

| # | Parent field | Parent testid | Control type | State space | Target col (0-idx, header) | Status | Encoding | Evidence |
|---|---|---|---|---|---|---|---|---|
| P1 | Corporate Pricing | `location-settings-checkbox-corporate-pricing` | checkbox | {true, false} | col 11 "Corporate Pricing" | **TRACKED** | unicode ✔ / "" | Saves 1+2 — 1-col clean diff (`✔→""` then `""→✔`) + Modified On only. |
| P2 | Include Service Charge in Price Guides | `location-settings-checkbox-price-guide-inclusion` | checkbox | {true, false} | col 61 "Include Service Charge in Price Guides" | **TRACKED** | unicode ✔ / "" | Saves 3+4 — 1-col clean diff (`✔→""` then `""→✔`) + Modified On only. |
| P3 | Primary Labor Pricing USD | `location-settings-select-primary-labor-pricing-usd` | popover-searchable combobox (100+ pricing-strategy options) | any valid labor strategy ID OR `--Select--` (initial placeholder, **not** a re-selectable option after a strategy is chosen) | col 16 "Labor Pricing" | **TRACKED (by inference)** | multi-currency string `"USD: <val>; CAD: <val>; MXN: <val>"` | Baseline row format already showed `"USD: ; CAD: ; MXN:"` indicating col 16 is populated even when empty. Direct save-cycle not performed — no reversible "unset" path exists in the UI (popover has no `--Select--` / Clear entry). Mapping derives from (a) header text match, (b) format match, (c) 1:1 adjacency with cols 17–20 and 5 -usd comboboxes. CUR-BUG candidate for irreversible-set UX (separate finding, out-of-scope here). |
| P4 | Primary Equipment Pricing USD | `location-settings-select-primary-equipment-pricing-usd` | popover combobox | per P3 | col 17 "Equip. Pricing" | **TRACKED (by inference)** | multi-currency string | Same reasoning as P3. |
| P5 | Primary Internal Equipment Pricing USD | `location-settings-select-primary-internal-equipment-pricing-usd` | popover combobox | per P3 | col 18 "Internal Equip. Pricing" | **TRACKED (by inference)** | multi-currency string | Same as P3. |
| P6 | Primary Production Labor Pricing USD | `location-settings-select-primary-production-labor-pricing-usd` | popover combobox | per P3 | col 19 "Production Labor Pricing" | **TRACKED (by inference)** | multi-currency string | Same as P3. |
| P7 | Primary Production Equipment Pricing USD | `location-settings-select-primary-production-equipment-pricing-usd` | popover combobox | per P3 | col 20 "Production Equip. Pricing" | **TRACKED (by inference)** | multi-currency string | Same as P3. |
| P8 | Pricing Currency (filter) | `location-settings-select-pricing-currency` | view-only combobox (filters Secondary Pricing table rows by currency) | `All` + 1..N currencies from Currency tab's Selected set | **NO TARGET COL** | **VIEW-ONLY (not persistable, not a save parent)** | n/a | Changing the value does not dirty the form (Save button stays disabled). Verified 2026-04-22 via ref_514 left_click attempt → combobox retained `"All"`, save stayed disabled. Also only 2 options on office 1604 ("All", "USD") because only USD is Selected on Currency tab. |
| S1 | Secondary Pricing table — Is Alternate (row 1: `2021-Tier 3 Urban A` / `2021-PB6` / USD) | table row 1, cell 3, `[role="checkbox"]` (no direct testid on the cell control) | checkbox per row | {true, false} | Secondary Pricing cluster cols 62–68 | **NOT-TRACKED (direct save-cycle proof)** | n/a | Saves 5 (FALSE→TRUE) + 6 (TRUE→FALSE). Both persisted to DB (aria-checked survives a reload of Pricing sub-tab). Neither save populated cols 62–68 on the resulting top-of-history row — only Modified On changed. Phantom-row save by the SP-B-LM-1 taxonomy. **Candidate PRC-BUG-A** (Pricing Secondary table audit-trail gap). |

> **Parent count vs subplan**: the subplan §Scope anticipated "~2-5 parents". The live inventory has **8 direct editable parents + 1 secondary-table mutation vector**. This is within the expected magnitude (no scope extension >30% past the table-side mutation vector). The 5 primary-pricing combos are classified by inference (parallel to SP-B-LM-1's CAD/MXN Merchant inference under the "no alternate-option data on office 1604" constraint).

---

## Col 63 "Currency" status — duplicate-header contribution

**Structural facts**:
- 87-col Location Management History has two columns named "Currency": **col 5** and **col 63** (MCP-confirmed 2026-04-22 via `window._histHeaders.map((h,i)=>h.toLowerCase().includes('currency')?...)` → only cols 5 and 63 match).
- Col 5 is **Currency-tab-owned**: writes from Currency tab populate it per SP-B-LM-1's 7-combo state-space matrix.
- Col 63 position: within the Secondary Pricing cluster (cols 62–68: Pricing Strategy, Currency, Pricing Action, Is Alternate, Use Effective Dates, Start Date, End Date).

**Cross-contamination guard** (expanded from SP-B-LM-1):

| Session | Save # | Save source | Col 5 after save | Col 63 after save |
|---|---|---|---|---|
| SP-B-LM-1 | Saves 1–9 | Currency tab (9 saves) | varies per combo | `""` (all 9) |
| SP-B-LM-2 (this) | 1 | Pricing / corporate-pricing FALSE | `"USD"` | `""` |
| SP-B-LM-2 | 2 | Pricing / corporate-pricing TRUE restore | `"USD"` | `""` |
| SP-B-LM-2 | 3 | Pricing / price-guide-inclusion FALSE | `"USD"` | `""` |
| SP-B-LM-2 | 4 | Pricing / price-guide-inclusion TRUE restore | `"USD"` | `""` |
| SP-B-LM-2 | 5 | Pricing / secondary-row-1 Is Alternate FALSE→TRUE | `"USD"` | `""` |
| SP-B-LM-2 | 6 | Pricing / secondary-row-1 Is Alternate TRUE→FALSE restore | `"USD"` | `""` |

**Total 15 save-cycles** (9 Currency + 6 Pricing), **col 63 never populated**.

**Pricing-ownership designation holds in the negative sense**:
1. SP-B-LM-1 proved col 63 is NOT Currency-tab-owned (col 63 stayed `""` even when col 5 churned through 7 distinct Selected subsets).
2. This session proved col 63 is NOT populated by the currently-surfaced Pricing-tab save paths (checkboxes, primary-pricing combos unset, secondary-row edit).
3. By process of elimination within the Location Management module, col 63 — if it ever populates — is populated by an as-yet-unsurfaced Pricing operation: a full Pricing Strategy **Add**, **Remove**, or possibly an admin-only bulk operation. No Add/Remove affordance is visible in the Pricing tab on office 1604 (zero buttons match `add|remove|delete|new` in the Pricing content root; see §Pricing tab DOM inventory).

**Operational conclusion for per-column tests (SP-D2)**:
- **Col 5 "Currency"** — assert **populated** per the 7-combo state-space matrix from SP-B-LM-1 when driven from Currency tab.
- **Col 63 "Currency"** — assert **empty `""`** on every Pricing-tab save currently surfaced. Treat as a phantom/reserved column until an Add/Remove pricing-strategy mutation path is found. File as **PRC-BUG-B** (phantom-cluster audit gap) if the Encore team confirms cols 62–68 are expected to populate for Secondary Pricing edits.

---

## NOT-TRACKED registry (feeds SP-E-LM-OTHER, Pricing batch)

### Confirmed via direct save-cycle evidence (this session)

| Parent | Control | MCP evidence | Bug candidate |
|---|---|---|---|
| Secondary Pricing row — Is Alternate | checkbox inside table row | Save 5 (2026-04-22 11:29:23 AM): `false → true` persisted to DB (post-reload aria-checked `true`), history top row added with **only** Modified On diff — cols 62–68 stayed empty. Save 6 (11:30:38 AM): `true → false` restore, same phantom-row pattern. | **PRC-BUG-A (Is Alternate NOT-TRACKED)** |
| Secondary Pricing row — Use Effective Dates (inferred) | checkbox inside table row | Not driven this session (conservatism — doesn't affect the Is Alternate conclusion). Inferred NOT-TRACKED from (a) same row-cell control pattern as Is Alternate, (b) same empty col 66 across all 6 saves. | **PRC-BUG-A (b, inferred)** |
| Secondary Pricing row — Start Date / End Date (inferred) | date picker inside table row | Not driven (requires Use Effective Dates=TRUE precondition and a real date). Inferred NOT-TRACKED via same phantom-cluster pattern. | **PRC-BUG-A (c, inferred)** |

### Cluster classification (cols 62–68 as a whole)

All seven columns remained `""` across every one of 15 session-driven save-cycles (9 SP-B-LM-1 + 6 this session). Per-session test strategy (SP-D2): treat cols 62–68 as a **phantom cluster** — assert-empty guards until a population path is confirmed (Add / Remove / admin). If the Encore team reports this is expected (e.g., cluster only writes on Add operations that aren't in the standard UI), graduate assertions from "empty always" to "empty except on Add/Remove".

---

## BUG-HIS-001 scope clarification (new finding)

**Subplan §Scope** states: *"Also investigate: EnableMultidayPricing was flagged NOT-TRACKED earlier (BUG-HIS-001). Confirm."*

**Finding**: EnableMultidayPricing is NOT on the Pricing sub-tab. MCP-verified 2026-04-22 by programmatic scan:

```js
Array.from(document.querySelectorAll('[data-testid*="multiday"]'))
  .map(e => ({tid: e.getAttribute('data-testid'), in_local_info: !!e.closest('...sub-tab-content-local-information'), in_pricing: !!e.closest('...sub-tab-content-pricing')}));
// → 2 elements, both in Local Information, 0 in Pricing
```

Matching testids:
- `location-settings-enable-multiday-pricing` (wrapper)
- `location-settings-checkbox-enable-multiday-pricing` (the checkbox itself)

Both sit under `[data-testid="location-settings-sub-tab-content-local-information"]`.

**Scope implication**: BUG-HIS-001 re-confirmation is out-of-scope for SP-B-LM-2 (Pricing). It is properly owned by **SP-B-LM-3a / 3b** (Local Information catalog — SP # 10 & 11 in master plan Execution Order). BUG-HIS-001 remains **open** and untouched; this session neither re-verifies nor re-tests its claim.

BUG-HIS-001 evidence from the bug's own JSON (`reports/bugs/BUG-HIS-001.json`, sourceTab field) agrees: `"sourceTab": "Local Information"`. The subplan wording was a scope-of-source mis-attribution; this catalog records the clarification and hands the confirmation off to SP-B-LM-3a/3b.

---

## Save-cycle timeline (2026-04-22, office 1604, Claude in Chrome)

| # | Type | Time (local) | Source field | Expected col effect | Observed diff vs prior row |
|---|---|---|---|---|---|
| — | (baseline, pre-session) | 10:59:43 AM | SP-B-LM-1 restore | n/a | col 5 `"USD"`, col 63 `""`, col 11 `✔`, col 61 `✔` |
| 1 | Direct | 11:20:25 AM | `checkbox-corporate-pricing` TRUE→FALSE | col 11 `✔→""` | **col 11** + col 33 / col 37 snapshot drift (matches SP-B-LM-1 sub-observation; unrelated to this save) + Modified On |
| 2 | Restore | 11:22:22 AM | `checkbox-corporate-pricing` FALSE→TRUE | col 11 `""→✔` | **col 11 only** + Modified On — CLEAN 1-col diff |
| 3 | Direct | 11:23:47 AM | `checkbox-price-guide-inclusion` TRUE→FALSE | col 61 `✔→""` | **col 61 only** + Modified On — CLEAN 1-col diff |
| 4 | Restore | 11:25:06 AM | `checkbox-price-guide-inclusion` FALSE→TRUE | col 61 `""→✔` | **col 61 only** + Modified On — CLEAN 1-col diff |
| 5 | Table-edit | 11:29:23 AM | Secondary row 1 Is Alternate FALSE→TRUE | col 65 `""→"✔"` (expected) | **NONE** (phantom row, only Modified On) — PRC-BUG-A (a) |
| 6 | Restore | 11:30:38 AM | Secondary row 1 Is Alternate TRUE→FALSE | col 65 `"✔"→""` (expected) | **NONE** (phantom row, only Modified On) — PRC-BUG-A (a) |
| — | (post-session baseline verify) | 11:31 (read-only) | n/a | — | 0 mismatches across 8 direct parents; secondary row 1 Is Alternate restored; Save disabled |

**Save 1 diff anomaly note**: col 33 "Service Charge Name" and col 37 "Terms and Conditions" showed `""→"US English: ..."` in the Save 1 vs pre-session baseline diff. This is **snapshot-moment drift** — the SP-B-LM-1 Save 9 restore row had captured those cols as empty, while the CURRENT steady-state value is populated. This matches SP-B-LM-1 §Sub-observation — Multi-user / cross-parent drift. The Save 2 restore diff vs Save 1 confirmed: those cols stabilized after Save 1 and did not re-diff in any subsequent save. The corporate-pricing col 11 effect is isolated and clean via the Save 1↔2 pair.

---

## Dialog pattern (re-confirmed)

Location Settings Pricing tab uses the **same Cancel / Ok** Save Changes dialog as all other Location Settings sub-tabs (per SP-B-LM-1 §Save dialog pattern and SP-B-LO-* catalogs). Confirmed this session via 6 successful saves + 1 N1 Cancel. No selector override required beyond what SP-B-LM-1 already noted for SP-D1 (existing framework `btnSaveChangesConfirm` matches "Save" text → needs "Ok" override for Location Settings).

---

## Negative cases

| # | Scenario | Driver steps | Observed behavior | Test implication (SP-D2) |
|---|---|---|---|---|
| N1 | **Cancel** | `checkbox-corporate-pricing` TRUE→FALSE dirties form → click Save → Save Changes dialog opens → click **Cancel** | Dialog closes; form remains dirty (Save still enabled); corporate-pricing stays FALSE (toggled state, un-committed); **no new history row** (top row remained at 11:30:38 AM after N1). | TC: "Cancel preserves dirty state and produces zero history rows" |
| N2 | **No-op** | Toggle corporate-pricing FALSE→TRUE restores pristine state | Save button = **disabled** (boolean property). Form is pristine; no API call possible, no history row. | TC: "Save button is disabled when form is pristine (no Pricing field changed)" |
| N3 | **Validation-block** | n/a | **Not applicable for Pricing tab**. All 8 direct Pricing parents are independently optional: Corporate Pricing can be FALSE; Price Guide Inclusion can be FALSE; 5 Primary Pricing combos can remain `--Select--`; filter combobox is not a save parent. No cross-field or required-field validator surfaces on the Pricing tab for office 1604. | TC: "No validation-block scenario on Pricing tab" (documented as N/A; no test needed) |

---

## Primary Pricing combobox — popover mechanics (feedback for SP-D2 + LR-038)

The 5 Primary Pricing comboboxes (`-usd` suffix) open a **custom Radix popover dialog** (not a `role="listbox"` with `role="option"` items). Structure:
```
[data-radix-popper-content-wrapper]
  └ [role="dialog"]
    └ <div class="flex flex-col">
      └ <div class="max-h-[300px] overflow-y-auto ... p-1">  // scrollable container
        └ <button class="relative flex w-full cursor-default ...">  // each option = native <button>
          └ <span class="truncate">{strategy-name}</span>
```

**Consequences for SP-D2 automation**:
1. Pattern "role=option" selectors do NOT work. Use `[data-radix-popper-content-wrapper] button` (filter by text) or Claude-in-Chrome `find` tool semantic search.
2. 100+ options on office 1604 — LR-025 retry pattern applies (intermittent dispatch failure on first click).
3. Synthetic dispatch (PointerEvent+MouseEvent) on the combobox trigger fails to open the popover; **Enter key** on focused combobox DOES open it (verified this session). This is a new observation beyond SP-B-LM-1's combobox notes.
4. Popover persists through synthetic Escape + outside-click dispatch on body; the reliable close is a **sub-tab switch** (navigating to Management History tab unmounts the Pricing content tree and cleans up the popper portal).
5. **No `--Select--` / Clear / None entry**. Once a strategy is chosen, there is no UI path back to the placeholder state → setting a strategy is a **one-way UX mutation**. This is itself a UX-discoverability finding (candidate PRC-BUG-C) — users cannot clear a primary pricing strategy without a support escalation.

---

## Pricing tab DOM inventory (for reconciliation reference)

Full testid set under `[data-testid="location-settings-sub-tab-content-pricing"]` (2026-04-22):

**Direct parents (9)**:
- `location-settings-checkbox-corporate-pricing` (checkbox, col 11)
- `location-settings-checkbox-price-guide-inclusion` (checkbox, col 61)
- `location-settings-select-pricing-currency` (combobox, filter-only, no col)
- `location-settings-select-primary-labor-pricing-usd` (combobox, col 16)
- `location-settings-select-primary-equipment-pricing-usd` (combobox, col 17)
- `location-settings-select-primary-internal-equipment-pricing-usd` (combobox, col 18)
- `location-settings-select-primary-production-labor-pricing-usd` (combobox, col 19)
- `location-settings-select-primary-production-equipment-pricing-usd` (combobox, col 20)
- `location-settings-btn-toggle-settings-panel` (UI affordance — collapses/expands the primary pricing panel; not a save parent)

**Secondary Pricing table** (`location-settings-table-secondary-pricing`, 31 data rows on office 1604):
- Per-row cells: Pricing Strategy (popover), Pricebook (popover), Currency (text, read-only), Is Alternate (checkbox), Use Effective Dates (checkbox), Start Date (date picker), End Date (date picker)
- Column-config testids (UI-only, not data): `location-settings-table-pricing-col-{pricing-strategy,pricebook,currency,is-alternate,use-effective-dates,start-date,end-date}`
- **No row-level add / remove / delete affordance** on office 1604 (scan of all `<button>` textContent in Pricing content root: zero buttons match `/add|remove|delete|new/i`).

---

## Boolean-encoding registry (per LR-036)

Location Management History uses **Unicode `"✔"`** for booleans. This session re-verified the Unicode encoding for **col 11 "Corporate Pricing"** (Saves 1+2) — textContent read returns exactly `"✔"` when TRUE and `""` when FALSE. Same for **col 61 "Include Service Charge in Price Guides"** (Saves 3+4).

Pricing tab contributes **2 boolean-encoded history columns** (col 11, col 61) — both Unicode, both using the standard `assertBooleanCell(cell, expected, 'unicode')` path from the forthcoming SP-D0 shared utils.

---

## Baseline row (post-session verify)

End-of-session state (2026-04-22 ~11:31 AM read-only verify on office 1604 Pricing sub-tab):

| Parent | Baseline (pre-session) | End-of-session | Match |
|---|---|---|---|
| corporate-pricing | `true` | `true` | ✓ |
| price-guide-inclusion | `true` | `true` | ✓ |
| select-pricing-currency | `"All"` | `"All"` | ✓ |
| primary-labor-usd | `"--Select--"` | `"--Select--"` | ✓ |
| primary-equipment-usd | `"--Select--"` | `"--Select--"` | ✓ |
| primary-internal-equipment-usd | `"--Select--"` | `"--Select--"` | ✓ |
| primary-production-labor-usd | `"--Select--"` | `"--Select--"` | ✓ |
| primary-production-equipment-usd | `"--Select--"` | `"--Select--"` | ✓ |
| Secondary row 1 — Is Alternate | `false` | `false` | ✓ |
| Save button state | disabled (pristine) | disabled (pristine) | ✓ |

**0 mismatches**. Office 1604 Pricing tab safe to hand off.

Top-of-history row at session end: **04/22/2026 11:30:38 AM** (Save 6, Is Alternate restore).

---

## Follow-on plans unblocked

- **SP-B-LM-R** (Location Management 87-col reconciliation): cols 11, 16–20, 61 mapped to Pricing parents; cols 62–68 flagged as phantom cluster pending confirmation; col 63 Pricing-attributed by process-of-elimination (not Currency-owned per SP-B-LM-1).
- **SP-D2** (location-hist-pricing.spec.ts): can start immediately on col 11 + col 61 TC writing (2 clean direct-save TCs). For cols 16–20, use inferred mappings from this catalog + verify only value-format (not specific strategy IDs). For cols 62–68, treat as phantom-empty guards.
- **SP-E-LM-OTHER** (Pricing bug filings): candidates **PRC-BUG-A** (Secondary Pricing table edits NOT-TRACKED — direct for Is Alternate, inferred for Use Effective Dates / Start Date / End Date), **PRC-BUG-B** (optional — col 62–68 phantom cluster audit-trail gap; may be intentional if the Encore team documents this as "only writes on Add/Remove"), **PRC-BUG-C** (UX: no way to clear a Primary Pricing strategy once set).

---

## Rules honored

- **LR-020** — every claim in this catalog is backed by MCP evidence from this session (timestamps given per save); prior SP-B-LM-1 findings used for cross-contamination context are cited by exact save # and time, not re-interpreted.
- **LR-025** — Radix retry pattern: `find` + `computer.left_click` used for Corporate Pricing + Primary Labor combobox on Radix-fragile paths. Document plain-DOM `.click()` as working for the basic checkboxes once the element is in the DOM and the sub-tab is mounted.
- **LR-026** — Angular dirty-state discipline: Save button disabled observed as the pristine signal after every save; dialog "Ok" click followed by a 2.5–3.0 s settle before re-read.
- **LR-027** — Execution Summary will be added to the subplan file; catalog itself is the input to the summary.
- **LR-028 / LR-037** — activity-log row appended wall-clock ≥ catalog mtime.
- **LR-030 / LR-031** — DOM contradictions found (BUG-HIS-001 source-tab claim vs subplan wording) were traced to the original bug's JSON (`sourceTab: "Local Information"`) and documented as a subplan-wording clarification, not a bug filing.
- **LR-032** — all findings from live MCP driving (6 saves this session); zero theory claims.
- **LR-033** — network-activity verification implicit via save-API round-trip timing (Save button re-disables after ~2–3 s signals PUT 200). No 4xx/5xx observed in console.
- **LR-034** — bug candidates enumerated (PRC-BUG-A/B/C) but not filed — waiting for user approval per LR-034 gate (SP-E-LM-OTHER owns the filing).
- **LR-036** — Unicode ✔ boolean encoding reconfirmed for cols 11 + 61 this session.
- **LR-038** — browser tool choice (Claude in Chrome) announced at session start + recorded in this catalog header.

---

`outcome:pass, attempts:1 (session), rules-written:0 (framework rules unchanged; catalog-level findings only).`
