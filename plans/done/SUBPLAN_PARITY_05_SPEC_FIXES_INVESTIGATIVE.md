# SUBPLAN_PARITY_05 — Spec Fixes (Investigative) [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` (MGH + SSL items) + `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` (LI-EXTRA verify only — already done)
**Superseded date**: 2026-05-26
**Reason**: All MGH + SSL items require e2e (un-skip RCA cycles + verdict-dependent rewrites). LI-EXTRA already in MD/CSV/spec per audit — no MD authoring needed.

### Execution Summary (LR-027)

- Tasks: management_history (TC-013/014 verdict + TC-006/007/019 un-skip), shared_setup_locations (6 fixmes un-skip), local_information (LI-EXTRA MD add-back)
- Implemented: 0 (none executed; restructured before run)
- Routed to W2-08: MGH TC-013/014 verdict-driven rewrite, MGH TC-006/007/019 un-skip + RCA, SSL fixmes (current state TC-031/032/007/026/030, all BUG-LOC-SHR-001) un-skip per LR-021
- Routed to W1-04: LI-EXTRA parity verification (no MD authoring — already in repo per audit 2026-05-26)
- Staleness correction: SSL fixmes were originally TC-016/018/019/020/021/024 (6 TCs) per 2026-05-21 snapshot; current state is 5 different TCs all blocked by same bug. W2-08 uses current TC IDs.
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 7 (partial — investigative module group) of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: Live-verify MGH TC-013/014 i18n-key bug state + SSL fixme blocker investigations.
**Skills**: /execute, /regression-guard, /bugfix (file Jira for confirmed bugs), /rca (un-skip investigation)
**Identity**: BUILDER + HEALER (deeper investigation than easy modules)
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: no `.fixme` stubs added to specs; SP05 has no stubs to MUTATE. Drift Check "SP00 awareness" subsection + LI-specific bidirectional-parity note + Step 2a "per-module SP00 stub mutation pass" are no longer applicable and were removed. SP05's actual investigative work (management_history, shared_setup_locations, local_information add-back) is unaffected. Original pre-2026-05-25 SP05 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — per-module rows in §B for: management_history, shared_setup_locations, local_information
2. `clients/encore/specs_planning/_internal/shady-pass-verdicts-2026-05-20.md` — read MGH + SSL + LI-EXTRA verdicts
3. Module MDs (post-SUBPLAN_03), CSVs (post-re-export), specs
4. `.claude/rules/specs.md` — LR-021 (un-skip before rewrite), LR-022 (no hardcoded counts), LR-024 (clean before RCA)
5. `clients/encore/CLAUDE.md` — LR-036 (boolean render formats per table — relevant for management_history)
6. `clients/encore/specs_planning/_internal/agent-mistakes.md` — recent MGH / SSL / LI patterns

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim needs proof. MGH bug-fixed vs bug-present is decided by playwright-cli live observation (snapshot + DOM eval, dated artifact), NOT inference. SSL fixme blocker per TC requires per-TC un-skip + actual run output. LI add-back rows must be authored from spec body Reads, not paraphrase. Banned: "I assume", "should be", "probably", "seems to". 2-failure stop → artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any spec/MD/CSV edit:

1. **Re-Glob** the 3 specs in scope: management_history, shared_setup_locations, local_information.
2. **Re-Grep** for each parent §B claim:
   - management_history TC-006/007/019 still `test.skip`?
   - management_history TC-013/014 still asserts fixed headers (vs raw i18n key)?
   - shared_setup_locations TC-016/018/019/020/021/024 still `test.fixme`?
   - local_information spec still has TC-LOC-LI-064..077 + SKIP-BILLING not in MD/CSV?
3. **Cross-check SP01's shady-pass-verdicts** — confirm MGH + SSL + LI-EXTRA verdicts still applicable.
4. **Cross-check Jira** — have NM-NNNN tickets cited in SP01 been resolved (changing the expect-bug vs expect-fix calculus)?
5. **Read activity log** since 2026-05-21 for sessions on these 3 modules.
6. **Emit a Drift Note** per module. If >30% of scope is stale → HALT and request re-planning.

---

## Scope (IN)

- **management_history**:
  - Act on MGH verdict — if MD/CSV stale (bug fixed) → update MD+CSV; if SHADY → rewrite spec to assert real bug + cite Jira
  - Implement TC-006/007/019 (currently `test.skip`) per LR-021 — un-skip + run original logic first
  - For any TC that remains skipped, MUST carry `// BLOCKED-BY: NM-NNNN` comment
- **shared_setup_locations**:
  - Per-TC investigation of TC-016/018/019/020/021/024 fixmes (per SSL verdict from SUBPLAN_01)
  - Implement those with no blocker; cite Jira for those with real blocker
  - Update MD Status to honest "Automated" once 6/6 implemented OR honest "Partial X/24" if blockers remain
- **local_information**:
  - Add TC-LOC-LI-064..077 + SKIP-BILLING to MD+CSV (LI-EXTRA verdict)
  - Author MD sections matching existing pattern; capture title, steps, expected, data, status, dependencies
  - Re-export CSV (re-run exporter from SUBPLAN_03)
  - Verify spec already covers them (yes — that's why they exist); confirm dependency_gate annotations correct

## Scope (OUT)

- Easy modules (SUBPLAN_PARITY_04)
- Local-office modules (SUBPLAN_PARITY_06)
- Left-panel new spec (SUBPLAN_PARITY_07)
- CI guardrails (SUBPLAN_PARITY_08)

## Step-by-step

1. **`/regression-guard` snapshot**
2. **Read SUBPLAN_01 verdicts** for MGH + SSL + LI-EXTRA rows
3. **management_history**:
   - If MD/CSV stale: edit MD TC-013/014 expected results to match spec's fixed-headers behavior; re-export CSV
   - If SHADY: rewrite spec TC-013/014 assertions to expect raw i18n key / duplicate label (the actual bug); add `// EXPECT-BUG: NM-NNNN` comment
   - Un-skip TC-006/007/019: remove `test.skip`, run original logic, RCA per LR-024 if fails. Implement; if blocked, file Jira + add `// BLOCKED-BY: NM-NNNN`.
4. **shared_setup_locations**:
   - For each of TC-016/018/019/020/021/024:
     - Per LR-021, remove `test.fixme`, run original logic first
     - If passes → keep, sync MD Status to Automated
     - If fails → RCA per LR-024; implement fix OR file Jira
   - Update MD `Total: 24` (was 25); update Status field with honest count
5. **local_information**:
   - For TC-LOC-LI-064..077 (14 TCs) + SKIP-BILLING: read spec test bodies to understand intent
   - Author one MD `## TC-LOC-LI-NNN: <title>` section per spec test — preserve test order, copy intent into MD's Steps + Expected
   - Insert at appropriate position in `locations_local_information_test_cases.md`
   - Update MD header count + automated count
   - Run exporter (SUBPLAN_03's D1) to re-emit CSV
6. **Per-spec local run**: `npx playwright test --grep "TC-LOC-{MGH,SSL,LI}-"`
7. **Module run-all**: `npx playwright test clients/encore/specs/locations/location-{management-history,shared-setup-locations,local-information}.spec.ts`
8. **CSV sanity check**: `node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/locations_{management_history,shared_setup_locations,local_information}_test_cases.csv` — must exit 0 (the new LI rows for 064..077 + SKIP-BILLING are the highest-risk for content leaks — they were authored by Claude reading spec bodies, so verify no internal jargon leaked into MD → CSV)
8a. **Comment / MD sanity + exhaustive discovery** (per parent §"In-depth quality" + §"Mission: find all + permanent prevention"): scan the 3 touched specs + 3 touched MDs:
  - **(A)** Run `node clients/encore/scripts/ci/check-comment-sanity.mjs <files>` — catalog catches
  - **(B)** Manual scan for NOVEL patterns — LI module is especially high-risk (064..077 MD sections were Claude-authored from spec bodies, possible AI-tics leaked in)
  - **(C)** Every new pattern → append to `red-flag-patterns.json` with `{discovered_by_subplan: "SP05", discovered_date}`
  - **(D)** Re-run scripts — confirm catches
  - **(E)** Clean inline
  - **(F)** Re-run — must exit 0
  - **Closure**: report `Catalog growth: +N patterns`.
9. **`/regression-guard` diff**: expect 3 spec edits, 3 MD edits, 3 CSV re-exports, 1 CSV sanity report, 1 comment sanity report

## Verification

- All 3 module specs run green individually + together
- TC-LOC-MGH-006/007/019 either green or carry `// BLOCKED-BY: NM-NNNN`
- TC-LOC-SSL-016/018/019/020/021/024 either green or carry Jira citation
- MD shared_setup_locations Status accurately reflects implementation count
- MD locations_local_information has new sections for 064..077 + SKIP-BILLING (15 new TCs)
- CSV for local_information has matching new rows
- No `test.skip` / `test.fixme` in these 3 specs without Jira comment

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP05** — likely mistakes to investigate:
   - Why did 6 `test.fixme` accumulate in shared_setup_locations without Jira citation? Existing rule: LR-031 ("SKIP requires exhaustive investigation — no lazy escapes"). Did LR-031 fire? If yes, why didn't it block? If no, why didn't its trigger match `test.fixme`? Likely fix: sharpen LR-031 trigger to include `fixme`, add D7 CI check (already scoped to SP08).
   - Why did management_history TC-013/014 spec assertions diverge from MD without a "test adapted" comment? Existing rule: GEN-021 (test-case-wrong → raise it). Did it fire? Structural escalation likely needed.
   - Why did local_information have 14+ spec-only TCs (064–077 + SKIP-BILLING) never propagated to MD/CSV? Existing rule: ALL-071 / COP-009 spec-markdown TC parity. Did either fire? If yes, why did parity drift accumulate? If no, sharpen trigger to catch spec-additions, not just spec-removals.

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md.

3. **Decision**: all three reflection-seed mistakes likely have existing learnings → no new memory rules; structural escalations only (sharper triggers + CI checks D5/D6/D7).

4. **Emit Reflection table** in `/final-q`:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep similarity; >70% → rollback + structural escalation.

Closure-gate rejects if Reflection table missing, near-duplicate added, or mistake mapped to "more reading" actions.

## Closure

- LR-028 activity log
- LR-050 cleanup roster
- `/final-q` GREEN
