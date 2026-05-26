# SUBPLAN_PARITY_06 — Spec Fixes (LOS Trio + smoke_seed) [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` (file-only: BAS-068, HIS-7, ECT-018, smoke_seed) + `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` (e2e: BAS-048, ECT-001/010)
**Superseded date**: 2026-05-26
**Reason**: Split by verdict-dependency + file-only vs e2e.

### Execution Summary (LR-027)

- Tasks: BAS-068 add, BAS-048 un-skip, HIS-7 enumeration, ECT-018 implement, ECT-001/010 verdict, smoke_seed restore/delete
- Implemented: 0 (none executed; restructured before run)
- Routed to W1-04: BAS-068 add to spec + CSV (intent confirmed via W1-01 E6), HIS-7 42-column enumeration (deterministic file edit), ECT-018 implementation (file-only addition), smoke_seed restore/delete per W1-01 E5 decision
- Routed to W2-08: BAS-048 un-skip + RCA (e2e), ECT-001/010 verdict-dependent rewrite (post-W2-06 verdict)
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 7 (partial — local-office group + smoke seed decision) of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: Live-verify ECT TC-001/010 + HIS TC-002 (42-column count) for shady-pass classification.
**Skills**: /execute, /regression-guard, /bugfix
**Identity**: BUILDER + HEALER
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: no `.fixme` stubs added to specs; SP06 has no stubs to MUTATE. Drift Check "SP00 awareness" subsection (per-prefix LOS stub routing + SP02-non-partition note) + smoke_seed-independence note + Step 1a "per-spec SP00 stub mutation pass" are no longer applicable and were removed. SP06's actual LOS trio + smoke_seed work is unaffected. Original pre-2026-05-25 SP06 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — per-module rows in §B for: local_office_settings, local_office_history, local_office_ect, smoke_seed
2. `clients/encore/specs_planning/_internal/shady-pass-verdicts-2026-05-20.md` — read ECT, HIS-7, BAS-048, LI-EXTRA verdicts
3. **SUBPLAN_PARITY_02 closure note** — local-office structural split MUST be done before this subplan runs
4. Module MDs (post-SUBPLAN_03), 3 split CSVs (post-SUBPLAN_03 re-export), 3 split specs, 3 split page objects, 3 split selectors
5. `.claude/rules/specs.md` — LR-019, LR-021, LR-022
6. `clients/encore/CLAUDE.md` — LR-036 (boolean render format — HIS table uses Unicode ✔, vs Local Office History uses SVG lucide-check)

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim needs proof. ECT-001/010 silent-revert behavior decided by playwright-cli observation (snapshot + interaction trace). HIS 42-column count verified by actual DOM enum (no `>0` assumption). BAS-068/BAS-048 "implemented" claim requires actual `--grep` PASS line. Smoke-seed origin decision based on Read of worktree mirror file content + git history, not inference. Banned: "I assume", "should be", "probably", "seems to". 2-failure stop → artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any spec/MD/CSV edit:

1. **Confirm SP02 (local-office split) is closed** — read its `/final-q` artifact. If SP02 isn't done, HALT (this subplan depends on the structural split).
2. **Re-Glob** the 3 LOS specs + smoke seed candidate locations.
3. **Re-Grep** for each parent §B claim:
   - LOS BAS-068 still missing from spec + CSV?
   - LOS BAS-048 still `test.skip`?
   - LOS HIS TC-002 still asserts `toBeGreaterThan(0)` for column count?
   - LOS ECT TC-018 still absent from spec?
   - LOS ECT TC-001/010 still implemented despite MD blocked?
   - smoke seed still absent from `clients/encore/specs/smoke/`?
4. **Cross-check SP01's shady-pass-verdicts** for ECT + HIS-7 + BAS-048 rows.
5. **Read activity log** since 2026-05-21 for sessions on `local-office/` specs or `smoke/`.
6. **Emit a Drift Note**. If >30% of scope is stale → HALT and request re-planning.

---

## Scope (IN)

- **local_office_settings**:
  - Add BAS-068 to CSV+spec (MD has it — fix the gap)
  - Un-skip BAS-048 per LR-021; implement OR cite Jira
  - Spec stays in `specs/local-office/local-office-settings.spec.ts`
- **local_office_history**:
  - Audit all 7 spec tests for shady passes (HIS-7 verdict — TC-002's `>0` count vs MD's "exactly 42 columns")
  - Replace bare `>0` with content-based enumeration of all 42 columns
  - Per LR-036: confirm boolean render detection branches correctly per table type
- **local_office_ect**:
  - Implement TC-LOS-ECT-018 (sub-section-headings) in spec
  - Act on ECT verdict for TC-001/010 — if SHADY (codifying silent-revert bug), rewrite + file Jira; if HONEST, document
- **smoke_seed**:
  - Investigate origin (decided in SUBPLAN_PARITY_01 via E5)
  - If real coverage → restore `seed.spec.ts` to `clients/encore/specs/smoke/`
  - If scaffolding → grep + delete every reference (fixture entries, dependencyGate edges, MD mentions, plan references)

## Scope (OUT)

- Local-office structural split (SUBPLAN_PARITY_02 — must precede)
- Easy modules (SUBPLAN_PARITY_04)
- Investigative modules (SUBPLAN_PARITY_05)
- Left-panel new spec (SUBPLAN_PARITY_07)
- CI guardrails (SUBPLAN_PARITY_08)

## Step-by-step

1. **`/regression-guard` snapshot**
2. **local_office_settings**:
   - Read BAS-068 MD section; mirror neighbor TC pattern; add `test('TC-LOS-BAS-068: ...')` to spec
   - Add BAS-068 row to (now-split) `local_office_settings_test_cases.csv` if not auto-emitted from MD via exporter
   - Un-skip BAS-048: run original logic; RCA per LR-024 if fails; implement or file Jira
3. **local_office_history**:
   - HIS-7 (TC-002): replace `expect(count).toBeGreaterThan(0)` with `expect(columns).toEqual([...42 header names from MD])`
   - Walk other 6 tests; check for similar shortcuts; fix each
   - Per LR-036: HIS table uses Unicode ✔ — confirm boolean readers use `textContent.includes('✔')`, not SVG-only detection
4. **local_office_ect**:
   - Implement TC-LOS-ECT-018 (sub-section-headings): read MD intent; author `test('TC-LOS-ECT-018: ...')` with selectors/assertions matching the MD
   - For TC-001/010 per ECT verdict: if SHADY → rewrite assertions; file Jira; tag `// EXPECT-BUG: NM-NNNN`
5. **smoke_seed**:
   - Per E5 decision: either copy `seed.spec.ts` from `.claude/worktrees/loving-allen-408532/clients/encore/tests/specs/smoke/seed.spec.ts` to `clients/encore/specs/smoke/seed.spec.ts` (restoring) — adjust imports for new path structure
   - OR grep `seed.spec.ts` repo-wide + delete references
6. **Per-spec local run**: `npx playwright test --grep "TC-LOS-"` + `--grep "@smoke"` if restored
7. **LOS module run-all**: `npx playwright test clients/encore/specs/local-office/`
8. **CSV sanity check**: `node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/local_office_*.csv` — must exit 0 (newly-added BAS-068 row is the highest-risk for leaks)
8a. **Comment / MD sanity + exhaustive discovery** (per parent §"In-depth quality" + §"Mission: find all + permanent prevention"): scan the 3 LOS specs + smoke seed (if restored) + 3 LOS MDs:
  - **(A)** Run `node clients/encore/scripts/ci/check-comment-sanity.mjs <files>` — catalog catches
  - **(B)** Manual scan beyond catalog — smoke seed (if restored from worktree mirror) is HIGHEST risk for stale agent comments; LOS HIS + ECT specs may have audit-era agent narration
  - **(C)** Every new pattern → append to `red-flag-patterns.json` with `{discovered_by_subplan: "SP06", discovered_date}`
  - **(D)** Re-run scripts — confirm catches
  - **(E)** Clean inline
  - **(F)** Re-run — must exit 0
  - **Closure**: report `Catalog growth: +N patterns`.
9. **`/regression-guard` diff**: expect 3 LOS spec edits + 1 smoke seed action (restore or delete refs) + 1 CSV sanity report + 1 comment sanity report

## Verification

- BAS-068 + BAS-048 both have green `test()` in spec (or BAS-048 carries Jira comment)
- LOS HIS TC-002 asserts exact column names (no bare `>0`)
- LOS ECT TC-018 implemented + green
- LOS ECT TC-001/010 either honest spec + MD doc OR Jira-cited
- smoke_seed: either green `tests/specs/smoke/seed.spec.ts` OR zero references in repo
- LR-036 boolean detection correct for both LOS HIS (SVG) and LM HIST (Unicode) tables
- All 3 LOS specs run green individually + together

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP06** — likely mistakes to investigate:
   - Why did ECT-001/010 spec codify the silent-revert bug behavior as expected instead of asserting correct intent? Existing pattern: `feedback_failing_TC_as_bug_evidence_vehicle.md` (deliberate failing TC = upstream bug evidence). Did it apply? If yes, why was Jira not cited? If no, gap in the pattern's reach.
   - Why did LOS HIS TC-002 assert `toBeGreaterThan(0)` instead of exact 42 columns? Existing rule: LR-022 ("No hardcoded structural counts in assertions") — but this rule is the OPPOSITE direction. The actual gap: no rule that says "when MD declares an exact count, spec must enumerate it". Likely new LR-NNN needed.
   - Why did LOS BAS-068 + BAS-048 go untracked (MD has BAS-068, spec doesn't; BAS-048 skipped without Jira)? Existing rules: ALL-071 (spec-MD parity) + LR-031 (skip requires investigation). Why didn't either fire? Structural escalation likely.
   - Why did smoke_seed end up only in worktree mirror? Restructure-era loss. Existing rule: LR-050 (restructure plans must enumerate stale-slop IN-SCOPE). Did it fire on the 2026-05-19 restructure plan? If yes, why was smoke seed missed? If no, sharpen trigger.

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md.

3. **Decision**: HIS-2 hardcoded-count direction is likely net-new → add LR-NNN inverse to LR-022 ("when MD declares exact count, enumerate it"). Other reflection-seed mistakes likely have existing learnings → structural escalations only.

4. **Emit Reflection table** in `/final-q`:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep similarity; >70% → rollback + structural escalation.

Closure-gate rejects if Reflection table missing, near-duplicate added, or mistake mapped to "more reading" actions.

## Closure

- LR-028 activity log
- LR-050 cleanup roster (smoke_seed grep findings)
- `/final-q` GREEN
