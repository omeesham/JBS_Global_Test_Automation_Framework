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
| Locations | "Locations Using Pricing As Default" table (cols Local Office / Local Office Name); 1991, 7011 for this strategy |
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
| Nav-away while dirty | Breadcrumb nav fires the **"Unsaved changes" alertdialog** ("Are you sure you want to leave this view? Any unsaved changes will be lost." — **Stay / Discard**); navigation blocked until resolved (+ native beforeunload) | TC-061 |
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
| 013 selected strategy shows locations | VERIFIED (Locations table: 1991, 7011) | TC-CPR-STR-013 |
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
| Locations Using Pricing As Default | table (Local Office / Name) | 1991, 7011 | read-only | TC-CPR-STR-013 |

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
1. Navigate to the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604) -> Page loads
2. Verify page title / heading -> "Corporate Pricing Details" heading visible
3. Verify the header reflects the chosen pricebook -> name "2022-NP Tier 1" shown

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
1. Open the Pricebook Details page for the "2022-NP Tier 1" pricebook -> Page loads
2. Read the header name -> Shows "2022-NP Tier 1"

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
1. Open the Pricebook Details page -> Page loads
2. Read the "Labor/Equipment" header value -> Shows "Equipment"

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
1. Open the Pricebook Details page -> Page loads
2. Read the "Year" header value -> Shows "2022"

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
1. Open the Pricebook Details page -> Page loads
2. Read the "Currency" header value -> Shows "USD"

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
1. Open the Pricebook Details page -> Page loads
2. Read the Active-status indicator in the header -> Shows "Active"

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
1. Open the Pricebook Details page -> Page loads
2. Inspect the 5 header fields (Name, Type, Year, Currency, Active) -> All render as read-only text, with no editable fields

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
1. Open the Pricebook Details page -> Page loads
2. Read the tab buttons -> "Pricing Strategy" and "Pricing Detail" present, in that order
3. Note: the requirements describe a third "History" tab -> the live page shows only two (see the History-tab test)

**Expected**: Exactly two tabs render ("Pricing Strategy", "Pricing Detail"); the History tab is covered by a separate test (it is absent on the live page) and raised as a clarification for the product team.
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
1. Open the Pricebook Details page in a fresh session -> Page loads
2. Observe which tab content renders -> Pricing Strategy content (Price Strategies list + editor) is visible

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
1. Open the Pricebook Details page -> Pricing Strategy active
2. Click the "Pricing Detail" tab -> Tab activates and its content renders

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
1. Open the Pricebook Details page -> Page loads
2. Search the tab row for a "History" tab -> No "History" tab is rendered

**Expected**: No History tab exists in the current version. This is raised as a clarification for the product team; the History feature is tracked separately.
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
1. Open the Pricebook Details page -> Pricing Strategy active, strategy list shows "2022-NP Tier 1"
2. Click the strategy "2022-NP Tier 1" in the Price Strategies list -> Editor populates
3. Verify the editor shows the strategy name + flag checkboxes (Is Productions, Is Internal, Is GSO, Is Active)

**Expected**: Selecting a strategy loads its details into the editor (name field + flag checkboxes reflect the strategy).
**Data**: office=1604

---

## TC-CPR-STR-013: Selected strategy displays its assigned locations
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active.

**Steps**:
1. Open the Pricebook Details page and select "2022-NP Tier 1" -> Editor loads
2. Read the "Locations Using Pricing As Default" table -> Shows the assigned locations

**Expected**: The Locations table (cols "Local Office", "Local Office Name") lists the strategy's assigned locations (e.g. 1991 Premier Global Events, 7011 Production).
**Data**: office=1604

---

## TC-CPR-STR-014: Edit an existing strategy and Save persists the change (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the "2022-NP Tier 1" strategy at its default saved state.

**Steps**:
1. Confirm the starting state (strategy = "2022-NP Tier 1") -> Clean starting point
2. Edit the strategy name field (append a reversible marker) -> Save button enables
3. Click Save -> Save completes (button disables)
4. Reload the page -> Modified name persists for the strategy
5. Restore the original name (cleanup) -> Starting state restored

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
1. Open the Pricebook Details page -> Total: 1 strategy
2. Click the Add ("+") button in the Price Strategies pane -> "New Pricing Strategy" dialog opens (Strategy Name field + 4 flag checkboxes + Cancel/Add/Close)
3. Enter a Strategy Name and click "Add" -> Dialog closes; a new strategy row is appended (Total increments); new strategy is selected in the editor
4. Discard the new strategy (Remove) without Save -> Starting state restored

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
1. Add a new strategy via the dialog -> New strategy row appears in the list
2. Inspect the new strategy's list item -> A Remove (icon) button is present on it
3. Discard (Remove) without Save -> Starting state restored

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
1. Open the Pricebook Details page -> Legacy strategy "2022-NP Tier 1" in the list
2. Inspect the legacy strategy's list item -> No Remove button is present

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
1. Add a new strategy via the dialog -> Total increments; Save enabled
2. Click the new strategy's Remove button -> New strategy disappears immediately
3. Verify state -> Total returns to 1; Save returns to disabled; no page reload or save to the database required

**Expected**: Removing a new (uncommitted) strategy deletes it from the list instantly with no database round trip, returning the form to clean.
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
1. Open the Pricebook Details page with a legacy strategy visible -> Page loads
2. Look for any remove/delete control on the legacy strategy -> None available

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
1. Open the Pricebook Details page; make no changes -> Page loads
2. Observe the Save button -> Save is disabled

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
1. Open the Pricebook Details page (clean) -> Save disabled
2. Edit the selected strategy's name field -> Save button enables
3. Discard (reload / restore) without Save -> Starting state restored

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
1. Open the Pricebook Details page (clean) -> Save disabled
2. Add a new strategy via the dialog -> Save button enables
3. Discard (Remove) without Save -> Starting state restored

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
1. Confirm the starting state -> Clean starting point
2. Edit the existing strategy (reversible marker) AND add a new strategy via the dialog -> Save enabled (dirty)
3. Click Save -> Save completes
4. Reload -> Both the edited legacy strategy and the newly added strategy reflect the saved changes
5. Restore the starting state (remove the added strategy / revert the edit) -> Starting state restored

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
1. Confirm the starting state -> Clean starting point
2. Make a reversible change and click Save -> Save completes
3. Observe the notifications area -> A success indicator confirms the pricebook configuration was updated
4. Restore the starting state -> Starting state restored

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
1. Confirm the starting state -> Clean starting point
2. Make a reversible change -> Save enabled (dirty)
3. Click Save and wait for success -> Save returns to disabled (clean)
4. Restore the starting state -> Starting state restored

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
1. Open the New Pricing Strategy dialog, enter a unique name (strategy A), click Add -> Dialog closes; Total: 2; A appears in the list
2. Open the dialog again, enter a second unique name (strategy B), click Add -> Total: 3; both A and B appear in the list
3. Verify the Save button -> enabled (dirty); no Save performed
4. Reload the page (discard) -> Total: 1 restored (in-session adds discarded)

**Expected**: Two new strategies append to the in-session list (Total 1→2→3); both names render; Save is enabled. Reloading discards them (never committed).
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
1. Add three unique new strategies (A, B, C) via the dialog -> Total: 4; all three appear in the list
2. Verify the Save button -> enabled (the ≥1-strategy gate is satisfied)
3. Reload (discard) -> Total: 1 restored

**Expected**: Three new strategies append (Total→4); Save stays enabled across multiple adds. In-session only.
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
1. Add two new strategies (A, B) via the dialog -> Total: 3
2. Select A, edit its name in the editor to A2 -> list shows A2
3. Select B, edit its name in the editor to B2 -> list shows B2
4. Reload (discard) -> Total: 1 restored

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
1. Add three new strategies (A, B, C) via the dialog -> Total: 4; Save enabled
2. Remove A via its Remove icon -> Total: 3
3. Remove B -> Total: 2
4. Remove C -> Total: 1; Save returns to disabled (back to the clean legacy-only baseline)

**Expected**: New (uncommitted) strategies remove one at a time (Total decrements each); after all new rows are removed the form is clean (Save disabled). No DB round-trip.
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
1. Set Pricebook Name + Year, then add one strategy via the dialog -> Save enabled
2. Remove that strategy (its Remove icon) -> 0 strategies; the empty-strategy state renders; Save -> disabled

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
1. Add a strategy via the dialog -> Save -> enabled again

**Expected**: Re-adding a strategy after delete-all re-enables Save. No commit.
**Data**: office=1604; new pricebook (never saved)

---

## TC-CPR-STR-032: Reverting the strategy name disables Save (recovery ≠ pristine)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-021
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
1. Select the strategy and edit its name (append a marker) -> Save enabled
2. Clear the name back to the original "2022-NP Tier 1" -> Save -> disabled

**Expected**: Reverting the name to the saved value disables Save again — reverting to the original is detected as no net change. (Live-confirmed.)
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
1. Toggle Is Active off -> Save enabled
2. Toggle Is Active back on -> Save -> disabled

**Expected**: Toggling a flag then reverting it disables Save (reverting to the original is no net change). (Live-confirmed.)
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
1. Edit the name AND toggle Is Active -> Save enabled (two dirty fields)
2. Revert only the name -> Save still enabled (form still dirty on Is Active)
3. Revert Is Active -> Save -> disabled (both reverted = pristine)

**Expected**: With two dirty fields, reverting one leaves Save enabled; reverting both disables Save. (Is Active is the second lever — Is Internal/Is GSO are disabled while Is Productions is checked.)
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
1. Open the New Pricing Strategy dialog -> read the Is Active checkbox -> checked

**Expected**: Is Active defaults to checked in the New Pricing Strategy dialog. (Live.)
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
1. Open the New Pricing Strategy dialog -> read the Is GSO checkbox -> unchecked

**Expected**: Is GSO defaults to unchecked in the dialog. (Live.)
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
1. Open the New Pricing Strategy dialog -> read the Is Internal checkbox -> unchecked

**Expected**: Is Internal defaults to unchecked in the dialog. (Live.)
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
1. Open the New Pricing Strategy dialog -> read the Is Productions checkbox -> unchecked

**Expected**: Is Productions defaults to unchecked in the dialog. (Live.)
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
1. Open the dialog, uncheck Is Active, enter a unique name, click Add -> new strategy appended
2. Select the new strategy -> editor shows Is Active unchecked
3. Reload (discard) -> Total: 1 restored

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
1. Open the dialog, check Is GSO, enter a unique name, click Add -> new strategy appended
2. Select the new strategy -> editor shows Is GSO checked
3. Reload (discard) -> Total: 1 restored

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
1. Open the dialog, check Is Internal, enter a unique name, click Add -> new strategy appended
2. Select the new strategy -> editor shows Is Internal checked
3. Reload (discard) -> Total: 1 restored

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
1. Open the dialog, check Is Productions -> Is Internal + Is GSO become disabled in the dialog
2. Enter a unique name, click Add -> new strategy appended
3. Select the new strategy -> editor shows Is Productions checked
4. Reload (discard) -> Total: 1 restored

**Expected**: Checking Is Productions carries to the new strategy AND disables Is Internal/Is GSO in the dialog (mutual-exclusion). In-session only.
**Data**: office=1604; in-session only

---

## TC-CPR-STR-043: Is Productions disables Is Internal and Is GSO (mutually-exclusive flags)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-012
**Automatable**: Yes

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab. The fixture strategy has Is Productions checked.

**Steps**:
1. Select the strategy in the editor -> Is Productions checked; Is Internal + Is GSO are disabled
2. Open the New Pricing Strategy dialog and check Is Productions -> Is Internal + Is GSO become disabled

**Expected**: Whenever Is Productions is checked (editor or dialog), Is Internal and Is GSO are disabled — a mutually-exclusive flag group. (Live-confirmed.)
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
1. Inspect the Pricebook Details header Type (Labor/Equipment) and Currency -> both render as read-only reference text (no editable input/combobox)

**Expected**: On an existing pricebook the Type (Labor/Equipment) and Currency render as non-editable reference fields (the labor/currency values become locked once the pricebook is created). The strategy form itself exposes no labor/currency control. (Live.)
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
1. Open the New Pricing Strategy dialog, leave Strategy Name empty -> the Add button is disabled

**Expected**: With an empty Strategy Name the Add button is disabled (disabled-gate, no inline error). (Live.)
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
1. Open the dialog, enter spaces only ("   ") -> the Add button stays disabled (the value is trimmed to empty)

**Expected**: A whitespace-only name keeps Add disabled (input trimmed). (Live.)
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
1. Open the New Pricing Strategy dialog, enter the existing name "2022-NP Tier 1", click Add -> the inline error "A pricing strategy with this name already exists." appears; the dialog stays open; Total is unchanged (no row added)
2. Cancel the dialog (discard) -> no change

**Expected**: A duplicate strategy name is rejected with the inline error **"A pricing strategy with this name already exists."**; no row is added. (Live-confirmed — the app correctly enforces unique strategy names.)
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
1. Open the dialog, enter a unique name, click Cancel -> dialog closes; the strategy is NOT in the list; Total unchanged

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
1. Open the dialog, enter a unique name, click the Close (X) control -> dialog closes; the strategy is NOT in the list; Total unchanged

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
1. Set Pricebook Name + Year, add no strategies -> Save is disabled

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
1. Add one strategy via the dialog -> Save -> enabled

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
1. Remove the strategy -> Save -> disabled (0 strategies)

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
1. Open the dialog, enter a 255-character name -> the field value is truncated to 100 characters (the input enforces maxlength=100)
2. Cancel (discard)

**Expected**: The Strategy Name field caps input at 100 characters; a 255-char entry is truncated to 100. (Live — the requirements' assumed 255 is not the live cap.)
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
1. Open the dialog, enter `ZZ-Test & <Strategy> "2026"` -> the field value is preserved verbatim; the Add button is enabled
2. Cancel (discard)

**Expected**: Special characters are accepted and preserved exactly (no corruption or HTML interpretation); Add is enabled. (Live.)
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
1. Rename the existing strategy to a special-character value `2022-NP Tier 1 & "QA"` -> Save enabled
2. Save and reload -> the editor name equals the special-character value exactly
3. Restore the original name and Save (cleanup) -> baseline restored

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
1. Select the strategy and read the Is Active flag's checked state from its rendered checkbox -> reads true (Radix `aria-checked`, nested check img when true)

**Expected**: A strategy flag's boolean state reads correctly from its rendered checkbox format. (LR-036 — the Strategy editor uses Radix `aria-checked`.)
**Data**: office=1604

---

## TC-CPR-STR-057: Every editor flag reads per its render format; the list has no boolean columns
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-STR-056
**Automatable**: Yes
**Surface_Family**: render-state (DEEP)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab.

**Steps**:
1. Read each editor flag (Is Productions / Is Internal / Is GSO / Is Active) checked + disabled state via the Radix `aria-checked` render -> each reads its live state
2. Inspect the strategy list (left pane) -> rows render only the strategy name button (no boolean columns)

**Expected**: All four editor flags read their checked/disabled state per the Radix render format; the strategy list itself renders no boolean columns (booleans live only in the editor). (Live — corrects the assumption that the list renders boolean columns.)
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
1. On the existing pricebook, the strategy list renders one row (Total: 1)
2. On a new pricebook with 0 strategies, the empty-strategy state renders and Save is disabled

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
1. 0 strategies (new pricebook) -> empty state renders; Total: 0
2. 1 strategy (existing fixture) -> one row; Total: 1
3. N strategies (multi-add in-session on the fixture) -> N rows; Total reflects the count
4. Reload (discard)

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
1. Rename the existing strategy reversibly, Save, reload -> the change persists
2. Restore the original name and Save (cleanup)

**Expected**: A saved strategy edit survives reload (reversible, restored afterward).
**Data**: office=1604

---

## TC-CPR-STR-061: Dirty state survives sub-tab switch; nav-away prompts "Unsaved changes"
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-STR-021
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)

**Preconditions**: Pricebook Details for "2022-NP Tier 1" (office 1604), Pricing Strategy tab, clean baseline.

**Steps**:
1. Edit the strategy name (dirty), switch to the Pricing Detail tab -> Save stays enabled; no dialog (silent sub-tab switch)
2. Trigger a full navigation away (the Corporate Pricing breadcrumb) while dirty -> the "Unsaved changes" alertdialog appears ("Are you sure you want to leave this view? Any unsaved changes will be lost." — Stay / Discard); navigation is blocked until a choice
3. Click Discard -> the change is abandoned and navigation proceeds

**Expected**: Unsaved changes survive Strategy↔Detail sub-tab switches (silent); navigating away with unsaved changes raises the "Unsaved changes" prompt (Stay / Discard) and blocks navigation until resolved. (Live-confirmed.)
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
1. Type a non-matching query ("zzzz") in "Search strategies..." -> the list shows 0 rows (Total: 0)
2. Type a matching query ("2022") -> the strategy "2022-NP Tier 1" shows
3. Clear the search -> the full list returns

**Expected**: The strategy search box filters the list — a non-matching query yields no rows (Total reflects the filtered count, 0), a matching query shows the strategy. (Live-confirmed.)
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
1. Add two in-session strategies with distinct names (A, B) -> Total: 3
2. Filter by A's name -> only A shows (content-anchored, not by count)
3. Clear the filter -> all strategies show again; Total reflects the filtered vs full count
4. Reload (discard) -> Total: 1 restored

**Expected**: With multiple strategies the search narrows to matching names and Total reflects the filtered count; clearing restores the full list. In-session only.
**Data**: office=1604; in-session only
