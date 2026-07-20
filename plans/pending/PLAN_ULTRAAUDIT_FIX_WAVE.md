# PLAN_ULTRAAUDIT_FIX_WAVE.md
**Status**: Pending
**Priority**: HIGH
**PermissionMode**: default
**Date**: 2026-07-18
**Owner**: OWNER
**Source**: PLAN_COPILOT_INTEGRATION_ULTRAAUDIT Phase 5 + plans/pending/_ULTRAAUDIT_FINDINGS.md (316 findings)

---

## Objective

Apply every actionable finding from the UltraAudit (Phases 1–3, 316 total findings). NOTHING in categories C or D executes without per-item Rutvik GO. Category A/B proceeds with council green + efficacy-floor battery proof.

---

## Execution Prerequisite (baked 2026-07-19, Rutvik-directed — do this BEFORE any fix)

This plan is PARKED and its findings are INCOMPLETE-BY-CONSTRUCTION: they came from a **model-guessed denominator (~197 files)** — the same blind spot the later whole-repo slop sweep exposed and fixed. Do NOT start fixing on the assumption this list is complete. Before executing ANY fix here, a future (rested) session does two things IN ORDER:

1. **Re-run the bug hunt over the FULL machine denominator.** Scope = the machine roster the slop sweep built (`.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md` — `git ls-files` + on-disk walk, 1,853 in-scope entries), NOT the old 197-file manifest. Cross-provider council (gpt-5.5 + claude-opus-4.6), guilty-until-proven, so harness **correctness** gets the same 100% coverage that file-**existence** already got. Fold any new S0/S1 bugs into the Fix Lots below.
2. **Reconcile against the slop sweep's DELETE-list.** Cross-check every fix here against `plans/pending/_REPO_SLOP_FINDINGS.md`: if a file this plan fixes is on that sweep's DELETE/RELOCATE list (or vice-versa), resolve the conflict before touching it. Never fix-then-delete, never delete-mid-fix.

Only after 1 + 2 do the Fix Lots below run. Coupled with `plans/pending/PLAN_REPO_SLOP_SWEEP.md` → "Execution Order" (STEP 0). If unclear at run time: STOP and re-read — do not improvise.

---

## Fix Lots

### Lot FW-A1 — Docs/Prose Compaction (delegation dir)
**Category A** | **Findings**: P2-LOT02-01..12, P2-LOT05-01..07, P2-LOT05-09..11, P2-LOT05-12
**Files**: `~/.claude/delegation/` (ASKING_DOCTRINE.md, session-continuity.md, pruning-policy.md, UPLINK_DOCTRINE.md, gap-hunt-checklist.md, interrogation-bank.md, OUTCOMES-FORMAT.md, weakness-map.md, PROTECTED-SPLICE-PROPOSALS-0712.md, dispatcher-lessons.md, registry-block.sh, assistant-fight-gate-DESIGN.md, worker-rules-extract.md)
**Change**: Deduplicate prose, compact preambles, add APPLIED/PENDING status blocks, fix 8→9 duty reference in worker-rules-extract.md
**Verification**: `grep -c 'DRAFT ONLY' PROTECTED-SPLICE-PROPOSALS-0712.md` = 0; `grep '8-duty' worker-rules-extract.md` = 0

### Lot FW-A2 — JSON Config Annotation
**Category A** | **Findings**: P2-LOT04-01..03, P2-LOT04-08..12, P2-LOT04-16, P2-LOT04-18..19, P2-LOT04-22, P2-LOT04-24..25
**Files**: `routing-policy.json`, `model-registry.json`, `config-liveness-registry.json`, `uplink-policy.json`, `scorecard.mjs` (stale-state fields only)
**Change**: Compact repeated evidence strings; rename semantic label fields; hoist identical entries; fix hardcoded 'unknown' timestamps
**Verification**: `node -e "JSON.parse(require('fs').readFileSync('routing-policy.json','utf8'))"` exits 0

### Lot FW-A3 — Plan/Skill Prose Annotations
**Category A** | **Findings**: P1-M09, P1-M11..12, P1-M14..16, P1-M21, P2-06..07, P2-22, P2-15..P2-20, P2-23, P3-13, P25-M05..06, P25-M19, P25-LOT03-01..05
**Files**: `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md`, `plans/done/SUBPLAN_LCD_05_LEARNING_LANES.md`, `plans/done/SUBPLAN_LCD_06_SELF_PRUNING.md`, `~/.claude/delegation/DUTY_STACK.md`, `.claude/skills/ultra-agents/worker-ext.md`, `.claude/skills/audit/SKILL.md`, `.claude/skills/questionnaire/SKILL.md`, `.claude/skills/compile-learnings/SKILL.md`, `.claude/skills/planning/SKILL.md`, `.claude/skills/assistants/SKILL.md`, `.claude/rules/guardrail-policy.md`, `CLAUDE.md`, `.claude/rules/hooks-identity.md`
**Change**: Supersession notes; fix 8→9 duty; fix auto-call contradictions; fix wrong-rule-home; fix questionnaire limit contradiction; compact redundant sections
**Verification**: `grep -c 'P3 parked' plans/done/SUBPLAN_LCD_05_LEARNING_LANES.md` ≥ 1

### Lot FW-A4 — Navigation/Context Hygiene
**Category A** | **Findings**: P2-LOT13-02, P2-LOT13-19..22, P2-LOT13-24..29, P2-LOT13-32, P2-LOT12-01, P2-LOT12-04
**Files**: `.claude/context/navigation.md`, `.claude/context/patterns.md`, `.claude/identity-gate-config.json`, `.claude/hooks/lib/uplink/redact.mjs`
**Change**: Delete/repath stale references; demote exploration-registry; add maintenance schedule; fix metadata comment; fix stale comment
**Verification**: `grep -c 'AGENT_RULES_ENCORE' .claude/context/navigation.md` = 0

### Lot FW-A5 — Misc Script/Log Annotations
**Category A** | **Findings**: P2-LOT09-02..07, P2-LOT16-07, P2-LOT16-10, P2-LOT17-02, P2-LOT17-04, P2-LOT17-08, P2-LOT18-02, P25-LOT01-01..03, P25-LOT01-06..07, P25-LOT01-11..14, P25-LOT05-02..05
**Files**: `~/.claude/delegation/` logs, `scripts/walk-coverage/critic-prompt.md`, `scripts/ship-branch.sh`, `scripts/xlsx-lint-rules.mjs`, `src/rotation.ts`, `.claude/hooks/` (browsertool-gate.sh, check-browsertool.mjs, test fixtures), `scripts/check-per-test-baseline.mjs`, `scripts/check-doc-script-parity.mjs`, `scripts/check-reload-wait.mjs`
**Change**: Log quality flags; compact headers; comment fixes; docstring compact
**Verification**: Manual spot-check that browsertool-gate.sh HOW-TO-ENABLE section points to CLI_BROWSER_GUIDE.md

### Lot FW-B1 — S1 Gate Logic Bugs (highest priority)
**Category B** | **Findings**: P2-LOT06-24, P2-LOT06-29, P2-LOT06-30, P2-LOT15-04, P2-LOT03-16, P3-12
**Files**: `~/.claude/hooks/check-isolation-perimeter.mjs` (lines 189, 262), `~/.claude/hooks/check-delegation-envelope.mjs` (lines 336-342), `scripts/identity-ownership.mjs` (lines 297-300), `pipeline/verify-run.mjs` (lines 135-137, 433-436), `.claude/hooks/lib/check-browsertool.mjs`
**Change**: Fix `!.length > 0` → `.length === 0`; remove `|| true` from self-test; fix /.claude/ early-return to not disable .claude/rules/** scanning; move HARD_STOP check before OWNER short-circuit; add sha256/cmd= parsing to verifier; fix no_subplan_pointer_allow fixture
**Pre-battery**: LCD_03 (8 checks) + LCD_04 (43 probes) green
**Post-battery**: same floor + fixture run: `node .claude/hooks/lib/check-browsertool.mjs --self-test` 19/19 PASS
**Verification**: `node -e "const {canWrite}=require('./scripts/identity-ownership.mjs'); process.exit(canWrite('.env.local','OWNER')?1:0)"` exits 0

### Lot FW-B2 — S1/S2 Ship/Score/Gate Fixes
**Category B** | **Findings**: P2-LOT17-06, P2-LOT17-07, P2-LOT04-05..07, P2-LOT04-20, P2-LOT04-15, P2-LOT04-21, P2-LOT04-23
**Files**: `scripts/ship-client.ps1` (lines 39-40, 53-55), `~/.claude/delegation/gates-config.json` (G0/G1/G2/G3), `pipeline/scorecard.mjs` (lines 193-194, 114)
**Change**: Add $LASTEXITCODE checks after npm/tar/playwright in ship script; fix G0/G1/G2/G3 sev=S0 mode=announce contradiction; fix VERIFY_OUTPUT→VERIFY_ARTIFACTS in scorecard D12; fix error handling for missing model-costs.json
**Pre-battery**: LCD_04 battery (43 probes) green
**Verification**: `grep 'VERIFY_ARTIFACTS' pipeline/scorecard.mjs` ≥ 1; `grep 'LASTEXITCODE' scripts/ship-client.ps1` ≥ 3

### Lot FW-B3 — Hook Boilerplate Extraction + Dead Code
**Category B** | **Findings**: P2-LOT06-01..22, P2-LOT06-31..32, P2-LOT03-07..08, P2-LOT11-01..08, P2-LOT03-05..06, P2-LOT03-09, P2-LOT03-11..13, P2-LOT03-15, P2-LOT03-17
**Files**: `~/.claude/hooks/` (check-agent-parity, check-closure-debt, check-config-liveness, check-delegation-envelope, check-isolation-perimeter, check-weight-council), `~/.claude/hooks/lib/hook-utils.mjs` (new), `~/.claude/hooks/lib/` (delegation-gate.mjs, ua-worker-guard.mjs, labor-gate.mjs), `~/.claude/hooks/lib/` (parse-verdict.mjs, delegation-nudge.mjs), `.claude/hooks/lib/check-todo-injection.mjs`, `.claude/hooks/lib/check-identity-switch.mjs`, `~/.claude/delegation/chain-state.sh`, `~/.claude/delegation/chain-state.mjs`
**Change**: Delete dead __dirname/REPO_ROOT/resolve; extract emitAllow/emitDeny/failOpen/fireTelemetry/readMode/readStdin to hook-utils.mjs; extract hasPipelineIdentity to hook-lib; PBUG-09 fix in labor-gate; propagate pipeline-detection fix; extract textOf/isInExecuteContext/hasOverrideAuthorization to shared module; move 656-line self-test to test file; delete cs_history_append dead code
**Pre-battery**: LCD_04 (43 probes) green; identity-switch 22/22; jargon 18/18
**Verification**: `npm run check:hooks 2>&1 | tail -5`; all gate self-tests pass

### Lot FW-B4 — Dark Gate Telemetry
**Category B** | **Findings**: P1-M13, P3-01..11, P2-LOT09-08..10, P2-LOT12-05..07
**Files**: All 10 dark gate libs (check-plan-closure, check-todo-injection, check-no-verify, check-graft-ship, check-identity-switch, check-bug-baseline, check-rca-verdict, check-jargon, check-execution-completion + labor-gate), `~/.claude/delegation/labor-gate-audit.log`, `~/.claude/delegation/outcomes.jsonl`, `~/.claude/delegation/grants-audit.log`
**Change**: Add shared fireTelemetry() call to every deny/announce branch in all 10 dark gates; merge delegation-nudge + delegation-primer into single gate; fix log data quality (missing session_id, contradictory metrics, fixture contamination)
**Pre-battery**: LCD_03 (8 checks) + LCD_04 (43 probes) + LCD_05 (35) + LCD_06 (49) green
**Verification**: `grep -c 'fireTelemetry' .claude/hooks/lib/check-plan-closure.mjs` ≥ 1; `cat ~/.claude/delegation/gate-fires.log | tail -3` shows rows after test fire

### Lot FW-B5 — Script Dead Code + Logic Fixes
**Category B** | **Findings**: P2-LOT11-09..10, P2-LOT12-02..03, P2-LOT12-09..10, P2-LOT13-09..18, P2-LOT13-21, P2-LOT13-23, P2-LOT15-01, P2-LOT15-05, P2-LOT16-01..06, P2-LOT16-08..09, P2-LOT18-01, P2-LOT18-03..04, P2-LOT18-05, P2-LOT18-07..08, P25-M01..03, P25-M09..11, P25-M12..14, P25-M15..18, P25-M20, P25-LOT03-04..06, P25-LOT05-01, P25-LOT05-06
**Files**: `scripts/` (identity-ownership, verify-no-stale-live-refs, ticket-doctrine-from-scope, prune-check, check-dead-exports, check-per-test-baseline, check-save-route-parity, check-save-honesty, check-step-labels, check-spec-sleeps, check-swallowed-failures, check-unfailable-assertions, plans-reindex, validate-plan-closure, xlsx-lint-rules, lib/git-staged.mjs new, lib/hook-utils.mjs), `src/index.ts`, `src/rotation.ts`, `tsconfig.json`, `.gitignore`, `.claude/hooks/lib/check-plan-closure.mjs`, `.claude/hooks/lib/check-md-first.mjs`, `relevant-injection.sh`, `.claude/agents/*.md`, `AGENT_SHARED_RULES.md`, `.claude/closure-config.json`, `.claude/rules/guardrail-policy.md`, `.claude/rules/specs.md`, `scripts/lib/forbidden-patterns.mjs`
**Change**: Fix override-approval ordering; centralize LR-043; BASH_SOURCE path; safeLoadTranscript merge; normPath extraction; agent block merges to AGENT_SHARED_RULES.md; announce-gap fix; .claude scan gap in prune-check; OWNER bypass fix; dead test DEFECT-5; parser gap in ticket-doctrine; walk-coverage fixes; tsconfig fix; rotation.ts dedup; .max(20); implicit-parsing guard; lock-path bypass + hook-utils.mjs with gate-label; cwd-root fix; ESM guard; shared walker helpers; delete ASYNC_METHOD_RE/sortPending()/isInFencedCodeBlock/dead-symbols; NUL sentinel; redundant-parse; spec.md + guardrail-policy.md coverage completion; stagedFiles() extract; walk-evidence liveness fix
**Pre-battery**: Full npm run check:scripts + LCD_03/04/05/06 green
**Verification**: `npm run check:tc-parity 2>&1 | tail -3` = 0 gaps; `grep -c 'UNREAD' scripts/validate-plan-closure.mjs` = 0

### Lot FW-B6 — Config/Agent Profile Fixes
**Category B** | **Findings**: P1-M01, P1-M04, P1-M06, P1-M08, P1-M17, P2-01..05, P2-08..12, P2-LOT04-13..14, P2-LOT04-17, P2-LOT04-18, P2-LOT04-19, P2-LOT04-22, P2-LOT05-12, P2-LOT17-01, P2-LOT17-03, P2-LOT17-05, P2-LOT25
**Files**: `.claude/guardrail-config.json`, `~/.copilot/agents/council-worker.agent.md`, `~/.copilot/agents/chief.agent.md`, `~/.copilot/agents/council-reviewer.agent.md`, `pipeline/scorecard.mjs`, `pipeline/copilot-worker.sh`, `~/.claude/delegation/uplink-policy.json`, `scripts/ship-client.ps1`, `scripts/xlsx-lint-rules.mjs`, `scripts/walk-coverage/tdw-probe.mjs`
**Change**: Wire uplink_mode or remove dead knob; add SKIP-as-PASS lint; canonicalize stall dual-source; 8→9 duty in profiles; add EXTERNAL_CONTENT_CONSUMED; remove skill_route_* dead knobs; remove duplicate _stall_guard_comment key; fix VERIFY_OUTPUT in scorecard; add XLSX check to ship-client.ps1; stall_consult string→bool; delete orchestrate/research from WORK_TYPES; fix D9 path; compact report-history rotation; mark bash-parse_verdict superseded
**Pre-battery**: PINJ echo-check on canary dispatch; one real end-to-end council dispatch (ticket → worker → ledger row → report schema)
**Verification**: `node pipeline/scorecard.mjs --self-check 2>&1 | grep PASS`; council worker dispatch returns report with EXTERNAL_CONTENT_CONSUMED field

---

## Efficacy Floor

> Verbatim from PLAN_COPILOT_INTEGRATION_ULTRAAUDIT Phase 5.2

Before ANY category-B/C apply and again after ALL applies, run the full existing regression floor and diff:

- **LCD_03 live-verify** (8 checks)
- **LCD_04 probe battery** (43 probes)
- **LCD_05 battery** (35 probes) + route-sim
- **LCD_06 battery** (49 probes)
- **PINJ echo-check** on a canary dispatch
- **One real end-to-end council dispatch** (ticket → worker → ledger row → report schema)

**Every pre-pass green must be post-pass green.** A single regression = revert that fix, not rationalize it.

One legitimate exception, declared never discovered: a fix that intentionally changes a fingerprinted surface must ship the probe update IN THE SAME reviewed fix lot, named in the reviewer's verdict.

---

## Explicit Exclusions

The following findings were classified KEEP, REFUTED, or non-actionable and are NOT in the fix wave:

| id | reason |
|---|---|
| P1-M07 | REFUTED: worker-primer.md coexistence premise false |
| P1-M10 | REFUTED: UPLINK_WAVE2 gating is intentional |
| P2-LOT10-07, P2-LOT10-08 | KEEP: assistant-state.json and candidates.txt have live callers |
| P2-LOT12-08 | KEEP: defense-in-depth guards are valid |
| P2-LOT15-03 | KEEP-as-archive: completed fightinnovation ring prompts |
| P2-LOT18-06 | KEEP: Authorization: ****** is benign template literal (CEO-confirmed) |
| Phase 4 (76 items) | All WORTH-IT; RESTORE_LIST empty; no reversals needed |

---

## Open Owner Decisions

Items requiring Rutvik input before any action:

1. **C lot routing-policy.json** (P1-M03): Is grant-broker Tier-1 Claude-approvable or Rutvik-only? Blocking PLAN_LAZY_CEO_DELEGATOR grant-broker build.
2. **C lot delegation-gate.mjs.lcd07r2** (P1-M05): 25KB staged unapplied patch. Apply now or park until after this fix wave?
3. **D lot hook bak files** (P2-LOT08-01..07): bak-lcd07 must NOT be deleted (unique v4/v5 content P2-LOT08-03); confirm delete-vs-archive for remaining 6.
4. **D lot agent bak files** (P2-LOT10-01..06): quarantine confirmed; ready to batch-delete on your GO.
5. **D lot delegation-temp/SKILL.md** (P2-21): graduation conditions verified met; delete on your GO.
6. **D lot PLAN_AUDIT_COPILOT.md** (P1-M18, 2816L): TRIM candidate; prune-check run required first; confirm on GO.
7. **Stale ship-plan references** (Phase 4 QUESTIONS_FOR_OWNER): 2 ship plans in plans/pending/ cite deleted verify-vendor-fresh.mjs — update or retire those plans.
8. **Orphaned untracked PNGs**: git-clean nod required to remove.
9. **docker-compose/render/jest vestigials** + **gitignored scratch dirs**: disposition before ship.
10. **9 residual staged pending plans**: confirm which are active vs stale before Phase 7 closure.
