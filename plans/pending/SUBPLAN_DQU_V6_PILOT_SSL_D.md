# SUBPLAN_DQU_V6_PILOT_SSL_D — Unlock 6 Fixme'd TCs + Test Runs (Strict LR-046)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-15
**Identity**: OWNER
**Parent**: plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md
**Depends on**: plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A.md (Section B classifications + BUG-001 verdict + preliminary alternate-query observations) + plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_C.md (new TCs in spec)
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: /rca on TC-016 live verification + alternate-query independence probes for TC-018/019/020/021/024 + test-run failure RCA — RCA/closure-gate/multi-rule judgment per LR-041.
**Justification**: strict-line gate at Step 6 (all 6 fixme'd TCs unlocked or APP-bug-blocked-with-Section-C-evidence) + Phase 2 test runs + flake detection = Opus max per LR-041 (RCA / closure gates / multi-rule judgment).

---

## Context

Unlock + Test Runs arm of the v5.1-chunked PLAN_DQU_V6_PILOT_SHARED_SETUP execution. Owns Step 6 + Step 7 of the parent plan.

Strict LR-046 line: **ALL 6 fixme'd TCs unlocked**. Parent plan v5.1 CLOSURE-2 adds per-TC alternate-query independence test for TC-018/019/020/021/024; CLOSURE-4 adds 4-artifact evidence + isolated-grep ruling-out gate. Goal: maximize unlocks; HALT-and-ask when strict line cannot be met.

---

## Phase 0 dependency gate

- **HARD GATE 1**: SP-A `Status: DONE` AND `walk-evidence-shared-setup-2026-05-15.md` Section B complete (6 rows) with isolated-grep verdict + classification + per-class evidence.
- **HARD GATE 2**: SP-C `Status: DONE` AND spec has new TCs added per gaps (Step 5 complete).
- **HARD GATE 3**: `reports/bugs/BUG-LOC-SHR-001.json` has 2026-05-15 verificationLog (from SP-A Step 2.5).
- If any gate fails → HALT, ask user.

---

## Bootstrap

- Parent plan: `plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (v5.1)
- SP-A: `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md`
- SP-C: `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_C.md`
- `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` (Section B + preliminary Section C observations)
- `reports/bugs/BUG-LOC-SHR-001.json` (verificationLog with 2026-05-15 verdict)
- `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` (target — unfixme + flag operations)
- `.claude/rules/specs.md` (LR-024 clean before run)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-034, LR-044, LR-046)
- `.claude/skills/rca/SKILL.md`
- `.claude/skills/bugfix/SKILL.md`
- `.claude/skills/regression-guard/SKILL.md`

---

## Phase 0 — bootstrap ceremonies

1. Identity OWNER confirmed.
2. `/relevant` scan.
3. LR-020: verify SP-A + SP-C done; walk-evidence Section B has 6 rows + isolated-grep verdicts.
4. **First-output (LR-038)**: "Browser tool: Playwright CLI. Reason: TC-016 /rca live verification + alternate-query probes + test-run failure RCA. Unattended."
5. `/regression-guard` pre-snapshot via skill invocation.

## Phase 0.5b — Baseline-first walk

Title doesn't include "audit"; output produces unlocked spec + test runs. Baseline = SP-A's `walk-evidence-shared-setup-2026-05-15.md` Section B (consumed, not re-walked).

---

## Step 6 — Unlock ALL 6 fixme'd TCs (STRICT LR-046 line)

**Process per TC** — driven by SP-A's Section B classification + Section C preliminary observations + parent plan's 4-class table + v5.1 CLOSURE-2 alternate-query rules.

### TC-LOC-SSL-016 (discardAndReturn serial state)

- Read Section B.TC-LOC-SSL-016 classification + evidence.
- If FAIL-FRAMEWORK (isolated-grep PASSED in SP-A) → diagnose framework leak per `/rca`. Apply audit-note #5: TC-016 hint (replace `discardAndReturn()` cleanup in TC-015 with `reloadAndNavigateToSSLTab()` OR strengthen `beforeEach` to force reload) is ADVISORY — verify live before applying. Run TC x2 cycles isolated post-fix.
- If FAIL-APP (4 artifacts at Section B) → file BUG-LOC-SSL-NNN if not already filed in SP-A Step 2.6; keep `test.fixme()` with `OBSTACLE: <bug-id> | walk-evidence-shared-setup-2026-05-15.md:Section B.TC-LOC-SSL-016:line N`.
- If PASS-LIVE → remove `test.fixme()`; run x2 cycles isolated; confirm both green.
- If CHANGED-SYMPTOM → updates already done in SP-A (CLOSURE-4 code-update path); just verify x2 isolated green here.

### TC-LOC-SSL-018 (alternate-query "Chicago")

**v5.1 CLOSURE-2 process** (per parent plan Step 6 per-TC table):
1. Read SP-A Section B.TC-LOC-SSL-018 + preliminary Section C observation (Chicago alternate-query result).
2. **If alternate "Chicago" returns results** (regardless of BUG-001 verdict) → TC is NOT BUG-001-blocked → remove `test.fixme()`; run x2 cycles isolated. Confirm both green.
3. **If alternate "Chicago" also fails identically** → finalize Section C.TC-LOC-SSL-018 in walk-evidence: Miami probe + Chicago probe + both network captures. Only AFTER Section C evidence is filed: annotate `test.fixme()` line with `OBSTACLE: BUG-LOC-SHR-001 | walk-evidence-shared-setup-2026-05-15.md:Section C.TC-LOC-SSL-018:line N`. **Inline comment must cite the Section C entry path, not just the bug ID.**

### TC-LOC-SSL-019 (alternate-query "Boston") — same protocol as TC-018, query=Boston
### TC-LOC-SSL-020 (alternate-query "Dallas") — same protocol, query=Dallas
### TC-LOC-SSL-021 (alternate-query "Denver") — same protocol, query=Denver
### TC-LOC-SSL-024 (alternate-query "Atlanta") — same protocol, query=Atlanta

### v5.1 anti-cascade enforcement (CLOSURE-2)

After processing all 5 cascade candidates: count TCs ending Step 6 with `OBSTACLE: BUG-LOC-SHR-001` annotation **without** their own Section C entry → must be 0. If 1 TC has BUG-001 annotation, it MUST have Section C evidence. If 2+ TCs have BUG-001 annotation, ALL of them MUST have Section C evidence. Absent that, the TCs MUST be unfixme'd and run.

### Strict-line gate

At end of Step 6: count `test.fixme()` for the 6 TCs (TC-016/018/019/020/021/024):
- All 6 in NON-fixme'd state (i.e., unlocked + passing x2) → continue to Step 7.
- Any in `test.fixme()` state → MUST have `OBSTACLE: <bug-id> | walk-evidence:Section [B|C].<TC-id>:line N` annotation citing a 2026-05-15 evidence file path.
- Any in `test.fixme()` state without proper annotation → HALT-and-ask user. Do NOT close subplan. Do NOT use APPEND/SPAWN. (FORBIDDEN LOOPHOLES #1, #5, #6.)

### v5.1 FORBIDDEN LOOPHOLES — explicit fences

The agent MUST NOT (any of these = LR-046 violation; chain audit will catch):
1. Keep fixme'd "because it was fixme'd before" — every TC was re-verified at SP-A Step 2B; classification drives action.
2. Substitute `test.skip` / `test.only(other)` / `if (condition) return` for `test.fixme`.
3. Add new `test.fixme()` to Step 5 TCs (SP-C constraint, restated here).
4. Cite 2026-05-12 verificationLog.
5. Scope-cut to a future subplan silently.
6. Append new step or relax strict-N.
7. Mark COVERED without smoke-pass evidence (SP-A concern).
8. Cite BUG-001 as blocker for 2+ TCs without per-TC Section C.
9. Inflate gap count to trigger HALT (SP-C concern).
10. Classify FAIL-APP without isolated-grep gate + 4 artifacts; HALT on CHANGED-SYMPTOM instead of code-updating.

---

## Step 7 — Run tests x2 + flake check + HIST migration grep

**LR-024 clean-before-run**: clean `test-results/` + `reports/` (artifact dirs only — NOT source code).

**Run 1**:
```bash
npx playwright test clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts --retries=0
```
Failures → `/bugfix` skill (max 2 cycles per TC). Past 2 cycles → `test.fixme('OBSTACLE: <reason>')`. **But if the failing TC is one of the strict-line 6 (TC-016/018/019/020/021/024), HALT-and-ask user instead of fixme'ing.**

**Run 2**: identical command. Any flake (different result from Run 1) → HALT, investigate per /rca.

**HIST migration grep**:
```bash
find clients/encore/tests/specs -name "*hist-*.spec.ts"   # expect 0
find clients/encore/tests/specs -name "*-history.spec.ts" # expect 2
```

---

## Acceptance Criteria

### Strict (LR-046 — inherits from parent v5.1)

- [ ] ⚠ **PARENT-STRICT-LINE (CLOSURE-2)** Count of TCs ending Step 6 with `OBSTACLE: BUG-LOC-SHR-001` annotation **without** their own Section C entry = 0.
- [ ] ⚠ **PARENT-STRICT-LINE** ALL 6 fixme'd TCs in NON-fixme'd state (unfixme'd + passing x2) OR annotated as legitimate APP-bug-blocked with `OBSTACLE: <bug-id> | walk-evidence-shared-setup-2026-05-15.md:Section [B|C].<TC-id>:line N`. Zero exceptions.
- [ ] ⚠ **PARENT-STRICT-LINE (FORBIDDEN LOOPHOLES)** No `test.skip` substitution; no new `test.fixme` on Step 5 TCs; no 2026-05-12 verificationLog citation; no scope-cut silently; no strict-N relaxation.
- [ ] ⚠ **PARENT-STRICT-LINE** Run 1 + Run 2 both pass; zero flakes.
- [ ] ⚠ **PARENT-STRICT-LINE** Every `test.fixme()` remaining has explicit `OBSTACLE: <reason> | <evidence-path>` cite.

### Ceremony (LR-050)

- [ ] Phase 0 context loaded.
- [ ] Identity OWNER confirmed.
- [ ] /relevant scan run.
- [ ] LR-038 announcement in first output.
- [ ] /regression-guard pre + post snapshot via skill invocation.
- [ ] /rca / /bugfix as needed for failures (max 2 cycles per TC).
- [ ] HIST migration grep run + result captured.
- [ ] LR-024 clean-before-run satisfied (test-results/ + reports/ cleaned before Run 1).
- [ ] LR-028 activity-log row.
- [ ] LR-027 SP-D Execution Summary + git mv + parent-cascade check (NO yet — SP-E pending).

### Outputs

- [ ] `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` with 6 fixme'd TCs resolved + 2 green run logs.
- [ ] `walk-evidence-shared-setup-2026-05-15.md` Section C populated with per-TC evidence (if any cascading TCs remain BUG-001-blocked).
- [ ] Run 1 + Run 2 logs at `test-results/`.

---

## Handoff (LR-039)

**GREEN**: all 6 unlocked or properly Section-C-annotated; 2 green runs; zero flakes → SP-D moves to `done/`. Hand off to SP-E (Step 8 sweep + Step 9 closure).

**RED**: any strict-line breach (fixme without Section C/B evidence, BUG-001 cited 2+ times without per-TC Section C, flake on Run 2) → HALT, write blockers in CHAT with concrete file:line evidence + specific TC ID + specific FORBIDDEN-LOOPHOLE rule. Do NOT close subplan. Do NOT flip Status.
