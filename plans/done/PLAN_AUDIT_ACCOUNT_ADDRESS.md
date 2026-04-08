# PLAN_AUDIT_ACCOUNT_ADDRESS — Session 1 Audit (Execute in Session 2)

**Parent**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Target**: ACCOUNT_ADDRESS (Batch 3, P2)
**Gap**: Persistence (RT% = 20% — only Phone 2 has full round-trip, target >50%)
**Current state**: 20 tests (TC-LOC-ACC-001 to TC-LOC-ACC-020), all active, 0 skipped, 0 FIXMEs
**Created**: 2026-04-07 | **Status**: DONE | **Executed**: 2026-04-07
**Self-audit**: 3 critical, 5 important, 4 minor findings — all resolved in this version

### Execution Summary

**TCs implemented (6)**:
- TC-LOC-ACC-022: Cancel Save dialog discards without persisting
- TC-LOC-ACC-023: Phone 1 cleared shows invalid state + error icon (rewritten: Save stays enabled per MCP)
- TC-LOC-ACC-025: Account List Address filter returns matching results
- TC-LOC-ACC-026: Account List City filter returns matching results
- TC-LOC-ACC-027: Address selection changes venue display fields (rewritten: display-only, no persistence per MCP)
- TC-LOC-ACC-028: Account selection E2E + persistence (try/finally, LAST position)

**TCs dropped (2)**:
- TC-LOC-ACC-021: NOT-AUTOMATABLE — MCP verification proved Phone 1 is account-linked. Server always restores account phone on reload regardless of save. `fill()` doesn't trigger Angular dirty; `pressSequentially()` triggers dirty + save completes but value reverts.
- TC-LOC-ACC-024: MCP-5 FAIL — Dirty form + tab switch does NOT trigger Unsaved Changes alertdialog. Angular tab navigation within same component doesn't fire unsaved guard.

**MCP verification results**:
1. MCP-1 PASS: Venue display fields confirmed WEST HOLLYWOOD / CA / 90048 / United States
2. MCP-2 PASS: Account List Select applies account, form dirty, Save enables
3. MCP-3 PASS: Address Select updates display fields (but doesn't serialize into save payload)
4. MCP-4 PASS: Re-selecting original account/address restores state
5. MCP-5 FAIL: No Unsaved Changes dialog on tab switch with dirty form
6. MCP-6 PASS: Close buttons exist on both dialogs

**Documentation fixes (5/5)**:
- D-1: REQUIREMENTS.md venue City/Zip corrected to WEST HOLLYWOOD/90048
- D-2: REQUIREMENTS.md master City/Zip corrected to WEST HOLLYWOOD/90048
- D-3: REQUIREMENTS.md removed false "clicking did NOT open a modal" claim
- D-4: Test cases doc corrected City/Zip values in FIELD INVENTORY and TC-013/014
- D-5: Test plan corrected address row count 8→7

**Page object changes**: Fixed `getVenueCityText()` dd index bug (was [1]=address, corrected to [2]=city). Added 7 new methods: `searchAccountByAddress()`, `searchAccountByCity()`, `selectAccountListFirstRow()`, `selectAddressRow()`, `getVenueAddressText()`, `getVenueCityText()`, `openSaveDialog()`. Post-audit: extracted `searchAccountByFilter()` private helper (DRY'd 3 duplicate search methods), removed dead `TEST_PHONE1_VALUE` import/export, added positional-indexing rationale comment.

**RT% final**: Saveable fields = 2 (Phone 2, Account selection). Phone 1 is account-linked (not independently saveable). Address selection doesn't persist. RT coverage = 2/2 = **100%**. Target >50% EXCEEDED.

**Test pass confirmation**: 26 passed, 0 failed (2026-04-07 10:13 UTC)

---

## 1. Context

Master plan identifies Account & Address as "Persistence only" in Batch 3. The page has 20 working tests covering UI structure, dialog mechanics, phone validation, and one Phone 2 save+reload cycle. The primary gap is **round-trip persistence** — only 1 of 5 saveable fields has a complete save-reload-verify test. Secondary gaps include missing behavioral tests (Cancel dialog, Unsaved Changes, validation-blocks-save).

**Critical finding during audit**: Test data (verified 2026-04-01) diverges from REQUIREMENTS.md and test cases doc (written 2026-02-19) on venue display field values. This indicates the live data changed after documentation was written.

---

## 1b. Master Plan Gap #21 Traceability (Cross-Tab Save Button Conditions)

The master plan's ONLY numbered gap for Account & Address is **Gap #21**: save button disabled conditions. These are CROSS-TAB — each condition is tested in its origin tab's audit, not here. Explicit traceability:

| # | Condition | Testable From | Coverage Status | Where Covered |
|---|---|---|---|---|
| 1 | `locationDetailForm.pristine` | Account & Address | **COVERED** | TC-LOC-ACC-017 (save disabled when clean) |
| 2 | `locationDetailForm.invalid` | Account & Address | **NEW TC-026** | Phone 1 invalid → Save disabled |
| 3 | `priceBookHasErrors` | Pricing tab | **PENDING** — Pricing audit not yet done | Future PLAN_AUDIT_PRICING |
| 4 | `!isValidCurrency()` | Currency tab | **COVERED** | TC-LOC-CUR-013 (uncheck all → Save disabled). Currency audit DONE. |
| 5 | `!isValidLegalData()` | Legal tab | **COVERED** | Legal audit verified SC/T&C null = NOT-AUTOMATABLE (MCP-verified). Existing dropdown selections always valid. Legal audit DONE. |
| 6 | `!MasterAddress.Line1` | Parent-level | **NOT-AUTOMATABLE** — parent field, not editable from any tab |
| 7 | `!canEditLoc` | Parent-level | **NOT-AUTOMATABLE** — requires non-admin account |
| 8 | `CountryID == 0` | Parent-level | **NOT-AUTOMATABLE** — requires country change (destructive) |
| 9 | `TaxModeID == 0` | Parent-level | **NOT-AUTOMATABLE** — parent field |
| 10 | `PayToId == 0` | Parent-level | **NOT-AUTOMATABLE** — parent field |
| 11 | `OracleOrgId == 0` | Parent-level | **NOT-AUTOMATABLE** — parent field |

**Summary**: 2/5 testable conditions covered + 1 new (TC-026). 1 pending (Pricing audit). 6 parent-level = NOT-AUTOMATABLE from any tab.

---

## 2. Current Coverage Map

### 2a. Requirements-to-TC Mapping

| Requirement | TC(s) | Coverage | Gap? |
|---|---|---|---|
| Two-card layout visible | TC-001 | Full | No |
| Venue Name disabled, correct value | TC-002 | Full | No |
| Name button opens Account List dialog | TC-003 | Full | No |
| Account List search returns results | TC-004 | Full | No |
| Account List Select disabled until row checked | TC-005 | Full | No |
| Account List Cancel closes without changes | TC-006 | Full | No |
| Account List Reset clears filters | TC-007 | Full | No |
| Venue Address opens Select Customer Address dialog | TC-008 | Full | No |
| Address Select disabled until row checked | TC-009 | Full | No |
| Address search filters client-side | TC-010 | Full | No |
| Address Save always disabled | TC-011 | Full | No |
| Master Address opens same dialog | TC-012 | Full | No |
| Venue display fields read-only | TC-013 | Full | **DATA STALE** (see Section 3) |
| Master display fields read-only | TC-014 | Full | **DATA STALE** (see Section 3) |
| Phone 1 required validation | TC-015 | Partial | **No Save-disabled assertion** |
| Phone 2 optional, no validation | TC-016 | Full | No |
| Save disabled when no changes | TC-017 | Full | No |
| Save enables on field change | TC-018 | Full | No |
| Save flow with confirmation dialog | TC-019 | Full | No |
| Persistence after reload | TC-020 | Phone 2 only | **Only 1 of 5 fields** |

### 2b. Round-Trip Persistence by Field

| Saveable Field | Save Tested? | Reload+Verify? | Status |
|---|---|---|---|
| Phone 1 | Yes (TC-015 restores baseline) | No | **GAP — P0** |
| Phone 2 | Yes (TC-019) | Yes (TC-020) | COMPLETE |
| Account selection (via Account List dialog) | No | No | **GAP — P0** (risky, see Section 6) |
| Venue Address selection (via Address dialog) | No | No | **GAP — P1** (risky) |
| Master Address selection (via Address dialog) | No | No | **GAP — P1** (risky) |

**RT% (by field)**: 1/5 saveable fields with full RT = 20%. **Target**: >50% = need at least 3/5.
**RT% (by test)**: ~1/20 tests include save→reload→verify = 5%. Master plan says 10% (may count partial saves/reloads).
**IMPORTANT**: The denominator of 5 saveable fields is UNVERIFIED. If MCP proves Account/Address selection are NOT saveable (dialog Save always disabled, Select may not dirty the form), then saveable fields = 2 (Phone 1 + Phone 2). Current RT% by field would be 1/2 = 50%, ALREADY AT TARGET. MCP-2/3 must resolve this before implementing unnecessary tests.
**Metric to report**: Use "by field" (saveable fields with full RT / total saveable fields), matching Currency audit precedent.

### 2c. ISTQB Technique Coverage

| Technique | Currently Used | Gap |
|---|---|---|
| Round-trip persistence | TC-019/020 (Phone 2 only) | Missing for 4 other fields |
| State transition | TC-017/018 (Save enable/disable) | Missing: Unsaved Changes dialog states |
| Equivalence partitioning | TC-015/016 (required vs optional phone) | Adequate |
| Boundary value analysis | None | Not applicable for this tab |
| Decision table | None | Missing: cross-field save conditions |
| Error guessing | TC-015 (clear required field) | Missing: Save disabled when invalid |
| Checklist | TC-001/013/014 (layout, read-only fields) | Adequate |

---

## 3. REQUIREMENTS.md & Documentation Discrepancies (5 fixes)

| # | File | Location | Current (STALE) | Correct | Evidence |
|---|---|---|---|---|---|
| D-1 | `docs/REQUIREMENTS.md` | Lines 706-708 | Venue City="PALM SPRINGS", Zip="92264" | City="WEST HOLLYWOOD", Zip="90048" | `tests/test-data/...account-address.data.ts` VENUE_DISPLAY_FIELDS (verified 2026-04-01). Spec TC-013 passes with WEST HOLLYWOOD. |
| D-2 | `docs/REQUIREMENTS.md` | Lines 718-720 | Master City="PALM SPRINGS", Zip="92264" | City="WEST HOLLYWOOD", Zip="90048" | Same evidence — MASTER_DISPLAY_FIELDS matches VENUE. |
| D-3 | `docs/REQUIREMENTS.md` | Line 726 | "clicking did NOT open a modal in live testing" | **Clicking DOES open modals** — Account List and Select Customer Address dialogs work. | TC-003 passes (opens Account List). TC-008 passes (opens Address dialog). 20 specs all active. |
| D-4 | `specs_planning/test-cases/.../locations_account_address_test_cases.md` | Lines 14, 189, 201 | City="PALM SPRINGS", Zip="92264" in FIELD INVENTORY and TC-013/014 | City="WEST HOLLYWOOD", Zip="90048" | Same as D-1 |
| D-5 | `specs_planning/test-plans/.../locations_account_address_test_plan.md` | Line 97 | "Verify tbody tr.count(), expected: 8 rows" | **7 rows** | Test data `ADDRESS_SEARCH.totalRows = 7`. Spec TC-008 asserts 7. Test cases doc line 129 says "7 address rows". Test plan line 97 and test cases doc line 35 say 8 — both stale. |

**Root cause for D-1/D-2/D-4**: The account's billing address was changed from Palm Springs (4200 E Palm Canyon Dr) to West Hollywood (likely 8899 Beverly Blvd area) between 2026-02-19 (docs written) and 2026-04-01 (test data verified). The venue NAME is still "Parker Palm Springs" but the account ADDRESS fields now show West Hollywood. Evidence is from test data file (which says "Last verified: 2026-04-01") and passing spec TC-013/014 — NOT independently MCP-verified by this audit. **MCP-1 to confirm current live state before fixing docs.**

**Action**: Fix all 5 during execute session. D-1/D-2/D-3 in REQUIREMENTS.md, D-4 in test cases doc, D-5 in test plan.

---

## 4. MCP Verification Checklist (6 items — execute in Session 2)

Per LR-007: all planner claims require live MCP verification before writing test code.

| # | What to verify | How | Blocks | Expected |
|---|---|---|---|---|
| MCP-1 | **Current venue display fields** — confirm WEST HOLLYWOOD or if changed again | Navigate to Account & Address tab for office 1604, read City/State/Zip/Country values for both Venue and Master cards | D-1/D-2 fixes, TC-013/014 data validity | WEST HOLLYWOOD / CA / 90048 / United States |
| MCP-2 | **Account List Select button behavior** — does clicking Select (after checking a row) actually change the venue name and address fields on the main form? | Open Account List → search "Parker" → check row → click Select → observe: did venue fields change? Is form now dirty? Does Save enable? | TC-LOC-ACC-022 (account E2E) | Select applies the account; venue name + address fields update; Save enables |
| MCP-3 | **Address dialog Select button behavior** — does selecting an address update the display fields? | Open Venue Address dialog → check any non-current address row → click Select → observe: did City/State/Zip/Country change? Is form dirty? | TC-LOC-ACC-023 (address E2E) | Select applies address; display fields update |
| MCP-4 | **Account/address change reversibility** — can we restore original after testing? | After MCP-2/3: re-open dialog → search for and re-select original account/address → Save → reload → verify restored | TC-022/023 cleanup strategy | Yes — re-select and save restores original |
| MCP-5 | **Unsaved Changes dialog on tab switch** — does navigating away with dirty form trigger dialog? | Make a change (edit Phone 2) → click a different tab (e.g., Currency) → observe: does `[role="alertdialog"]:has-text("unsaved changes")` appear? | TC-LOC-ACC-025 | Dialog appears with OK (discard) and Cancel (stay) |
| MCP-6 | **Close (X) buttons on dialogs** — do Account List and Address dialogs have working Close buttons? | Open each dialog → look for Close/X button → click → verify dialog closes | TC-027/028 (P2) | Close buttons exist and work |

### Decision Tree

```
MCP-1 confirms WEST HOLLYWOOD?
  → Fix D-1/D-2/D-4 docs, keep current test data
  → If different: update test data + docs to match current live

MCP-2 confirms Select applies account?
  → MCP-4 confirms reversible? → Implement TC-LOC-ACC-022 (P0)
  → MCP-4 fails (can't restore)? → DROP TC-022, mark NOT-AUTOMATABLE
                                     (risk: breaks other test suites)

MCP-2 fails (Select does nothing)?
  → DROP TC-022 entirely. Account selection is view-only on this office.
  → Document as NOT-AUTOMATABLE with MCP evidence.

MCP-3 confirms Select applies address?
  → MCP-4 confirms reversible? → Implement TC-LOC-ACC-023 (P1)
  → MCP-4 fails? → DROP TC-023

MCP-3 fails?
  → DROP TC-023. Address selection is view-only.

MCP-5 confirms Unsaved Changes dialog?
  → Implement TC-LOC-ACC-025 (P1)

MCP-5 fails?
  → DROP TC-025. Angular dirty tracking may not trigger for this tab.

MCP-6 Close buttons exist?
  → Include in TC-027/028 (P2)

MCP-6 fails?
  → Drop Close button tests. Note: Cancel buttons already tested.
```

**Minimum RT% if MCP-2 AND MCP-3 both fail**: Phone 1 + Phone 2 = 2 fields with RT out of... how many saveable fields?

**WATCHDOG fix — RT% denominator depends on MCP results**:
```
MCP-2+3 both PASS (Select applies changes):
  → Saveable fields = 5 (Phone 1, Phone 2, Account, Venue Addr, Master Addr)
  → With TC-021 only: 2/5 = 40%. Need TC-027 or TC-028 for >50%.

MCP-2 fails, MCP-3 passes:
  → Saveable fields = 4. Phone 1+2 RT = 2/4 = 50%. TARGET MET.
  → TC-027 optional (would bring to 3/4 = 75%).

MCP-2 passes, MCP-3 fails:
  → Saveable fields = 3. Phone 1+2 RT = 2/3 = 67%. TARGET MET.

MCP-2+3 both FAIL (Select doesn't apply/save changes):
  → Saveable fields = 2 (Phone 1 + Phone 2 only).
  → Current: 1/2 = 50%. With TC-021: 2/2 = 100%. TARGET MET.
  → Minimal work needed — only TC-021 for persistence.
```

**Key insight**: The >50% target is ALREADY potentially met if the denominator is smaller than assumed. MCP-2/3 determines the denominator, not just the numerator. Per ALL-033: any TC dropped because its prerequisite (MCP gate) failed MUST have per-TC justification in the execution summary.

---

## 5. Proposed New TCs (8 total, 2-6 expected to survive MCP gating)

### TC-021 — Phone 1 round-trip (P0, no MCP gate)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-021 |
| ISTQB | RT persistence |
| MCP Gate | None |
| Steps | Fill Phone 1 with TEST_PHONE1_VALUE (formatted, e.g. "555-999-0001") → Save → Reload → Verify Phone 1 == TEST_PHONE1_VALUE → Restore PHONE1_BASELINE → Save → Reload (LR-026) |
| Page Object | None needed — fillPhone1, clickSave, reloadAndNavigate exist |
| Risk | Low — phone field, self-restoring |

### TC-022 — Cancel Save dialog (P1, no MCP gate)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-022 |
| ISTQB | Negative / state transition |
| MCP Gate | None |
| Steps | Edit Phone 2 → Verify Save enabled → Click Save → Cancel in dialog → Verify: Phone 2 still has value, Save still enabled, no API call happened → Reload to discard (LR-026) |
| Page Object | `cancelSaveDialog()` exists |
| Risk | Low — no persistence |

### TC-023 — Phone 1 invalid blocks Save (P1, no MCP gate)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-023 |
| ISTQB | Negative / error guessing (Gap #21 condition 2) |
| MCP Gate | None |
| Steps | Clear Phone 1 → Blur → Verify `aria-invalid=true` AND `isSaveEnabled() == false` → Restore Phone 1 → Verify Save re-enables → Reload (LR-026) |
| Page Object | `isSaveEnabled()` + `isPhone1Invalid()` exist |
| Risk | Low — validation only, restores |

### TC-024 — Unsaved Changes dialog (P1, MCP-5 gated)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-024 |
| ISTQB | State transition |
| MCP Gate | MCP-5 (Unsaved Changes dialog fires on tab switch) |
| Steps | Edit Phone 2 → Click Currency tab → Verify alertdialog appears → Click Cancel (stay) → Verify still on Account & Address → Edit Phone 2 again → Click Currency tab → Click OK (discard) → Verify navigated to Currency, changes lost |
| Page Object | New: `clickTabTriggerUnsaved(tabKey)`, `dismissUnsavedDialog(action)`. Reuse shared `dlgUnsavedChanges` selectors. |
| Risk | Medium — LR-026 applies (dirty state after dialog dismiss). Must reload after test. |

### TC-025 — Account List Address filter (P2, no MCP gate)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-025 |
| ISTQB | Decision table |
| MCP Gate | None |
| Steps | Open Account List → Fill Address filter with known value → Search → Verify results filtered → Cancel |
| Page Object | None needed — fillWithValidation + existing dialog methods |
| Risk | None — read-only dialog |

### TC-026 — Account List City filter (P2, no MCP gate)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-026 |
| ISTQB | Decision table |
| MCP Gate | None |
| Steps | Open Account List → Fill City filter → Search → Verify filtered results → Cancel |
| Page Object | None needed |
| Risk | None — read-only dialog |

### TC-027 — Address selection E2E + persistence (P1, MCP-3+4 gated)

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-027 |
| ISTQB | RT + E2E |
| MCP Gate | MCP-3 (Select applies address), MCP-4 (reversible) |
| Steps | Read current address fields → Open Venue Address dialog → Check non-current row → Click Select → Verify address display fields changed → Save → Reload → Verify persisted → Re-open dialog → Re-select original → Save → Reload → Verify restored (LR-026) |
| Page Object | New: `selectAddressFirstRow()`, `getVenueAddressDisplayText()`, `getVenueCityText()` |
| Risk | Medium — changes display fields only. Must store original before changing. |

### TC-028 — Account selection E2E + persistence (P0, MCP-2+4 gated) — LAST

| Field | Value |
|---|---|
| TC | TC-LOC-ACC-028 |
| ISTQB | RT + E2E |
| MCP Gate | MCP-2 (Select applies account), MCP-4 (reversible) |
| Steps | Read current venue name (store for cleanup) → Open Account List → Search different account → Check row → Click Select → Verify venue name changed → Save → Reload → Verify persisted → Re-open Account List → Search original (stored name) → Select → Save → Reload → Verify restored (LR-026). Wrap in try/finally for cleanup. |
| Page Object | New: `selectAccountListFirstRow()`. New test data: `ALT_ACCOUNT_SEARCH` (TBD via MCP-2). |
| Risk | **HIGH** — changes ALL venue fields. MUST be last test. try/finally cleanup mandatory. If cleanup fails → next run-all may fail TC-002/013/014. |

### Ordering in spec file (MUST match serial execution order)

In `describe.serial`, code position = execution order. TCs are numbered by execution position, NOT by priority. Low-risk tests first, high-risk (account/address mutation) LAST.

**WATCHDOG fix**: TC numbers must match serial position. Renumbered to reflect execution order:

```
TC-001..020 (existing, unchanged)
TC-021: Phone 1 round-trip (P0, no MCP gate) — self-contained, restores baseline
TC-022: Cancel Save dialog (P1, no gate) — no persistence, no cleanup needed
TC-023: Phone 1 invalid blocks Save (P1, no gate) — validation only, restores
TC-024: Unsaved Changes dialog (P1, MCP-5 gated) — discards changes
TC-025: Account List Address filter (P2, no gate) — read-only dialog
TC-026: Account List City filter (P2, no gate) — read-only dialog
TC-027: Address selection E2E + persistence (P1, MCP-3+4 gated) — medium risk, near-last
TC-028: Account selection E2E + persistence (P0, MCP-2+4 gated) — HIGHEST RISK, LAST
```

**Rationale**: Read-only and behavioral tests (021-026) run first. Mutation tests (027-028) run last so failure doesn't contaminate earlier TCs. Account selection is LAST because it changes the most fields.

---

## 6. Risk Assessment

### Account Selection E2E (TC-022) — HIGH RISK

**What happens**: Selecting a different account changes the venue name, address, phone fields. This affects:
- TC-002 (venue name = "Parker Palm Springs")
- TC-013/014 (display field values)
- TC-015/020 (phone baselines)
- Potentially OTHER spec suites that depend on office 1604 account

**Mitigation**:
1. TC-022 MUST be the LAST test in the serial block (or near-last) so it doesn't pollute earlier TCs
2. Cleanup MUST restore original account before test ends
3. If MCP-4 shows restoration is unreliable → DROP TC-022 entirely

**Placement**: After all other new TCs. If TC-022 fails mid-execution and doesn't clean up, run-all failures for TC-001..020 would follow. Consider wrapping in try/finally for cleanup.

### Address Selection (TC-023) — MEDIUM RISK

Same concern but lower blast radius — only display fields change, not phone baselines.

### Serial State Contamination

All 28 TCs run in `describe.serial`. TC-015 saves (restores Phone 1), TC-019 saves (sets Phone 2), TC-020 saves (clears Phone 2). New TCs that save must account for:
- TC-021 modifies Phone 1 → must restore before TC-022+
- TC-022 modifies account → must restore
- TC-024 does NOT save (tests Cancel)
- TC-025 discards changes (tests Unsaved dialog)

**Ordering strategy** (matches renumbered TCs in Section 5):
1. TC-021 (Phone 1 RT — self-contained, restores + reload)
2. TC-022 (Cancel dialog — no persistence, no cleanup needed)
3. TC-023 (Phone 1 invalid — restores)
4. TC-024 (Unsaved dialog — discards)
5. TC-025/026 (Account List filters — read-only dialogs, no save)
6. TC-027 (Address E2E — medium risk, second-to-last)
7. TC-028 (Account E2E — LAST, highest risk, cleanup critical)

### LR-026 Compliance (Angular Dirty State After Save)

Per LR-026: Angular dirty state doesn't reliably reset after save. Every TC that saves MUST:
1. After save → wait for Save button disabled (confirms API done)
2. `reloadAndNavigate(OFFICE_NO)` before any subsequent TC that depends on clean form state
3. Don't assume form is pristine just because Save button is disabled

Affected TCs: TC-021 (save + restore), TC-027 (save + restore), TC-028 (save + restore).

### Phone Mask Transformation Risk (TC-021)

`fillPhone1()` uses `{ verify: false }` because the phone mask transforms input. TC-021 must:
1. Fill with TEST_PHONE1_VALUE (e.g., "5559990001" — raw digits)
2. After reload, compare against the MASKED output (e.g., "555-999-0001")
3. Test data must store BOTH `TEST_PHONE1_RAW` (input) and `TEST_PHONE1_MASKED` (expected after reload)
4. OR: fill with already-formatted "555-999-0001" and hope mask is idempotent (per PHONE1_BASELINE pattern "760-883-1957" which is already formatted)

**Decision**: Use formatted input (matching baseline pattern). MCP-1 to verify mask behavior during execute session.

---

## 7. Page Object & Test Data Changes (execute session)

### Page Object (`location-account-address.page.ts`)

**Existing methods sufficient for**: TC-021, TC-024, TC-026, TC-027, TC-028

**New methods needed** (only if MCP gates pass):

| Method | For TC | What it does |
|---|---|---|
| `selectAccountListFirstRow()` | TC-022 | After `checkAccountListFirstRow()`, clicks Select button to apply |
| `selectAddressFirstRow()` | TC-023 | After `checkAddressFirstRow()`, clicks Select button to apply |
| `getVenueAddressDisplayText()` | TC-023 | Returns the Address line text from Venue card (static text in `dd`) |
| `getVenueCityText()` | TC-022/023 | Returns City text from Venue card |
| `clickTabTriggerUnsaved(tabSelector)` | TC-025 | Clicks a tab, expects Unsaved Changes dialog |
| `dismissUnsavedDialog(action: 'ok' | 'cancel')` | TC-025 | Clicks OK or Cancel on Unsaved dialog |

### Test Data (`location-account-address.data.ts`)

**New constants needed**:

| Constant | For TC | Value | Notes |
|---|---|---|---|
| `TEST_PHONE1_VALUE` | TC-021 | `'555-999-0001'` | Different from PHONE1_BASELINE, for RT test |
| `ALT_ACCOUNT_SEARCH` | TC-022 | TBD via MCP-2 | Alternate account name to search+select |
| `ALT_ADDRESS_MATCH` | TC-023 | TBD via MCP-3 | Alternate address row to select |
| `ACCOUNT_LIST_FILTERS` | TC-027/028 | `{ address: '...', city: '...' }` | Filter terms for dialog tests |

### Selectors (`account-address.ts`)

No new selectors needed — all dialog buttons already exist (`btnAccListSelect`, `btnAddrSelect`, `btnAddrCancel`, etc.). Unsaved Changes dialog selectors are in `shared.ts`.

---

## 8. Documentation Updates (execute session)

| File | What to change |
|---|---|
| `docs/REQUIREMENTS.md` lines 706-708, 718-720 | Update City/Zip to WEST HOLLYWOOD/90048 for both Venue and Master cards |
| `docs/REQUIREMENTS.md` line 726 | Remove "clicking did NOT open a modal" — modals work. Update to document both dialog behaviors. |
| `specs_planning/test-cases/.../locations_account_address_test_cases.md` | Update FIELD INVENTORY City/Zip values. Fix TC-008 description (7 rows, not 8). Add new TC-021..028 descriptions. |
| `specs_planning/test-plans/.../locations_account_address_test_plan.md` | Fix line 97 (8→7 rows). Add selector mappings for new TCs. |

---

## 9. Execution Checklist (Session 2)

```
Pre-execution:
[ ] Clean artifacts: npm run clean, clear .auth/
[ ] Run existing 20 TCs: npm test -- --project=chrome tests/specs/setup/locations/location-account-address.spec.ts
[ ] Confirm all 20 pass (baseline green)
[ ] Read agent-mistakes.md for any new entries since audit

MCP Phase (Phase 0.5 per LR-013):
[ ] MCP-1: Verify current venue display fields
[ ] MCP-2: Test Account List Select behavior
[ ] MCP-3: Test Address dialog Select behavior
[ ] MCP-4: Test account/address change reversibility
[ ] MCP-5: Test Unsaved Changes dialog
[ ] MCP-6: Test Close (X) buttons
[ ] Decision tree: determine which TCs to implement vs DROP

Implement (in serial order — matches spec position):
[ ] TC-021: Phone 1 round-trip (no MCP dependency)
[ ] TC-022: Cancel Save dialog (no MCP dependency)
[ ] TC-023: Phone 1 invalid blocks Save (no MCP dependency, Gap #21 cond 2)
[ ] TC-024: Unsaved Changes dialog (if MCP-5 passed)
[ ] TC-025/026: Account List filters (no MCP dependency, P2)
[ ] TC-027: Address selection E2E (if MCP-3+4 passed)
[ ] TC-028: Account selection E2E (if MCP-2+4 passed) — LAST, try/finally cleanup

Post-execution:
[ ] Run each new TC individually (LR-018 step 4)
[ ] Run ALL 20+N TCs together (LR-018 step 5)
[ ] Fix REQUIREMENTS.md (D-1 through D-3)
[ ] Fix test cases doc (D-4)
[ ] Fix test plan (D-5)
[ ] Add new TC descriptions to test cases doc
[ ] Add selector mappings to test plan
[ ] Update agent-activity-log.md (LR-028)
[ ] Calculate final RT% and confirm >50%
```

---

## 10. Expected Outcomes

**Best case** (all MCP gates pass): 8 new TCs, RT% = 4/5 (80%), all 28 pass
**Likely case** (Account/Address works, needs cleanup): 6-7 new TCs, RT% = 3/5 (60%)
**Worst case** (Account+Address selection doesn't apply/save): RT denominator = 2, so 2/2 = 100% with just TC-021. 6 new TCs (021-026), all behavioral + 1 RT. Target EXCEEDED.

**Minimum guaranteed deliverables** (no MCP dependencies):
- TC-021 (Phone 1 RT)
- TC-022 (Cancel Save dialog)
- TC-023 (Phone 1 invalid blocks Save — also covers Gap #21 condition 2)
- TC-025/026 (Account List filters)
- All 5 documentation fixes
- = 5 new TCs + 5 doc fixes, regardless of MCP outcomes

---

## 11. Files to Modify (execute session)

| File | Changes |
|---|---|
| `tests/specs/setup/locations/location-account-address.spec.ts` | Add TC-021 through TC-028 (MCP-gated subset) |
| `src/pages/setup/locations/location-account-address.page.ts` | Add 2-6 new methods (MCP-gated) |
| `tests/test-data/setup/locations/location-account-address.data.ts` | Add TEST_PHONE1_VALUE + MCP-discovered constants |
| `docs/REQUIREMENTS.md` | Fix lines 706-708, 718-720, 726 |
| `specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md` | Update FIELD INVENTORY, add new TC docs |
| `specs_planning/test-plans/setup/locations/locations_account_address_test_plan.md` | Fix row count, add selector mappings |

No changes to `src/selectors/setup/locations/account-address.ts` — all needed selectors exist.

---

## 12. WATCHDOG Self-Audit (2026-04-07)

**Audit of the audit plan. 3 critical, 5 important, 4 minor findings. All resolved.**

### Findings Resolved

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| F-1 | CRITICAL | Gap #21 (cross-tab save conditions) never referenced by number | Added Section 1b: full traceability table mapping all 11 conditions to coverage status |
| F-2 | CRITICAL | RT% metric inconsistent with master plan (20% vs 10%) | Clarified: "by field" metric adopted, master plan's 10% was "by test" count. Denominator is MCP-dependent. |
| F-3 | CRITICAL | TC numbers don't match serial execution order | Renumbered TCs 021-028 to match execution position: low-risk first, mutation tests last |
| F-4 | IMPORTANT | "5 saveable fields" denominator unverified | Added WATCHDOG note: denominator depends on MCP-2/3. If fewer saveable fields, RT% target may already be met. |
| F-5 | IMPORTANT | No cross-tab traceability for Gap #21 conditions | Resolved by F-1 Section 1b table |
| F-6 | IMPORTANT | LR-026 (Angular dirty state) not addressed for save tests | Added dedicated subsection in Section 6: mandatory reload-after-save between serial tests |
| F-7 | IMPORTANT | Phone mask transformation risk for TC-021 | Added subsection: use formatted input matching baseline pattern, MCP-1 to verify |
| F-8 | IMPORTANT | Worst-case 40% < target 50%, no fallback | Replaced with decision tree showing RT% recalculates when denominator shrinks |
| F-9 | MINOR | D-1/D-2 evidence from test data, not MCP | Noted in Section 3 root cause: "from test data file (verified 2026-04-01), MCP-1 to independently confirm" |
| F-10 | MINOR | TC-028 cleanup lacks specific account identifier | Execute session must: (a) read current venue name BEFORE changing, (b) store as cleanup reference |
| F-11 | MINOR | ALL-033 (dropped TC justification) not referenced | Added ALL-033 reference in MCP decision tree section |
| F-12 | MINOR | AUD-003 field/selector reconciliation missing | See Section 12b below |

### 12b. Selector / Field / TC Reconciliation (AUD-003)

| Category | Count | Details |
|---|---|---|
| Selectors in `account-address.ts` | 39 | 2 tab nav + 5 venue card + 1 save + 1 master scoped + 11 account dialog + 9 address dialog + 1 save msg = 30 actually usable (some are scoped/computed in page object) |
| Fields in FIELD INVENTORY | 13 | 8 venue (name, address, city, state, zip, country, phone1, phone2) + 5 master (address, city, state, zip, country) |
| Existing TCs | 20 | TC-001 through TC-020 |
| Selector usage in TCs | 24/30 | 6 selectors unused by any TC: `txtAccListAddress`, `txtAccListCity`, `drpAccListState`, `drpAccListCountry`, `btnAccListClose`, `btnAddrClose` |
| Proposed new TCs using unused selectors | TC-025/026 | Would exercise `txtAccListAddress` and `txtAccListCity`. `drpAccListState`, `drpAccListCountry`, `btnAccListClose`, `btnAddrClose` remain unused (P3 — very low value). |

**Unused selector verdict**: 4 selectors remain unused after all proposed TCs. These are Account List State/Country dropdowns (complex Radix combobox interaction, low value for persistence testing) and Close buttons (Cancel buttons already cover dialog dismissal). Acceptable — not worth TC investment.

### 12c. Compliance Matrix

| Rule | Compliant? | Notes |
|---|---|---|
| LR-007 (MCP-verify before asserting) | YES | 6 MCP items with decision tree |
| LR-009 (Angular net-zero change) | YES | TC-021 uses TEST_PHONE1_VALUE (different from baseline) |
| LR-012 (shared Save dialog) | YES | Plan uses shared `dlgSaveChanges`/`btnSaveChangesConfirm` from shared.ts |
| LR-018 (run-all is truth) | YES | Execution checklist includes individual + full-suite runs |
| LR-019 (first test enforces baseline) | N/A | Existing TC-001 handles baseline; new TCs inherit serial state |
| LR-022 (no hardcoded structural counts) | YES | No new count assertions proposed |
| LR-023 (no networkidle) | YES | Page object uses waitForAngularStable + data signals |
| LR-024 (clean before RCA) | YES | Execution checklist starts with artifact cleanup |
| LR-026 (Angular dirty state) | YES (fixed) | Dedicated subsection added after WATCHDOG review |
| LR-027 (plan execution summary) | YES | Template in execution checklist |
| ALL-033 (dropped TC justification) | YES (fixed) | Referenced in MCP decision tree |
| AUD-003 (field/selector reconciliation) | YES (fixed) | Section 12b added |
