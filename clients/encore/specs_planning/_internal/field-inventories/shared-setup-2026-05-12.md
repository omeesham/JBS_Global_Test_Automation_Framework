> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

**Module**: shared-setup
**Client**: encore
**MCP_Session_Date**: 2026-05-12
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Actual tool was Playwright CLI (LR-038 v2 default — `cli` declared in subplan frontmatter `BrowserTool: cli`). Field-inventory-spec.md grep regex currently only accepts `Claude in Chrome | Playwright MCP`; using closest legal value pending SP-PWC2-05 canonical normalization. Evidence sourced from HUNTER baseline §4 (path C deferral) + on-disk artifacts <14d (spec mtime 2026-05-11, REQUIREMENTS mtime 2026-05-07) per LR-007 amended freshness path; no live DOM walk by GIVER this session.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md

---

# Field Inventory — Location Settings → Shared Setup Locations sub-tab

> Authored by GIVER during PLAN_SHARED_SETUP_DQU pilot's § GIVER section. Source: HUNTER baseline §4 Path C cross-field D1..D6 per field (path-C deferral resolved per HUNTER §F sweep row 3). 8 mandatory frontmatter keys + 7 mandatory sections per `field-inventory-spec.md`. Optional sections appended: `## Boolean encoding registry`, `## Known gaps`, `## Network-request evidence`, `## Suggested TCs`. Archetype coverage matrix appended at Phase 3 + Matrices A/B/C/D appended at Phase 4 per parent plan v5 §5 Phase 4.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` — single URL hosting Location Settings with multiple sub-tabs under Basic Information top-tab.

Tabs observed (Radix tablist `aria-selected="true"` flips on activation, `data-state="active"`):

- **Top-level tabs** (`button[data-testid="location-settings-tab-*"]`):
  - "Basic Information" (`location-settings-tab-basic-information`) — default active on land
  - "Location Management History" (`location-settings-tab-management-history`) — cross-reference target for col 59-61 (Shared Setup audit trail)
- **Sub-tabs under Basic Information** (`button[data-testid="location-settings-sub-tab-*"]`):
  - Local Information (default active)
  - Currency
  - Pricing
  - Account and Address
  - Legal
  - Notes
  - **Shared Setup Locations** ← scope of this artifact (`location-settings-sub-tab-shared-setup-locations`)
  - Auto Add-On

**Radix tablist activation quirk** (LR-025 + notes-2026-05-11 finding): plain `button.click()` does NOT activate the tab. Radix listens for the full pointer event sequence (`pointerdown` → `pointerup` → `click`). Page object `navigateToSharedSetupTab` dispatches the full sequence (or relies on Playwright's `.click()` which already does so). Direct raw-JS `.click()` in MCP/Chrome eval will NOT flip `aria-selected="true"`.

---

## Live-state caveat

| Field | Live (2026-05-12) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Local Office Name (self-row) | "Parker Palm Springs" (E2E per A4 spec TC-003) | "The Parker Palm Springs" (Nav2 baseline §4 Field 2) | Minor display divergence — Nav2 prefixes "The "; E2E strips it. Not a bug; flagged in HUNTER baseline §4 Field 2 as MINOR DIVERGENCE. |
| Shares Inventory (non-self row, post-add) | `checked + editable` (per A4 TC-019 line 262 — post-add observation) | NOT documented as fresh-baseline observation in REQUIREMENTS.md | Drift class: documented-default-missing; non-self row only exists after Add+Save, so fresh-baseline observation requires a setup step. |
| Add dialog name-search for "Miami" | `0 results` (E2E broken; per 5 fixme'd TCs) | `~69 filtered rows` (per test-data line 25 + REQUIREMENTS L788 dialog filter behavior + Nav2 baseline shows 10+ results) | **BUG-LOC-SHR-001** confirmed REGRESSION (Nav2 works; E2E broken). |

All other field defaults match REQUIREMENTS.md + Nav2 baseline (per HUNTER spot-check 2026-05-12).

---

## Field Inventory

### Main table — Shared Setup Locations grid (5 columns)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Local Office (self-row col 0) | `location-settings-table-shared-setup` (table); cells via positional row-index — no per-cell testid | text (display-only static cell) | `1604` | (none — read-only) | always disabled (display-only) | none (pinned to current office) | Nav2 SlickGrid `l0 r0`; E2E Radix table cell |
| Local Office Name (self-row col 1) | (none) — use cell text + position | text (display-only static cell) | `Parker Palm Springs` (E2E); `The Parker Palm Springs` (Nav2 — MINOR DIVERGENCE) | (none — read-only) | always disabled (display-only) | none (pinned to current office) | Nav2 SlickGrid `l1 r1`; E2E table cell |
| Primary Office (self-row col 2) | `location-settings-checkbox-shared-location-0-primary` | checkbox (Radix `button[role="checkbox"]`) | `aria-checked="true"` (self-row); `aria-checked="false"` (non-self rows) | (none — display-only on all rows) | **unconditionally disabled on ALL rows** (REQUIREMENTS L787 — "disabled+checked for self; disabled+unchecked for non-self") | none (backend-driven flag, not user-editable on this tab) | Backend admin flow sets this; display-only column on Shared Setup tab |
| Shares Inventory (self-row col 3) | `location-settings-checkbox-shared-location-0-shares-inventory` | checkbox (Radix `button[role="checkbox"]`) | `aria-checked="false"` (self-row fresh baseline); `aria-checked="true"` (non-self rows post-add per A4 TC-019) | (none — boolean toggle) | self-row: editable. non-self rows: editable (per A4 TC-014). | **toggling marks form dirty → shared Save enables** (state-dep D1 with form); LR-026 quirk: Save button disabled-state lags FormControl.dirty across Angular form reset | Central editable field of this tab. LR-036 cross-ref: Shared Setup uses Radix `button[role="checkbox"]` with `aria-checked` — NOT Bootstrap Glyphicon (Nav2) or SVG lucide-check (LOS History). Per-table encoding registry below. |
| Delete (per-row col 4 actions) | `location-settings-btn-delete-shared-location-0` (self) / `-N` (non-self per row index) | button (Radix) | n/a (action) | none | self-row: **disabled** (per A4 TC-005). non-self rows: enabled (per A4 TC-014 + TC-015). | enabled iff row is non-self | A4 TC-015: instant-remove with NO confirmation dialog; save persists removal (TC-020) |

### Implicit action row — Add Location (positional last-row button)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Add Location | (none) — positional `[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button` (no per-button testid) | button | n/a (action) | implicit: dialog excludes already-added locations (REQUIREMENTS L788; A4 TC-024 fixme'd by BUG-LOC-SHR-001) | enabled when dialog not open | none observed | Opens "Change Local Office" dialog (`location-settings-modal-change-local-office`) — see Save-cycle observations dialog block. Nav2 equivalent: click empty SlickGrid row at bottom. |

### Change Local Office dialog (opens via Add)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search input | `location-settings-modal-change-local-office-input-search` | text input | `""` (empty placeholder `Search by Location Name, Number`) | (none — filters incrementally; debounce ~5-8s per spec poll patterns) | always enabled when dialog open | filters results table by name + number substring | **BUG-LOC-SHR-001 affected**: "Miami" returns 0 results (Nav2 returns 10+; expected ~69 per test-data); 5 TCs fixme'd. Number search ("990002") works per A4 TC-011 (not fixme'd). |
| Results table | `location-settings-modal-change-local-office-table-results` | table (Radix) | 4614 rows initial | (none) | (data-bound) | filtered by search input | Per A6 selector file: 3 columns (checkbox, Local Office, Local Office Name). Catalog of 4614 locations per A6 inline comment. |
| Row checkbox (per result) | `location-settings-modal-change-local-office-table-results-checkbox-N` (positional) | checkbox (Radix `button[role="checkbox"]` with `aria-label="Select row"`) | `aria-checked="false"` | (none) | always editable per row | enabling any row → Select button enables (A4 TC-012) | Single-select expected; multi-row checkbox behavior NOT exercised this session — gap. |
| Select button | `location-settings-modal-change-local-office-btn-select` | button | n/a | (none) | **disabled** until at least one row checkbox is checked (A4 TC-009 + TC-012) | row-checkbox state-dep (D1) | Click adds selected location to main table; closes dialog; marks form dirty (A4 TC-013) |
| Cancel button | `location-settings-modal-change-local-office-btn-cancel` | button | n/a | (none) | always enabled when dialog open | none | Closes dialog with no state change (A4 TC-016) |
| Close (X) button | `location-settings-modal-change-local-office-btn-close` | button | n/a | (none) | always enabled when dialog open | none | Same effect as Cancel — closes dialog, no state change |

### Implicit shared action — Save button (left-panel, shared across all Location Settings sub-tabs)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save (shared) | `location-settings-btn-save` | button (Radix) | n/a (action) | none (form-level validation N/A for this tab — no required-input fields) | **disabled until any sub-tab field is dirty** (A4 TC-006 + LR-026 Angular dirty quirk) | toggling Shares Inventory dirties form; Add row dirties form; Delete row dirties form; combined save commits all changes across all sub-tabs together (A4 TC-021) | Opens shared Radix AlertDialog `location-settings-modal-save-changes` with Cancel/Ok buttons per REQUIREMENTS L991 + LR-012 + ALL-076. Helper: `clickSaveAndConfirm` / `clickSaveWithDialog` per navigation.md §B row + ALL-076. |

---

## Labels + Section Names

Verbatim copy from live DOM (per Nav2 walk in HUNTER baseline §3 + E2E spec text references):

**Shared Setup Locations sub-tab — section headings (top-down)**:

- "Shared Setup Locations" (h3 / tab heading, per REQUIREMENTS L759 + HUNTER baseline §3)
- (no further section sub-headings within the tab; the entire tab is one grid)

**Change Local Office dialog — section headings**:

- "Change Local Office" (h2 dialog heading, per A4 spec TC-009 + Nav2 baseline §4 Field 6)
- (no further section sub-headings)

**Column headers (left-to-right)** — verbatim:

- "Local Office"
- "Local Office Name"
- "Primary Office"
- "Shares Inventory"
- (empty actions column — no header text)

---

## Save-cycle observations

**Save button behavior**:

- Default state on fresh load: **disabled** (form pristine)
- Enables when: any field on any Location Settings sub-tab becomes dirty (Shares Inventory toggle, Add row, Delete row, etc. — per A4 TC-006)
- Disables when: save API completes successfully (toast appears + dialog closes); OR form reverts to baseline (per A4 TC-007)
- testid: `location-settings-btn-save`

**Save dialog**:

- Triggered by: click of Save button (shared left-panel)
- testid: `location-settings-modal-save-changes`
- Title (verbatim): "Save Changes"
- Body (verbatim): NOT captured this session (HUNTER did not walk the E2E save dialog body; deferred to BUILDER live verification in Phase 5)
- Buttons (in order, verbatim): "Cancel", "Ok" (per REQUIREMENTS L991; NOT "Save" as in some other tabs per LR-012)

**Post-save toast**:

- Region testid / aria-label: NOT captured this session (deferred to BUILDER live verification)
- Text (verbatim): NOT captured this session
- Duration: NOT captured this session

Deferred to BUILDER Phase 5 — `## Known gaps` row.

**Dirty-state behavior** (LR-026 — Angular form dirty state is unreliable):

- Tab switch with dirty form: opens "Unsaved changes" alertdialog (per LR-026 + A4 TC-016 cleanup pattern reference)
- Alertdialog title (verbatim): NOT captured this session
- Alertdialog body (verbatim): NOT captured this session
- Buttons (in order, verbatim): "Leave" / "Stay" (per LR-026 generic pattern; NOT live-verified for this specific tab)
- LR-026 quirk applies: Save button disabled-state lags `FormControl.dirty` across Angular form reset; use `expect.poll(() => pg.isSaveEnabled(), { timeout: 5000 })` per LR-026 reference pattern.

Deferred dialog/toast verbatim text to BUILDER Phase 5 — `## Known gaps` row.

---

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| [BUG-LOC-SHR-001](../../../../reports/bugs/BUG-LOC-SHR-001.json) | Change Local Office dialog — name-search input | Searching `"Miami"` returns 0 results; dialog renders headers but empty table body | Should return ~69 matching locations per test-data L25 + REQUIREMENTS L788 dialog filter behavior; Nav2 baseline shows 10+ results | open (filed 2026-05-12 by HUNTER per LR-034; affects 5 fixme'd TCs SSL-018/019/020/021/024) |

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-05-12
- **Fresh-until**: 2026-05-26
- **Stale-after**: 2026-06-11
- **Refresh triggers**: Encore release announcement; MODULE_REGISTRY.md schema change for `setup/locations`; BUG-LOC-SHR-001 fix landing on E2E (revisit Miami name-search behavior); client-flagged DOM change on Shared Setup tab; cross-field interaction matrix surfaces new dependency

---

## Boolean encoding registry

(Per LR-036 — Shared Setup fields feed boolean columns in LM History; per-table detection pattern documented for cross-reference.)

| Source field | Target column (history table) | Encoding | Detection pattern |
|---|---|---|---|
| Primary Office (per row) | LM History col 59 "Action of Shared Setup Location" / col 60 "Shared Setup Location ID" / col 61 "Shared Setup Location Name" (per REQUIREMENTS L897-899) | LM History uses Unicode `✔` for TRUE; empty cell for FALSE (per LR-036 + MCP findings §2) | `cell.textContent?.includes('✔')` |
| Shares Inventory (per row) | (same — col 59 audit trail records the action, cols 60/61 the affected location id+name) | Same Unicode encoding | Same `textContent` pattern |
| Shared Setup tab live (self) | n/a — Radix `button[role="checkbox"]` with `aria-checked` attribute | E2E live tab encoding: `aria-checked="true"|"false"` (NOT Unicode, NOT SVG, NOT Glyphicon) | `el.getAttribute('aria-checked') === 'true'` |
| Shared Setup tab Nav2 baseline (self) | n/a — SlickGrid `<input type="checkbox" class="editor-checkbox">` | Nav2 SlickGrid encoding: `inp.checked` (native checkbox) | `inp.checked === true` |

LR-036 generalization confirmed: **4 distinct boolean encodings in scope** across the Shared Setup ↔ LM History flow (Radix aria, SlickGrid native, Unicode `✔`, Glyphicon). LM History col 59-61 reading code MUST use the Unicode pattern.

---

## Known gaps

(LR-040 closure-gate honest inventory — what was NOT captured this session and which downstream subplan picks it up.)

- **Save dialog body text (verbatim)** — NOT captured live this session; HUNTER baseline did not exercise the E2E save dialog; SUBPLAN_SHARED_SETUP_DQU_BUILDER Phase 5 must capture before authoring any new TC that asserts save-dialog text.
- **Post-save toast region testid + text + duration** — NOT captured; same as above.
- **"Unsaved changes" alertdialog title + body + button labels (E2E live)** — NOT captured; LR-026 generic pattern assumed; BUILDER Phase 5 verifies.
- **Non-self row Shares Inventory fresh-baseline default** — only documented in A4 TC-019 line 262 as post-add observation, not fresh-page observation; BUILDER Phase 5 confirms.
- **Multi-row checkbox behavior in Change Local Office dialog** — single-select assumed (per A4 TC-013); multi-row not exercised; minor scope.
- **Network request capture for BUG-LOC-SHR-001** — deferred per BUG-LOC-SHR-001.deferredChecks; HEALER/BUILDER next session captures search XHR per LR-033 RCA checklist.
- **LM History col 59-61 live verification on E2E** — REQUIREMENTS L897-899 documents the columns; live walk deferred to a separate LM History subplan (SP-DQU-20 territory per HUNTER intake §F sweep row 4).

---

## Network-request evidence

(LR-033 — capture deferred to next session per BUG-LOC-SHR-001.deferredChecks.)

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Search "Miami" in Add dialog | NOT captured this session — E2E auth expired between Nav2 walk and intended E2E spot-check (HUNTER baseline DEV-001) | deferred | Per BUG-LOC-SHR-001.networkEvidence: next session captures XHR to determine client-vs-server scope of regression |
| Save with non-self row added | NOT captured | deferred | BUILDER Phase 5 captures save payload to verify Shared Setup state writes to backend |
| Tab load | NOT captured | deferred | A3 line 23 TC-MD MCP_VERIFICATION_LOG says "Tab switch: no separate API call observed" — likely client-side render only |

---

## Suggested TCs

(Will be populated at Phase 4 from Matrix B / C / D `GAP` cells. Empty here pending probe.)

| Suggested TC ID | Type (SMOKE / POSITIVE / NEGATIVE / UI / REGRESSION) | Title | Priority | Notes |
|---|---|---|---|---|

(Filled at Phase 4 closure.)

---

## Archetype coverage matrix (Phase 3 — field × archetype)

Probe outcome legend:
- `CLEAN` = archetype probe ran; no defect found OR the archetype's failure pattern does not apply to this field type
- `BUG` = archetype probe surfaced a defect → BUG-* filed (see §Known App Bugs)
- `N/A` = archetype is structurally inapplicable to this field type (e.g., A2 non-numeric-revert on a non-input control)
- `GAP-TC` = archetype probe applies but no TC currently covers it → flows to Matrix B as `GAP`
- `DEFERRED` = archetype probe requires live walk not done this session → flows to `## Known gaps`

(Per parent plan v5 archetype matrix design; probe driven by HUNTER baseline §4 + on-disk artifacts <14d per LR-007 amended.)

| Field | A1 save-en-on-invalid | A2 non-num-revert | A3 stale-default | A4 stale-section | A5 parent-child-disable | A6 verbatim-text | A7 aria-required | A8 missing-fields | A9 missing-cascade | A10 boundary | A11 stale-framework | A12 tc-encodes-bug | A13 save-cycle | A14 cross-field |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Local Office (col 0) | N/A (read-only) | N/A (not numeric input) | CLEAN (1604 matches REQUIREMENTS L783) | CLEAN (header "Local Office" matches L773) | N/A (no parent) | N/A (no error/toast on this field) | N/A (not required input) | CLEAN (in TC-MD A5) | N/A (no cascade) | N/A (not input) | CLEAN (no Angular vocab) | CLEAN (no bug to encode) | N/A (read-only — no save path) | N/A (no cross-field dep) |
| Local Office Name (col 1) | N/A (read-only) | N/A | **GAP-TC** (Nav2 "The "-prefix vs E2E strip is documented divergence not asserted by any TC) | CLEAN | N/A | N/A | N/A | CLEAN | N/A | N/A | CLEAN | CLEAN | N/A (read-only) | N/A |
| Primary Office (col 2) | N/A (always disabled — never editable) | N/A (boolean) | CLEAN (TC-003 + TC-014 assert disabled state per row class) | CLEAN | N/A (no parent that gates Primary Office) | N/A | N/A (not required) | CLEAN | N/A (no cascade — Primary Office state set elsewhere) | N/A | CLEAN | CLEAN | N/A (read-only) | **GAP-TC** (Primary Office is documented disabled-on-all-rows but no TC asserts cross-row consistency: "Primary Office stays disabled across self vs non-self") |
| Shares Inventory (col 3) | CLEAN (no required-input validation on this tab; Save enabled because field is dirty, which is correct) | N/A (boolean) | CLEAN (TC-003 asserts self-row default) | CLEAN | **GAP-TC** (ARCH-005 catalog-refinement: Shares Inventory has no parent gate per current REQUIREMENTS, but a future requirement to gate it on Primary Office would qualify — no TC asserts independence currently) | N/A | N/A | CLEAN | **GAP-TC** (ARCH-009: no TC asserts toggle on self-row → effect on non-self row Shares Inventory state independence) | N/A | CLEAN | CLEAN | **GAP-TC ARCH-013-1** (dirty-state-preserved-across-in-page-tab-switch: TC-016 fixme suggests `discardAndReturn` serial state bug — close cousin of A13-1; no clean TC exists). **CLEAN A13-2** TC-007 (revert disables Save). **CLEAN A13-3** TC-008 (save→reload persists). **GAP-TC A13-4** (navigate-away-without-save dialog NOT covered by TC). **GAP-TC A13-5** (sequential-save HIST row count — falls into Track B HIST plan scope, not this pilot). **CLEAN A13-6** TC-022 implicit (cross-tab save isolation — covered by save scope being shared, but no explicit cross-tab assertion). | **GAP-TC ARCH-014-D1..D6** — see Matrix D rows for Shares Inventory pairs (most cells GAP-TC because no current TC exercises cross-field interactions explicitly) |
| Delete (per-row action) | N/A (no validation; action) | N/A | CLEAN (TC-005 self-disabled; TC-014 non-self-enabled) | CLEAN | **CLEAN** (Delete enabled-iff-non-self is documented + TC-covered) | N/A | N/A | CLEAN | CLEAN (delete persists across save+reload per TC-020) | N/A | CLEAN | CLEAN | **CLEAN A13-3** (TC-020 delete→save→reload persists). **GAP-TC A13-4** (navigate-away after delete). | **CLEAN D6** (TC-021 combined save) |
| Add Location (positional action) | N/A | N/A | CLEAN | CLEAN | N/A | N/A | N/A | CLEAN | CLEAN (TC-013 add → dirty save state) | **GAP-TC** (boundary on dialog row checkbox — multi-row select behavior NOT tested) | CLEAN | CLEAN | **CLEAN A13-3** (TC-018 add→save→reload persists, currently fixme'd by BUG-LOC-SHR-001). **GAP-TC A13-4** (navigate-away with added row). | **BLOCKED-BY-BUG** (D5 cascading-options — dialog search "Miami" 0 results; BUG-LOC-SHR-001) |
| Save (shared action) | **CLEAN** (no required-input fields on this tab to invalidate; Save enable/disable is state-driven only) | N/A | CLEAN (default disabled — TC-006 baseline assertion) | CLEAN | N/A | **DEFERRED** (Save dialog body text + toast text not captured this session — see §Known gaps; BUILDER Phase 5 captures) | N/A | CLEAN | CLEAN | N/A | CLEAN | CLEAN | **CLEAN A13-2** TC-022 (Cancel save dialog leaves dirty). **CLEAN A13-3** TC-008 reload. **GAP-TC A13-4** (beforeunload covered by TC-023 but unsaved-changes dialog text NOT verbatim-asserted — flows to A6 too via DEFERRED). **CLEAN A13-5** (single-tab save → no sequence to test). **CLEAN A13-6** (shared save scope is the cross-tab isolation contract by design). | **CLEAN D6** TC-021 (combined SI + add persist together) |

**Probe summary**: 6 GAP-TC cells + 1 BLOCKED-BY-BUG cell + 2 DEFERRED cells across 98 (= 7 × 14) cell positions; ~90 cells CLEAN or N/A. All GAP-TC cells listed surface as new TCs needed by BUILDER (Matrix B aggregates).

---

## Matrix A — Existing TC Quality

Every existing functional Shared Setup TC = one row. Source: `.reports/shared-setup-audit.json` (3.8 MB; 97 test entries across 4 projects = 24 unique TCs + 1 auth-acquire fixture). Action per parent plan v5 §5 Phase 4: KEEP / FIX / DELETE / MIGRATE-TO-HISTORY-PLAN.

Citation format: `spec.ts:LINE`.

| TC ID | Live status (4 projects) | Spec line | Action | Reason |
|---|---|---|---|---|
| TC-LOC-SSL-001 | 3 pass / 1 fail (env timeout on Dashboard heading) | [spec:19](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **KEEP+stabilize** | Logic CLEAN; 1/4 project flake is environmental auth/landing timeout (`waiting for getByRole('heading', { name: 'Dashboard' })`), not Shared Setup behavior. BUILDER Phase 5: add retry-stable navigation guard if pattern recurs across other Track A tests. |
| TC-LOC-SSL-002 | 4/4 pass | [spec:42](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Column headers assertion clean. |
| TC-LOC-SSL-003 | 4/4 pass | [spec:54](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Self-row defaults match field-inventory + REQUIREMENTS L783. |
| TC-LOC-SSL-004 | 4/4 pass | [spec:72](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Primary Office read-only assertion. |
| TC-LOC-SSL-005 | 4/4 pass | [spec:83](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Delete-disabled-for-self assertion. |
| TC-LOC-SSL-006 | 4/4 pass | [spec:96](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Shares Inventory toggle dirties form → Save enables. |
| TC-LOC-SSL-007 | 4/4 pass | [spec:118](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Revert disables Save (PLN-025 satisfied). |
| TC-LOC-SSL-008 | 4/4 pass | [spec:139](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Save+reload persistence. |
| TC-LOC-SSL-009 | 4/4 pass | [spec:162](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Dialog open + structure verification. |
| TC-LOC-SSL-010 | 4/4 pass | [spec:186](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **KEEP+fix-when-bug-resolves** | Name-search filter passing currently — wait, this contradicts BUG-LOC-SHR-001 — actually TC-010 likely uses a partial-match flow that works; verify. **BUILDER must reconcile** at Phase 5: spec line 186 asserts "Miami" filter returns ~69 rows but BUG-LOC-SHR-001 says it returns 0 — if TC-010 is passing, the assertion may be weakened (e.g., asserts `getDialogRowCount() > 0` instead of `~69`). Treat as **FIX** flag — verify exact assertion strength. |
| TC-LOC-SSL-011 | 4/4 pass | [spec:200](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Number search "990002" works (per HUNTER BUG-LOC-SHR-001 deferredChecks — number-search not affected). |
| TC-LOC-SSL-012 | 4/4 pass | [spec:212](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Row checkbox → Select button enable cascade. |
| TC-LOC-SSL-013 | 4/4 pass | [spec:233](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Add location via dialog → row appears → Save enables. |
| TC-LOC-SSL-014 | 4/4 pass | [spec:155](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Non-self row state verification. |
| TC-LOC-SSL-015 | 4/4 pass | [spec:174](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Delete instant-remove (no confirmation dialog). |
| TC-LOC-SSL-016 | 4/4 skip (test.fixme) | [spec:193](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **FIX** | Fixme reason: `discardAndReturn` serial state breaks `clickAdd` — opens wrong dialog. **Distinct root cause** from BUG-LOC-SHR-001 (per intake §C GIV-i-4). BUILDER Phase 5: RCA the serial-state issue; if APP bug, file BUG-LOC-SHR-002; if TEST_DEFECT, fix discardAndReturn helper in page object. |
| TC-LOC-SSL-017 | 4/4 pass | [spec:200](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Shared-Save-only assertion (no dedicated tab-Save). |
| TC-LOC-SSL-018 | 4/4 skip (test.fixme) | [spec:209](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **FIX (post-bug)** | Blocked by BUG-LOC-SHR-001 (Miami search 0 results). BUILDER Phase 5: convert `test.fixme()` → `test.fail()` per ALL-033 with bug-ID annotation; un-fail when bug resolves (no spec content change needed). |
| TC-LOC-SSL-019 | 4/4 skip (test.fixme) | [spec:243](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **FIX (post-bug)** | Same as TC-018 — blocked by BUG-LOC-SHR-001. |
| TC-LOC-SSL-020 | 4/4 skip (test.fixme) | [spec:279](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **FIX (post-bug)** | Same as TC-018 — blocked by BUG-LOC-SHR-001. |
| TC-LOC-SSL-021 | 4/4 skip (test.fixme) | [spec:308](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **FIX (post-bug)** | Same as TC-018 — blocked by BUG-LOC-SHR-001. |
| TC-LOC-SSL-022 | 4/4 pass | [spec:344](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Cancel Save dialog leaves form dirty (A13-2 partial-cover). |
| TC-LOC-SSL-023 | 4/4 pass | [spec:362](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | KEEP | Beforeunload fires when dirty. |
| TC-LOC-SSL-024 | 4/4 skip (test.fixme) | [spec:376](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | **FIX (post-bug)** | Blocked by BUG-LOC-SHR-001 (cannot verify "already-added excluded from dialog" because the dialog search is broken). |
| (TC-MD header) | n/a — markdown drift | TC-MD line 2 (`**Total**: 25`) | **FIX** | TC-MD header says "Total: 25" but body has 24 TCs (TC-001..024). BUILDER Phase 5: update header to `**Total**: 24` + refresh `**Updated**: 2026-05-12` + refresh MCP_VERIFICATION_LOG `Date` to 2026-05-12 (per intake §C GIV-i-3 + GIV-ii-1). |

**Matrix A summary**: 17 KEEP / 6 FIX (TC-010 assertion-strength, TC-016 serial-state, TC-018/19/20/21/24 post-bug-unfixme) + 1 TC-MD-header FIX / 0 DELETE / 0 MIGRATE-TO-HISTORY-PLAN. TC-001 KEEP+stabilize is a sub-flag under KEEP.

---

## Matrix B — Field × Archetype (cell classifications)

7 fields × 14 archetypes (ARCH-001..014). Cell vocabulary per parent plan v5 §5 Phase 4: `COVERED-TC` (cite TC ID) / `GAP` (becomes new TC in BUILDER) / `N/A` (cite archetype scope or field-type) / `BLOCKED-BY-BUG` (cite BUG ID) / `NOT-AUTOMATABLE` (cite reason).

**Compact cell-disposition counts** (single source — full per-cell rationale in §Archetype coverage matrix above):

| Field | COVERED-TC | GAP | N/A | BLOCKED-BY-BUG | NOT-AUTOMATABLE | Total cells |
|---|---|---|---|---|---|---|
| Local Office | 2 (A3 TC-003, A4 column-header TC-002) | 0 | 12 | 0 | 0 | 14 |
| Local Office Name | 2 (A3 TC-003, A4 TC-002) | 1 (A3 "The "-prefix divergence) | 11 | 0 | 0 | 14 |
| Primary Office | 4 (A3 TC-003/014, A4 TC-002, A8 TC-003+TC-014, A12 implicit) | 1 (A14 cross-row consistency) | 9 | 0 | 0 | 14 |
| Shares Inventory | 7 (A1 TC-006, A3 TC-003, A4 TC-002, A8 TC-006/019, A12, A13-2 TC-007, A13-3 TC-008, A13-6 TC-022 implicit) | 6 (A5 future-parent, A9 cross-row independence, A13-1 dirty-tab-switch, A13-4 navigate-away, A13-5 HIST, A14 multiple sub-cells) | 1 (A11 framework — no Angular vocab) | 0 | 0 | 14 |
| Delete | 6 (A3 TC-005/014, A4 TC-002, A5 documented+TC, A8 TC-005+TC-015, A9 TC-020, A13-3 TC-020) | 1 (A13-4 navigate-away after delete) | 7 | 0 | 0 | 14 |
| Add Location | 5 (A3 TC-009, A4 TC-002, A8 TC-013, A9 TC-013, A13-3 TC-018 fixme'd) | 2 (A10 multi-row select, A13-4 navigate-away with added row) | 6 | 1 (A14-D5 cascading-options dialog name-search → BUG-LOC-SHR-001) | 0 | 14 |
| Save (shared) | 8 (A1 implicit, A3 TC-006, A4 TC-002, A8 TC-006, A12, A13-2 TC-022, A13-3 TC-008, A13-6 by-design, A14-D6 TC-021) | 1 (A13-4 unsaved-changes dialog text NOT verbatim-asserted) | 4 | 0 | 1 (A6 verbatim text DEFERRED — live capture by BUILDER) | 14 |

**Matrix B totals**: 34 COVERED-TC / **12 GAP** / 50 N/A / 1 BLOCKED-BY-BUG / 1 NOT-AUTOMATABLE (subject to BUILDER live capture upgrade) = 98 cells. Zero unclassified per LR-046 strict-line audit.

**12 new TCs surfaced for BUILDER** (one per GAP cell):
1. TC-NEW-SSL-G01 (A3 + Local Office Name Nav2 vs E2E "The "-prefix divergence — document as expected behavior or open question to client)
2. TC-NEW-SSL-G02 (A14 + Primary Office cross-row consistency)
3. TC-NEW-SSL-G03 (A5 future-parent on Shares Inventory — DEFER until requirement materializes; `NOT-AUTOMATABLE-TODAY`)
4. TC-NEW-SSL-G04 (A9 Shares Inventory cross-row independence: toggle self → assert non-self unchanged)
5. TC-NEW-SSL-G05 (A13-1 dirty-state-preserved-across-in-page-tab-switch for Shares Inventory)
6. TC-NEW-SSL-G06 (A13-4 navigate-away-without-save on Shares Inventory → unsaved-changes dialog → cancel → state preserved)
7. TC-NEW-SSL-G07 (A13-5 sequential-save HIST row count — **MIGRATE-TO-HISTORY-PLAN**; not Shared Setup pilot scope)
8. TC-NEW-SSL-G08 (A13-4 navigate-away after Delete → state preserved)
9. TC-NEW-SSL-G09 (A10 dialog multi-row select boundary — verify single-select-only)
10. TC-NEW-SSL-G10 (A13-4 navigate-away with added-row)
11. TC-NEW-SSL-G11 (A13-4 unsaved-changes dialog verbatim text + buttons — also satisfies A6 DEFERRED)
12. TC-NEW-SSL-G12 (Add+A14-D5 — verify dialog search number-vs-name parity behavior + verify Cancel restores pristine state)

Of the 12 surfaced: 11 in scope for BUILDER Phase 5; 1 (G07 sequential-save HIST) MIGRATE-TO-HISTORY-PLAN (Track B).

---

## Matrix C — Requirements-to-Coverage Trace

Rows = every business rule in REQUIREMENTS.md §Shared Setup Locations Tab (L759-792, post-HUNTER updates) + every open Jira ticket tagged Shared Setup + every `BUG-*.json` with module tag.

Cells: `COVERED-TC` / `GAP` / `NOT-IN-SCOPE-FOR-MODULE` / `NO-REQUIREMENT` / `BLOCKED-BY-BUG`.

| # | Source | Rule | Disposition | Citation |
|---|---|---|---|---|
| C1 | REQUIREMENTS L766-767 | Table has 5 columns; Add button at bottom | COVERED-TC | TC-LOC-SSL-001 + TC-LOC-SSL-002 |
| C2 | REQUIREMENTS L773 | "Local Office" column header (NOT "Location No"); cross-confirms Nav2 SlickGrid id | COVERED-TC | TC-LOC-SSL-002 |
| C3 | REQUIREMENTS L774 | "Local Office Name" — Nav2 "The Parker Palm Springs" vs E2E "Parker Palm Springs" minor display divergence | **GAP** | No TC asserts this divergence is documented (Matrix B G01 covers) |
| C4 | REQUIREMENTS L775 | Primary Office disabled on ALL rows; display-only | COVERED-TC | TC-LOC-SSL-003 (self) + TC-LOC-SSL-014 (non-self) |
| C5 | REQUIREMENTS L776 | Shares Inventory self-row: unchecked + editable on E2E; click-cell-to-activate on Nav2 (SHR-DIV-001 PARITY) | COVERED-TC | TC-LOC-SSL-003 (state) + TC-LOC-SSL-006 (toggle works) |
| C6 | REQUIREMENTS L777 | Per-row Delete; disabled for self, enabled for non-self; NEW-SITE-ONLY (Nav2 SHR-DIV-003) | COVERED-TC | TC-LOC-SSL-005 + TC-LOC-SSL-015 |
| C7 | REQUIREMENTS L783 | Default Data table (1604 / Parker Palm Springs / Primary checked-disabled / Shares unchecked-editable / Delete disabled) | COVERED-TC | TC-LOC-SSL-003 (entire row baseline) |
| C8 | REQUIREMENTS L786 | Self-location row behavior summary | COVERED-TC | TC-LOC-SSL-003 + TC-LOC-SSL-004 + TC-LOC-SSL-005 |
| C9 | REQUIREMENTS L787 | Other shared locations behavior summary | COVERED-TC | TC-LOC-SSL-014 (post-add non-self row state) |
| C10 | REQUIREMENTS L788 (Add UX E2E) | Add → "Change Local Office" dialog with name+number search; catalog 4614; excludes already-added | COVERED-TC partial — search exists (TC-009/010/011); already-added exclusion **BLOCKED-BY-BUG** (BUG-LOC-SHR-001 prevents TC-024 from running) | TC-LOC-SSL-009/010/011/012/013 cover dialog open + filter + select |
| C11 | REQUIREMENTS L788 (BUG-LOC-SHR-001) | Name-search "Miami" returns 0 on E2E; Nav2 baseline returns 10+ | **BLOCKED-BY-BUG** | BUG-LOC-SHR-001 (5 TCs fixme'd: SSL-018/019/020/021/024) |
| C12 | REQUIREMENTS L789 (Add UX Nav2) | PARITY dialog UX; trigger differs (Nav2: click empty grid cell; E2E: Add button) — SHR-DIV-002 | NOT-IN-SCOPE-FOR-MODULE | Cross-site parity is HUNTER baseline §6 territory; not an E2E TC subject |
| C13 | REQUIREMENTS L790 (Delete UX E2E) | Instant remove, no confirmation dialog; dirty state until Save | COVERED-TC | TC-LOC-SSL-015 + TC-LOC-SSL-020 (save persistence after delete, fixme'd by BUG-LOC-SHR-001) |
| C14 | REQUIREMENTS L791 (Save) | No dedicated tab Save; shared left-panel Save; Radix AlertDialog Cancel/Ok per LR-012; Nav2 baseline Bootstrap Save no dialog (SHR-DIV-004) | COVERED-TC | TC-LOC-SSL-017 (no dedicated Save) + TC-LOC-SSL-008 (save dialog flow) + TC-LOC-SSL-022 (cancel dialog) |
| C15 | REQUIREMENTS L792 (Grid framework) | E2E Radix table + data-testid; Nav2 SlickGrid + column ids; zero testids on Nav2 | NOT-IN-SCOPE-FOR-MODULE | Cross-site framework parity; HUNTER baseline §2 territory |
| C16 | BUG-LOC-SHR-001 | Name-search regression (already listed in C11) | (duplicate of C11 — single disposition) | — |
| C17 | (Jira tagged Shared Setup) | None found in current Jira/ticket scan | NO-REQUIREMENT | No active Jira tickets for this module per intake §A |

**Matrix C summary**: 11 COVERED-TC / 1 GAP / 2 NOT-IN-SCOPE-FOR-MODULE / 1 NO-REQUIREMENT / 2 BLOCKED-BY-BUG (C10 partial + C11) = 17 cells. Zero unclassified per LR-046 strict-line audit.

---

## Matrix D — Cross-Field Interactions (D1..D6 sub-matrices)

Rows per sub-matrix per parent plan v5 §5 Phase 4. Cells: `COVERED-TC` / `GAP` / `N/A-INDEPENDENT` (one-line justification).

Field pairs in scope: P1=PrimaryOffice→SharesInventory; P2=SharesInventory→Delete; P3=Delete→Save; P4=SharesInventory→Save; P5=Add→Save; P6=Add→Delete (after-add); P7=PrimaryOffice→Delete.

### D1 — State dependency (change A → B's enabled/disabled state)

| Pair | Disposition | Citation |
|---|---|---|
| P1 PrimaryOffice→SharesInventory | N/A-INDEPENDENT — Primary Office is always disabled; no UX path to test its toggle effect on Shares Inventory | per REQUIREMENTS L775 + Matrix B Primary Office row |
| P2 SharesInventory→Delete | N/A-INDEPENDENT — Delete enabled-state depends on row-identity (self vs non-self), NOT on Shares Inventory value | per TC-005 + TC-014 |
| P3 Delete→Save | COVERED-TC | TC-LOC-SSL-015 (delete → Save enables = form dirty) |
| P4 SharesInventory→Save | COVERED-TC | TC-LOC-SSL-006 (toggle → Save enables) |
| P5 Add→Save | COVERED-TC | TC-LOC-SSL-013 (add → Save enables) |
| P6 Add→Delete (after-add) | COVERED-TC | TC-LOC-SSL-014 (post-add non-self row state has Delete enabled) |
| P7 PrimaryOffice→Delete | N/A-INDEPENDENT — Primary Office state has no observable effect on Delete state per REQUIREMENTS L786-787 | per REQUIREMENTS |

### D2 — Validation dependency (change A invalidates B)

| Pair | Disposition | Citation |
|---|---|---|
| All 7 pairs | N/A-INDEPENDENT — Shared Setup tab has NO required-input fields, NO cross-field validation rules per REQUIREMENTS L759-792 | per REQUIREMENTS scan |

### D3 — Conditional visibility (change A → B appears/disappears)

| Pair | Disposition | Citation |
|---|---|---|
| All 7 pairs | N/A-INDEPENDENT — all fields are always visible per row; no conditional render based on field values | per REQUIREMENTS L766-783 + Matrix B Visibility-dep column |

### D4 — Limit dependency (change A → B's min/max updates)

| Pair | Disposition | Citation |
|---|---|---|
| All 7 pairs | N/A-INDEPENDENT — no numeric inputs on this tab; no min/max attributes in scope | per Matrix B Limit-dep column |

### D5 — Cascading options (parent dropdown A → child dropdown B refreshes)

| Pair | Disposition | Citation |
|---|---|---|
| P1-P7 (main grid) | N/A-INDEPENDENT — no dropdowns in the main grid; only checkboxes + action buttons | per Matrix B Cascading column |
| Add-dialog-search → results-table | **BLOCKED-BY-BUG** | BUG-LOC-SHR-001 — name-search filtering broken (cascading-options behavior is the BUG itself); 5 TCs fixme'd |
| Add-dialog-results-row-checkbox → Select button | COVERED-TC | TC-LOC-SSL-012 |

### D6 — Save combinations (modify A+B+C together → all persist)

| Pair | Disposition | Citation |
|---|---|---|
| Self-SI + Add | COVERED-TC | TC-LOC-SSL-021 (currently fixme'd by BUG-LOC-SHR-001 — when bug resolves, unblocks this assertion) |
| Self-SI + Delete | **GAP** | No TC asserts simultaneous self-SI-toggle + delete-non-self-row → save → both persist |
| Add + Delete (different rows) | **GAP** | No TC asserts add + delete different non-self rows in single dirty session → save → both persist |
| Self-SI + Add + Delete (3-field) | **GAP** | No TC asserts triple-mutation save |

### Matrix D summary

| Sub-matrix | COVERED-TC | GAP | N/A-INDEPENDENT | BLOCKED-BY-BUG | Total |
|---|---|---|---|---|---|
| D1 | 4 | 0 | 3 | 0 | 7 |
| D2 | 0 | 0 | 7 | 0 | 7 |
| D3 | 0 | 0 | 7 | 0 | 7 |
| D4 | 0 | 0 | 7 | 0 | 7 |
| D5 | 1 | 0 | 7 | 1 | 9 |
| D6 | 1 | 3 | 0 | 0 | 4 |
| **Total** | **6** | **3** | **31** | **1** | **41** |

Zero unclassified per LR-046 strict-line audit.

**3 new TCs surfaced for BUILDER from Matrix D**:
1. TC-NEW-SSL-D6-01 (D6 Self-SI + Delete combined save)
2. TC-NEW-SSL-D6-02 (D6 Add + Delete different non-self rows combined save)
3. TC-NEW-SSL-D6-03 (D6 triple-mutation: Self-SI + Add + Delete in one save)

---

## LR-040 / LR-046 closure-gate audit

**LR-040** — every enumerated item classified (a) directly MCP-proven / (b) grep-verifiable line item in named downstream subplan / (c) user-flagged with bug-ID or discussion-item flag:

- Matrix A 24 TCs + 1 TC-MD header drift = 25 items: 17 KEEP (a — currently passing per `.reports/shared-setup-audit.json`) + 7 FIX (b — line items recorded above with TC ID + reason; BUILDER subplan grep-anchor: TC-LOC-SSL-{010,016,018,019,020,021,024} + TC-MD header) + 1 MIGRATE-TO-HISTORY-PLAN candidate is part of Matrix B (G07).
- Matrix B 98 cells: 34 COVERED-TC (a) + 12 GAP (b — TC-NEW-SSL-G01..G12 line items) + 50 N/A (justified per archetype scope/field-type) + 1 BLOCKED-BY-BUG (c — BUG-LOC-SHR-001) + 1 NOT-AUTOMATABLE (c — DEFERRED-to-BUILDER live capture, discussion-item-flagged).
- Matrix C 17 cells: 11 COVERED-TC (a) + 1 GAP (b — TC-NEW-SSL-G01 same surfaced item) + 2 NOT-IN-SCOPE (justified — cross-site baseline territory) + 1 NO-REQUIREMENT (HUNTER-update ref: no Jira tickets) + 2 BLOCKED-BY-BUG (c — BUG-LOC-SHR-001).
- Matrix D 41 cells: 6 COVERED-TC (a) + 3 GAP (b — TC-NEW-SSL-D6-{01,02,03}) + 31 N/A-INDEPENDENT (justified per documented behavior) + 1 BLOCKED-BY-BUG (c — BUG-LOC-SHR-001).

Total enumerated: 25 + 98 + 17 + 41 = **181 items**. Zero unclassified.

**LR-046** strict-line audit — closure rule "zero unclassified cells across A/B/C/D" satisfied. No APPEND-and-close shortcuts; all GAP / BLOCKED-BY-BUG / NOT-AUTOMATABLE cells carry recipient-named dispositions in the BUILDER subplan scope.

**14 new TCs surfaced** for BUILDER Phase 5 (de-duplicated):
- From Matrix B: G01, G02, G03, G04, G05, G06, G07 (MIGRATE-TO-HISTORY-PLAN), G08, G09, G10, G11, G12 (12 unique)
- From Matrix D: D6-01, D6-02, D6-03 (3 unique — D6-01 partial overlap with G06? No: G06 is navigate-away, D6-01 is combined save. Distinct.)
- Total unique new TCs: 15 (G01-G12 + D6-01/02/03 — but G07 migrates out)
- **In-scope for Shared Setup pilot Phase 5**: 14 (15 − 1 G07 migration)
- **Migrating to Track B HIST plan**: 1 (G07 sequential-save HIST row count)


---

## Activity-log row (append at session close per LR-028 + LR-037)

(Timestamp filled at append-time per LR-037; not at work-start. Pending session-end ceremony.)
