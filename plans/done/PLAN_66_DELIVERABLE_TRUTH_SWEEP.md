# PLAN_66 — Deliverable Truth Sweep (post-PLAN_65 poison containment)

**Status**: DONE
**Executed**: 2026-08-14
**Identity**: OWNER (orchestration; GIVER-owned workbook artifacts rebuilt via delegated workers; git ops CEO-only)
**PermissionMode**: acceptEdits
**Created**: 2026-08-14
**Parent**: PLAN_65_TICKET_ID_STRUCTURAL_NAMING_REMEDIATION.md (its D6 will reference this plan)
**Delegation**: /delegation-temp + /ultra-agents active — all substantive work via Copilot tickets; CEO does git ops, dispatch, verdict reading only.

## Incident (measured, not assumed)

PLAN_65's workbook rebuild (`npm run xlsx:build`, list-only mode) ingested a Playwright listing in which **every collected test carried a `skip` annotation**. Result written to client deliverables:

- Rows marked "Skipped": **45 → 1970** across 28 modified workbooks (own count, exceljs cell-resolution, artifact: session scratchpad `count-skipped.mjs` output 2026-08-14).
- Static skip/fixme in the whole suite: **40** (19 skip + 21 fixme). The 1970 is therefore ~1925 rows of false "Skipped" on client-visible files.
- The six NEW corporate-override workbooks are 100% "Skipped" (e.g. labor-grid 48/48; its spec has 0 skips).
- The six OLD delivered workbooks at HEAD carried **blank** Automation Status cells (with-run builds whose run reports lacked those TCs) — the delivered convention never asserted Pass.
- Worker report W1-CHURN materially undercounted (claimed encore_test_cases 60 fills; measured 1037) — worker claims re-measured by CEO before this plan.

## Scope — every deliverable-facing file touched today (2026-08-14 session)

| Surface | State | Disposition |
|---|---|---|
| 28 modified `.xlsx` under `clients/encore/testcases/` (27 unrelated + core) | POISONED | P0 revert to HEAD |
| 6 new `.xlsx` (feature-named, staged A) | POISONED (100% Skipped) | P2 rebuild from verified-clean listing |
| 6+6 renamed `.spec.ts` + `_test_cases.md` | byte-identical at R100 (audited) | keep; no action |
| `export_test_cases/module-codes.json` | correct (restored blob `06df5cc5`) | P4 re-verify |
| `export_test_cases/to-xlsx.ts` | correct maps; `buildIsoDate` churn design flaw | P4 verify; churn fix = spawned follow-up, NOT this plan |
| `scripts/deliverable/delivery-manifest.encore.json` | codes correct; validator red ×8 (pre-existing) | Council C3 fixes at source |
| `clients/encore/docs/MODULE_REGISTRY.md` | tracked, ships | P4 re-verify surface names |
| `scripts/deliverable/approval-log.md` | annotation only, rows byte-identical | P4 confirm |
| `.githooks/pre-commit`, `package.json`, `scripts/lib/check-structural-names.mjs`, `.claude/rules/deliverable.md` | internal, gate green 18/18 | no action |

## Phases

### P0 — Containment (CEO git op, immediate)
Revert all 28 modified `.xlsx` to HEAD (`git checkout --`). Staged 6 A + 6 D untouched. Acceptance: `git status --porcelain -- 'clients/encore/testcases/*.xlsx'` shows only the 6 A + 6 D rows; core worktree distribution == HEAD distribution.

### P1 — RCA of the poisoned listing (ticket `p66-rca`, T2, instrument-and-observe)
Deliver: file:line of the global skip-annotation source, the triggering condition, the env delta between the poisoned A2/A3 build and a healthy shell, and the **prescription** (env prerequisites + expected per-module col-I distribution) for a clean rebuild. No fixes. No test execution — `--list`/JSON reporter only. Known facts embedded in ticket; only 2 conditional `test.skip(true)` exist in specs (location-management-history) — the global source is elsewhere (fixture/config/setup).

### P2 — Rebuild the 7 in-scope workbooks (ticket `p66-rebuild`, T2, blocked by P1)
Rebuild with P1's prescription. Acceptance: per-module Skipped == static skip/fixme counts (location-picker 1, core 2, others 0, modulo P1 findings); zero "Skipped" rows without a matching spec annotation; BOM/encoding clean; `npm run check:tc-parity` exit 0; re-stage; no XY divergence.
**Client-visible semantic flag (record in PLAN_65 D6 + receipt)**: list-only fills non-skipped rows with assumed "Pass" where delivered workbooks had blank. Rutvik sees this flag before any push.

### P3 — Skip-explosion tripwire (ticket `p66-tripwire`, T2, blocked by P1 facts; LR-069 header S1, graduating incident = this one, 2026-08-14)
A check that fails the build/commit when a generated workbook's Skipped+Blocked count diverges from the spec-derived annotation count for that module. Threshold = exact match against the measured mechanism P1 names — no invented tolerances. Wire per W2 pattern (pre-commit on testcases paths + `pipeline:validate`). Fixture-proven deny + allow.

### Phase C — Chip councils (parallel, each = build worker + cross-family reviewer)
- **C1 `p66-c1-scorecard`**: fault attribution for delegation scorecard. Premise re-verified in-ticket against `~/.claude/delegation/scorecard.mjs` (worker operates on a CEO-prepared COPY in chips dir; CEO applies the diff to the Claude-half after review — workers never write `~/.claude`). HALT if premise false.
- **C2 `p66-c2-shipbranch`**: retire dead per-ticket preset table in `scripts/ship-branch.sh` (zero callers measured in package.json/.ci/docs/scripts). Three scopes: impl (preset `case` block) + callers (full-repo re-grep incl. plans/docs, update references) + gates (none found; verify). Keep the ad-hoc `--modules/--surface` form; add banner pointing to `/push-encore-deliverables`. `bash -n` mandatory.
- **C3 `p66-c3-manifest`**: clear the 8 validator findings at source (census fresh, classify each via git blame/log, fix manifest refs/evidence honestly). NEVER loosen the validator. No BOM. Does not touch workbooks (collision-free vs P2).

### P4 — Cross-family re-audit (ticket `p66-audit2`, T4 gpt-5.5, after P2+P3+C3)
Fresh audit of the full scope table: re-verify registry/manifest referential integrity, workbook distributions vs P1 prescription, MODULE_REGISTRY/approval-log, renames still byte-identical, W1-undercount noted as worker-trust finding. Verdict gates PLAN_65 + PLAN_66 closure.

### P5 — Closure
PLAN_65 D6 recorded · scorecard rows (W1 undercount; A2/A3 poison provenance per P1 fault attribution) · LR-027 execution summaries · closure-gate dry-run → Status flip · `npm run plans:reindex` · LR-028 activity-log row · commit. **NO PUSH — `/push-encore-deliverables` remains Rutvik's explicit invocation.**

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | — | (none) | (none) |
| GIVER | testcases workbooks (content correctness) | `clients/encore/testcases/corporate-override/corporate-override-labor-grid.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-location-picker.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-filters.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-grid-sort.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-export.xlsx`<br>`clients/encore/testcases/corporate-override/corporate-override-import.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | — (specs untouched this plan) | (none) | (none) |
| HEALER | RCA artifact | RCA output of worker chip `p66-truth-0814` — produced, but a per-run worker artifact that was never tracked and does not travel with the repo | file exists + names file:line + env delta |
| WATCHDOG | re-audit verdict | audit verdict of worker chip `p66-truth-0814` — produced, but a per-run worker artifact that was never tracked and does not travel with the repo | `VERDICT:` line present |
| GARDENER | tripwire check + ship-branch retirement | `scripts/xlsx-tripwire.test.ts`<br>`scripts/ship-branch.sh` | `bash -n scripts/ship-branch.sh` exit 0; `npm run test:xlsx-tripwire` exit 0 (guards live in `export_test_cases/sp00-augment-logic.ts` per D1 seam) |

## What becomes stale (LR-050)
- The 3 session chips (`task_f2d628e5`, `task_45afac25`, `task_b58fa1f1`) — superseded by Phase C councils; dismissed at dispatch.
- W1-CHURN.md's per-file table — superseded by CEO's own count artifact (undercount defect recorded).

## Plan Deviations
- **D1 (P3 seam)**: tripwire implemented at the EXPORTER SOURCE (pre-listing auth-state abort + all-skip listing abort in `export_test_cases/`), not as a pre-commit xlsx parser — per RCA mechanism, fix-at-source doctrine, and LR-069 bloat governor (a commit-time xlsx parse would risk the 20s budget and invented thresholds; the source abort makes the poison unwritable).
- **D2 (C2 review)**: reviewer REJECT traced to a dispatcher-stale constraint (I told it "staged = 12 renames + 6 deletes" after the set had legitimately grown to include 6 re-staged adds). All substantive items VERIFIED. Its one real finding — stale `nm2268` example in `.claude/skills/push-encore-deliverables/SKILL.md` — is delegation-gate PROTECTED; fix pends Rutvik's explicit go (drafted: example → `notes` + retirement note).
- **D3 (C3 review)**: reviewer REJECT valid but report-scoped — the worker's report cited commit `f2e9626a0` as rename provenance (wrong; PLAN_65's work is uncommitted). The repo artifacts (rows 49–51) cite the original approval lines correctly and needed no edit. Lesson goes to scorecard, not the tree.
- **D4 (SVC approvals)**: Rutvik approved SVC.BAS + SVC.HIS in chat 2026-08-14 ("YES"). Rows 52–53 appended; approved_refs set; the append changed the log's blob so rows 49–51's pins were refreshed to the new blob per the validator's own documented recovery (referenced rows byte-unchanged). `validate-delivery-manifest` now exit 0 (34 modules) — first green on this validator since the debt accrued.
- **D5 (Pass wording)**: Rutvik ratified "Pass" in the six rebuilt workbooks ("we only deliver passing ones; pass = correct as per previous deliveries"). No blank-cell restoration; exporter semantics stand.
- **D6 (P4 verdict handling)**: final audit `p66-p4-audit2-0814` returned REJECT with 3 findings; items 1–5, 7, 9 VERIFIED. Disposition: (1) BLOCKER ship-branch missing LR-073 target gate — fixed by `p66-d1-shipgate-0814` at `scripts/ship-branch.sh:330` before both success paths; verified by CEO (bash -n 0, placement read, own deny-fixture exit 1) + worker deny/allow fixtures. Root cause: PLAN_66's own C2 kept ship-branch alive for ad-hoc shipments after W2 had scoped it out as dead — the keep decision invalidated the scoping. (2) MAJOR stale plan `PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md` — Status flipped to SUPERSEDED with retirement note. (3) MAJOR "45 unattributable paths" — dissolved by attribution against `BEFORE-git-status.txt`: 49 new paths minus declared scope = 6, all six are in-scope A1/A2/B edits (MODULE_REGISTRY.md, check-per-test-baseline.mjs, ship-client.sh gate, test-fieldinventory-skip-fixtures.mjs, walk-coverage fixtures ×2), diffs inspected. No third audit round purchased: the two real fixes carry worker fixture proofs + CEO independent verification, and `/final-q` remains the last net (frugality per Rutvik's burn-less directive).
- **D7 (labor gate at closure)**: closure battery ran validators/parses only; `check:tc-parity` (exit 0, P2 + CEO re-run) and `test:xlsx-tripwire` (exit 0, CEO run post-P3) are cited from this session's existing evidence — the labor gate correctly refused CEO re-execution.

## Execution Summary
- **P0**: 28 poisoned workbooks reverted to HEAD (`git checkout`), verified 6 A + 6 D only.
- **P1**: RCA `p66-rca-0814` — mechanism: missing Playwright storage-state under `.auth/` at collection ⇒ Playwright annotates every test skip (projects declare storageState + setup dependency) ⇒ exporter writes "Skipped". CEO corrections recorded: the report's "separate Aug-14 rebuild" is unsupported (ticket wording artifact); its distribution table was approximate — P2 re-derived from source. Fault: env + dispatcher (auth prerequisite absent from A2/A3 tickets).
- **P2**: `p66-p2-rebuild-0814` — six workbooks rebuilt with auth verified; expected table derived from md+spec sources FIRST; cell-resolved EXACT match (103 Pass, 1 Skipped = TC-CPR-OVR-040, 0 Blocked); CEO re-measured independently, identical. All other xlsx surgically restored; tc-parity exit 0.
- **P3**: `p66-p3-tripwire-0814` — two S0 guards at exporter source (auth-state abort + all-skip abort) as tested pure functions; `test:xlsx-tripwire` + typecheck exit 0 (CEO re-run). Seam per D1.
- **Phase C**: C2 ship-branch presets retired (review REJECT overruled — dispatcher-stale constraint, all substantive items VERIFIED; its real finding fixed under Rutvik's granted skill edit). C3 manifest: 6/8 fixed with commit provenance, 2 refused pending owner approval — Rutvik approved in chat; rows 52–53 appended; blob pins refreshed per validator's documented recovery; **`validate-delivery-manifest` exit 0 (34 modules)**. C3 review's provenance defect was report-narrative only (artifacts cite original approval lines correctly).
- **P4**: audit REJECT → all three findings dispositioned per D6.
- **P5**: this summary; chips dismissed (1 false-premise, 2 superseded by councils); scorecard lessons owed: W1 undercount (worker), A2/A3 poison (dispatcher/env), C2-review false-reject (dispatcher).
- **TCs**: none authored, none dropped — this plan corrects generated artifacts and gates; TC content untouched.
- **Docs**: `.claude/skills/push-encore-deliverables/SKILL.md` example modernized under Rutvik's granted SELF_GRANT; `.claude/context/navigation.md` row 74 updated by C2; `plans/pending/PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md` superseded.
- **Verification battery (closure)**: structural-names exit 0 · delivery-manifest exit 0 · pre-commit parse exit 0 · ship-branch parse exit 0 · 18-case harness exit 0 · tc-parity exit 0 (P2 + CEO re-run) · xlsx-tripwire exit 0 (CEO run post-P3).
- **Battery artifacts**: the closure-battery and AFTER-git-status outputs of worker chip `p66-truth-0814` — per-run worker artifacts on the machine that ran them; never tracked, so they do not travel with the repo.
- **NO PUSH performed**; shipping remains Rutvik's explicit `/push-encore-deliverables` invocation.

## Constraints (inherited, load-bearing)
- NO push of any kind. NEVER run full test suites — collection only. Jira READ-ONLY. Workers never commit/stage/push; git ops CEO-only. Evidence tee'd to chips dir `p66-truth-0814/`. Worker claims re-verified by CEO grep before acceptance (today's W1 undercount is the standing reason).
