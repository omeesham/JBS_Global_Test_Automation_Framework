> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_65_TICKET_ID_STRUCTURAL_NAMING_REMEDIATION.md`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load /identity per the Identity field below (OWNER).
> 2. **Skills**: load every skill in the Skills field below (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read `**Model**:`, `**Thinking**:`, `**PermissionMode**:` from this plan's frontmatter (all three required per LR-041).
> 4. **Dependency gate**: verify every item in the Depends-on field. HALT if blocker.
> 5. **Context load**: read this plan in full + the evidence pack at `.claude/state/ua-worker/chips/naming-rca-0813/` (LOT-A..D + DIGEST). If that dir is gone, re-derive the inventory with the Phase 0 denominator commands — never proceed on memory.
> 5.5. **Browser tool**: `BrowserTool: none` — no live-app work in this plan.
> 6. **Phase 0 FIRST**: re-derive the violation inventory (denominator re-run) before any edits.
> 7. **Execute Phases 1–5** in order. Delegation-first: deterministic edit/verify phases dispatch to workers per `.claude/skills/ultra-agents/worker-ext.md`; the executing session keeps judgment, ceremony, and publishing.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append activity-log row (LR-028 + LR-037), git mv to plans/done/, npm run plans:reindex, commit.
>
> **HALT + ASK USER** if: dependency blocker / scope ambiguity / Phase 0 re-derivation finds >30% more violations than §Inventory / regression-guard unrelated changes / any strict zero-hit acceptance line cannot be met (LR-046 — HALT-and-ask, never APPEND-rescope).

---

# PLAN 65: Ticket-ID Structural Naming — Remediation + Prevention

**Status**: DONE
**Executed**: 2026-08-14
**Priority**: P0 (`main` is the sole delivery surface and it carries internal ticket-ID filenames on client-facing artifacts; every ship from now on carries them until this lands)
**Created**: 2026-08-13
**Identity**: OWNER
**Skills**: /execute, /regression-guard
**Depends on**: none. The per-ticket delivery branches are RETIRED (Rutvik, 2026-08-13: only `main` goes to prod). Pending plans that cite renamed paths (`plans/pending/PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP.md`, `plans/pending/PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md`, pending `SUBPLAN_CORP_PRICING_NM227*.md`) get their path citations repathed in Phase 2 so they don't point at files that no longer exist.
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

## Context

Rutvik caught `clients/encore/testcases/corporate-override/corporate-override-nm2268..nm2273.xlsx` — six client-facing workbooks named after Jira tickets instead of features. Evidence run `naming-rca-0813` (chief + workers, CEO spot-audited) established:

- **Origin**: `plans/done/PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md` (line 173) deliberately chose the ticket-ID split axis; landed in commit `a544dcd72` (2026-07-28). A design decision, not a typo.
- **RCA (4 causes)**: (1) NO written file-naming rule existed anywhere; (2) `NM-####` is KEEP-listed by design (legitimate as content), so content gates can't flag it; (3) every gate scans CONTENT, none scans file/dir/registry NAMES; (4) PLAN 59's closure gate was skipped (`agent-mistakes.md:255-256`).
- **Blast radius (30 structural violations)**: 18 files (6 xlsx + 6 spec + 6 md) + 6 `mdBasename` registry values + MODULE_REGISTRY surface keys. Plus, found by CEO verification beyond the worker map: `export_test_cases/to-xlsx.ts:239-244` SPLIT_FILE_MAP stems (the actual xlsx filename source), `export_test_cases/types.ts:191-196` code enum, `scripts/deliverable/delivery-manifest.encore.json` COR.N271-273 rows, `scripts/ship-branch.sh` presets.
- **Not violations (stay untouched)**: plan filenames (`SUBPLAN_CORP_PRICING_NM2268_*` — plans are ticket-scoped by design), `_internal/` walk/RCA artifacts, `.playwright-cli/` snapshots, `NM-####` as CONTENT anywhere (comments, TC step text, md title lines — KEEP per `scripts/lib/forbidden-patterns.mjs`), TC IDs (`TC-CPR-OVR-*` are already feature-coded), xlsx SHEET names (already feature-named).
- **Exposure**: `main` is the only branch that ships to prod (Rutvik, 2026-08-13); the per-ticket delivery branches (`nm2268`…`nm2273` on origin + encore-mock) are dead and are NOT remediated by this plan. Since the ticket-named files live on `main`, every future ship carries them until this plan lands — that is the whole exposure, and fixing `main` fixes it.

## Rename Map (approved-by-plan-approval; sheet-aligned, minimal churn)

| Current stem | New stem | Registry key | New key | Jira anchor |
|---|---|---|---|---|
| `corporate-override-nm2268` | `corporate-override-location-picker` | `N268` | `LPK` | NM-2268 "Location Search" (sheet+display say Location Picker; picker kept — matches sheet `corporate_override_loc_picker`) |
| `corporate-override-nm2269` | `corporate-override-filters` | `N269` | `FLT` | NM-2269 "Override Filters" |
| `corporate-override-nm2270` | `corporate-override-grid-sort` | `N270` | `GSR` | NM-2270 "Override Grid Filters (incl. search filter)" — display "Grid Text Filter and Sort"; sheet `grid_sort` |
| `corporate-override-nm2271` | `corporate-override-labor-grid` | `N271` | `LGR` | NM-2271 "Override Grid Equipment and Labor" — display "Labor Grid" |
| `corporate-override-nm2272` | `corporate-override-export` | `N272` | `EXP` | NM-2272 "Pricing Override Export" |
| `corporate-override-nm2273` | `corporate-override-import` | `N273` | `IMP` | NM-2273 "Pricing Override Import" |

md pattern: `corporate_override_<feature_snake>_test_cases.md`. `NM-####` stays INSIDE file content (title lines, traceability) — that is correct and untouched.

## Step-by-Step

### Phase 0 — Re-derive the denominator (no edits)
1. Re-run the inventory: `git ls-files | grep -iE "nm-?[0-9]{3,4}"` filtered to `clients/encore/testcases|tests|specs_planning/test-cases` + `git grep -n "corporate.override.nm22"` + registry/key greps (`git grep -n "N26[89]\|N27[0-3]" -- "*.ts" "*.mjs" "*.sh" "*.json"`). Compare counts against §Context blast radius. >30% growth = HALT.
2. `git status` snapshot + `/regression-guard` pre-snapshot.
3. Confirm nothing in `PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md` / `PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP.md` is mid-flight (no partially-pushed refresh pending on those branches).

### Phase 1 — Registry + exporter (the data sources) [SONNET-SAFE]
4. `export_test_cases/module-codes.json:54-59`: keys `N268..N273` → `LPK/FLT/GSR/LGR/EXP/IMP`; `mdBasename` → new md basenames. `display`/`sheet`/`idModule`/`idSubmodule` unchanged.
5. `export_test_cases/types.ts:191-196`: update the code enum to the new keys (keep `// NM-####` comments — content traceability is legal and wanted).
6. `export_test_cases/to-xlsx.ts:239-244`: SPLIT_FILE_MAP stems → new stems (sheet-name keys unchanged).
7. `scripts/deliverable/delivery-manifest.encore.json`: `COR.N271/N272/N273` → new codes.
8. `scripts/ship-branch.sh` presets: `--modules=COR.N268` etc. → new codes, so the script stays internally consistent. Its per-ticket BRANCH presets are now dead machinery (branches retired) — do NOT retire the script in this plan; note it in the Execution Summary as a standing cleanup candidate for a separate decision.

### Phase 2 — File renames (git mv, content untouched) [SONNET-SAFE]
9. `git mv` 6 spec files + 6 md files to new names. Zero content edits inside them in this phase.
10. `clients/encore/docs/MODULE_REGISTRY.md:23`: surface list `core, nm2268..nm2273` → `core, location-picker, filters, grid-sort, labor-grid, export, import`.
11. Chase every tracked reference to old stems/keys found in Phase 0 (excluding `plans/done/`, `_internal/`, `.playwright-cli/` — historical records stay verbatim). Pending plans that cite old paths (`PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP.md`, `PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md`, pending `SUBPLAN_CORP_PRICING_NM227*.md`) get their path citations updated — plan FILENAMES stay.

### Phase 3 — Rebuild + verify
12. Rebuild workbooks — verify the exact exporter entry from root `package.json` scripts FIRST (LR-020: do not trust the `xlsx:build` name from memory), then run it: new feature-named xlsx appear; DELETE the 6 old `corporate-override-nm22*.xlsx` (git rm — LR-050 stale cleanup, enumerated here, not deferred).
13. Battery: `npm run check:tc-parity` exit 0 · `npm run typecheck` clean · `npx playwright test --list` resolves all corporate-override specs · `npm run check:spec-quality` on working tree (LR-060 ob.4) · solo `--grep` smoke of ONE renamed spec compiles/collects (NO full suite — LR: never full suites).
14. Zero-hit acceptance (strict, LR-046): `git grep -in "corporate.override.nm22" -- ':!plans/done' ':!clients/encore/specs_planning/_internal'` → only legal content refs (md title lines, comments) remain; ZERO hits as path/stem/key. Any unforeseen hit = HALT-and-ask.

### Phase 4 — Prevention (rule + machine gate, live-fired)
15. **Write the rule** (the RCA's root cause #1): add `LR-<next-free>` to `.claude/rules/deliverable.md` (verify next number per Numbering Convention before writing): *Structural names in client-shippable artifacts (file/dir basenames under `clients/*/testcases/**`, `clients/*/tests/**`, `clients/*/specs_planning/test-cases/**`; registry keys/`mdBasename`/split-file stems) MUST be feature-based. Ticket IDs (`nm####`/`NM-####`) are legal ONLY as content (traceability) and in plan/internal artifacts.* Cross-link from `docs/read_only_docs/CASE_GENERATION_STANDARD.md` file-naming note.
16. **Build the gate**: new `scripts/lib/check-structural-names.mjs` — basename pattern `/(^|[-_])nm-?\d{3,4}([-_.]|$)/i` scoped to ALL shippable client paths (`clients/*/testcases/**`, `clients/*/tests/**`, `clients/*/src/**`, `clients/*/config/**`, `clients/*/specs_planning/test-cases/**`) — EXCLUDING legitimately ticket-named internals (`**/specs_planning/_internal/**`, `**/.playwright-cli/**`, `**/.auth/**`, `plans/**`) — plus registry lint (module-codes.json keys/mdBasename + to-xlsx.ts SPLIT_FILE_MAP stems). Anchored to emitter formats, path-scoped — NOT a prose detector (a description mentioning a ticket must never trip it; file CONTENT is never scanned by this gate).
17. **Wire it**: `.githooks/pre-commit` (staged added/renamed paths) + npm script `check:structural-names` in the commit-gate battery + ship-path verify next to `verify-no-forbidden.mjs` in `client:ship`/`ship-branch.sh`.
18. **Live-fire proof (HARD, not SOFT)**: stage a throwaway violating file (`clients/encore/tests/corporate-override/corporate-override-nm9999.spec.ts`), prove the gate DENIES (non-zero exit, message states the rule), record the trip output in the Execution Summary, then remove the fixture. A gate never seen firing = SOFT-SUSPECT = not done.

### Phase 5 — Closure
19. LR-027 Execution Summary (include the ship-branch.sh dead-machinery note from step 8) + Status flip via closure gate dry-run first (`validate-plan-closure`) · LR-028 activity-log row · `npm run plans:reindex` · commit. Deviations → §Plan Deviations.
20. NO push of any kind by this plan. Shipping `main` to the client remains Rutvik's explicit `/push-encore-deliverables` invocation.

## Prior-Fix Trial (recurrence-class gate)

| Prior fix | What it did | Why it didn't fire here | Verdict |
|---|---|---|---|
| `scripts/lib/forbidden-patterns.mjs` + jargon-gate (LR-058) | Blocks internal jargon in shipped CONTENT; `NM-####` deliberately KEEP | `scoped-wrong` for this class BY DESIGN — content scanner, filenames invisible; KEEP is correct for content | SURVIVES (correct for its class; extended, not replaced — new gate covers the name axis) |
| commit `10ef433ed` (internal defect-ID scrub) | Removed internal defect IDs from client-facing surfaces | One-off content scrub; created no rule and no gate for NAMES | different-sub-class; superseded by Phase 4 rule+gate |
| `check:tc-parity` | TC-ID parity md↔xlsx↔spec | Checks IDs, blind to filenames | SURVIVES (untouched) |

No existing mechanism is convicted-and-removed; the gap was an ABSENT mechanism. Phase 4 adds it; no layering over a failed fix.

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | — | (none) | (none) |
| GIVER | test-case md + xlsx workbooks (rename-only; zero content authoring) | `clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_location_picker_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_filters_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_grid_sort_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_labor_grid_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_export_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_import_test_cases.md`<br>`clients/encore/testcases/corporate-override/corporate-override-location-picker.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-filters.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-grid-sort.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-labor-grid.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-export.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-import.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec files (rename-only) | `clients/encore/tests/corporate-override/corporate-override-location-picker.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-filters.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-grid-sort.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-labor-grid.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-export.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-import.spec.ts` | `npx playwright test --list` resolves all corporate-override specs |
| HEALER | — | (none) | (none) |
| WATCHDOG | — | (none) | (none) |
| GARDENER | structural refactor (registry/exporter/scripts edits, no business logic) | `scripts/lib/check-structural-names.mjs` | `npm run typecheck` clean + gate live-fire trip recorded |

## What becomes stale (LR-050 — removed IN-SCOPE)

- 6 old `corporate-override-nm22*.xlsx` → git rm in Phase 3 (rebuilt under new stems).
- Old registry keys `N268..N273` + old `mdBasename` values + old SPLIT_FILE_MAP stems → replaced Phase 1.
- Old path citations in pending plans → repathed Phase 2. `plans/done/` + `_internal/` historical records stay verbatim (audit trail).

## NOT touched

- Plan FILENAMES (`*_NM2268_*` etc.) — ticket-scoped by design. `_internal/` artifacts, `.playwright-cli/` snapshots.
- `NM-####` content references anywhere (KEEP; client's own Jira, traceability).
- TC IDs (`TC-CPR-OVR-*`) and xlsx sheet names — already feature-based.
- Git branch names (`nm2268`… on both remotes) — those branches are retired; no branch renames, deletions, or pushes here.
- `encore_test_cases.xlsx` consolidated workbook internals beyond what the rebuild regenerates.

## Decisions (settled 2026-08-13)

- **D0 — Rename map + registry codes as tabled**: settled by plan approval. `location-picker` over Jira's "Location Search" because the sheet name and registry display already say picker.
- **D1 — `filters` vs `active-currency-filters`** for nm2269: **SETTLED — `filters`** (Rutvik picked short).
- **D2 — ticket-named git branches**: **SETTLED — moot.** Rutvik: the per-ticket delivery branches are dead; only `main` goes to prod each time. No branch work in this plan; `main` is the delivery surface this plan cleans.

## Acceptance Criteria

- [ ] Phase 0 re-derived counts match §Context (±30% HALT rule respected)
- [ ] All 18 files renamed per §Rename Map; old xlsx deleted; registry/exporter/manifest/ship-script updated
- [ ] Battery green: tc-parity · typecheck · `--list` · check:spec-quality (working tree) · solo smoke — NO full-suite run
- [ ] Strict zero-hit grep (step 14) clean — path/stem/key hits = 0 outside plans/done + _internal
- [ ] New naming rule written (next-free LR number verified by grep) + gate wired in pre-commit AND ship path
- [ ] Gate live-fire trip PROVEN and recorded (HARD enforcement, not prose)
- [ ] Pending plans citing renamed paths are repathed; no push and no branch work performed by this plan
- [ ] Closure: dry-run validate-plan-closure PASS before Status flip; activity-log row; plans:reindex

## Plan Deviations

(record at execution; D-rows for genuine scope/process surprises only)

**D1 — `to-xlsx.ts` `SHEET_NAMES` keys added to scope (2026-08-13).** The plan's blast radius enumerated `SPLIT_FILE_MAP` stems at `to-xlsx.ts:239-244` but missed `SHEET_NAMES` at `to-xlsx.ts:152-157`, whose six KEYS carry ticket IDs (`corporate_override_nm2268: 'corporate_override_loc_picker'`). Found by the pre-flight clarify round on the execution tickets, then CEO-verified against source. It is load-bearing, not cosmetic: `toSheetName()` (`to-xlsx.ts:296-299`) strips `_test_cases` from the markdown basename and looks the result up in `SHEET_NAMES`, so the key is the `mdBasename` value minus that suffix. Changing `mdBasename` without the key produces a lookup MISS, which does not throw — it falls through to the derived slug (`to-xlsx.ts:309`), and `corporate_override_location_picker` at 34 chars then breaches Excel's 31-char limit. Values (real sheet names) stay byte-identical; only keys move. Count goes 30 → 36 structural violations, +20%, inside the plan's ±30% HALT tolerance, so execution proceeded without a HALT. Phase 4's gate spec is correspondingly widened from two registry structures to three so the class cannot re-enter.

**D5 — staged workbook blobs went stale against the rebuilt working copies (2026-08-13).** After Phase 2's rebuild staged six new workbooks and Phase 3's fix rebuilt them, `git status` showed all six as `AM` — index copy from the earlier build, working copy from the later one, confirmed by differing blob sha256. A commit at that moment would have shipped the pre-fix workbooks carrying the degraded SUMMARY labels D4 was raised to fix, silently and with every other check green. Caught by an index-vs-worktree hash comparison during CEO audit, not by any gate. Remediated by re-staging so index and working tree agree; verified `git status --porcelain` shows no `XY` two-letter divergence anywhere. Standing lesson: `git mv` / `git rm` / a worker's `git add` stage a *snapshot*, so any later rebuild silently desynchronises the index — re-stage and hash-compare before any commit that includes generated artifacts.

**D4 — a third slug-keyed map in `to-xlsx.ts` (`SHEET_DISPLAY_NAMES`) was missed by both the plan and D1 (2026-08-13).** D1 widened scope from one structure to two (`SPLIT_FILE_MAP` + `SHEET_NAMES`). A third, `SHEET_DISPLAY_NAMES` at `to-xlsx.ts:170`, was still keyed by ticket-ID slugs and surfaced only through Phase 2's strict zero-hit search. It is read at `to-xlsx.ts:699` as `SHEET_DISPLAY_NAMES[mdSlugForSheet(sheetName)] ?? sheetName` — the `??` makes a miss silent, degrading each workbook's SUMMARY label from `Corporate Override — Location Picker` to the raw slug, which is client-visible. Remediated by a dedicated pass whose first deliverable was an exhaustive census of every slug-keyed structure in the file rather than another hand-written list; CEO independently confirmed the file declares exactly three such maps (lines 119, 170, 211) and all three are clean. Process lesson recorded: hand-enumerating anchors in a file failed twice on the same file, so the third attempt delegated enumeration itself and verified the census independently. Phase 4's gate covers all three structures.

**D3 — `scripts/deliverable/approval-log.md` gets an LR-050 staleness annotation, not a rename (2026-08-13).** A repo-wide search inherited from the planning session surfaced `COR.N271/N272/N273` at `approval-log.md:18-20` — three dated rows recording the owner's 2026-07-30 ship approval, each quoting the owner verbatim. `scripts/deliverable/delivery-manifest.encore.json` cites this log, so Phase 1's manifest code rename strands the cross-reference. Classified NOT a violation: these are registry codes appearing as *content* in a historical audit trail, which §NOT-touched already protects, and rewriting a dated row would misstate what was approved under the names in force that day. Classified instead as LR-050 staleness — a consequence of the rename that must be enumerated in-scope rather than discovered later. Disposition: Phase 2 appends a forward-pointing migration note (old code → new code, dated) so the trail resolves from either direction, leaving all three historical rows byte-exact. Structural-violation count is unaffected and stays at 36 of the 39 tolerance.

**D2 — pre-flight clarify probe died in its write channel (2026-08-13).** Run `p65-clarify-0813` was dispatched read-mode (correct per the clarify recipe) but carried an `OUTPUT (LITERAL ABSOLUTE)` anchor; read mode denies the write tool, so the deliverable could never land and the wrapper recorded `ok=false / no-deliverable / death_class C3` while the backgrounded process still reported exit 0. The work itself succeeded — the answers were captured in the wrapper's `result.md` and are dispositioned into the tickets. Classified prompt-issue (dispatcher defect), not worker-defect: no bounce charged, no re-dispatch spent. Adjacent finding for Phase 2.5: `dispatch-preflight.mjs` passes an OUTPUT anchor combined with `--mode read`, a combination that is guaranteed to produce a no-deliverable death.

**D6 — the Phase 3 workbook rebuild was poisoned by a missing auth-state file; remediated under PLAN_66 (2026-08-14).** A2/A3's `npm run xlsx:build` ran in worker shells lacking `clients/encore/.auth/encore-state.json`; Playwright annotates every collected test `skip` when a project's declared `storageState` file is absent, and the exporter faithfully wrote "Skipped" into 1970 rows across 28 client workbooks (suite truth: 40 static skip/fixme markers). Found by the post-execution audit's byte-identity check, characterized and measured by CEO cell-resolution (worker W1's characterization undercounted 17×), and remediated in full under `PLAN_66_DELIVERABLE_TRUTH_SWEEP` (containment revert → RCA → clean rebuild with source-derived expected distributions, EXACT match → S0 source-level tripwire making the state unwritable). Fault: env + dispatcher (the A2/A3 tickets never stated the auth prerequisite). The six shipped workbooks now carry 103 Pass / 1 Skipped (TC-CPR-OVR-040) / 0 Blocked, verified independently twice.

## Execution Summary

- **Scope executed**: all 36 structural violations remediated across four structures.
- **Registry**: `module-codes.json` COR keys+mdBasenames (6 rows → LPK/FLT/GSR/LGR/EXP/IMP), `types.ts` enum, `to-xlsx.ts` `SPLIT_FILE_MAP` stems + `SHEET_NAMES` keys + `SHEET_DISPLAY_NAMES` keys.
- **Files**: 12 renames at R100 (6 `.spec.ts` + 6 `_test_cases.md`, content byte-identical), 6 stale ticket-ID workbooks `git rm`'d, 7 feature-named workbooks present (rebuilt clean under PLAN_66 per D6).
- **References**: delivery manifest + `clients/encore/docs/MODULE_REGISTRY.md` + ship-branch presets + ~10 pending-plan citations repointed; approval-log annotated per D3, historical rows byte-identical.
- **Prevention landed (Phase 4)**: LR-073 in `.claude/rules/deliverable.md` (cross-linked from CASE_GENERATION_STANDARD) · `scripts/lib/check-structural-names.mjs` (S0 header, graduating incident named; pattern `/nm-?\d{3,4}(?!\d)/i` hardened through 2 cross-family review rounds + a frozen 18-case harness, sha256 `f38a8d61…`) · wired into `.githooks/pre-commit` (client-path AR trigger + registry/exporter modified trigger), `check:structural-names` npm script, `pipeline:validate`, `scripts/ship-client.sh` and `scripts/ship-branch.sh` `--target` gates · telemetry to `.claude/state/gate-fires.log` · runtime 53–163ms.
- **Verification**: Playwright collection green (165 `TC-CPR-OVR-*` IDs, 0 old names — independent re-run `p65-pwverify-0813-r2`) · tc-parity exit 0 · typecheck exit 0 · closure battery all exit 0 (`.claude/state/ua-worker/chips/p66-truth-0814/closure-battery.txt`) · regression-guard BEFORE/AFTER snapshots at `.claude/state/ua-worker/chips/p65-naming-0813/BEFORE-git-status.txt` and `.claude/state/ua-worker/chips/p66-truth-0814/AFTER-git-status.txt` (W3 disposition: fingerprint = snapshot pair + battery).
- **TCs**: rename-only plan — zero TC content authored or dropped; TC-CPR-OVR-040 remains the module's only skip (spec-annotated), per source.
- **Audits**: post-execution audit REJECT (4 findings) → all remediated (workbook churn → PLAN_66; gate coverage holes → W2; regression-guard evidence → W3; wiring → D1 ship-gate). Final cross-family audit `p66-p4-audit2-0814` REJECT (3 findings) → dispositioned per PLAN_66 D6. Worker-report defects caught by CEO re-measurement are recorded as scorecard lessons.
- **Not done / explicitly out**: `validate-delivery-manifest` pre-existing debt was OUT of this plan's scope and was cleared under PLAN_66 C3 (now exit 0) · exporter `buildIsoDate` churn design flaw remains (documented, spawn-worthy, not alarm-class) · `to-xlsx.ts` pre-existing BOM left untouched by design.
- **NO PUSH performed.** Shipping remains Rutvik's explicit `/push-encore-deliverables` invocation.

## Handoff

Chat-only per handoff discipline: outcomes + what changed + gate-trip evidence; no blocker language (LR-039).
