> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-A3: Strip HIST Sections from 10 Test-Case MDs + Re-export CSVs

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 1 (Top Priority)
**Status**: DONE
**Priority**: P0
**Created**: 2026-04-20
**Executed**: 2026-04-20
**Depends on**: SP-A1 + SP-A2 complete (spec code must go first — otherwise MDs describe code that still exists)
**Identity**: GIVER (Planner — owns test-case MDs + exports)
**Skills**: `/cleanup` + auto-called `/regression-guard` + `/identity`
**Estimated**: one session (~1 hour)

---

## Cause

Test-case MDs and CSV exports are a mirror of the spec code. Once SP-A1/A2 remove the 10 `TC-*-HIST` tests, the matching sections in MDs and rows in CSVs are orphaned. They mislead future Planner/Generator agents into re-creating the dead tests.

Exporter `to-csv.ts` has no HIST-specific logic — just regenerate after MD strips.

---

## Scope — Exact Files + Actions

**Strip the `## TC-*-HIST: ...` section + sub-bullets from each of these 10 MDs. Do not touch any other TC section in the same file.**

| MD file | Line of section start | Section title to strip |
|---|---|---|
| [locations_account_address_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md) | 387 | `## TC-LOC-ACC-HIST: ...` |
| [locations_auto_addon_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md) | 474 | `## TC-LOC-AAO-HIST: ...` |
| [locations_currency_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md) | 406 | `## TC-LOC-CUR-HIST: ...` |
| [locations_legal_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_legal_test_cases.md) | 448 | `## TC-LOC-LGL-HIST: ...` |
| [locations_local_information_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md) | 1144 | `## TC-LOC-LI-HIST: ...` |
| [locations_notes_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md) | 393 | `## TC-LOC-NTS-HIST: ...` |
| [locations_pricing_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md) | 497 | `## TC-LOC-PRI-HIST: ...` |
| [locations_shared_setup_locations_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md) | 552 | `## TC-LOC-SSL-HIST: ...` |
| [local_office_settings_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md) | 1709 | `## TC-LOS-BAS-HIST: ...` |
| [local_office_settings_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md) | 1741 | `## TC-LOS-ECT-HIST: ...` |

Line numbers are approximate — confirm by grepping `TC-.*-HIST` in each MD and reading the file.

**Then regenerate CSV exports**: run whichever npm script invokes `export_test_cases/to-csv.ts` (likely `npm run export:csv` or similar — grep `package.json` for `csv`/`export`).

---

## KEEP list — DO NOT TOUCH

- [locations_management_history_test_cases.md](../../clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md) — dedicated 19-TC structural MD, untouched.
- Any other TC section in the 10 files listed.
- `export_test_cases/to-csv.ts` — no edits needed.
- `export_test_cases/README.md` — untouched.
- `locations_management_history_test_cases.csv` — structural 19-TC CSV, untouched. (Regenerated when exporter runs, but content won't change since source MD didn't change.)

---

## Step-by-Step Execution

### Phase 0 — Date-Forensic Self-Discovery (MANDATORY)

**Principle**: The scope table above lists 10 test-CASE MDs — but the planning folder has more artifacts (test-PLAN MDs, agent-queue, _internal notes) that were also touched during HIST work. Use your own brain. The HIST integration window was 2026-04-13 → 2026-04-17. Find everything in your sphere that was written/modified in that window and decide what stays.

1. Run inside GIVER sphere:
   ```
   git log --since=2026-04-13 --until=2026-04-18 --name-only --pretty=format:"%h %ad %s" --date=short -- clients/encore/specs_planning/ clients/encore/exports/ export_test_cases/
   ```
2. Enumerate every file touched in that window. Focus areas:
   - `specs_planning/test-plans/setup/locations/*.md` — 9 non-history test plan files (the dedicated `locations_management_history_test_plan.md` is KEEP)
   - `specs_planning/test-plans/setup/local-office/*.md` — test plan for local office
   - `specs_planning/test-cases/**` — already partially listed in the scope table
   - `specs_planning/_internal/*.json` + `*.md` — queue state, agent-queue, agent-mistakes entries that may reference old TC IDs
   - `clients/encore/exports/*.csv` — auto-regenerated but cross-check line counts
3. Per file found, classify:
   - **STRIP**: prose describing integration-per-spec or listing TC-*-HIST; scrub.
   - **KEEP**: schema docs, structural spec references, domain knowledge. Leave alone.
   - **REVISE**: partially HIST-specific; surgical edit.
4. Test-plan MDs specifically — decide per-file whether the HIST cross-reference (Location Management History mention) is a structural pointer (keep) or a workflow directive describing the old integration pattern (revise).
5. Cross-reference master plan §3 KEEP list so you don't over-delete.
6. Document every candidate + disposition in your activity-log row `| Notes`. Scope extensions go here.

### Phase 1 — Deletion + Re-export (after Phase 0 complete)

1. `/identity GIVER`.
2. `/regression-guard` snapshot BEFORE (file fingerprints on the test-case + exports directories).
3. Per MD (10 passes, two in local_office_settings_test_cases.md):
   a. Read the file.
   b. Grep `TC-.*-HIST` — find exact start/end lines of the section (section ends at next `## ` or end of file).
   c. Use Edit to delete section (from `## TC-*-HIST: title` line through last sub-bullet of that section, stopping before the next `## `).
   d. Sanity: the next TC section heading still exists and is intact.
4. After all MDs edited, run the CSV exporter:
   - `npm run` list candidates or check `package.json` for export script
   - Run it — regenerates all `clients/encore/exports/*.csv`
5. `/regression-guard` AFTER. Diff should show:
   - 10 MD sections removed (one per MD, two in local_office_settings_test_cases.md)
   - 10 fewer rows in affected CSV exports
   - Nothing else changed
6. Commit: `chore(hist-pivot): SP-A3 — strip TC-*-HIST sections from 10 MDs + re-export CSVs`.

---

## Verification

1. `grep -rn "TC-.*-HIST" clients/encore/specs_planning/test-cases/` returns zero hits in the 10 files listed. (Only the structural `locations_management_history_test_cases.md` retains TC-LOC-MGH-* sections.)
2. `grep -rn "TC-.*-HIST" clients/encore/exports/` returns zero hits.
3. Diff the CSV files vs pre-SP-A3 — rows reduced by exactly the number of deleted HIST rows.

---

## Handoff Signals

1. the file's Status field to DONE + Executed date.
2. Activity-log row (LR-037 wall-clock):
   ```
   | YYYY-MM-DDThh:mm | giver | done | locations_account_address_test_cases.md, locations_auto_addon_test_cases.md, locations_currency_test_cases.md, locations_legal_test_cases.md, locations_local_information_test_cases.md, locations_notes_test_cases.md, locations_pricing_test_cases.md, locations_shared_setup_locations_test_cases.md, local_office_settings_test_cases.md, clients/encore/exports/*.csv | SP-A3 — stripped 10 TC-*-HIST sections + re-exported CSVs per HIST column-first pivot |
   ```
3. `git mv` this file to `plans/done/`.
4. `npm run plans:reindex`.

---

## Context for Cold-Start Session

- Master plan §3 — GIVER artifact classification.
- The CSV exporter has no HIST-specific logic; it just reads the MDs. Re-run is enough.
- The MDs were authored by GIVER (Planner) alongside the appended TC-*-HIST tests. Removing them completes the planner-side cleanup.
- LR-020 applies: verify plan claims against codebase. After cleanup, test-case count matches spec-code TC count exactly.

---

## Dependencies

- Requires SP-A1 + SP-A2 to complete first (MDs should be stripped only after code they describe is gone).
- Unblocks: no downstream subplan blocks on this, but MD/CSV cleanliness is part of the master verification acceptance.

---

## Execution Summary

**Executed**: 2026-04-20 by GIVER (OWNER identity active) via `/execute SUBPLAN_HIST_PIVOT_03_A3_PURGE_MDS_CSVS.md`.

### Dependencies verified
- SP-A1 (SUBPLAN_HIST_PIVOT_01_A1_PURGE_LOC_SPECS.md) — DONE, Executed 2026-04-20.
- SP-A2 (SUBPLAN_HIST_PIVOT_02_A2_PURGE_LO_SPECS.md) — DONE, Executed 2026-04-20.

### Phase 0 — Date-Forensic Self-Discovery findings
`git log --since=2026-04-13 --until=2026-04-18` in GIVER sphere (specs_planning, exports, export_test_cases) surfaced:
- **In-scope (primary)**: 10 test-case MDs listed in scope table. Processed. ✅
- **Scope extension candidate (9 test-plan MDs)**: each per-module test-plan for Location setup has a `## Integration: History Verification` section with `TC-LOC-HIST-NNN`; `local_office_settings_test_plan.md` has `Scenario Group 16: Integration — History Verification` with `TC-LOS-HISL-001/002`. These describe integration-per-spec tests that SP-A1/A2 deleted. Disposition: STRIP (orphan planning prose). Deferred per bootstrap HALT rule (>30% scope extension → user confirms before action).
- **KEEP (confirmed untouched)**: `locations_management_history_test_cases.md` + `.csv` (structural 19-TC plan), `AGENT_RULES_ENCORE.md`, `export_test_cases/to-csv.ts`, `export_test_cases/README.md`.
- **Out-of-sphere (owned by other identities)**: `REQUIREMENTS.md` §History language (SP-H owns), `agent-activity-log.md` (historical archival; LR-037 forbids rewriting).

### Actions taken
1. Stripped `## TC-*-HIST: ...` + parent `# Integration: History Verification Test Cases` section from each of 10 test-case MDs (strip point = `---\n\n# Integration: History Verification Test Cases` through EOF). Done via batched Node script (cleaner than 10 Edit calls for end-of-file truncation).
2. Regenerated 9 CSV exports via `npx ts-node export_test_cases/to-csv.ts <md>` per file.

### Verification results
| Acceptance check | Result |
|---|---|
| `grep "TC-.*-HIST" clients/encore/specs_planning/test-cases/` | 0 hits ✅ |
| `grep "TC-.*-HIST" clients/encore/exports/` | 0 hits ✅ |
| Last TC in each stripped file intact (non-HIST) | Verified per-file ✅ |
| CSV row count reduction per file | ACC 29→28, AAO 21→20, CUR 28→27, LGL 19→18, LI 78→77, NTS 28→27, PRI 35→34, SSL 25→24, LOS 85→83 — total −10 rows matching 10 deleted HIST TCs ✅ |
| `locations_management_history_test_cases.md/.csv` untouched | Confirmed via git status (not in modified list) ✅ |
| `export_test_cases/to-csv.ts` untouched by this session | Pre-existing mod only (unchanged by SP-A3) ✅ |
| Overall git diff: 18 files, +9 / −401 | Pure HIST removal; zero collateral churn ✅ |

### Files modified by this subplan
- 9 test-case MDs (total ~279 lines removed across them)
- 9 CSV exports (auto-regenerated, 10 HIST rows removed)

### Phase 0 extension — executed in-session (user confirmed 2026-04-20)

Auditor guidance (2026-04-20): "Option 1 — extend SP-A3 in this session, but DON'T blanket-strip. Read each section's full content FIRST, then classify per-file: STRIP (pure old-workflow), REVISE (coverage intent / field mapping / hist-tracking expectations), KEEP (pure cross-reference). GIVER owns test-plan MDs, not HUNTER."

All 9 surfaced sections were read in full. **Every section carried coverage intent** — column mappings, NOT-TRACKED registry entries, and/or format notes that remain valid under the pivot. None were pure old-workflow, so all 9 were REVISED (retargeted) rather than STRIPped. Domain knowledge preserved; old-workflow prose ("after X save TCs complete, navigate to history...") removed.

Per-file disposition:

| File | Old section | Disposition | Preserved domain content |
|---|---|---|---|
| locations_account_address_test_plan.md | `## Integration: History Verification` (TC-LOC-HIST-005) | REVISE → `## History Coverage` | col 55 (Account Name), col 57 (Phone2); pointer → SP-D4 |
| locations_auto_addon_test_plan.md | same (TC-LOC-HIST-008) | REVISE | NOT-TRACKED exploratory hypothesis for AAO checkboxes; pointer → SP-D8 + SP-E-LM-OTHER |
| locations_currency_test_plan.md | same (TC-LOC-HIST-003) | REVISE | col 6 (Currency), col 64 (pricing Currency); NOT-TRACKED Merchant; pointer → SP-B-LM-1 / SP-D1 |
| locations_legal_test_plan.md | same (TC-LOC-HIST-004) | REVISE | col 34 (SC Name), col 38 (T&C); pointer → SP-D5 |
| locations_local_information_test_plan.md | same (TC-LOC-HIST-001) | REVISE | cols 13/48/73 spot-check; NOT-TRACKED EnableMultidayPricing (BUG-HIS-001); format rules (Unicode ✔, N.NN %, MM/DD/YYYY); pointer → SP-D3a/D3b |
| locations_notes_test_plan.md | same (TC-LOC-HIST-007) | REVISE | col 70 (Notes content); pointer → SP-D6 |
| locations_pricing_test_plan.md | same (TC-LOC-HIST-002) | REVISE | col 62 (Include SC in Price Guides); API 500 rationale for why per-column driven-from-root avoids old spec limitation; pointer → SP-B-LM-2 / SP-D2 |
| locations_shared_setup_locations_test_plan.md | same (TC-LOC-HIST-006) | REVISE | cols 59-61 (Action/ID/Name of Shared Setup Location); pointer → SP-D7 |
| local_office_settings_test_plan.md | `## Scenario Group 16: Integration — History Verification` (TC-LOS-HISL-001/002) | REVISE → `## History Coverage (42-col)` | BAS spot-check (Prep Date Offset, Use Fulfillment, Default Order Type) + NOT-TRACKED (PO Number/Label, Room); ECT NOT-TRACKED (BenefitsMultiplier, HistoricalSubrental, LaborCost + cols 33-40 read-only); format rules (SVG lucide-check, MM/DD/YYYY AM/PM, plain integers); pointer → SP-C1/C2 |

### Extension verification
- `grep "TC-LOC-HIST|TC-LOS-HISL|## Integration: History Verification|Scenario Group 16: Integration"` in test-plans/ = **0 hits** ✅
- New sections read cleanly as final `## History Coverage` headings per file ✅
- Side benefit: duplicate "Scenario Group 16" heading bug in local_office_settings_test_plan.md resolved (old HIST section renamed to `## History Coverage (42-col)` so the remaining Scenario Group 16 is now unambiguously "ECT Tab — Persistence Gap-Fill (RT)")
- All 8 Location test-plans use CRLF line endings (detected + preserved); Local Office test-plan uses LF (preserved)
