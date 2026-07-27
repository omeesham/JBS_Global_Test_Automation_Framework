# Corporate Pricing — Pricebook Management / Pricing Strategy Test Cases (NM-1441 / NM-2261)

**Module**: corporate-pricing | **Total**: 63 | **Status**: Complete | **Updated**: 2026-06-26

---

## MCP_VERIFICATION_LOG — Pricing Strategy Tab (NM-1441)

| Field | Value |
|-------|-------|
| Date | 2026-06-05 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb |
| Office/Entity | 1604 (Parker Palm Springs) — pricebook `2022-NP Tier 1` (`strategyFixture`, Active) |
| Intent oracle | DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` NM-1441 (baseline-absent; net-new on e2e) |
| Field-inventory | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-05.md` |
| Tabs (live) | 2 — "Pricing Strategy" (default), "Pricing Detail". **History (DOCX 3rd tab) ABSENT** (NM-1444 not built) |
| Header (live) | 5 read-only fields: Name (h2), Type (Labor/Equipment), Year, Currency, Active status — reference-only (DOCX §1) |
| Strategy editor | Name textbox (editable); checkboxes Is Productions / Is Internal / Is GSO / Is Active (Is Internal + Is GSO disabled on this fixture) |
| Add New | "+" icon opens **"New Pricing Strategy" modal** (Strategy Name + 4 flags + Add/Cancel/Close) → "Add" appends a row |
| Remove | Nested icon button on **new (isNew) strategy rows only**; legacy rows have no Remove (bound to `isNew`) |
| Save | Single top-level "Save" button; `disabled` when clean, enables on any dirty change. Dirty indicator = Save enabled state (no separate badge) |
| Locations | "Locations Using Pricing As Default" table (cols Local Office / Local Office Name); read-only back-reference — an office appears only after it selects this strategy as its Primary Pricing on the Location → Pricing tab (assignments are volatile) |
| data-testid coverage | **0** on this page → text/role/content-anchored selectors (Doctrine 4 / D8) |
| Mutation safety | Save-cycle TCs run against `strategyFixture` with per-test `ensureDefaultState()` bounded-retry restore (LR-019) |

### 2026-06-26 — NM-2261 deep-coverage live re-verification (playwright-cli, office 1604, pricebook 2022-NP Tier 1)

Live-driven session (Playwright CLI, headless `state-load` of the e2e session) to ground the deep band `TC-CPR-STR-026..063`. Every expectation below is from the live DOM (evidence: `.playwright-cli/nm2261-*.yml` AX snapshots). The fixture was verified clean (Total: 1) at session end — only in-session/reversible mutations were used; no new strategy was ever committed.

| Behavior | Live finding (2026-06-26) | Encodes |
|---|---|---|
| New Pricing Strategy dialog | Strategy Name (placeholder "e.g. 2026-Tier 4 Urban A", auto-focused) + 4 checkboxes (order: Is GSO, Is Active, Is Internal, Is Productions) + Cancel / Add / Close(X) | TC-035..038, 045..049 |
| Dialog flag defaults | Is GSO **false**, **Is Active true**, Is Internal **false**, Is Productions **false** | TC-035..038 |
| Empty Strategy Name | **Add button disabled** (no inline error — disabled-gate) | TC-045 |
| Whitespace-only name `"   "` | **Add button disabled** (app trims) | TC-046 |
| Valid name | Add enabled; submitting appends an in-session row (Total +1), Save enabled (dirty) | TC-026/027 |
| Strategy Name maxlength | **100** (`maxlength="100"`; a 255-char entry truncates to 100). Requirements' assumed 255 is NOT the live cap. | TC-053 |
| Special characters | `ZZ-Test & <Strategy> "2026"` accepted + preserved verbatim, Add enabled | TC-054 |
| **NM-2047 mutual-exclusion** | Checking **Is Productions** disables **Is Internal + Is GSO** — confirmed in BOTH the editor (legacy strategy) AND the dialog | TC-043 |
| **NM-2047 IsLabor/Currency "lock after create"** | The strategy form exposes NO IsLabor/Currency control; Type (Labor/Equipment) + Currency are read-only header reference fields on the existing pricebook (the lock manifestation) | TC-044 |
| **NM-2059 duplicate name** | **BLOCKED** — entering the existing strategy's name + Add shows inline error **"A pricing strategy with this name already exists."**, dialog stays open, Total unchanged. **Contradicts the NM-2059 lead** ("duplicates allowed"); the app correctly enforces uniqueness (lead is stale / already-fixed). | TC-047 |
| LR-009 revert | Edit name → Save enabled; revert to original → **Save disabled**. Toggle Is Active → enabled; toggle back → **Save disabled**. (net-zero collapses dirty) | TC-032/033/034 |
| Dirty across sub-tab switch | Editing then switching Strategy→Detail keeps Save enabled, **no dialog** (silent) | TC-061 |
| Nav-away while dirty | Breadcrumb nav fires the **"Unsaved changes" confirmation dialog** ("Are you sure you want to leave this view? Any unsaved changes will be lost." — **Stay / Discard**); navigation blocked until resolved (+ native beforeunload) | TC-061 |
| Boolean render (LR-036) | Editor flags render as Radix `[role=checkbox][aria-checked]` (nested check `img` when true). The strategy **LIST** (left pane) renders only name buttons — **no boolean columns** | TC-056/057 |
| Strategy search filter | "Search strategies..." filters the list client-side — `"zzzz"` → 0 rows (**Total: 0**), `"2022"` → the strategy shows. Total reflects the FILTERED count. → result-fidelity is **in-scope** (the plan's "no search affordance" out-of-scope reason is wrong per live DOM) | TC-062/063 |
| Save gating (new pricebook) | `/add?type=equipment` with Name+Year set + 0 strategies → **Save disabled**; +1 strategy → enabled; remove last → disabled again (≥1-strategy gate, no commit) | TC-050/051/052, TC-030/031 |
| Mutation-safety boundary | Persisting a NEW strategy is **irreversible** (a saved strategy becomes legacy with no Remove) and there is no disposable pricebook fixture → full DB-persist of a *new* strategy is NOT-AUTOMATABLE. The create-multiple mechanics are covered IN-SESSION (TC-026..029, reload-discard) + reachability via the no-commit New-Pricebook gate (TC-050..052); only the irreversible commit slice is out of automation scope (documented, not silently skipped). | (boundary note) |

### HELPER VERIFICATION LEDGER (25 XLSX `TC-ENC-PRC-1441-*` → live verdict → `TC-CPR-STR-0NN`)

| Helper | Verdict (live 2026-06-05) | Re-ID |
|---|---|---|
| 001 entry from search link → mgmt page | VERIFIED (click pricebook link → `/details/<guid>`, "Pricebook Details") | TC-CPR-STR-001 |
| 002 header Name | VERIFIED (h2 "2022-NP Tier 1") | TC-CPR-STR-002 |
| 003 header Type | VERIFIED ("Equipment") | TC-CPR-STR-003 |
| 004 header Year | VERIFIED ("2022") | TC-CPR-STR-004 |
| 005 header Currency | VERIFIED ("USD") | TC-CPR-STR-005 |
| 006 header Active status | VERIFIED ("Active") | TC-CPR-STR-006 |
| 007 header reference-only/not editable | VERIFIED — `[ASSUMPTION]` RESOLVED: header is read-only paragraphs | TC-CPR-STR-007 |
| 008 three tabs render | **CORRECTED**: live = 2 tabs; assert 2 + raise 3-tab divergence | TC-CPR-STR-008 |
| 009 Strategy tab default | VERIFIED (Strategy active on load) | TC-CPR-STR-009 |
| 010 Pricing Detail tab | VERIFIED (Detail tab present + activates; NM-1443 content built) | TC-CPR-STR-010 |
| 011 History tab placeholder | **CORRECTED**: History tab ABSENT live; assert absence + clarification | TC-CPR-STR-011 |
| 012 click existing strategy loads details | VERIFIED (loads name + flags into editor) | TC-CPR-STR-012 |
| 013 location Primary Pricing surfaces office in strategy grid | VERIFIED (seed office 1604's Primary Equipment Pricing → office appears in the strategy's Locations table) | TC-CPR-STR-013 |
| 014 edit existing + Save persists | VERIFIED-mechanism (edit enables Save; persistence test w/ restore) | TC-CPR-STR-014 |
| 015 Add New appends row | **CORRECTED**: Add (+) opens modal → fill name → Add appends | TC-CPR-STR-015 |
| 016 new strategy shows Remove | VERIFIED (nested Remove icon on isNew row) | TC-CPR-STR-016 |
| 017 legacy strategies hide Remove | VERIFIED (legacy "2022-NP Tier 1" has no Remove) | TC-CPR-STR-017 |
| 018 Remove on new deletes pre-commit | VERIFIED (Remove → row gone, Total 2→1, Save disabled, no DB) | TC-CPR-STR-018 |
| 019 legacy cannot be removed | VERIFIED (no remove affordance on legacy) | TC-CPR-STR-019 |
| 020 clean-state indicator | **CORRECTED**: indicator = Save button `disabled` (no separate badge) | TC-CPR-STR-020 |
| 021 editing → dirty | VERIFIED (edit enables Save) | TC-CPR-STR-021 |
| 022 adding → dirty | VERIFIED (Add → Save enabled) | TC-CPR-STR-022 |
| 023 Save commits batch | VERIFIED-intent (save-cycle test w/ restore) | TC-CPR-STR-023 |
| 024 Save confirmation feedback | VERIFIED-intent (Notifications region present; assert success in save-cycle) | TC-CPR-STR-024 |
| 025 Save resets dirty→clean | VERIFIED-mechanism (discard → Save disabled; save → disabled) | TC-CPR-STR-025 |

**Dropped**: 0 of 25 (all retained; 6 corrected to live reality, 0 invalid).

### Clarifications (RAISED via `/encore-questions` — Doctrine 2, not silently dropped) — see `drafts/corporate-pricing-strategy-divergences-2026-06-05.md`

| # | DOCX intent | Live reality | Disposition |
|---|---|---|---|
| CPR-STRAT-Q1 | NM-1441 §2: 3 tabs incl. **History** | Only 2 tabs (History absent) | RAISED 2026-06-05 (see `drafts/corporate-pricing-strategy-divergences-2026-06-05.md` Q1 — forwarded for Encore-team confirmation). Expected-not-yet-built (DOCX labels History "(Placeholder) NM-1444"); gated to `SUBPLAN_CORP_PRICING_1444_HISTORY.md`. Asserted live-absent in TC-CPR-STR-011. |
| CPR-STRAT-Q2 | NM-1441 §3: "Add New" appends a fresh strategy (implies inline) | Add (+) opens a **"New Pricing Strategy" modal** first | RAISED 2026-06-05 (see `drafts/...strategy-divergences-2026-06-05.md` Q2); dispositioned as UI refinement (richer than doc), not a defect. TC-CPR-STR-015 asserts the live dialog flow. |
| CPR-STRAT-Q3 | NM-1441 §3: strategy flags Is Productions/Is Internal/Is GSO/Is Active | `Is Internal` + `Is GSO` **disabled** when `Is Productions` checked (on this fixture) | RAISED 2026-06-05 (see `drafts/...strategy-divergences-2026-06-05.md` Q3); interdependency not in doc; each-flag/BVA deferred to `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`. |

---

## FIELD INVENTORY — Pricing Strategy Tab

Full dated inventory: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-05.md`. Pricebook `2022-NP Tier 1` (`strategyFixture`, Active); 0 `data-testid` → text/role/content-anchored selectors (D8).

| Field | Type | Default (live 2026-06-05) | State | Notes |
|---|---|---|---|---|
| Header: Name / Type / Year / Currency / Active | read-only paragraphs (h2 + 4) | "2022-NP Tier 1" / Equipment / 2022 / USD / Active | reference-only | TC-CPR-STR-002..007 |
| Tabs | Pricing Strategy (default) + Pricing Detail | 2 tabs | — | History (NM-1444) absent live (CPR-STRAT-Q1) |
| Strategy Name | textbox | per row | editable | TC-CPR-STR-012/014 |
| Flags: Is Productions / Is Internal / Is GSO / Is Active | checkboxes | per row | Is Internal + Is GSO disabled when Is Productions checked | CPR-STRAT-Q3 |
| Add New (+) | button → "New Pricing Strategy" modal | — | opens modal (Name + 4 flags + Add/Cancel/Close) | TC-CPR-STR-015 |
| Remove | nested icon button | — | present on new (`isNew`) rows only; legacy rows none | TC-CPR-STR-016/017 |
| Save | button | disabled when clean | enables on any dirty change (no separate badge) | TC-CPR-STR-020/021 |
| Locations Using Pricing As Default | table (Local Office / Name) | populated via a location's Primary Pricing selection (volatile) | read-only | TC-CPR-STR-013 |

## Validation Rules

- **Flag interdependency**: with `Is Productions` checked, `Is Internal` + `Is GSO` are disabled on this fixture (CPR-STRAT-Q3, raised — per-flag/BVA deferred to `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`).
- **Dirty/Save**: any edit or Add enables the single top-level Save; the clean-state indicator IS the Save `disabled` state, with no separate dirty badge (TC-CPR-STR-020/025).
- **Remove scope**: Remove is bound to `isNew` — only un-committed (new) strategy rows can be removed pre-commit; legacy rows have no Remove affordance (TC-CPR-STR-017/019).
- **Header**: the 5 header fields are reference-only, not editable (TC-CPR-STR-007).

## TC-CPR-STR-001: Pricebook link entry loads the Pricebook Details management page
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Search page for office 1604, with the "2022-NP Tier 1" pricebook available to open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604). | The Pricebook Details management page opens for the "2022-NP Tier 1" pricebook. |
| 2 | Verify page title / heading. | The page title/heading identifies it as the Pricebook Details page. |
| 3 | Verify the header reflects the chosen pricebook. | The Pricebook Details management page loads and its header reflects the selected pricebook |

**Expected**: The Pricebook Details management page loads and its header reflects the selected pricebook.
**Data**: office=1604, pricebook=2022-NP Tier 1

---

## TC-CPR-STR-002: Header shows the Price Book Name
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page for the "2022-NP Tier 1" pricebook. | The Pricebook Details page for "2022-NP Tier 1" loads and displays its header. |
| 2 | Read the header name. | Header name equals the pricebook name "2022-NP Tier 1" |

**Expected**: Header name equals the pricebook name "2022-NP Tier 1".
**Data**: office=1604

---

## TC-CPR-STR-003: Header shows the Price Book Type (Labor/Equipment)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its header. |
| 2 | Read the "Labor/Equipment" header value. | Header Type value is "Equipment" (one of Labor/Equipment) |

**Expected**: Header Type value is "Equipment" (one of Labor/Equipment).
**Data**: office=1604

---

## TC-CPR-STR-004: Header shows the Price Year
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its header. |
| 2 | Read the "Year" header value. | Header Year value is "2022" |

**Expected**: Header Year value is "2022".
**Data**: office=1604

---

## TC-CPR-STR-005: Header shows the Currency
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its header. |
| 2 | Read the "Currency" header value. | Header Currency value is "USD" |

**Expected**: Header Currency value is "USD".
**Data**: office=1604

---

## TC-CPR-STR-006: Header shows the Active status
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its header. |
| 2 | Read the Active-status indicator in the header. | Header shows a clear active/inactive indicator ("Active" for this pricebook) |

**Expected**: Header shows a clear active/inactive indicator ("Active" for this pricebook).
**Data**: office=1604

---

## TC-CPR-STR-007: Header fields are reference-only (not editable)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its header. |
| 2 | Inspect the 5 header fields (Name, Type, Year, Currency, Active). | No header field exposes an editable field - the header is presented as reference information only |

**Expected**: No header field exposes an editable field — the header is presented as reference information only.
**Data**: office=1604

---

## TC-CPR-STR-008: Tabs render — Pricing Strategy + Pricing Detail
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its header and tab row. |
| 2 | Read the tab buttons. | The tab row is visible with labeled tab buttons. |
| 3 | Read the tab buttons. | Exactly two tabs render: "Pricing Strategy" and "Pricing Detail" |

**Expected**: Exactly two tabs render: "Pricing Strategy" and "Pricing Detail".
**Data**: office=1604

---

## TC-CPR-STR-009: Pricing Strategy tab is selected by default on load
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), opened in a fresh session.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page in a fresh session. | The Pricebook Details page loads successfully in the fresh session. |
| 2 | Observe which tab content renders. | The Pricing Strategy tab is active by default (its content area is shown) |

**Expected**: The Pricing Strategy tab is active by default (its content area is shown).
**Data**: office=1604

---

## TC-CPR-STR-010: Pricing Detail tab is present and activates
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads with the Pricing Strategy tab active by default. |
| 2 | Click the "Pricing Detail" tab. | Clicking "Pricing Detail" activates the Detail tab; its deeper behavior is covered by the Pricing Detail test suite |

**Expected**: Clicking "Pricing Detail" activates the Detail tab; its deeper behavior is covered by the Pricing Detail test suite.
**Data**: office=1604

---

## TC-CPR-STR-011: History tab is absent on the live site
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads and displays its tab row. |
| 2 | Search the tab row for a "History" tab. | No History tab exists in the current version |

**Expected**: No History tab exists in the current version.
**Data**: office=1604

---

## TC-CPR-STR-012: Clicking an existing strategy loads its details
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the "2022-NP Tier 1" strategy present in the Price Strategies list.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads with the Price Strategies list displayed. |
| 2 | Click the strategy "2022-NP Tier 1" in the Price Strategies list. | Clicking "2022-NP Tier 1" selects it and highlights it in the Price Strategies list. |
| 3 | Verify the editor shows the strategy name + flag checkboxes (Is Productions, Is Internal, Is GSO, Is Active) | Selecting a strategy loads its details into the editor (name field + flag checkboxes reflect the strategy) |

**Expected**: Selecting a strategy loads its details into the editor (name field + flag checkboxes reflect the strategy).
**Data**: office=1604

---

## TC-CPR-STR-013: Setting a location's Primary Pricing surfaces that office in the strategy grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes

**Preconditions**: Office 1604's Location → Pricing tab is reachable, and the "2026-Tier 2 Resort B" Equipment strategy (pricebook "2026-PB5") is selectable as a Primary Equipment Pricing option for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On office 1604's Pricing tab, set Primary Equipment Pricing to "2026-Tier 2 Resort B" and Save (skip the save when it is already selected). | Office 1604's Primary Equipment Pricing field shows "2026-Tier 2 Resort B" as the selected value. |
| 2 | Open the "2026-Tier 2 Resort B" pricebook's Pricing Strategy tab and read the "Locations Using Pricing As Default" table. | The "2026-Tier 2 Resort B" pricebook's Pricing Strategy tab opens and displays the "Locations Using Pricing As Default" table. |
| 3 | Restore office 1604's Primary Equipment Pricing to its original value. | Office 1604's Primary Equipment Pricing is restored to its original value and saved. |

**Expected**: The "Locations Using Pricing As Default" table (cols "Local Office", "Local Office Name") lists at least one row and includes office 1604 — the office whose Primary Pricing now points at this strategy. The grid is a read-only back-reference: an office surfaces here only because of its Primary Pricing selection, so an empty grid is no longer accepted as a pass.
**Data**: office=1604, strategy=2026-Tier 2 Resort B

---

## TC-CPR-STR-014: Edit an existing strategy and Save persists the change (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the "2022-NP Tier 1" strategy at its default saved state.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the starting state (strategy = "2022-NP Tier 1"). | The strategy name "2022-NP Tier 1" is shown in the list. |
| 2 | Edit the strategy name field (append a reversible marker). | The strategy name field accepts the edited value. |
| 3 | Click Save. | The changes are saved and the updated strategy name appears in the list. |
| 4 | Reload the page. | The page reloads and the updated strategy name persists. |
| 5 | Restore the original name (cleanup). | The strategy name is restored to "2022-NP Tier 1" and saved. |

**Expected**: A saved edit to an existing strategy persists across reload; the strategy is restored to its original state afterward (no leftover changes).
**Data**: office=1604, pricebook=2022-NP Tier 1

---

## TC-CPR-STR-015: Add New opens the New Pricing Strategy dialog and appends a row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and one existing strategy in the list.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads with the Price Strategies pane displayed. |
| 2 | Click the Add ("+") button in the Price Strategies pane. | Clicking "+" opens the New Pricing Strategy dialog. |
| 3 | Enter a Strategy Name and click "Add". | The typed Strategy Name is accepted and clicking "Add" closes the dialog. |
| 4 | Discard the new strategy (Remove) without Save. | The strategy is removed from the list; no changes are committed. |

**Expected**: Add ("+") opens the New Pricing Strategy dialog; submitting "Add" appends a fresh (unsaved) strategy to the list. (The add flow opens a dialog first.)
**Data**: office=1604

---

## TC-CPR-STR-016: Newly added strategy shows a Remove button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active, ready to add a new strategy via the dialog.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a new strategy via the dialog. | The new strategy appears as a row in the Price Strategies list. |
| 2 | Inspect the new strategy's list item. | The new strategy's list item includes a visible Remove button. |
| 3 | Discard (Remove) without Save. | A newly-added strategy row carries a Remove affordance |

**Expected**: A newly-added strategy row carries a Remove affordance.
**Data**: office=1604

---

## TC-CPR-STR-017: Legacy strategies do not show a Remove button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the existing (saved) "2022-NP Tier 1" strategy in the list.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page. | The Pricebook Details page loads with the legacy strategy listed. |
| 2 | Inspect the legacy strategy's list item. | A saved (legacy) strategy has no Remove control |

**Expected**: A saved (legacy) strategy has no Remove control.
**Data**: office=1604

---

## TC-CPR-STR-018: Remove on a new strategy deletes it before commit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-016
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and a newly added (unsaved) strategy in the list.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a new strategy via the dialog. | The new strategy appears as a row in the Price Strategies list. |
| 2 | Click the new strategy's Remove button. | Clicking Remove deletes the new strategy row from the list immediately. |
| 3 | Verify state. | Removing a new (uncommitted) strategy deletes it from the list instantly, returning the form to clean |

**Expected**: Removing a new (uncommitted) strategy deletes it from the list instantly, returning the form to clean.
**Data**: office=1604

---

## TC-CPR-STR-019: Legacy strategies cannot be removed from the management view
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-017
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and an existing (saved) strategy visible in the list.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page with a legacy strategy visible. | The Pricebook Details page loads with the legacy strategy visible in the list. |
| 2 | Look for any remove/delete control on the legacy strategy. | There is no path to remove a legacy strategy from this management view (the Remove control is available only for newly-added strategies, never for saved ones) |

**Expected**: There is no path to remove a legacy strategy from this management view (the Remove control is available only for newly-added strategies, never for saved ones).
**Data**: office=1604

---

## TC-CPR-STR-020: Unmodified strategy list shows the clean state (Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and no changes made.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page and make no changes. | The Pricebook Details page loads with no pending changes. |
| 2 | Observe the Save button. | With no pending changes the page is clean - there is no separate state badge; the Save button's disabled state is the clean indicator |

**Expected**: With no pending changes the page is clean — there is no separate state badge; the Save button's disabled state is the clean indicator.
**Data**: office=1604

---

## TC-CPR-STR-021: Editing a strategy changes the state to dirty (Save enabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-020
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active, a strategy selected, and no changes made (Save disabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page (clean). | The Pricebook Details page loads with the Save button disabled (clean state). |
| 2 | Edit the selected strategy's name field. | The strategy name field accepts the typed edit and displays the new text. |
| 3 | Discard (reload / restore) without Save. | Editing any editable strategy field transitions the page to dirty (Save enables) |

**Expected**: Editing any editable strategy field transitions the page to dirty (Save enables).
**Data**: office=1604

---

## TC-CPR-STR-022: Adding a new strategy changes the state to dirty (Save enabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-020
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and no changes made (Save disabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pricebook Details page (clean). | The Pricebook Details page loads with the Save button disabled (clean state). |
| 2 | Add a new strategy via the dialog. | The new strategy is added and appears in the Price Strategies list. |
| 3 | Discard (Remove) without Save. | Adding a new strategy transitions the page to dirty (Save enables) |

**Expected**: Adding a new strategy transitions the page to dirty (Save enables).
**Data**: office=1604

---

## TC-CPR-STR-023: Save commits strategy edits and additions in one batch (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-014
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the page at its default saved state.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the starting state. | The strategy list shows the baseline strategies with the Save button disabled. |
| 2 | Edit the existing strategy (reversible marker) AND add a new strategy via the dialog. | The existing strategy shows the edited name and the new strategy appears in the list; Save becomes enabled. |
| 3 | Click Save. | Clicking Save submits both the edit and the addition and the page displays a success indicator. |
| 4 | Reload. | The page reloads and displays the saved edit and the newly added strategy. |
| 5 | Restore the starting state (remove the added strategy / revert the edit). | A single Save commits all pending edits + additions; both are reflected on reload; the page is restored to its starting state afterward |

**Expected**: A single Save commits all pending edits + additions; both are reflected on reload; the page is restored to its starting state afterward.
**Data**: office=1604, pricebook=2022-NP Tier 1

---

## TC-CPR-STR-024: Save provides confirmation feedback
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-014
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the page at its default saved state.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the starting state. | The strategy list shows the baseline strategy with the Save button disabled. |
| 2 | Make a reversible change and click Save. | The change is accepted and clicking Save submits it to the server. |
| 3 | Observe the notifications area. | The notifications area displays a success message confirming the save. |
| 4 | Restore the starting state. | After Save, a visible success indicator confirms the update |

**Expected**: After Save, a visible success indicator confirms the update.
**Data**: office=1604

---

## TC-CPR-STR-025: Save resets the state from dirty to clean after success
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-014
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the page at its default saved state.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the starting state. | The strategy list shows the baseline strategy with the Save button disabled. |
| 2 | Make a reversible change. | The change is accepted and the Save button becomes enabled. |
| 3 | Click Save and wait for success. | Clicking Save submits the change and a success indicator is displayed. |
| 4 | Restore the starting state. | After a successful Save the state indicator returns to clean (Save disabled) |

**Expected**: After a successful Save the state indicator returns to clean (Save disabled).
**Data**: office=1604

---

# Deep Coverage (NM-2261 — create multiple Pricing Strategies)

> Ultracoverage band `TC-CPR-STR-026..063`, live-verified 2026-06-26 (see the 2026-06-26 re-verification table above). **Mutation safety**: new-strategy ADD/REMOVE and multi-row tests run **in-session only** and are discarded by reload (a committed new strategy is irreversible — it becomes legacy with no Remove). Save-cycle tests use the only UI-reversible save: editing the EXISTING strategy's name/flags then restoring. Save-gating + delete-all tests run on the **New Pricebook** create page (no commit — `clickSaveExpectDialog` + cancel).

## TC-CPR-STR-026: Add multiple strategies in one session (N=2)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, Total: 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog, enter a unique name (strategy A), click Add. | Strategy A is added and the list Total increases from 1 to 2. |
| 2 | Open the dialog again, enter a second unique name (strategy B), click Add. | Strategy B is added and the list Total increases from 2 to 3. |
| 3 | Verify the Save button. | The Save button is enabled. |
| 4 | Reload the page (discard). | Two new strategies append to the in-session list (Total goes from 1 to 2 to 3); both names render; Save is enabled. Reloading discards them (never committed) |

**Expected**: Two new strategies append to the in-session list (Total goes from 1 to 2 to 3); both names render; Save is enabled. Reloading discards them (never committed).
**Data**: office=1604; in-session only

---

## TC-CPR-STR-027: Add multiple strategies in one session (N=3, edge)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-026
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, Total: 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add three unique new strategies (A, B, C) via the dialog. | All three strategies (A, B, C) are added and the list Total increases from 1 to 4. |
| 2 | Verify the Save button. | The Save button remains enabled. |
| 3 | Reload (discard). | Three new strategies append (Total becomes 4); Save stays enabled across multiple adds. In-session only |

**Expected**: Three new strategies append (Total becomes 4); Save stays enabled across multiple adds. In-session only.
**Data**: office=1604; in-session only

---

## TC-CPR-STR-028: Edit each row's name in a multi-row session
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-026
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add two new strategies (A, B) via the dialog. | Strategies A and B are added and both appear in the list. |
| 2 | Select A, edit its name in the editor to A2. | Strategy A's name field updates to A2 and the list reflects the renamed row. |
| 3 | Select B, edit its name in the editor to B2. | Strategy B's name field updates to B2 and the list reflects the renamed row. |
| 4 | Reload (discard). | Each row's name edits independently within a multi-row session; the list reflects both renames. In-session only (no persist) |

**Expected**: Each row's name edits independently within a multi-row session; the list reflects both renames. In-session only (no persist).
**Data**: office=1604; in-session only

---

## TC-CPR-STR-029: Remove each new strategy in sequence
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-027
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, Total: 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add three new strategies (A, B, C) via the dialog. | Strategies A, B, and C are added and the list Total increases from 1 to 4. |
| 2 | Remove A via its Remove icon. | Strategy A is removed and the list Total decreases from 4 to 3. |
| 3 | Remove B. | Strategy B is removed and the list Total decreases from 3 to 2. |
| 4 | Remove C. | New (uncommitted) strategies remove one at a time (Total decrements each); after all new rows are removed the form is clean (Save disabled) |

**Expected**: New (uncommitted) strategies remove one at a time (Total decrements each); after all new rows are removed the form is clean (Save disabled).
**Data**: office=1604; in-session only

---

## TC-CPR-STR-030: Remove the last strategy on a new pricebook disables Save (delete-all)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (New Pricebook create flow)
**Automatable**: Yes

**Preconditions**: New Pricebook create page (`/add?type=equipment`, office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Pricebook Name + Year, then add one strategy via the dialog. | The Pricebook Name and Year are accepted and the new strategy appears in the list with Save enabled. |
| 2 | Remove that strategy (its Remove icon). | Removing the only strategy on a new pricebook leaves zero strategies and disables Save (the ≥1-strategy gate). No commit |

**Expected**: Removing the only strategy on a new pricebook leaves zero strategies and disables Save (the ≥1-strategy gate). No commit.
**Data**: office=1604; new pricebook (never saved)

---

## TC-CPR-STR-031: Re-add a strategy after delete-all re-enables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-030
**Automatable**: Yes

**Preconditions**: New Pricebook create page with Name + Year set and 0 strategies (Save disabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a strategy via the dialog. | Re-adding a strategy after delete-all re-enables Save. No commit |

**Expected**: Re-adding a strategy after delete-all re-enables Save. No commit.
**Data**: office=1604; new pricebook (never saved)

---

## TC-CPR-STR-032: Reverting the strategy name disables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-021
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select the strategy and edit its name (append a marker). | The strategy is selected and the name field updates with the appended marker; Save becomes enabled. |
| 2 | Clear the name back to the original "2022-NP Tier 1". | Reverting the name to the saved value disables Save again - reverting to the original is detected as no net change |

**Expected**: Reverting the name to the saved value disables Save again — reverting to the original is detected as no net change.
**Data**: office=1604

---

## TC-CPR-STR-033: Reverting a flag toggle disables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-032
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Toggle Is Active off. | Is Active becomes unchecked and Save becomes enabled. |
| 2 | Toggle Is Active back on. | Toggling a flag then reverting it disables Save (reverting to the original is no net change) |

**Expected**: Toggling a flag then reverting it disables Save (reverting to the original is no net change).
**Data**: office=1604

---

## TC-CPR-STR-034: Partial revert keeps Save enabled until all changes revert
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-032
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the name AND toggle Is Active. | The name field shows the edited value and Is Active toggles state; Save is enabled. |
| 2 | Revert only the name. | The name field returns to its original value and Save remains enabled. |
| 3 | Revert Is Active. | With two dirty fields, reverting one leaves Save enabled; reverting both disables Save. (Is Active is used as the second changeable field - Is Internal/Is GSO are disabled while Is Productions is checked.) |

**Expected**: With two dirty fields, reverting one leaves Save enabled; reverting both disables Save. (Is Active is used as the second changeable field — Is Internal/Is GSO are disabled while Is Productions is checked.)
**Data**: office=1604

---

## TC-CPR-STR-035: Dialog — Is Active defaults checked
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog and read the Is Active checkbox. | Is Active defaults to checked in the New Pricing Strategy dialog |

**Expected**: Is Active defaults to checked in the New Pricing Strategy dialog.
**Data**: office=1604

---

## TC-CPR-STR-036: Dialog — Is GSO defaults unchecked
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog and read the Is GSO checkbox. | Is GSO defaults to unchecked in the dialog |

**Expected**: Is GSO defaults to unchecked in the dialog.
**Data**: office=1604

---

## TC-CPR-STR-037: Dialog — Is Internal defaults unchecked
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog and read the Is Internal checkbox. | Is Internal defaults to unchecked in the dialog |

**Expected**: Is Internal defaults to unchecked in the dialog.
**Data**: office=1604

---

## TC-CPR-STR-038: Dialog — Is Productions defaults unchecked
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog and read the Is Productions checkbox. | Is Productions defaults to unchecked in the dialog |

**Expected**: Is Productions defaults to unchecked in the dialog.
**Data**: office=1604

---

## TC-CPR-STR-039: Dialog flag carries to the new in-session strategy (Is Active off)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-035
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, uncheck Is Active, enter a unique name, click Add. | Is Active becomes unchecked in the dialog and the new strategy is added to the list. |
| 2 | Select the new strategy. | The new strategy's editor opens and shows Is Active unchecked. |
| 3 | Reload (discard). | A flag set in the dialog carries to the new in-session strategy (Is Active unchecked on the added row). In-session only |

**Expected**: A flag set in the dialog carries to the new in-session strategy (Is Active unchecked on the added row). In-session only.
**Data**: office=1604; in-session only

---

## TC-CPR-STR-040: Dialog Is GSO carries to the new strategy
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-036
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, check Is GSO, enter a unique name, click Add. | Is GSO becomes checked in the dialog and the new strategy is added to the list. |
| 2 | Select the new strategy. | The new strategy's editor opens and shows Is GSO checked. |
| 3 | Reload (discard). | Checking Is GSO in the dialog carries to the added in-session strategy. In-session only |

**Expected**: Checking Is GSO in the dialog carries to the added in-session strategy. In-session only.
**Data**: office=1604; in-session only

---

## TC-CPR-STR-041: Dialog Is Internal carries to the new strategy
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-037
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, check Is Internal, enter a unique name, click Add. | Is Internal becomes checked in the dialog and the new strategy is added to the list. |
| 2 | Select the new strategy. | The new strategy's editor opens and shows Is Internal checked. |
| 3 | Reload (discard). | Checking Is Internal in the dialog carries to the added in-session strategy. In-session only |

**Expected**: Checking Is Internal in the dialog carries to the added in-session strategy. In-session only.
**Data**: office=1604; in-session only

---

## TC-CPR-STR-042: Dialog Is Productions carries + mutual-exclusion applies on the new strategy
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-038
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, check Is Productions. | Is Productions becomes checked and Is Internal/Is GSO become disabled in the dialog. |
| 2 | Enter a unique name, click Add. | The typed name is accepted and the new strategy is added to the list. |
| 3 | Select the new strategy. | The new strategy's editor opens and shows Is Productions checked. |
| 4 | Reload (discard). | Checking Is Productions carries to the new strategy AND disables Is Internal/Is GSO in the dialog (mutual-exclusion). In-session only |

**Expected**: Checking Is Productions carries to the new strategy AND disables Is Internal/Is GSO in the dialog (mutual-exclusion). In-session only.
**Data**: office=1604; in-session only

---

## TC-CPR-STR-043: Is Productions disables Is Internal and Is GSO (mutually-exclusive flags)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab. The test strategy has Is Productions checked.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select the strategy in the editor. | The strategy opens in the editor with Is Productions checked and Is Internal/Is GSO disabled. |
| 2 | Open the New Pricing Strategy dialog and check Is Productions. | Whenever Is Productions is checked (editor or dialog), Is Internal and Is GSO are disabled - a mutually-exclusive flag group |

**Expected**: Whenever Is Productions is checked (editor or dialog), Is Internal and Is GSO are disabled — a mutually-exclusive flag group.
**Data**: office=1604

---

## TC-CPR-STR-044: Type and Currency are read-only reference fields after create
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-003
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Inspect the Pricebook Details header Type (Labor/Equipment) and Currency. | On an existing pricebook the Type (Labor/Equipment) and Currency render as non-editable reference fields (the labor/currency values become locked once the pricebook is created). The strategy form itself exposes no labor/currency control |

**Expected**: On an existing pricebook the Type (Labor/Equipment) and Currency render as non-editable reference fields (the labor/currency values become locked once the pricebook is created). The strategy form itself exposes no labor/currency control.
**Data**: office=1604

---

## TC-CPR-STR-045: Empty Strategy Name blocks Add
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog, leave Strategy Name empty. | With an empty Strategy Name the Add button is disabled (disabled-gate, no inline error) |

**Expected**: With an empty Strategy Name the Add button is disabled (disabled-gate, no inline error).
**Data**: office=1604

---

## TC-CPR-STR-046: Whitespace-only name blocks Add
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-045
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, enter spaces only ("   "). | A whitespace-only name keeps Add disabled (input trimmed) |

**Expected**: A whitespace-only name keeps Add disabled (input trimmed).
**Data**: office=1604

---

## TC-CPR-STR-047: Duplicate strategy name is blocked with an inline error
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab; an existing strategy named "2022-NP Tier 1".

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the New Pricing Strategy dialog, enter the existing name "2022-NP Tier 1", click Add. | An inline error reads "A pricing strategy with this name already exists." and no row is added. |
| 2 | Cancel the dialog (discard). | A duplicate strategy name is rejected with the inline error "A pricing strategy with this name already exists." No row is added |

**Expected**: A duplicate strategy name is rejected with the inline error "A pricing strategy with this name already exists." No row is added.
**Data**: office=1604

---

## TC-CPR-STR-048: Cancel discards a pending strategy
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, Total: 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, enter a unique name, click Cancel. | Cancel discards the pending strategy; the list and Total are unchanged |

**Expected**: Cancel discards the pending strategy; the list and Total are unchanged.
**Data**: office=1604

---

## TC-CPR-STR-049: Close (X) discards a pending strategy
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-048
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, Total: 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, enter a unique name, click the Close (X) control. | Close (X) discards the pending strategy like Cancel |

**Expected**: Close (X) discards the pending strategy like Cancel.
**Data**: office=1604

---

## TC-CPR-STR-050: New pricebook with 0 strategies has Save disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (New Pricebook create flow)
**Automatable**: Yes

**Preconditions**: New Pricebook create page (`/add?type=equipment`, office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Pricebook Name + Year, add no strategies. | With Name + Year set but 0 strategies, Save is disabled (the ≥1-strategy gate). No commit |

**Expected**: With Name + Year set but 0 strategies, Save is disabled (the ≥1-strategy gate). No commit.
**Data**: office=1604; new pricebook (never saved)

---

## TC-CPR-STR-051: Adding one strategy enables Save on a new pricebook
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-050
**Automatable**: Yes

**Preconditions**: New Pricebook create page with Name + Year set, 0 strategies (Save disabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add one strategy via the dialog. | Adding the first strategy (with Name + Year set) enables Save. No commit |

**Expected**: Adding the first strategy (with Name + Year set) enables Save. No commit.
**Data**: office=1604; new pricebook (never saved)

---

## TC-CPR-STR-052: Removing the last strategy re-disables Save on a new pricebook
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-051
**Automatable**: Yes

**Preconditions**: New Pricebook create page with Name + Year + 1 strategy (Save enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Remove the strategy. | Removing the only strategy re-disables Save. No commit |

**Expected**: Removing the only strategy re-disables Save. No commit.
**Data**: office=1604; new pricebook (never saved)

---

## TC-CPR-STR-053: Strategy Name field caps input at 100 characters
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog, enter a 255-character name. | The Strategy Name field accepts input up to 100 characters and truncates the rest. |
| 2 | Cancel (discard) | The Strategy Name field caps input at 100 characters; a 255-char entry is truncated to 100 |

**Expected**: The Strategy Name field caps input at 100 characters; a 255-char entry is truncated to 100.
**Data**: office=1604

---

## TC-CPR-STR-054: Special characters in the Strategy Name are accepted and preserved
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-015
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog and enter this literal name: `ZZ-Test & <Strategy> "2026"`. | The Strategy Name field accepts and displays the special characters exactly as typed. |
| 2 | Cancel (discard) | Special characters are accepted and preserved exactly (no corruption or HTML interpretation); Add is enabled |

**Expected**: Special characters are accepted and preserved exactly (no corruption or HTML interpretation); Add is enabled.
**Data**: office=1604

---

## TC-CPR-STR-055: A special-character name round-trips exactly across save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-014
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Rename the existing strategy to a special-character value `2022-NP Tier 1 & "QA"`. | The name field accepts the special-character value without error. |
| 2 | Save and reload. | The page reloads and the strategy name shows the special-character value unchanged. |
| 3 | Restore the original name and Save (cleanup). | The strategy name is restored to "2022-NP Tier 1" and saved. |

**Expected**: A strategy name containing special characters persists and round-trips exactly across save + reload (reversible existing-strategy edit, restored afterward).
**Data**: office=1604

---

## Surface-Behavior Cases (SBC) — Strategy list + editor surfaces (NM-2261, LR-065)

> Axis-2 surface families per the Case-Generation Standard. The Strategy surface is a small FormArray-managed in-session list + a flag editor (not a virtualized query grid). Each applicable family carries ≥1 QUICK must-assert and a DEEP exhaustive case; inapplicable families carry an `out-of-scope:<family>=<reason>` token. IDs are ordinary 3-segment TCs in the band; the depth/family rides the `**Surface_Family**:` line (no `-SBC-` infix).
>
> **Out-of-scope dispositions** (the live walk confirmed the trigger does not hold):
> - `out-of-scope:pagination=the strategy list is a small in-session managed list with no rows-per-page control and does not paginate (confirmed absent on the live surface 2026-06-26)`
> - `out-of-scope:sorting=the strategy list has no sortable column header — it is a flat list of strategy-name buttons with no per-column order to flip (confirmed live 2026-06-26)`
> - `out-of-scope:combination=the combination family requires at least two of filter/sort/paginate to coexist; only the name filter is present on the strategy list surface`

## TC-CPR-STR-056: A strategy flag reads correctly from its rendered checkbox
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes
**Surface_Family**: render-state (QUICK)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select the strategy and read the Is Active flag's checked state from its rendered checkbox. | A strategy flag's boolean state reads correctly from its rendered checkbox format; the flag's checked state is readable from its checkbox |

**Expected**: A strategy flag's boolean state reads correctly from its rendered checkbox format; the flag's checked state is readable from its checkbox.
**Data**: office=1604

---

## TC-CPR-STR-057: All editor flags read correctly per render format (no boolean columns in list)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-056
**Automatable**: Yes
**Surface_Family**: render-state (DEEP)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read each editor flag (Is Productions / Is Internal / Is GSO / Is Active) checked + disabled state via the Radix `aria-checked` render. | Each editor flag's checked and disabled state is readable directly from its checkbox. |
| 2 | Inspect the strategy list (left pane). | All four editor flags have their checked state readable from their checkboxes; the strategy list itself renders no boolean columns (booleans appear only in the editor) |

**Expected**: All four editor flags have their checked state readable from their checkboxes; the strategy list itself renders no boolean columns (booleans appear only in the editor).
**Data**: office=1604

---

## TC-CPR-STR-058: 0-strategy and 1-strategy states render correctly
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-050
**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)

**Preconditions**: New Pricebook create page (0-strategy) + Pricebook Details for "2022-NP Tier 1" (1-strategy).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the existing pricebook, the strategy list renders one row (Total: 1) | The strategy list displays exactly one row and Total reads 1. |
| 2 | On a new pricebook with 0 strategies, the empty-strategy state renders and Save is disabled | The 1-strategy list renders; the 0-strategy state renders its empty presentation and disables Save |

**Expected**: The 1-strategy list renders; the 0-strategy state renders its empty presentation and disables Save.
**Data**: office=1604

---

## TC-CPR-STR-059: Strategy list renders at 0 / 1 / N strategies
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-058
**Automatable**: Yes
**Surface_Family**: empty-vol (DEEP)

**Preconditions**: New Pricebook create page + Pricebook Details for "2022-NP Tier 1".

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | 0 strategies (new pricebook). | The strategy list displays its empty-state presentation and Total reads 0. |
| 2 | 1 strategy (existing test pricebook). | The strategy list displays exactly one row and Total reads 1. |
| 3 | N strategies (multi-add in-session on the test pricebook). | The strategy list displays all added rows and Total reflects the increased count. |
| 4 | Reload (discard) | The strategy list renders correctly at 0 / 1 / N strategies and Total reflects the count |

**Expected**: The strategy list renders correctly at 0 / 1 / N strategies and Total reflects the count.
**Data**: office=1604; in-session for the N case

---

## TC-CPR-STR-060: A saved strategy edit survives reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-014
**Automatable**: Yes
**Surface_Family**: persistence (QUICK)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Rename the existing strategy reversibly, Save, reload. | The page reloads and the renamed strategy persists in the list. |
| 2 | Restore the original name and Save (cleanup) | The strategy name is restored to its original value and saved. |

**Expected**: A saved strategy edit survives reload (reversible, restored afterward).
**Data**: office=1604

---

## TC-CPR-STR-061: unsaved changes survives sub-tab switch and prompts on nav-away
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-021
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the strategy name (dirty), switch to the Pricing Detail tab. | The Pricing Detail tab becomes active and the unsaved name edit remains intact. |
| 2 | Trigger a full navigation away (the Corporate Pricing breadcrumb) while dirty. | An "Unsaved changes" prompt is displayed with Stay and Discard options, and navigation is blocked. |
| 3 | Click Discard. | Unsaved changes survive Strategy↔Detail sub-tab switches (silent); navigating away with unsaved changes raises the "Unsaved changes" prompt (Stay / Discard) and blocks navigation until resolved |

**Expected**: Unsaved changes survive Strategy↔Detail sub-tab switches (silent); navigating away with unsaved changes raises the "Unsaved changes" prompt (Stay / Discard) and blocks navigation until resolved.
**Data**: office=1604

---

## TC-CPR-STR-062: The strategy search box filters the list
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, Total: 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a non-matching query ("zzzz") in "Search strategies...". | The strategy list shows no rows and Total reads 0. |
| 2 | Type a matching query ("2022"). | The strategy list shows the matching strategy and Total reads 1. |
| 3 | Clear the search. | The strategy search box filters the list - a non-matching query yields no rows (Total reflects the filtered count, 0), a matching query shows the strategy |

**Expected**: The strategy search box filters the list — a non-matching query yields no rows (Total reflects the filtered count, 0), a matching query shows the strategy.
**Data**: office=1604

---

## TC-CPR-STR-063: Search narrows to matching names among multiple strategies
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-062
**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add two in-session strategies with distinct names (A, B). | Strategies A and B are added and both appear in the list. |
| 2 | Filter by A's name. | The list narrows to show only strategy A and Total reflects the filtered count. |
| 3 | Clear the filter. | The full strategy list is restored and Total reflects the unfiltered count. |
| 4 | Reload (discard). | With multiple strategies the search narrows to matching names and Total reflects the filtered count; clearing restores the full list. In-session only |

**Expected**: With multiple strategies the search narrows to matching names and Total reflects the filtered count; clearing restores the full list. In-session only.
**Data**: office=1604; in-session only
