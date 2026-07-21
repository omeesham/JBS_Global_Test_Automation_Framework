# TC Coverage Map — Shared Setup Locations (SP-A Step 1, 2026-05-15)

**Authored**: 2026-05-18 (sessionDate per LR-044 freshness gate, despite filename date — see provenance note)
**Author**: OWNER (single-session, SP-A)
**Source spec**: `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` (24 `test(` calls; 6 `test.fixme`)
**Source test-cases**: `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` (header claims `Total: 25`; body enumerates 24 — TC-MD header drift recorded for SP-E Step 9 fix)
**Parent plan**: `plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` v5.1 (CLOSURE-1 COVERED criterion)
**SP-A subplan**: `plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A.md`

> **Provenance note (LR-044 freshness)**: filename uses `2026-05-15` per the subplan filename convention to match the planned sessionDate. Actual authoring session is 2026-05-18. No prior tc-coverage-map exists for this module; this is a fresh-authored artifact, not a refresh of a stale file. The 3-day filename-vs-session offset is documented here so audit can correlate.

---

## v5.1 CLOSURE-1 COVERED Criterion (verbatim from parent plan)

A probe is **COVERED** iff ALL three hold:
- **(a)** ≥3 distinct TCs touch it
- **(b)** each cited TC's spec line is quoted **verbatim** in this map with `file:line` + `expect(...)` assertion text
- **(c)** the assertion targets that surface's **specific** DOM signature (incidental touches don't count — must be explicit Playwright `expect(...)`/`toHaveCount`/`toBeVisible`/`toHaveValue`/etc. against the surface)

Probes failing any of (a)/(b)/(c) are **UNCOVERED** → Step 2A Pass 1 (deep walk with 11-field gap schema) is required.

**Fixme reduces strength but does NOT remove the assertion line** — a fixme'd TC's `expect(...)` is still encoded in the spec at file:line, so it counts toward (a)+(b). However, since fixme'd TCs do NOT execute at runtime, a probe COVERED *only* by fixme'd TCs is structurally unproven. Such probes are flagged `COVERED-FIXME-ONLY` and routed to Step 2A.1 smoke-pass AND Step 2B isolated-grep.

---

## TC × Surface Matrix (24 TCs × 12 axes)

Axes (12):
- **A.columns** — column count / headers / order
- **B.self-row** — 1604 self-row state (Primary Office locked, SI editable, Delete disabled)
- **C.add-flow** — Add button → Change Local Office dialog
- **D.delete-flow** — Delete button (per-row) → row removed
- **E.save-flow** — left-panel Save + "Save Changes" alertdialog
- **F.non-self-row** — added row state (Primary disabled+unchecked, SI checked+editable, Delete enabled)
- **G.dialog-search** — search input filters dialog results
- **H.dialog-select** — row checkbox + Select button enable+click
- **I.persistence** — save → reload → state survives
- **J.cross-field** — multi-change interaction (self SI + add row, etc.)
- **K.edges** — boundary conditions (beforeunload, rapid click, table at max)
- **L.history** — HIST cols 59-61 reflect SSL changes

Matrix legend: `●` = explicit `expect(...)` against this surface; `○` = incidental touch (setup/cleanup, no surface assertion); blank = does not touch; `✖` = `test.fixme()` (assertion encoded but does not run).

| TC | fixme | A.col | B.self | C.add | D.del | E.save | F.nonself | G.search | H.select | I.persist | J.cross | K.edges | L.hist |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 001 |  | ● | ○ | ● | | | | | | | | | |
| 002 |  | ● | | | | | | | | | | | |
| 003 |  | ○ | ● | | ● | | | | | | | | |
| 004 |  | | ● | | | | | | | | | | |
| 005 |  | | ● | | ● | | | | | | | | |
| 006 |  | | ● | | | ● | | | | | | | |
| 007 |  | | ● | | | ● | | | | | | | |
| 008 |  | | ● | | | ● | | | ● | | | |
| 009 |  | | | ● | | | | | ● | | | | |
| 010 |  | | | | | | | ● | | | | | |
| 011 |  | | | | | | | ● | | | | | |
| 012 |  | | | | | | | | ● | | | | |
| 013 |  | | | ● | | ○ | ● | | ● | | | | |
| 014 |  | ● | | | | | ● | | | | | | |
| 015 |  | | | | ● | | ● | | | | | | |
| 016 | ✖ | | | ○ | | | | ○ | ○ | | | | |
| 017 |  | | | | | ● | | | | | | | |
| 018 | ✖ | | | ● | | ● | ● | ✖ | ✖ | ✖ | | | |
| 019 | ✖ | | | ○ | | ● | ● | ✖ | ✖ | ✖ | | | |
| 020 | ✖ | | | ○ | ● | ● | | ✖ | ✖ | ✖ | | | |
| 021 | ✖ | | | ○ | | ● | | ✖ | ✖ | ✖ | ✖ | | |
| 022 |  | | ○ | | | ● | | | | ● | | | |
| 023 |  | | ○ | | | | | | | | | ● | |
| 024 | ✖ | | | ○ | | ● | | ✖ | ✖ | ○ | | | |

---

## Section A.Index (COVERED probes — 60-second smoke-pass required at Step 2A Pass 2)

Per CLOSURE-1, each COVERED probe MUST have a Section A.1 smoke-pass entry with 5-field schema. Probes not on this list are UNCOVERED → Step 2A Pass 1 deep walk with 11-field gap schema.

### Probe-A: columns — column headers + count
- **TCs touching**: TC-002 (explicit), TC-001 (incidental — only `tblSharedSetupLocations` visibility), TC-014 (incidental — touches Primary/SI/Delete state on row 2, not column LAYOUT)
- **Explicit DOM-signature assertion count**: **1** (TC-002 only)
- **Verdict**: ❌ **UNCOVERED** (fails (a) — only 1 TC with explicit column-header assertion)
- Verbatim cite (only one):
  - `location-shared-setup-locations.spec.ts:33` → `expect(await pg.getColumnHeaders()).toEqual([...SSL_COLUMN_HEADERS]);`

### Probe-B: self-row state (1604)
- **TCs touching**: TC-003, TC-004, TC-005, TC-006, TC-007, TC-008
- **Explicit DOM-signature assertion count**: **6**
- **Verdict**: ✅ **COVERED** (active, runtime-proven)
- Verbatim cites:
  - `spec.ts:39-50` (TC-003): `expect(text.localOffice).toBe(SELF_ROW.localOffice);` + `expect(primaryState.checked).toBe(true);` + `expect(primaryState.disabled).toBe(true);` + `expect(inventoryState.checked).toBe(false);` + `expect(inventoryState.disabled).toBe(false);` + `expect(await pg.isSelfDeleteDisabled()).toBe(true);`
  - `spec.ts:56-58` (TC-004): `expect(state.disabled).toBe(true);` + `expect(state.checked).toBe(true);`
  - `spec.ts:63` (TC-005): `expect(await pg.isSelfDeleteDisabled()).toBe(true);`
  - `spec.ts:70` (TC-006): `expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);`

### Probe-C: add-flow (Add → dialog)
- **TCs touching**: TC-001, TC-009, TC-013
- **Explicit DOM-signature assertion count**: **3** (active)
- **Verdict**: ✅ **COVERED**
- Verbatim cites:
  - `spec.ts:28` (TC-001): `expect(await pg.isElementVisible('btnSharedAdd')).toBe(true);`
  - `spec.ts:101-110` (TC-009): `expect(await pg.isAddDialogVisible()).toBe(true);` + `expect(await pg.getDialogHeading()).toBe(SSL_DIALOG_HEADING);` + `expect(await pg.isElementVisible('txtDlgSearch')).toBe(true);` + `expect(await pg.isElementVisible('tblDlgResults')).toBe(true);` + `expect(await pg.isDialogSelectEnabled()).toBe(false);` + `expect(await pg.isElementVisible('btnDlgCancel')).toBe(true);` + `expect(await pg.isAddDialogVisible()).toBe(false);`
  - `spec.ts:153` (TC-013): `expect(await pg.getDataRowCount()).toBe(2);`

### Probe-D: delete-flow (Delete button + behavior)
- **TCs touching**: TC-003 (incidental — self-delete-disabled), TC-005 (explicit), TC-015 (explicit), TC-020 (fixme)
- **Explicit DOM-signature assertion count**: **2 active + 1 fixme = 3 by count**
- **Verdict**: 🟡 **COVERED-FIXME-ONLY-PARTIAL** (only 2 active assertions on delete-flow; TC-020 fixme'd)
  - Flag: Step 2A.1 smoke-pass needed; Step 2B Phase 2 covers TC-020 reverify
- Verbatim cites:
  - `spec.ts:63` (TC-005): `expect(await pg.isSelfDeleteDisabled()).toBe(true);` — self-only negative case
  - `spec.ts:174-176` (TC-015): `expect(await pg.isElementVisible('dlgSaveChanges', 1_500)).toBe(false);` + `await expect.poll(() => pg.getDataRowCount(), { timeout: 5_000 }).toBe(1);` + `await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);`
  - `spec.ts:298-300` (TC-020, fixme): `await expect.poll(() => pg.getDataRowCount(), { timeout: 5_000 }).toBe(1);` + `expect(result.success).toBe(true);`

### Probe-E: save-flow (left-panel Save + dialog)
- **TCs touching**: TC-006, TC-007, TC-008, TC-017, TC-022 (active), TC-018/019/020/021/024 (fixme)
- **Explicit DOM-signature assertion count**: **5 active + 5 fixme = 10**
- **Verdict**: ✅ **COVERED**
- Verbatim cites:
  - `spec.ts:71` (TC-006): `await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);`
  - `spec.ts:80-84` (TC-007): `await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(false);` + `await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);` + `await expect.poll(() => pg.isSaveEnabled(), { timeout: 8_000 }).toBe(false);`
  - `spec.ts:91-93` (TC-008): `await pg.clickSave();` + `expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);`
  - `spec.ts:194-198` (TC-017): `expect(await pg.hasInTabSaveButton()).toBe(false);` + `expect(await pg.isSaveEnabled()).toBe(true);` + `expect(result.success).toBe(true);`
  - `spec.ts:351-356` (TC-022): `await pg.openSaveDialog();` + `await pg.cancelSaveDialog();` + `await expect.poll(() => pg.isSaveEnabled(), { timeout: 3_000 }).toBe(true);` + `expect((await pg.getSelfSharesInventoryState()).checked).toBe(false);`

### Probe-F: non-self-row state
- **TCs touching**: TC-013 (count assert), TC-014 (explicit row-2 state), TC-019 (fixme — non-self SI toggle)
- **Explicit DOM-signature assertion count**: **2 active + 1 fixme = 3 by count**
- **Verdict**: 🟡 **COVERED-FIXME-ONLY-PARTIAL** (TC-014 is the only one fully proving non-self state at runtime)
  - Flag: Step 2A.1 smoke-pass needed; Step 2B Phase 2 covers TC-019 reverify
- Verbatim cites:
  - `spec.ts:153-154` (TC-013): `expect(await pg.getDataRowCount()).toBe(2);` + `await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);`
  - `spec.ts:161-165` (TC-014): `expect(state.primaryOffice.checked).toBe(false);` + `expect(state.primaryOffice.disabled).toBe(true);` + `expect(state.sharesInventory.checked).toBe(true);` + `expect(state.sharesInventory.disabled).toBe(false);` + `expect(state.deleteEnabled).toBe(true);`
  - `spec.ts:270` (TC-019, fixme): `expect((await pg.getNonSelfRowState(nsRow2!.index)).sharesInventory.checked).toBe(false);`

### Probe-G: dialog-search (name + number filter)
- **TCs touching**: TC-010 (name), TC-011 (number), TC-018/019/020/021 (fixme — name search "Miami"), TC-024 (fixme — number search for already-added)
- **Explicit DOM-signature assertion count (active)**: **2** (TC-010 name + TC-011 number)
- **Verdict**: 🟡 **COVERED-FIXME-ONLY-PARTIAL** by total count (2 active + 5 fixme = 7), but active-only count = 2 (fails (a) by ≥3 active assertions)
  - **Sub-probe G.name**: ✅ COVERED by TC-010 (active) + TC-018/019/020/021/024 (fixme) — fixme cluster all blocked on **BUG-LOC-SHR-001 "Miami search 0 results"**; runtime-proven only by TC-010
  - **Sub-probe G.number**: ❌ UNCOVERED (only TC-011 — 1 TC)
- Verbatim cites:
  - `spec.ts:116-117` (TC-010): `await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBeLessThan(ADD_LOCATION.searchByNameMaxResults);`
  - `spec.ts:125-128` (TC-011): `await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);` + `expect(row.localOffice).toBe(ADD_LOCATION.searchByNumber);` + `expect(row.localOfficeName).toBe(ADD_LOCATION.expectedName);`
  - `spec.ts:216-217` (TC-018, fixme): `await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 }).toBeLessThan(ADD_LOCATION.searchByNameMaxResults);`
  - `spec.ts:250-251` (TC-019, fixme): same pattern
  - `spec.ts:286-287` (TC-020, fixme): same
  - `spec.ts:316-317` (TC-021, fixme): same
  - `spec.ts:383-384` (TC-024, fixme): same

### Probe-H: dialog-select (row checkbox + Select button)
- **TCs touching**: TC-009 (Select initially disabled), TC-012 (Select enables after check), TC-013 (full select), TC-018/019/020/021/024 (fixme — same flow)
- **Explicit DOM-signature assertion count**: **3 active + 5 fixme = 8**
- **Verdict**: ✅ **COVERED**
- Verbatim cites:
  - `spec.ts:106-107` (TC-009): `expect(await pg.isDialogSelectEnabled()).toBe(false);` + `expect(await pg.isElementVisible('btnDlgCancel')).toBe(true);`
  - `spec.ts:135-141` (TC-012): `expect(await pg.isDialogSelectEnabled()).toBe(false);` + `await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);` + `await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);`
  - `spec.ts:151-154` (TC-013): `await pg.selectFirstDialogRow();` + `await pg.clickDialogSelect();` + `expect(await pg.getDataRowCount()).toBe(2);` + `await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);`

### Probe-I: persistence (save → reload → state survives)
- **TCs touching**: TC-008 (SI persist), TC-022 (non-persist after cancel — negative), TC-018/019/020/021 (fixme — row/SI/delete/combined persist), TC-024 (fixme — touched but not asserted)
- **Explicit DOM-signature assertion count**: **2 active + 4 fixme = 6**
- **Verdict**: 🟡 **COVERED-FIXME-ONLY-PARTIAL** (active-only: TC-008 + TC-022 = 2 — fails (a) by ≥3 active; total=6 passes)
  - Flag: Step 2A.1 smoke-pass for active subset; Step 2B Phase 2 reverify 4 fixme
- Verbatim cites:
  - `spec.ts:92-93` (TC-008): `await pg.reloadAndNavigateToSSLTab(OFFICE_NO);` + `expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);`
  - `spec.ts:355-356` (TC-022): `await pg.reloadAndNavigateToSSLTab(OFFICE_NO);` + `expect((await pg.getSelfSharesInventoryState()).checked).toBe(false);`
  - `spec.ts:230-234` (TC-018, fixme): `expect(await pg.getDataRowCount()).toBe(2);` + `expect(persisted!.localOffice).toBe(added!.localOffice);` + `expect(persisted!.localOfficeName).toBe(added!.localOfficeName);`
  - `spec.ts:268-270` (TC-019, fixme): `expect((await pg.getNonSelfRowState(nsRow2!.index)).sharesInventory.checked).toBe(false);`
  - `spec.ts:302-303` (TC-020, fixme): `expect(await pg.getDataRowCount()).toBe(1);`
  - `spec.ts:325-327` (TC-021, fixme): `expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);` + `expect(await pg.getDataRowCount()).toBe(2);`

### Probe-J: cross-field (multi-change interaction)
- **TCs touching**: TC-021 (fixme — self SI + add location combined)
- **Explicit DOM-signature assertion count**: **0 active + 1 fixme = 1**
- **Verdict**: ❌ **UNCOVERED** (fails (a) — only 1 TC, and that TC is fixme'd)
- Verbatim cite (only one):
  - `spec.ts:325-327` (TC-021, fixme): combined self-SI-checked + dataRowCount=2 assertion

### Probe-K: edges (beforeunload / rapid click / table at max)
- **K.1 beforeunload**: TC-023 only (1 TC — UNCOVERED)
- **K.2 rapid click (audit-note #8 KEEP-TENTATIVE)**: no TC asserts (UNCOVERED)
- **K.3 table at max (audit-note #8 KEEP-TENTATIVE)**: no TC asserts (UNCOVERED)
- **Verdict**: ❌ **UNCOVERED** (all 3 sub-probes fail (a))
- Verbatim cite for K.1:
  - `spec.ts:367-369` (TC-023): `const fired = await pg.triggerBeforeunloadAndStay();` + `expect(fired).toBe(true);`

### Probe-L: history (HIST cols 59-61)
- **TCs touching**: **NONE** (zero SSL TC asserts HIST cols 59-61 reflect SSL changes)
- **Verdict**: ❌ **UNCOVERED — STRICTLY ZERO COVERAGE** (HIST is the responsibility of SP-B per parent plan v5; this map flags it for SP-B awareness)
- Note: SP-B (`SUBPLAN_DQU_V6_PILOT_SSL_B.md`) owns the HIST root-map catalog for SSL parents → cols 59-61. SP-A surfaces this gap for cross-subplan awareness. SP-A's Step 2A does NOT need to walk HIST.

---

## COVERED Probes — Subject to Step 2A.1 60-second Smoke-Pass

| Probe | Verdict | Smoke-pass scope |
|---|---|---|
| **B.self-row** | ✅ COVERED (active) | Verify on nav2: 1604 row renders with Primary Office locked-checked, SI editable-unchecked, Delete disabled |
| **C.add-flow** | ✅ COVERED (active) | Verify on nav2: Add button visible, click opens Change Local Office dialog |
| **E.save-flow** | ✅ COVERED (active) | Verify on nav2: toggling SI enables left-panel Save; clicking Save opens dialog; Save→succeed |
| **H.dialog-select** | ✅ COVERED (active) | Verify on nav2: dialog opens, row checkbox check enables Select button |
| **D.delete-flow** | 🟡 COVERED-FIXME-ONLY-PARTIAL | Verify on nav2: self-row Delete disabled (TC-005); per-row Delete on non-self row removes instantly (TC-015) |
| **F.non-self-row** | 🟡 COVERED-FIXME-ONLY-PARTIAL | Verify on nav2: added non-self row renders Primary disabled+unchecked, SI editable+checked, Delete enabled (TC-014) |
| **G.name (sub-probe of G)** | 🟡 COVERED-FIXME-ONLY-PARTIAL | Verify on nav2: dialog name-search ("Miami") returns >0 rows (TC-010 active; cluster of TC-018/019/020/021/024 fixme'd on BUG-001) |
| **I.persistence** | 🟡 COVERED-FIXME-ONLY-PARTIAL | Verify on nav2: SI save → reload → checked persists (TC-008); Save dialog cancel → reload → non-persist (TC-022) |

---

## UNCOVERED Probes — Subject to Step 2A Pass 1 Deep Walk (11-field gap schema)

Per CLOSURE-3, each UNCOVERED gap MUST carry the 11-field evidence schema (id / probe / surface / timestamp / dom-snippet / network-capture-row / repro-steps / observed-live / why-gap / proposed-TC-title / proposed-TC-assertion).

| Probe | Why UNCOVERED | Audit-note flag |
|---|---|---|
| **A.columns** (column headers + count) | Only TC-002 has explicit `getColumnHeaders().toEqual()` assertion (1 TC, fails (a)) | — |
| **G.number (sub-probe of G)** | Only TC-011 has explicit number-search assertion (1 TC, fails (a)) | — |
| **J.cross-field** | Only TC-021 (fixme) — 0 active assertions on multi-change interaction beyond add+SI | — |
| **K.1 beforeunload** | Only TC-023 — 1 TC, fails (a) | — |
| **K.2 rapid click** | Zero TCs; KEEP-TENTATIVE per audit-note #8 | KEEP-TENTATIVE: downgrade to "skip Step 2A walk" if no behavior delta observed live |
| **K.3 table at max** | Zero TCs; KEEP-TENTATIVE per audit-note #8 | KEEP-TENTATIVE: downgrade if not reachable in 1604's data set |
| **L.history (HIST cols 59-61)** | Zero TCs; SP-B owns this surface (NOT SP-A scope) | Out-of-SP-A-scope; flagged for SP-B awareness only |

---

## Fixme'd-TC Roster (for Step 2B reverify — no causal inheritance from 2026-05-12)

Per parent plan v5 CHANGE LOG #4 "Zero fixme assumption inheritance": the table below records the **stated reason as of 2026-05-12 spec text only** — these are NOT to be assumed still valid; Step 2B Phase 2 default hypothesis is **"this TC works now"**.

| TC | spec line | fixme statement (verbatim) | stated reason (2026-05-12, NOT inherited) |
|---|---|---|---|
| TC-LOC-SSL-016 | `:188` | `test.fixme(true, 'discardAndReturn() serial state breaks clickAdd — opens wrong dialog');` | Serial state from preceding TC-015's `discardAndReturn` call leaves Angular SPA broken; `navigateToSharedSetupTab` re-nav doesn't recover; `clickAdd` opens wrong dialog ("Change Local Office") with "Miami" search returning 0 — labeled as TEST-DEFECT, NOT HIST-blocker. **Step 2B Phase 2 default hypothesis: this works now (serial state may be unrelated to current behavior).** |
| TC-LOC-SSL-018 | `:209` | `test.fixme();` + comment "Dialog search for 'Miami' returns 0 results — table body empty after search" | Dialog name-search broken; needs RCA on search API / virtual table rendering. **Step 2B Phase 2 + Step 2.5 BUG-LOC-SHR-001 verify against nav2 will determine current state.** |
| TC-LOC-SSL-019 | `:243` | `test.fixme(); // FIXME: same dialog search "Miami" returns 0 results — see SSL-018 fixme` | Same as TC-018 (cascade-blocked on BUG-001) |
| TC-LOC-SSL-020 | `:279` | same | Same |
| TC-LOC-SSL-021 | `:308` | same | Same |
| TC-LOC-SSL-024 | `:376` | same | Same |

**Step 2B Phase 1 (isolated-grep gate, CLOSURE-4)**: for each of the 6 fixme'd TCs, FIRST remove the `test.fixme()` line locally (or use `--grep` to force-run anyway — needs confirming syntax), then run `npx playwright test clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts --grep "TC-LOC-SSL-XYZ" --retries=0` in absolute isolation. Verdict:
- Isolated PASSES → classification MUST be FAIL-FRAMEWORK (state-leak from prior test in full-suite). Step 2B Phase 2 still runs to gather framework-leak signature.
- Isolated FAILS → continue to Phase 2 with eligibility for PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM.

**Step 2B Phase 3 (alternate-query observation, CLOSURE-2 preliminary)**: TC-018→Chicago, TC-019→Boston, TC-020→Dallas, TC-021→Denver, TC-024→Atlanta — record whether each alternate query passes or fails identically to "Miami".

---

## Audit-Note Re-Derivation (per audit-note #7 — aggregate counts re-derived on consumption)

Probe verdict totals from the table above:
- **✅ COVERED (active, runtime-proven)**: 4 probes (B.self-row, C.add-flow, E.save-flow, H.dialog-select)
- **🟡 COVERED-FIXME-ONLY-PARTIAL** (passes (a) by count, but ≥1 cite is fixme): 4 probes (D.delete-flow, F.non-self-row, G.name, I.persistence)
- **❌ UNCOVERED**: 7 probes/sub-probes (A.columns, G.number, J.cross-field, K.1 beforeunload, K.2 rapid click, K.3 table at max, L.history-SP-B-scope)
- **Total axes**: 12 (count matches "12-axis surface-area coverage map" mandate in SP-A Step 1)

Section A walk (Step 2A Pass 1) targets the 7 UNCOVERED entries (with K.2/K.3 KEEP-TENTATIVE downgrade option per audit-note #8). L.history is out-of-SP-A-scope.

Section A.1 smoke-pass (Step 2A Pass 2) targets all 8 COVERED + COVERED-FIXME-ONLY-PARTIAL entries (excludes UNCOVERED).
