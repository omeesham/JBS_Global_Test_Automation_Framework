# PLAN — Clean the Encore test-case workbook & make dirty cases structurally impossible

**Status**: DONE
**Executed**: 2026-06-05
**Identity**: OWNER
**PermissionMode**: acceptEdits

## Context

Two external AI reviews flagged internal engineering content in client-facing cells of `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (developer slang, framework code, speculation, internal corrections) and rows reading `Automation Execution = Pass` yet carrying a `Blocked by app bug … Pending Encore fix` reason. The workbook is **generated** (`npm run xlsx:build`), so leaks must be fixed at SOURCE, and a permanent guard must prevent regression.

## Locked decisions (with Rutvik)

- App-bug-blocked tests: keep visible, reword reasons to neutral professional English (the client IS Encore — reporting their app bugs is the QA value).
- Manual-by-design tests (security/exploratory): distinct **Manual** disposition — Coverage = Manual, blank execution + reason, rationale → Notes.
- Scope: surgical fixes + a hard guard. Dropped the external reviewer's ISTQB rebuild (Actual-Result column, traceability matrix, parameterizing the authorized office 1604, atomic-step rewrite).
- Guard: defense in depth — generator self-fails + pre-commit blocks + client-ship blocks.

## Execution Summary

**Goals met**: the deliverable workbook is clean (`npm run xlsx:lint` → 0 vocab hits, 0 integrity violations, 0 warnings) AND a defense-in-depth guard now makes dirty cases structurally impossible. TC parity intact (`check:tc-parity` PASS — 380 spec TCs in MD + XLSX). Negative test confirmed the guard trips (build exit 1 on an injected `APP BUG` marker).

**What was built**
- **Phase A — shared detector** `scripts/xlsx-lint-rules.mjs` (NEW): one source of truth (ALL-026 DRY) exporting `lintWorkbook()` with the widened vocab deny-list (slang / framework / speculation / tickets / bare dates, tuned against the live corpus to avoid false-positives) + cross-column integrity checks C1 (reason ⇒ not Pass, hard), C2 (status enum incl. **Manual**), C3 (Blocked ⇒ reason, warn), C4 (Manual ⇒ blank). `scripts/xlsx-vocab-lint.mjs` refactored to a thin CLI wrapper over it.
- **Phase B — content cleaned at true source**: 9 SSL + LI/ACC/NTS spec `test.fixme` / `// FIXME` reason strings reworded to client-safe English (internal tracking moved to adjacent `// BUG-…` comments); 7 MD files' prose reworded; pervasive ARIA nouns (`combobox`→dropdown, `spinbutton`→field) + `dirty-state`→`unsaved changes` translated at the single point `humanize.ts:scrubInternalVocab`.
- **Phase C — dispositions fixed at root + tripwire**: RCA found the Pass+reason contradiction is **live, not stale** — `test.fixme(true,…)` inside a test body is invisible to `playwright --list`, and the reason scan mis-attributed a blocked sibling's reason to a passing neighbor (grabbing a TC ID from the reason text / an adjacent `dependencyGate`). Fixed in `sp00-augment-logic.ts` by attributing each runtime fixme to its **enclosing `test('TC-…')`** (backward-walk) and forcing those rows to Blocked; removed the buggy forward-walk. Implemented the **Manual** disposition + curated reasons via a new COMMITTED, gitignore-proof seed `export_test_cases/blocked-reasons.json` (replaces the GC-prone `reports/fixme-registry.json` baseline-restoration entries). Replaced the emit-layer `reason ⇒ Blocked` coercion with a hard **Data Integrity Exception throw** (to-xlsx.ts).
- **Phase D — defense in depth**: build-time self-fail (`xlsx:build` re-lints its own output via subprocess, exit 1 on dirty); commit-time (`.githooks/pre-commit` step 5b, picks up the shared rules automatically); ship-time (`scripts/verify-no-forbidden.mjs` `--client`/`--target` lints every workbook → hard-fails the push, LR-049).
- **Phase E — verify + document**: rebuild self-check clean; lint PASS; cited TCs spot-checked correct; `check:tc-parity` PASS; documented **LR-ENC-004** in `clients/encore/CLAUDE.md`; negative test confirmed the guard trips.

**Deviations from the original plan (all improvements, evidence-driven)**
1. Plan premise "on-disk workbook is STALE; SSL-001/041-044 contradictions vanish on rebuild" was **FALSE** — they reproduce on a clean build. Fixed the root attribution bug instead of chasing ghosts.
2. Plan said "edit Cat-B reasons in `reports/fixme-registry.json`" — that registry is **gitignored AND GC-pruned on a second `fixme:scan`** (proven live: a registry edit was overwritten back to the spec text). Spec-present reasons fixed in the spec source; MD-only curated reasons moved to the committed `blocked-reasons.json` seed.
3. Re-audit surfaced leaks the external reviewers missed (entire `locations_local_information` reason column shorthand; Left-Panel bare dates + `NM-831` tickets) — all fixed.
4. The GC of the stale registry **corrected** an inverse contradiction: MGH-006/007/019 + NTS-035 are active passing tests the registry had been force-marking "Blocked"; they now show their true `Pass`.

**Per-TC accounting** (the curated/blocked/manual set, post-cleanup)
- Blocked + professional reason: SSL-007/030/031/032/041/042/043/044, NTS-062, LGL-016/017, LI-003/004/065, LI-NE-011/012.
- Skipped + reason: BAS-048, PRI-020/025/026/027/028/029/030.
- Pending Automation + reason (env/precondition): AAO-016, LGL-015, LI-057, LI-024A/046/048/059/060 (via reworded `// NOT-AUTOMATABLE` comment).
- **Manual** (blank exec+reason, rationale in Notes): NTS-018/019/020, LI-NE-044/045/046/047.
- Restored to true `Pass` (stale registry override removed): MGH-006/007/019, NTS-035.

**NOT done / flagged**
- LI terse `// FIXME` topic-labels (`Threshold step`, `batch isolation`, `ServiceCharge`, `eSignature`, `JobCosting`, `multi-invalid`) left as-is: they pass the guard, and no documented blocking mechanism exists to reword them accurately — fabricating one would violate NEVER-ASSUME. (Deliberate scope boundary.)
- MGH-006/007 may be falsely `Pass` under list-only mode (they test empty/single-page state on the 2900-row office 1604) — spawned a background task to verify via a real run.
- Field-inventory staleness (LR-013 / SP-AAE-02): prose-only MD edits don't change field facts, but the commit hook may want a ≤14-day inventory for modules whose inventory is stale (NTS, SSL). Flagged for the user at commit time.
- The `scan-fixmes.ts` double-scan GC of `baseline-restoration` entries is now moot (the committed seed is the durable reason home), so it was not fixed.
- No git commit (user commits). The working tree also carries pre-existing uncommitted `client_deliverable` branch changes that are not part of this plan.

## Files
- **New**: `scripts/xlsx-lint-rules.mjs`, `export_test_cases/blocked-reasons.json`.
- **Modified**: `scripts/xlsx-vocab-lint.mjs`, `scripts/verify-no-forbidden.mjs`, `export_test_cases/{to-xlsx,sp00-augment-logic,humanize}.ts`, `clients/encore/CLAUDE.md`, 4 spec files (SSL/LI/ACC/NTS reason strings), 7 setup MD files (prose + Manual Notes), `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (rebuilt).

## Verification
```
npm run xlsx:build      # builds AND self-checks (exit 0)
npm run xlsx:lint       # PASS — 0 vocab hits, 0 integrity violations, 0 warnings
npm run check:tc-parity # PASS — 380 spec TCs present in MD + XLSX
node scripts/verify-no-forbidden.mjs --client=encore   # OK — workbook clean (ship gate)
```
