# Corporate Pricing — Pricebook Management / Pricing Strategy Test Cases (NM-1441)

**Module**: corporate-pricing | **Total**: 25 | **Status**: Partial | **Updated**: 2026-06-05

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

### HELPER VERIFICATION LEDGER (25 XLSX `TC-ENC-PRC-1441-*` → live verdict → `TC-LOC-CPR-1NN`)

| Helper | Verdict (live 2026-06-05) | Re-ID |
|---|---|---|
| 001 entry from search link → mgmt page | VERIFIED (click pricebook link → `/details/<guid>`, "Pricebook Details") | TC-LOC-CPR-101 |
| 002 header Name | VERIFIED (h2 "2022-NP Tier 1") | TC-LOC-CPR-102 |
| 003 header Type | VERIFIED ("Equipment") | TC-LOC-CPR-103 |
| 004 header Year | VERIFIED ("2022") | TC-LOC-CPR-104 |
| 005 header Currency | VERIFIED ("USD") | TC-LOC-CPR-105 |
| 006 header Active status | VERIFIED ("Active") | TC-LOC-CPR-106 |
| 007 header reference-only/not editable | VERIFIED — `[ASSUMPTION]` RESOLVED: header is read-only paragraphs | TC-LOC-CPR-107 |
| 008 three tabs render | **CORRECTED**: live = 2 tabs; assert 2 + raise 3-tab divergence | TC-LOC-CPR-108 |
| 009 Strategy tab default | VERIFIED (Strategy active on load) | TC-LOC-CPR-109 |
| 010 Pricing Detail tab | VERIFIED (Detail tab present + activates; NM-1443 content built) | TC-LOC-CPR-110 |
| 011 History tab placeholder | **CORRECTED**: History tab ABSENT live; assert absence + clarification | TC-LOC-CPR-111 |
| 012 click existing strategy loads details | VERIFIED (loads name + flags into editor) | TC-LOC-CPR-112 |
| 013 selected strategy shows locations | VERIFIED (Locations table: 1991, 7011) | TC-LOC-CPR-113 |
| 014 edit existing + Save persists | VERIFIED-mechanism (edit enables Save; persistence test w/ restore) | TC-LOC-CPR-114 |
| 015 Add New appends row | **CORRECTED**: Add (+) opens modal → fill name → Add appends | TC-LOC-CPR-115 |
| 016 new strategy shows Remove | VERIFIED (nested Remove icon on isNew row) | TC-LOC-CPR-116 |
| 017 legacy strategies hide Remove | VERIFIED (legacy "2022-NP Tier 1" has no Remove) | TC-LOC-CPR-117 |
| 018 Remove on new deletes pre-commit | VERIFIED (Remove → row gone, Total 2→1, Save disabled, no DB) | TC-LOC-CPR-118 |
| 019 legacy cannot be removed | VERIFIED (no remove affordance on legacy) | TC-LOC-CPR-119 |
| 020 clean-state indicator | **CORRECTED**: indicator = Save button `disabled` (no separate badge) | TC-LOC-CPR-120 |
| 021 editing → dirty | VERIFIED (edit enables Save) | TC-LOC-CPR-121 |
| 022 adding → dirty | VERIFIED (Add → Save enabled) | TC-LOC-CPR-122 |
| 023 Save commits batch | VERIFIED-intent (save-cycle test w/ restore) | TC-LOC-CPR-123 |
| 024 Save confirmation feedback | VERIFIED-intent (Notifications region present; assert success in save-cycle) | TC-LOC-CPR-124 |
| 025 Save resets dirty→clean | VERIFIED-mechanism (discard → Save disabled; save → disabled) | TC-LOC-CPR-125 |

**Dropped**: 0 of 25 (all retained; 6 corrected to live reality, 0 invalid).

### Clarifications (RAISED via `/encore-questions` — Doctrine 2, not silently dropped) — see `drafts/corporate-pricing-strategy-divergences-2026-06-05.md`

| # | DOCX intent | Live reality | Disposition |
|---|---|---|---|
| CPR-STRAT-Q1 | NM-1441 §2: 3 tabs incl. **History** | Only 2 tabs (History absent) | RAISED 2026-06-05 (see `drafts/corporate-pricing-strategy-divergences-2026-06-05.md` Q1 — forwarded for Encore-team confirmation). Expected-not-yet-built (DOCX labels History "(Placeholder) NM-1444"); gated to `SUBPLAN_CORP_PRICING_1444_HISTORY.md`. Asserted live-absent in TC-111. |
| CPR-STRAT-Q2 | NM-1441 §3: "Add New" appends a fresh strategy (implies inline) | Add (+) opens a **"New Pricing Strategy" modal** first | RAISED 2026-06-05 (see `drafts/...strategy-divergences-2026-06-05.md` Q2); dispositioned as UI refinement (richer than doc), not a defect. TC-115 asserts the live dialog flow. |
| CPR-STRAT-Q3 | NM-1441 §3: strategy flags Is Productions/Is Internal/Is GSO/Is Active | `Is Internal` + `Is GSO` **disabled** when `Is Productions` checked (on this fixture) | RAISED 2026-06-05 (see `drafts/...strategy-divergences-2026-06-05.md` Q3); interdependency not in doc; each-flag/BVA deferred to `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`. |

---

## FIELD INVENTORY — Pricing Strategy Tab

Full dated inventory: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-05.md`. Pricebook `2022-NP Tier 1` (`strategyFixture`, Active); 0 `data-testid` → text/role/content-anchored selectors (D8).

| Field | Type | Default (live 2026-06-05) | State | Notes |
|---|---|---|---|---|
| Header: Name / Type / Year / Currency / Active | read-only paragraphs (h2 + 4) | "2022-NP Tier 1" / Equipment / 2022 / USD / Active | reference-only | TC-LOC-CPR-102..107 |
| Tabs | Pricing Strategy (default) + Pricing Detail | 2 tabs | — | History (NM-1444) absent live (CPR-STRAT-Q1) |
| Strategy Name | textbox | per row | editable | TC-LOC-CPR-112/114 |
| Flags: Is Productions / Is Internal / Is GSO / Is Active | checkboxes | per row | Is Internal + Is GSO disabled when Is Productions checked | CPR-STRAT-Q3 |
| Add New (+) | button → "New Pricing Strategy" modal | — | opens modal (Name + 4 flags + Add/Cancel/Close) | TC-LOC-CPR-115 |
| Remove | nested icon button | — | present on new (`isNew`) rows only; legacy rows none | TC-LOC-CPR-116/117 |
| Save | button | disabled when clean | enables on any dirty change (no separate badge) | TC-LOC-CPR-120/121 |
| Locations Using Pricing As Default | table (Local Office / Name) | 1991, 7011 | read-only | TC-LOC-CPR-113 |

## Validation Rules

- **Flag interdependency**: with `Is Productions` checked, `Is Internal` + `Is GSO` are disabled on this fixture (CPR-STRAT-Q3, raised — per-flag/BVA deferred to `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`).
- **Dirty/Save**: any edit or Add enables the single top-level Save; the clean-state indicator IS the Save `disabled` state, with no separate dirty badge (TC-LOC-CPR-120/125).
- **Remove scope**: Remove is bound to `isNew` — only un-committed (new) strategy rows can be removed pre-commit; legacy rows have no Remove affordance (TC-LOC-CPR-117/119).
- **Header**: the 5 header fields are reference-only, not editable (TC-LOC-CPR-107).

## TC-LOC-CPR-101: Pricebook link entry loads the Pricebook Details management page
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

## TC-LOC-CPR-102: Header shows the Price Book Name
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page for the "2022-NP Tier 1" pricebook -> Page loads
2. Read the header name -> Shows "2022-NP Tier 1"

**Expected**: Header name equals the pricebook name "2022-NP Tier 1".
**Data**: office=1604

---

## TC-LOC-CPR-103: Header shows the Price Book Type (Labor/Equipment)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Read the "Labor/Equipment" header value -> Shows "Equipment"

**Expected**: Header Type value is "Equipment" (one of Labor/Equipment).
**Data**: office=1604

---

## TC-LOC-CPR-104: Header shows the Price Year
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Read the "Year" header value -> Shows "2022"

**Expected**: Header Year value is "2022".
**Data**: office=1604

---

## TC-LOC-CPR-105: Header shows the Currency
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Read the "Currency" header value -> Shows "USD"

**Expected**: Header Currency value is "USD".
**Data**: office=1604

---

## TC-LOC-CPR-106: Header shows the Active status
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Read the Active-status indicator in the header -> Shows "Active"

**Expected**: Header shows a clear active/inactive indicator ("Active" for this pricebook).
**Data**: office=1604

---

## TC-LOC-CPR-107: Header fields are reference-only (not editable)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Inspect the 5 header fields (Name, Type, Year, Currency, Active) -> All render as read-only text, with no editable fields

**Expected**: No header field exposes an editable field — the header is presented as reference information only.
**Data**: office=1604

---

## TC-LOC-CPR-108: Tabs render — Pricing Strategy + Pricing Detail
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Read the tab buttons -> "Pricing Strategy" and "Pricing Detail" present, in that order
3. Note: the requirements describe a third "History" tab -> the live page shows only two (see the History-tab test)

**Expected**: Exactly two tabs render ("Pricing Strategy", "Pricing Detail"); the History tab is covered by a separate test (it is absent on the live page) and raised as a clarification for the product team.
**Data**: office=1604

---

## TC-LOC-CPR-109: Pricing Strategy tab is selected by default on load
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), opened in a fresh session.

**Steps**:
1. Open the Pricebook Details page in a fresh session -> Page loads
2. Observe which tab content renders -> Pricing Strategy content (Price Strategies list + editor) is visible

**Expected**: The Pricing Strategy tab is active by default (its content area is shown).
**Data**: office=1604

---

## TC-LOC-CPR-110: Pricing Detail tab is present and activates
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active.

**Steps**:
1. Open the Pricebook Details page -> Pricing Strategy active
2. Click the "Pricing Detail" tab -> Tab activates and its content renders

**Expected**: Clicking "Pricing Detail" activates the Detail tab; its deeper behavior is covered by the Pricing Detail test suite.
**Data**: office=1604

---

## TC-LOC-CPR-111: History tab is absent on the live site
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604).

**Steps**:
1. Open the Pricebook Details page -> Page loads
2. Search the tab row for a "History" tab -> No "History" tab is rendered

**Expected**: No History tab exists in the current version. This is raised as a clarification for the product team; the History feature is tracked separately.
**Data**: office=1604

---

## TC-LOC-CPR-112: Clicking an existing strategy loads its details
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the "2022-NP Tier 1" strategy present in the Price Strategies list.

**Steps**:
1. Open the Pricebook Details page -> Pricing Strategy active, strategy list shows "2022-NP Tier 1"
2. Click the strategy "2022-NP Tier 1" in the Price Strategies list -> Editor populates
3. Verify the editor shows the strategy name + flag checkboxes (Is Productions, Is Internal, Is GSO, Is Active)

**Expected**: Selecting a strategy loads its details into the editor (name field + flag checkboxes reflect the strategy).
**Data**: office=1604

---

## TC-LOC-CPR-113: Selected strategy displays its assigned locations
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-112
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active.

**Steps**:
1. Open the Pricebook Details page and select "2022-NP Tier 1" -> Editor loads
2. Read the "Locations Using Pricing As Default" table -> Shows the assigned locations

**Expected**: The Locations table (cols "Local Office", "Local Office Name") lists the strategy's assigned locations (e.g. 1991 Premier Global Events, 7011 Production).
**Data**: office=1604

---

## TC-LOC-CPR-114: Edit an existing strategy and Save persists the change (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-112
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

## TC-LOC-CPR-115: Add New opens the New Pricing Strategy dialog and appends a row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
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

## TC-LOC-CPR-116: Newly added strategy shows a Remove button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-115
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active, ready to add a new strategy via the dialog.

**Steps**:
1. Add a new strategy via the dialog -> New strategy row appears in the list
2. Inspect the new strategy's list item -> A Remove (icon) button is present on it
3. Discard (Remove) without Save -> Starting state restored

**Expected**: A newly-added strategy row carries a Remove affordance.
**Data**: office=1604

---

## TC-LOC-CPR-117: Legacy strategies do not show a Remove button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the existing (saved) "2022-NP Tier 1" strategy in the list.

**Steps**:
1. Open the Pricebook Details page -> Legacy strategy "2022-NP Tier 1" in the list
2. Inspect the legacy strategy's list item -> No Remove button is present

**Expected**: A saved (legacy) strategy has no Remove control.
**Data**: office=1604

---

## TC-LOC-CPR-118: Remove on a new strategy deletes it before commit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-116
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and a newly added (unsaved) strategy in the list.

**Steps**:
1. Add a new strategy via the dialog -> Total increments; Save enabled
2. Click the new strategy's Remove button -> New strategy disappears immediately
3. Verify state -> Total returns to 1; Save returns to disabled; no page reload or save to the database required

**Expected**: Removing a new (uncommitted) strategy deletes it from the list instantly with no database round trip, returning the form to clean.
**Data**: office=1604

---

## TC-LOC-CPR-119: Legacy strategies cannot be removed from the management view
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-117
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and an existing (saved) strategy visible in the list.

**Steps**:
1. Open the Pricebook Details page with a legacy strategy visible -> Page loads
2. Look for any remove/delete control on the legacy strategy -> None available

**Expected**: There is no path to remove a legacy strategy from this management view (the Remove control is available only for newly-added strategies, never for saved ones).
**Data**: office=1604

---

## TC-LOC-CPR-120: Unmodified strategy list shows the clean state (Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-101
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and no changes made.

**Steps**:
1. Open the Pricebook Details page; make no changes -> Page loads
2. Observe the Save button -> Save is disabled

**Expected**: With no pending changes the page is clean — there is no separate state badge; the Save button's disabled state is the clean indicator.
**Data**: office=1604

---

## TC-LOC-CPR-121: Editing a strategy changes the state to dirty (Save enabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-120
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active, a strategy selected, and no changes made (Save disabled).

**Steps**:
1. Open the Pricebook Details page (clean) -> Save disabled
2. Edit the selected strategy's name field -> Save button enables
3. Discard (reload / restore) without Save -> Starting state restored

**Expected**: Editing any editable strategy field transitions the page to dirty (Save enables).
**Data**: office=1604

---

## TC-LOC-CPR-122: Adding a new strategy changes the state to dirty (Save enabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-120
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and no changes made (Save disabled).

**Steps**:
1. Open the Pricebook Details page (clean) -> Save disabled
2. Add a new strategy via the dialog -> Save button enables
3. Discard (Remove) without Save -> Starting state restored

**Expected**: Adding a new strategy transitions the page to dirty (Save enables).
**Data**: office=1604

---

## TC-LOC-CPR-123: Save commits strategy edits and additions in one batch (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-114
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

## TC-LOC-CPR-124: Save provides confirmation feedback
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-114
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

## TC-LOC-CPR-125: Save resets the state from dirty to clean after success
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-114
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the "2022-NP Tier 1" pricebook (office 1604), with the Pricing Strategy tab active and the page at its default saved state.

**Steps**:
1. Confirm the starting state -> Clean starting point
2. Make a reversible change -> Save enabled (dirty)
3. Click Save and wait for success -> Save returns to disabled (clean)
4. Restore the starting state -> Starting state restored

**Expected**: After a successful Save the state indicator returns to clean (Save disabled).
**Data**: office=1604
