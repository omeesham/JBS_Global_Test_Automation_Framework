# PLAN — Restore "Blocked" Status in XLSX Workbook + Opus Audit Gate

**Status**: DONE
**Owner**: OWNER
**Created**: 2026-05-27
**Executed**: 2026-05-27
**Identity**: OWNER (non-pipeline)
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: ask
**Parent**: [PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md)
**BrowserTool**: none — pure code edits + 5 Opus audit subagents (read-only, no DOM)

---

## Context

The Phase A XLSX deliverable at `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (committed in current working tree) had **0 rows** marked `Automation Execution = Blocked` across all 477 rows in 14 sheets. This is wrong.

`reports/fixme-registry.json` captures **28 distinct TCs** that should be Blocked:
- **22 Cat-A / NOT-AUTOMATABLE entries** registered programmatically at `clients/encore/specs/locations/location-local-information.spec.ts` lines 473–476 (Oracle required, BillingCycle required, JobCosting, ServiceCharge, Skip Billing one-way lock, eSignature, multi-invalid, Billing/Country/random-mutation, role, batch isolation, Threshold step) — runtime-skipped inside test bodies, so `playwright test --list` annotations cannot see them; only the registry knows.
- **6 actual `test.fixme(true, '...')` calls**: 1 in `location-notes.spec.ts:425`, 5 in `location-shared-setup-locations.spec.ts` (lines 249, 364, 532, 876, 971) — of which 3 lack extractable TC IDs in their test titles (UNKNOWN entries in registry).

**Root cause** (confirmed via code read of `export_test_cases/to-xlsx.ts:525-561`):
- `npm run xlsx:build` defaults to `--from-csv` mode (Phase A bootstrap — preserves humanized CSV text).
- `from-csv` mode calls `buildFromCsvSource()` (line 538) which reads CSV columns verbatim.
- The CSVs **only have the legacy "Automated Yes/No" column** — no "Blocked" status anywhere.
- `buildFromCsvSource()` **NEVER called `augmentByTcId()`** (the path that detects Blocked from registry + playwright annotations).

**User mandate** (Q&A 2026-05-27):
1. Mark **all 28** registry TCs as Blocked (both classes — runtime Cat-A + static test.fixme).
2. Backfill TC IDs into the 3 UNKNOWN spec entries (resolved alternatively via spec-walk overlay — see Plan deviation D1 below).
3. Run **Opus-class audit subagents NOW** as part of this fix's verification, AND register them as **binding pre-deletion gate at Phase D** in parent migration plan.

---

## Bootstrap

- Repo: `C:\Users\rutvi\projects\encore_framework`
- Active client: encore
- Identity: OWNER (edits `export_test_cases/*` + `scripts/xlsx-*.mjs` + `plans/pending/PLAN_CSV_TO_XLSX_*` + `plans/pending/PLAN_XLSX_BLOCKED_OVERLAY_BUGFIX.md`)
- Critical reads before edits:
  - `export_test_cases/to-xlsx.ts` — `buildFromCsvSource()` (lines 413–486), `buildWorkbook()` (lines 525–561), CLI entry (lines 720–756).
  - `export_test_cases/sp00-augment-logic.ts` — `augmentByTcId()` (lines 58–112), `scanFixmeReasons()` (lines 167–207), `augmentFromCsv()` (lines 220–260).
  - `reports/fixme-registry.json` — 30 entries (12 Cat-A + 12 NOT-AUTOMATABLE + 6 FIXME-CALL).
  - `scripts/xlsx-vs-csv-parity.mjs` — `compareCsv()` cell-by-cell loop (lines 148-288).
  - `clients/encore/test_cases_csv/locations_local_information_test_cases.csv` — confirms 4-segment TC ID format `TC-LOC-LI-NNN`.

---

## Strict Lines (LR-046)

1. `npm run xlsx:vs-csv-parity` exits 0 after Blocked overlay applied. **Modulo extended** to allow any XLSX `Automation Execution = 'Blocked'` regardless of CSV value (registry is authoritative).
2. `npm run xlsx:dump | findstr /i blocked` shows ≥ 26 Blocked rows. (Original ambition: 28 — 2 stale registry entries TC-LOC-LI-078/079 don't exist in CSV; documented as informational, not a defect — see Plan deviation D2.)
3. `npm run test:xlsx-sheet-name` exits 0 (17/17 assertions hold, sheet-name unit tests unchanged).
4. `npm run typecheck` clean on `export_test_cases/*.ts` (pre-existing deprecated `scripts/build-framework-vendor.ts` errors unrelated, package.json line 5 deprecation note).
5. 5 Opus-class audit subagents return unanimous GREEN verdict; reports written to `reports/xlsx-vs-csv-audit-<sheet>-2026-05-27.md`.

---

## Files Changed

| File | Change |
|---|---|
| [export_test_cases/sp00-augment-logic.ts](export_test_cases/sp00-augment-logic.ts) | +200 lines: `readFixmeReasonAt`, `inferSubmoduleCode`, `expandShortTcIdViaSpec`, `walkSpecForTcId`, `resolveRegistryEntry`, `isMoreSpecificReason`, `loadBlockedFromRegistry` (exported), `applyBlockedOverlay` (exported, generic over T extends BlockedOverlayRow). |
| [export_test_cases/to-xlsx.ts](export_test_cases/to-xlsx.ts) | +1 import + 5-line overlay invocation inside `buildWorkbook()`'s `from-csv` branch (after `tcsBySheet = buildFromCsvSource()`). |
| [scripts/xlsx-vs-csv-parity.mjs](scripts/xlsx-vs-csv-parity.mjs) | +6 lines: pre-resolve `xlsxExec` + `xlsxReason` outside compare loop; allow any XLSX 'Blocked' on Automation Execution + any non-empty XLSX If Failed Reason when XLSX Automation Execution = 'Blocked'. |
| [clients/encore/test_cases_xlsx/encore_test_cases.xlsx](clients/encore/test_cases_xlsx/encore_test_cases.xlsx) | Regenerated. New: 26 rows marked Blocked. |
| [plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md) | APPEND under Phase D: D-PRE-AUDIT hard gate (5 Opus subagents, partition table, modulo rules). |
| [clients/encore/specs_planning/_internal/agent-activity-log.md](clients/encore/specs_planning/_internal/agent-activity-log.md) | One LR-028 row recording this fix + audit verdicts. |

**Cleanup discipline answer** (per user question "who deletes leftover shitty files"): this fix creates ZERO new files. All changes are additive edits to existing files. No new package.json scripts. No new CLI mode. No throwaway scaffolding. One regenerated file (the XLSX itself). The 5 audit reports under `reports/` are intentional Council-audit-trail artifacts, not garbage.

---

## Plan Deviations (LR-046 — to be carried into Execution Summary)

### D1 — TC ID backfill via spec walk, not spec edit

**Plan said**: "Add TC IDs to specs now" (user answer Q3 in plan-mode Q&A).

**What landed**: Investigation showed the TC IDs are ALREADY in the spec titles — the registry's UNKNOWN entries are a `scripts/scan-fixmes.ts` extraction failure, not missing spec data. Resolution moved into the overlay (`walkSpecForTcId` reads spec file ±30 lines from registry's `line` for nearest `test(...TC-...-...)` declaration).

**Why**: editing 3 specs to add TC IDs that are already in their titles would have been redundant + would have triggered spec-touched LR rules (LR-018 spec-fixing workflow, LR-019 first-test baseline, etc.) unnecessarily.

**Mitigation**: `loadBlockedFromRegistry` handles all 3 forms — direct match, short→long expansion via spec inference, UNKNOWN walk. Spec files untouched (zero diff in `git status` for specs/).

### D2 — 26/28 instead of 28/28 Blocked TCs (stale registry hygiene)

**Plan said**: "Mark all 28 registry TCs as Blocked".

**What landed**: 26 Blocked rows applied; 2 unresolved (`TC-LOC-LI-078` BillingCycle required, `TC-LOC-LI-079` SkipBilling Oracle).

**Why**: TC-LOC-LI-078 and TC-LOC-LI-079 do NOT exist in the CSV. They appear in the FIXME-LIST comments at location-local-information.spec.ts:474 but the CSV catalog has no corresponding rows. This is a stale-registry-vs-catalog discrepancy — the TCs were probably removed/renamed before the registry was updated.

**Mitigation**: Overlay logs `[overlay] WARN — registry TC X resolved but not found in any XLSX sheet (CSV may have dropped this TC; registry is stale)` on each occurrence. Recommend a registry-hygiene pass in a future maintenance session. Not a fix-this-plan defect — the overlay correctly refuses to invent rows.

### D3 — Initial expansion bug (immediately corrected within this fix)

**Initial attempt**: `expandShortTcIdViaKnownSet` iterated all known TC IDs and picked the first match for the suffix. Bug: `TC-LOC-008` registered for `location-local-information.spec.ts` could expand to `TC-LOC-ACC-008` (account_address) because that came first in iteration order. Corrupted 7 TC-LOC-ACC-* rows in first build.

**What landed**: Replaced with `expandShortTcIdViaSpec` which reads the registry entry's `file` field, infers the submodule code (e.g., `LI`) from the spec's first `test('TC-LOC-XX-NNN':...)` declaration, and expands strictly to `TC-LOC-LI-NNN`. Verified second build: zero ACC corruption, 22 LI Blocked entries match registry verbatim (per Agent 3 GREEN audit).

**Mitigation**: documented inline in `sp00-augment-logic.ts` `expandShortTcIdViaSpec` doc comment; covered by Audit Agent 3's verification table.

---

## Execution Summary

**Verdict: GREEN.** All strict lines satisfied; 5/5 Opus audit subagents returned unanimous GREEN.

### Mechanical gates (Phase 1)

- `npm run xlsx:build` — OK, `26 row(s) overlaid from 26 registry TC(s)`, `2 registry entries unresolvable` (stale TC-LOC-LI-078/079 — see deviation D2 above).
- `npm run xlsx:dump | findstr /i blocked` — 26 confirmed Blocked rows visible: 22 in `locations_local_information` (Cat-A + NOT-AUTOMATABLE), 1 in `locations_notes` (TC-LOC-NTS-062), 3 in `locations_shared_setup_location` (TC-LOC-SSL-007/-026/-030).
- `npm run xlsx:vs-csv-parity` — `PASS — all 11 CSVs match XLSX modulo schema cells + LO 3-way split` (477/477 rows after widened Blocked modulo).
- `npm run test:xlsx-sheet-name` — `PASS — all assertions hold` (17/17, sheet-name unit tests).
- `npm run typecheck` — clean on touched files (pre-existing `scripts/build-framework-vendor.ts` errors are dead code per `package.json:5` deprecation note, unrelated).

### Opus audit subagents (Phase 2 — per user mandate)

| # | Agent | Sheets | Rows | Cells | Verdict | Report |
|---|---|---|---|---|---|---|
| 1 | Local Office | `local_office_settings` + `local_office_history` + `local_office_ect` | 85 | 1020 | **GREEN** | [reports/xlsx-vs-csv-audit-local-office-2026-05-27.md](reports/xlsx-vs-csv-audit-local-office-2026-05-27.md) |
| 2 | Account/AutoAddon/Currency | 3 sheets | 75 | 900 | **GREEN** | [reports/xlsx-vs-csv-audit-account-autoaddon-currency-2026-05-27.md](reports/xlsx-vs-csv-audit-account-autoaddon-currency-2026-05-27.md) |
| 3 | LeftPanel/Legal/LocalInfo | 3 sheets | 156 | ~1800 | **GREEN** | [reports/xlsx-vs-csv-audit-leftpanel-legal-localinfo-2026-05-27.md](reports/xlsx-vs-csv-audit-leftpanel-legal-localinfo-2026-05-27.md) |
| 4 | MgmtHistory/Notes | 2 sheets | 83 | ~1000 | **GREEN** | [reports/xlsx-vs-csv-audit-mgmthistory-notes-2026-05-27.md](reports/xlsx-vs-csv-audit-mgmthistory-notes-2026-05-27.md) |
| 5 | Pricing/SSL/Overview | 2 sheets + Overview | 78 + Overview | ~950 | **GREEN** | [reports/xlsx-vs-csv-audit-pricing-ssl-overview-2026-05-27.md](reports/xlsx-vs-csv-audit-pricing-ssl-overview-2026-05-27.md) |

**Aggregate**: 5/5 GREEN, 477 rows + Overview audited, ~5700 cells compared independently against CSV, **zero UNEXPECTED drifts** across all agents.

Agent 3 specifically verified all 22 LI Blocked overlay entries match registry reason strings verbatim (per-TC table in its report). Agent 4 verified TC-LOC-NTS-062 is the only Blocked NTS row, correctly carrying the registry's generic `"test.fixme() call in spec"` reason (the spec walker chose generic fallback rather than fabricate a reason — explicitly authorized in the assignment). Agent 5 verified the Overview sheet's per-row metrics are internally consistent (Auto + Pend = Total; Pass + Fail + Skipped + Blocked ≤ Total).

### Cross-agent informational notes (NOT defects, NOT blocking)

1. **Agent 1 produced `scripts/audit-lo-parity.mjs`** — reproducible audit helper, ~80 lines, runs `node scripts/audit-lo-parity.mjs → drifts total: 0`. Kept as a useful asset for future audit re-runs; not garbage.
2. **Agent 4 spec-walker note**: could optionally harvest the `// BUG-LOC-NTS-004` comment above the fixme to produce a richer registry reason instead of the generic `"test.fixme() call in spec"`. Currently uses generic fallback (explicitly authorized in agent prompt). Filed as a registry-hygiene enhancement candidate; not addressed in this fix.
3. **Agent 5 percentage observation**: `locations_local_information` shows `% Pass of Executed = 18.5%`. Formula is `pass / (total - skipped - blocked) = 17 / (114 - 0 - 22) = 17/92 = 18.5%` — definition is "Pass of TCs we could have actually executed" (excludes skipped+blocked). Defensible definition; per-spec inspection of `export_test_cases/to-xlsx.ts:652` confirms intent. NOT a bug.
4. **Agent 2 enum suggestion**: `TC-LOC-ACC-021` / `TC-LOC-ACC-024` are "Retired" TCs that get `Pending Automation` via the No→Pending rename. Semantically slightly off; a future `Retired` value for the Coverage Status enum would be cleaner. Filed as enhancement, not a bug.

### Cleanup discipline outcome (answer to "who will delete leftover shitty files")

- **Files created NEW (kept on disk)**: 5 audit reports under `reports/xlsx-vs-csv-audit-*.md` (Council audit trail per LR-042 evidence-emission spirit); 1 reproducible audit helper at `scripts/audit-lo-parity.mjs` (Agent 1 contribution, useful for future re-runs).
- **Files created NEW (purgeable)**: NONE. No throwaway scaffolding, no scratch directories, no temp logs.
- **Files modified**: 3 source files (`sp00-augment-logic.ts`, `to-xlsx.ts`, `xlsx-vs-csv-parity.mjs`), 1 plan body (parent migration plan APPEND), 1 workbook regenerated (`encore_test_cases.xlsx`), 1 activity log row, 1 plan moved pending→done (this plan).
- **Files deleted**: NONE.
- **Out-of-scope leftovers untouched** (per parent /execute instruction): the 11 working-tree items from the prior Phase A session (3 DQU plan moves, 1 lock, 4 closure-attempts state, 3 untracked done/ plans). They belong to their original work blocks and remain owned by the next OWNER session that closes those plans.

### Plan deviations summary (LR-046 logged for /final-q)

- **D1 (overlay-walks-spec instead of spec-edit)**: TC IDs were already in spec titles — registry generator extraction failure was the true root cause. Resolved in overlay via `walkSpecForTcId`, no spec edits required. Eliminated 3 unnecessary spec edits + bypassed LR-018/019/021 spec-fixing-workflow rules that would have fired.
- **D2 (26/28 vs all-28 strict)**: 2 stale registry entries (TC-LOC-LI-078/079) don't exist in CSV. Documented as registry-hygiene issue; overlay correctly refuses to invent rows; logged WARN at build time; Agent 3 confirmed informational-only.
- **D3 (initial expansion bug, corrected in-flight)**: First implementation iterated `knownTcIds` for short-form expansion → matched `TC-LOC-ACC-008` for `TC-LOC-008` (account_address came first in iteration order). Detected via dump inspection; replaced with `expandShortTcIdViaSpec` that reads the registry entry's `file` field to infer the correct submodule code (LI). Verified by Agent 3's 22/22 verbatim-match audit.

### LR compliance checklist

- **LR-020** (verify plan claims): ✓ — verified line numbers, function names, regex patterns, TC ID formats against live code before each edit.
- **LR-027** (Execution Summary mandatory at plan move): ✓ — this section.
- **LR-028** (activity log row): ✓ — row written at T2026-05-27T10:44, timestamp ≥ all touched-file mtimes (LR-037 satisfied).
- **LR-046** (strict plan lines): ✓ — 3 deviations (D1/D2/D3) all documented with grep-verifiable mitigations + Agent 3 audit corroboration.
- **LR-048** (subplan structural minimum): N/A — this is a standalone bugfix plan, not a SUBPLAN.
- **LR-050** (restructure plans enumerate stale-slop): N/A — this is a bugfix, not a restructure.
- **LR-055** (closure gate): to be exercised by `npm run plans:validate-closure:write-manifest` at flip.

---

## Verification

### Phase 1 — Sanity (mechanical, ~30s)

```bash
npm run xlsx:build                          # rebuilds workbook with Blocked overlay
npm run xlsx:dump | findstr /i blocked      # 26+ Blocked rows
npm run xlsx:vs-csv-parity                  # PASS (overlay-modulo allowed)
npm run test:xlsx-sheet-name                # 17/17 assertions PASS
npm run typecheck                           # clean on our files (vendor-deprecated errors unrelated)
```

### Phase 2 — Opus-class subagent audit (per user mandate)

5 Opus subagents (`model=opus`, `subagent_type=general-purpose`) spawned in parallel per the partition in parent plan's D-PRE-AUDIT section. Each writes a report at `reports/xlsx-vs-csv-audit-<sheet>-2026-05-27.md`. Aggregate verdict must be unanimous GREEN.

### Phase 3 — Activity log + close

- One LR-028 row in `clients/encore/specs_planning/_internal/agent-activity-log.md`.
- This plan moves `pending/` → `done/` per LR-055 closure gate.

---

## Out of Scope

- Humanization-layer port from `to-csv.ts` into `to-xlsx.ts` (still Phase A.5 work — independent).
- N1 "Manual → Pending Automation" semantic rename (still Phase A.5).
- 20+ file rewire to point at XLSX instead of CSVs (Phase B).
- Plan triage + dependency graph rewrite (Phase C).
- Actual CSV deletion (Phase D — gated by audit landed in this plan).
- 2 stale registry entries (TC-LOC-LI-078/079) — deferred to registry-hygiene pass.
- 11 working-tree leftovers from prior /execute (orthogonal, owned by original work blocks).
