---
module: shared-setup
agent: hunter
date: 2026-05-12
parent_plan: plans/pending/PLAN_SHARED_SETUP_DQU.md
parent_subplan: plans/pending/SUBPLAN_SHARED_SETUP_DQU_HUNTER.md
freshness_window_days: 14
upstream_updates_made: 2 (REQUIREMENTS.md tightening + navigation.md §C row refresh; both re-revised after user screenshot review to flip BUG vs /encore-questions classification on Miami search)
session_status: complete
halt_reason: n/a (resumed Phase 1a after user-assisted headed CLI sign-in; nav2-state.json minted; Phase 1a body + Phase 2 diff completed)
identity_section2_path: C (per §2 HUNTER=READ on field-inventories/<module>-*.md; cross-field section embeds into baseline artifact §4)
---

# Phase 0 Intake — Shared Setup (Location Settings tab) — HUNTER 2026-05-12

Parent: [SUBPLAN_SHARED_SETUP_DQU_HUNTER.md](../../../../../plans/pending/SUBPLAN_SHARED_SETUP_DQU_HUNTER.md). Pilot context in [PLAN_SHARED_SETUP_DQU.md](../../../../../plans/pending/PLAN_SHARED_SETUP_DQU.md). Module = Shared Setup Locations tab on `/settings/location` (per `clients/encore/docs/MODULE_REGISTRY.md` — tab within `setup/locations`, NOT a separate module).

## Session summary

**Status**: COMPLETE — Phase 0 (Steps A/B/C/D) + Phase 1a Nav2 walk + Phase 2 diff + Phase 2.5 sweep all done. Phase 1b live spot-check substituted by LR-007 amended freshness path (on-disk E2E artifacts <14d; spec mtime 2026-05-11 = 1d, REQUIREMENTS mtime 2026-05-07 = 5d). Deviation logged in baseline DEV-001.

**Trigger sequence**: initial headless attempt at 14:30 IST failed (Gate-3: encore-state.json lacks `.psav.com` cookies; SPA redirected to `#/login/exp/...`). User-assisted path (i) executed at 14:50 IST — headed `playwright-cli open --persistent --profile=clients/encore/.auth/nav2-profile https://navigator2.training.psav.com/#/setup/locationdetail/1604` → user completed Microsoft SSO → `state-save -s=nav2 clients/encore/.auth/nav2-state.json` (9688 bytes; .psav.com domain cookies persisted). Phase 1a walk continued on the authenticated headed session; nav2 session closed cleanly post-walk.

**Authoring-time fix recommendation** (for next analogous subplan): `BrowserTool: cli` should be `BrowserTool: both` + `BrowserToolJustification: nav2 needs auth-refresh sign-in (per OSB-ACCESS-VERIFY 2026-04-24 + this session); e2e walk uses CLI headless` when both Nav2 and E2E walks are in scope. SP-PWC2-02 validator would have caught the mismatch at authoring time. Not filing as a bug; flagging as a pattern for `/compile-learnings` to consider graduating into LR-NNN if 3+ subplans repeat the same shape.

---

## §A — Extract (relevance-scored)

Pulled every existing artifact relevant to HUNTER's phase. Each row has a `relevance` score, an `investigated` marker if it came from a prior dated walk, and a one-line takeaway.

| # | Artifact | Relevance | Investigated | Takeaway |
|---|---|---|---|---|
| A1 | [clients/encore/docs/REQUIREMENTS.md §"Shared Setup Locations Tab"](../../../../docs/REQUIREMENTS.md) (lines 759-789) | HIGH | 2026-05-07 (file mtime) | Documents: 5-column grid (Local Office, Local Office Name, Primary Office, Shares Inventory, [Actions]), Office 1604 default row, behaviors (self-row read-only Primary Office disabled, Delete disabled for self, Add opens "Change Local Office" dialog, no dedicated tab Save). |
| A2 | [clients/encore/docs/MODULE_REGISTRY.md](../../../../docs/MODULE_REGISTRY.md) lines 21-24 | HIGH | 2026-04-30 (file mtime, latest registry rebuild) | Confirms: `setup/locations` module @ `/settings/location`. Shared Setup is a TAB within this module, NOT a separate module entry (per rule: "Tabs within a page are NOT separate modules"). |
| A3 | [clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md](../../../test-cases/setup/locations/locations_shared_setup_locations_test_cases.md) | HIGH | (file present, mtime not checked — exists per `ls`) | Authoritative TC list. 24 TCs (TC-LOC-SSL-001..024). To be cross-checked Phase 2 once Nav2 baseline available. |
| A4 | [clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts](../../../../tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | HIGH | 2026-05-11 (latest mtime per nav-guard pattern present at line 14) | 24 TCs runnable. 6 `test.fixme()`'d: TC-016 (`discardAndReturn` serial state breaks `clickAdd` — opens wrong dialog); TC-018/019/020/021/024 (dialog search "Miami" returns 0 results — possibly BUG-LOC-SHR-NNN candidate; needs verify). All other TCs pass per registry §C ("24/24 passing" — but 6 fixme'd means **18/18 not-fixme'd-pass**, which is a documentation drift vs §C row "24/24"). |
| A5 | [clients/encore/src/pages/setup/locations/location-shared-setup-locations.page.ts](../../../../src/pages/setup/locations/location-shared-setup-locations.page.ts) | MEDIUM | — | Helpers: `navigateToSharedSetupTab`, `reloadAndNavigateToSSLTab`, `discardAndReturn`, `ensureCleanSSLTable`, `triggerBeforeunloadAndStay`, `findNonSelfRow`, `getSelfRowText`, `getSelfPrimaryOfficeState`, `getSelfSharesInventoryState`, `toggleSelfSharesInventory`, `setSelfSharesInventory`, `clickAdd`, `searchInDialog`, `getDialogRowCount`, `selectFirstDialogRow`, `clickDialogSelect`, `clickDialogCancel`, `getFirstDialogRowText`, `getNonSelfRowState`, `toggleNonSelfSharesInventory`, `deleteNonSelfRow`, `isSaveEnabled`, `clickSave`, `openSaveDialog`, `cancelSaveDialog`, `isAddDialogVisible`, `getDialogHeading`, `hasInTabSaveButton`, `isSelfDeleteDisabled`, `getDataRowCount`, `getColumnHeaders`, `isDialogSelectEnabled`. |
| A6 | [clients/encore/src/selectors/setup/locations/shared-setup-locations.ts](../../../../src/selectors/setup/locations/shared-setup-locations.ts) | MEDIUM | — | 19 testid-based selectors. Tab: `location-settings-sub-tab-shared-setup-locations`. Table: `location-settings-table-shared-setup`. Self-row checkboxes/delete: `-checkbox-shared-location-0-primary`, `-checkbox-shared-location-0-shares-inventory`, `-btn-delete-shared-location-0`. Dialog: `location-settings-modal-change-local-office` (+ search input, results table, Select/Cancel/Close buttons). Add button: positional (`tbody tr:last-child button` — no testid available, row-index-based). |
| A7 | [clients/encore/tests/test-data/setup/locations/location-shared-setup-locations.data.ts](../../../../tests/test-data/setup/locations/location-shared-setup-locations.data.ts) | MEDIUM | — | Constants: SSL_COLUMN_HEADERS = ['Local Office', 'Local Office Name', 'Primary Office', 'Shares Inventory', '']; SELF_ROW = {1604, 'Parker Palm Springs'}; ADD_LOCATION = {searchByName: 'Miami' (~69 results expected; max 100); searchByNumber: '990002' (1 result expected); expectedName: '990002 - Test Server1'}; SSL_DIALOG_HEADING = 'Change Local Office'. |
| A8 | [clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md](../old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md) | HIGH (reference shape; STALENESS_WARNING: 18 days old, within 14-30d window per LR-013/AAE-D6) | 2026-04-24 | §3 confirms: "Shared Setup Locations" is PRESENT on BOTH old site and new site (Tabs/features PRESENT on both sites list). Old site: `https://navigator2.training.psav.com/#/setup/locationdetail/1604`, embedded sub-tabs panel within Basic Information. New site: dedicated tab under `/settings/location`. NO Shared Setup-specific field-level baseline data captured in OSB-ACCESS-VERIFY (it focused on Oracle Bundle + LM History; Shared Setup tab roam not drilled). |
| A9 | [clients/encore/specs_planning/_internal/bug-archetypes.md](../bug-archetypes.md) | MEDIUM | — | ARCH-001..012 catalogued. ARCH-013 (save-cycle) + ARCH-014 (cross-field-interaction) NOT yet authored — that's GIVER's Phase 3 task per parent PLAN_SHARED_SETUP_DQU. |
| A10 | [clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md](../field-inventories/_TEMPLATE.md) + [field-inventory-spec.md](../field-inventory-spec.md) | LOW (consumed via path C — embedded in baseline §4 rather than authored as separate inventory) | — | Frontmatter shape + 7 mandatory sections, cross-field key vocabulary (state/validation/visibility/limit/cascading/save). |
| A11 | [clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md](../old-site-baseline/notes-2026-05-11.md) | LOW (reference shape — adjacent pilot's baseline structure; not Shared Setup specific) | 2026-05-11 | Most recent baseline artifact authored, useful as the v2 schema template (post-OSB-ACCESS-VERIFY-2026-04-24). |
| A12 | [.claude/context/navigation.md](../../../../../.claude/context/navigation.md) §C row "Local Office Settings → Shared Setup Locations spec (24/24 passing)" | LOW (stale — see A4 contradiction) | 2026-04-07 first / 2026-04-07 last | Registry says "24/24 passing"; A4 shows 6 fixme'd as of 2026-05-11. Registry row needs UPDATE post-pilot. |
| A13 | `reports/bugs/BUG-LOC-SHR-*.json` | (none filed at this time — `ls` returned no matches) | — | No prior Shared Setup bug filings. |

## §B — Inventory (per-dimension knowledge)

Per parent plan Phase 0 step B table. Each field row carries `investigated: YYYY-MM-DD` + status (known <14d / stale / missing) + source.

### Fields in scope (5 effective fields per A1/A6/A7)

1. **Local Office** (column / static text in self-row + non-self rows)
2. **Local Office Name** (column / static text)
3. **Primary Office** (Radix checkbox; disabled for all rows by current UX)
4. **Shares Inventory** (Radix checkbox; editable on self + non-self rows)
5. **Delete action** (button; per-row, disabled for self-row)

Plus implicit: **Add Location** (table action button → dialog) + **Save** (shared left-panel — `location-settings-btn-save`, NOT in-tab).

### Dimension table

| Dimension | Local Office | Local Office Name | Primary Office | Shares Inventory | Delete | Add Location | Save (shared) |
|---|---|---|---|---|---|---|---|
| Default value | "1604" self-row (A7); dyn for added rows | "Parker Palm Springs" self-row (A7); dyn for added rows | checked+disabled for self-row (A1+A4 TC-003); unchecked+disabled for non-self rows (A1+A4 TC-014) | unchecked self-row (A4 TC-003) — but **CONTRADICTS A1** which says "[editable]" without stating default; checked default for non-self rows (A4 TC-019 line 262) | disabled for self (A4 TC-005) — known <14d | enabled when table loaded (A4 TC-001) — known <14d | disabled until form dirty (A4 TC-006) — known <14d |
| Allowed values | text (read-only) | text (read-only) | boolean (always disabled) | boolean (editable) | n/a (action) | n/a (action) | n/a (action) |
| Min/max/length | n/a (static) | n/a (static) | n/a | n/a | n/a | n/a | n/a |
| Format | numeric string | free text | Radix `<button role="checkbox">` (LRN-015) | Radix `<button role="checkbox">` (LRN-015) | button | button | button |
| State-dep (cross-field) | self-row pinned to office 1604 | self-row pinned | **disabled UNCONDITIONALLY** — never editable on any row per A1 + A4 TC-014. Cross-field role unclear — what flips it true beyond pinned-self-row logic? GAP. | self toggles enables Save (A4 TC-006); non-self toggle enables Save (A4 TC-019). State-dep none observed. | enabled-iff-non-self (A4 TC-005 disabled for self, TC-014 enabled for non-self) | enabled when dialog not open; disabled while dialog open (implied by A4 TC-009 isDialogSelectEnabled false initially) | enabled-iff-form-dirty (A4 TC-006 + TC-007) |
| Validation-dep | none | none | none | none | none | implicit: cannot add already-added location (A4 TC-024 fixme'd — needs Nav2 baseline + live verify) | none — Save dialog (Cancel/Ok per REQUIREMENTS line 991, shared `dlgSaveChanges`) |
| Visibility-dep | always visible | always visible | always visible per row | always visible per row | always visible per row | bottom of table always (A6 positional selector) | left panel always (A1 line 789 "shared left-panel Save") |
| Limit-dep | none | none | n/a | n/a | n/a | dialog returns 4614 rows total (A6 line 14) | n/a |
| Cascading | none | none | none | none | delete on non-self requires save to persist (A4 TC-020) | dialog excludes already-added locations (A4 TC-024 fixme'd; A1 line 788 "dialog excludes already-added locations") | clicking Save opens shared `location-settings-modal-save-changes` AlertDialog (REQUIREMENTS line 1053; LR-012 + ALL-076) |
| Save behavior | n/a | n/a | n/a | save-with-others (A4 TC-021 combined SI + add); save persists after reload (A4 TC-008/019/020) | save persists removal after reload (A4 TC-015 instant remove, TC-020 save+reload persistence) | n/a (action chains into save) | uses shared "Save Changes" dialog with **Cancel/Ok** (REQUIREMENTS line 991) — distinct from Local Office Settings which uses Cancel/Save |

### Freshness verdict (per dimension)

- **<14d** (known): Default value (A4 spec 2026-05-11 mtime), Allowed values, Format, State-dep, Validation-dep (limited), Visibility-dep, Cascading, Save behavior — all rest on the 2026-05-11 spec + 2026-05-07 REQUIREMENTS. SKIP per parent plan rule. EXCEPT:
- **STALE / MISSING from canonical artifacts**:
  - **Primary Office default state contradiction** between A1 ("Primary Office [editable]" implied) and A4 TC-003 (`checked: true, disabled: true` for self-row, A4 TC-014 `checked: false, disabled: true` for non-self). A1 phrasing in REQUIREMENTS.md is ambiguous — needs Step D upstream tightening.
  - **Shares Inventory default for self-row at fresh load** — A4 TC-003 asserts `checked: false`. A1 row table shows `unchecked [editable]`. Consistent. KNOWN.
  - **Shares Inventory default for non-self rows** — A4 TC-019 line 262 asserts `(state).sharesInventory.checked === true` post-add. Source: post-add state, NOT a fresh-baseline observation. Needs Phase 1b live spot-check + Nav2 baseline.
  - **Cross-field section D1..D6 missing for Nav2 baseline** — no Nav2 walk data on file. THIS is the gap Phase 1a was meant to close. DEFERRED.
  - **Dialog rendering of already-added locations** — A1 line 788 says "dialog excludes already-added locations". A4 TC-024 fixme'd ("Miami search returns 0 results"). Two contradictory observations — see §C bucket (iii).

### Investigated markers

| Dimension cluster | investigated_date | source |
|---|---|---|
| Field set + column headers + default Office 1604 self-row | 2026-05-07 | A1 REQUIREMENTS.md mtime |
| Behavioral assertions (TC-001..024 — 24 TCs) | 2026-05-11 | A4 spec mtime (latest nav-guard rollout) |
| Selectors + DOM notes | 2026-04-29 | A6 inline comment "(added 2026-04-29)" — column header testids + dialog defensive selectors |
| OSB Nav2 architectural notes | 2026-04-24 | A8 OSB-ACCESS-VERIFY mtime — STALENESS_WARNING 18d (within 14-30d window) |
| **Nav2 per-field baseline for Shared Setup tab** | **NEVER (missing)** | — — Phase 1a target |

## §C — Gap-name (three buckets per parent plan)

### (i) Missing-from-canonical-docs

| # | Gap | Where it should live | Severity |
|---|---|---|---|
| C-i-1 | **Nav2 baseline of Shared Setup tab — per-field defaults, validation, save behavior, cross-field deps** | `old-site-baseline/shared-setup-2026-05-12.md` (this session's target — stub emitted, BODY pending Phase 1a) | HIGH — pilot acceptance blocker |
| C-i-2 | **Primary Office "always disabled" rule** is implicit in A1/A4 but not documented as an explicit business rule. Why is Primary Office never editable, on any row? Is the feature itself an in-flight UX (read-only column awaiting backend support)? | REQUIREMENTS.md §Shared Setup Locations Tab — add explicit "Primary Office Behavior" subsection. **PENDING Step D**. | MEDIUM |
| C-i-3 | **Dialog max-row count of 4614** is in A6 source code comment but not in REQUIREMENTS. Confirms full-list-mode (no server-side filter). | REQUIREMENTS.md — add to "Behaviors" list. **PENDING Step D**. | LOW |
| C-i-4 | **Save Changes dialog button text** for SSL save flow — REQUIREMENTS line 991 says "Cancel/Ok" buttons for Location Settings shared dialog; A4 spec uses `openSaveDialog`/`cancelSaveDialog` (TC-022). Confirms shared dialog. But Nav2 baseline equivalent not documented. | Baseline §4. **PENDING Phase 1a.** | LOW |

### (ii) Stale-vs-live (artifact says X, live DOM says Y)

| # | Gap | Source claim | Evidence to verify |
|---|---|---|---|
| C-ii-1 | navigation.md §C: "Shared Setup Locations spec (24/24 passing)" (last updated 2026-04-07) vs A4: **6 of 24 are `test.fixme()`'d** (TC-016, TC-018, TC-019, TC-020, TC-021, TC-024 as of 2026-05-11). Effective pass-rate = 18/18 not-fixme'd. | navigation.md row stale by 5+ weeks. Needs registry UPDATE in /reflect. | navigation.md §C row UPDATE. **PENDING Step D upstream — or roll into /reflect for next session**. |
| C-ii-2 | A1 REQUIREMENTS Default Data table: `unchecked [editable]` for self-row Shares Inventory — implies editable. A4 TC-003 line 47 spec confirms `disabled: false` (editable). Live: needs spot-verify. | A1 + A4 agree → likely correct; no contradiction. | n/a — verify via live spot-check during Phase 1b (PENDING). |
| C-ii-3 | A1 line 788 "dialog excludes already-added locations" vs A4 TC-024 line 376 fixme'd ("Miami search returns 0 results — table body empty after search"). | A1's exclusion behavior cannot be currently verified because the dialog search itself appears broken on "Miami" — pre-existing issue per A4 line 207. **Possible BUG-LOC-SHR-001 candidate** (dialog name-search regression) pending verify. | Phase 1b live spot-check + Nav2 baseline (does Nav2 dialog name-search work for "Miami"?). **PENDING Phase 1a/1b.** |

### (iii) Cross-artifact contradictions

| # | Gap | Artifact A | Artifact B | Resolution path |
|---|---|---|---|---|
| C-iii-1 | "Miami search returns 0 results" | A4 spec TC-018 line 207 (fixme reason) | A7 test-data line 25 `searchByName: 'Miami'` with `~69 filtered rows` expected | Either the test data is stale (location list changed; "Miami" stopped matching) OR the dialog name-search has regressed (BUG-LOC-SHR candidate). **Resolution requires Phase 1b live spot-check.** |
| C-iii-2 | "24/24 passing" registry row vs 6 fixme'd in current spec | A12 navigation.md §C | A4 spec 2026-05-11 mtime | Registry stale. UPDATE in /reflect or Step D. |
| C-iii-3 | "Primary Office is editable for non-self rows" — implied UX expectation | (none — no artifact claims this) | A1 + A4 TC-014: Primary Office disabled for ALL rows | **Not a contradiction** — both A1 + A4 agree it's disabled. The "implied UX" expectation is mine (the rule "primary office of a shared location" suggests it should be settable). FLAG as discussion-item, not bug — per `feedback_discussion_item_not_bug.md` (empty-everywhere + no-UI-path + no-Jira). |

## §D — Update-upstream (executed)

Phase 1a Nav2 walk + Phase 2 diff produced concrete content to push upstream. Executed:

1. **REQUIREMENTS.md §Shared Setup Locations Tab** (lines 759-789) — tightened Primary Office state language ("disabled on ALL rows; display-only column"); added Save dialog Cancel/Ok confirmation; added Nav2 baseline framework note (SlickGrid → Radix UX upgrade). 1 update.
2. **MODULE_REGISTRY.md** — no edits made (Shared Setup is correctly registered as a tab in `setup/locations` per A2; confirmed no MODULE_REGISTRY drift).
3. **navigation.md §C** — updated "Shared Setup Locations spec (24/24 passing)" row to "18/18 not-fixme'd passing; 6 fixme'd: TC-016 discardAndReturn serial state + TC-018/019/020/021/024 dialog 'Miami' name-search returns 0 results (BASELINE-ABSENT per SHR-DIV-006 → /encore-questions Tier-A)". Last updated 2026-05-12. 1 update.
4. **bug-archetypes.md** — no edits (ARCH-013/014 are GIVER's task per parent plan).

upstream_updates_made = **2**.

## §E — Phase 2 diff outcomes (revised 2026-05-12 16:05 IST after user screenshot review)

6 divergences classified (full table in baseline §6):
- 3 INTENTIONAL-UX-CHANGE (SHR-DIV-003 Delete UX, SHR-DIV-004 Save dialog, SHR-DIV-005 page layout)
- 2 PARITY-WITH-INTERACTION-OR-TRIGGER-DIVERGENCE (SHR-DIV-001 self-row SI editable on both sides — Nav2 needs click-cell-to-activate; SHR-DIV-002 dialog UX parity on both sides — trigger differs Nav2:empty-grid-cell vs E2E:Add-button)
- 1 CONFIRMED REGRESSION (SHR-DIV-006 dialog "Miami" name-search — Nav2 returns 10+; E2E returns 0) → filed as `reports/bugs/BUG-LOC-SHR-001.json` per LR-034

**Bugs filed**: 1 (`BUG-LOC-SHR-001.json` — Miami name-search regression with baselineComparison + baselineEvidence; affects 5 fixme'd TCs SSL-018/019/020/021/024). 0 /encore-questions candidates (earlier 2 flags WITHDRAWN after user-confirmed screenshots proved both items have working Nav2 baselines).

## §F — Phase 2.5 Adjacent-Sweep outcomes

| Item discovered | Disposition | Action |
|---|---|---|
| navigation.md §C "Shared Setup Locations spec (24/24 passing)" stale 2026-04-07 → reality 18/18 + 6 fixme'd | **DO-NOW** | Edited inline as part of Step D #3 above |
| REQUIREMENTS.md Primary Office state language ambiguous on per-row editability | **DO-NOW** | Edited inline as part of Step D #1 above |
| `field-inventories/shared-setup-2026-05-12.md` formal file NOT authored (path C decision) | **APPEND** to SUBPLAN_SHARED_SETUP_DQU_GIVER.md as a grep-verifiable line item under Phase 3 (cite path C resolution; GIVER lifts baseline §4 cross-field section into formal field-inventory) | Documented in this artifact's deviation_log; GIVER subplan body already enumerates field-inventory authoring as its Phase 3 task — no actual subplan-body edit needed (verified via grep) |
| LM History col 59-61 Nav2 live walk | **APPEND** to SUBPLAN_HISTORY_01_MCP_FINDINGS or SP-DQU-20 if applicable — but those subplans exist as completed work; this is a no-op for the pilot scope | Discussion-item per `feedback_discussion_item_not_bug.md` — LM History Glyphicon detection is governed by LR-036 + existing helpers; not in Shared Setup pilot's scope |

No bare "out of scope" or unrouted items.

---

## Resume contract (next session) — N/A

Session is complete; GIVER is unblocked. See baseline §7 `giver_unblock_state: ready`.
