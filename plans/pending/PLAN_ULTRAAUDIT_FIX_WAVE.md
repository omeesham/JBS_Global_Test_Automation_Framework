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

## ⚠ TRI-PLAN MUTUAL GATE — welded to ULTRAAUDIT + SLOP_SWEEP (2026-07-20, Rutvik-directed)

These three plans are ONE gated unit — running any ONE obligates the other two: `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT` ⇄ `PLAN_ULTRAAUDIT_FIX_WAVE` (this) ⇄ `PLAN_REPO_SLOP_SWEEP`. The shared re-hunt (full **1,853** machine denominator) + fix-list ⇄ delete-list reconciliation described below is performed **ONCE and shared** across all three — whoever runs first performs it; the other two CONSUME the artifact, they do not repeat it. **Shared artifact path**: plans/pending/_TRIPLAN_RECONCILIATION.md — produced once by whichever plan runs first; the other two consume it and do not regenerate it. Required sections: collision matrix, staged-artifact register, folded-in new S0/S1 findings. None of the three's harness fix/delete/apply work proceeds until it is complete. The ULTRAAUDIT parent now also carries this gate (its `_ULTRAAUDIT_MANIFEST.md` ~197-file denominator is SUPERSEDED by the 1,853 roster). The mechanics for this plan are the Execution Prerequisite immediately below.

---

## Execution Prerequisite (baked 2026-07-19, Rutvik-directed — do this BEFORE any fix)

This plan is PARKED and its findings are INCOMPLETE-BY-CONSTRUCTION: they came from a **model-guessed denominator (~197 files)** — the same blind spot the later whole-repo slop sweep exposed and fixed. Do NOT start fixing on the assumption this list is complete. Before executing ANY fix here, a future (rested) session does two things IN ORDER:

1. **Re-run the bug hunt over the FULL machine denominator.** Scope = the machine roster the slop sweep built (`.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md` — `git ls-files` + on-disk walk, 1,853 in-scope entries), NOT the old 197-file manifest. **Staleness note (2026-07-30)**: this roster was enumerated 2026-07-18. The file is 1,937 total lines / 1,901 non-blank — the 1,901 figure is a NON-BLANK count and must not be used as a line offset (doing so silently drops the final ~36 rows, including website/frontend entries such as website/frontend/src/data/jiraconfig.txt). Commits have landed since enumeration. Re-run the enumerator and diff against this roster before certifying any sweep complete. Cross-provider council (gpt-5.5 + claude-opus-4.6), guilty-until-proven, so harness **correctness** gets the same 100% coverage that file-**existence** already got. Fold any new S0/S1 bugs into the Fix Lots below.
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
**Files**: `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md`, `plans/done/SUBPLAN_LCD_05_LEARNING_LANES.md`, `plans/done/SUBPLAN_LCD_06_SELF_PRUNING.md`, (off-repo) ~/.claude/delegation/DUTY_STACK.md, `.claude/skills/ultra-agents/worker-ext.md`, `.claude/skills/audit/SKILL.md`, `.claude/skills/questionnaire/SKILL.md`, `.claude/skills/compile-learnings/SKILL.md`, `.claude/skills/planning/SKILL.md`, `.claude/skills/assistants/SKILL.md`, `.claude/rules/guardrail-policy.md`, `CLAUDE.md`, `.claude/rules/hooks-identity.md`
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
**Files**: `scripts/ship-client.ps1` (lines 39-40, 53-55), (off-repo) ~/a delegation-era scratch file (removed — never tracked) (G0/G1/G2/G3), (off-repo) ~/.claude/delegation/scorecard.mjs (lines 193-194, 114)
**Change**: Add $LASTEXITCODE checks after npm/tar/playwright in ship script; fix G0/G1/G2/G3 sev=S0 mode=announce contradiction; fix VERIFY_OUTPUT→VERIFY_ARTIFACTS in scorecard D12; fix error handling for missing model-costs.json
**Pre-battery**: LCD_04 battery (43 probes) green
**Verification**: `grep 'VERIFY_ARTIFACTS' ~/.claude/delegation/scorecard.mjs` ≥ 1 (off-repo); `grep 'LASTEXITCODE' scripts/ship-client.ps1` ≥ 3

### Lot FW-B3 — Hook Boilerplate Extraction + Dead Code
**Category B** | **Findings**: P2-LOT06-01..22, P2-LOT06-31..32, P2-LOT03-07..08, P2-LOT11-01..08, P2-LOT03-05..06, P2-LOT03-09, P2-LOT03-11..13, P2-LOT03-15, P2-LOT03-17
**Files**: `~/.claude/hooks/` (check-agent-parity, check-closure-debt, check-config-liveness, check-delegation-envelope, check-isolation-perimeter, check-weight-council), `~/.claude/hooks/lib/hook-utils.mjs` (new), `~/.claude/hooks/delegation-gate.mjs`, `~/.claude/hooks/ua-worker-guard.mjs`, `~/.claude/hooks/labor-gate.mjs`, `.claude/hooks/lib/parse-verdict.mjs` (repo path only — not in `~/.claude/hooks/`), `~/.claude/hooks/delegation-nudge.mjs` (path corrected 2026-07-30 — ~/.claude/hooks/lib/ does not exist; verified by directory listing. Do not confuse with the repo path .claude/hooks/lib/, which does exist and is a different location.), `.claude/hooks/lib/check-todo-injection.mjs`, `.claude/hooks/lib/check-identity-switch.mjs`, `~/.claude/delegation/chain-state.sh`, `~/.claude/delegation/chain-state.mjs`
**Change**: Delete dead __dirname/REPO_ROOT/resolve; extract emitAllow/emitDeny/failOpen/fireTelemetry/readMode/readStdin to hook-utils.mjs; extract hasPipelineIdentity to hook-lib; PBUG-09 fix in labor-gate; propagate pipeline-detection fix; extract textOf/isInExecuteContext/hasOverrideAuthorization to shared module; move 656-line self-test to test file; delete cs_history_append dead code
**Pre-battery**: LCD_04 (43 probes) green; identity-switch 22/22; jargon 18/18
**Verification**: `npm run check:hooks 2>&1 | tail -5`; all gate self-tests pass

### Lot FW-B4 — Dark Gate Telemetry
**Category B** | **Findings**: P1-M13, P3-01..11, P2-LOT09-08..10, P2-LOT12-05..07
**Files**: All 10 dark gate libs (check-plan-closure, check-todo-injection, check-no-verify, check-graft-ship, check-identity-switch, check-bug-baseline, check-rca-verdict, check-jargon, check-execution-completion + labor-gate), (off-repo) ~/a delegation-era scratch file (removed — never tracked), (off-repo) ~/.claude/delegation/outcomes.jsonl, (off-repo) ~/a delegation-era scratch file (removed — never tracked)
**Change**: Add shared fireTelemetry() call to every deny/announce branch in all 10 dark gates; merge delegation-nudge + delegation-primer into single gate; fix log data quality (missing session_id, contradictory metrics, fixture contamination)
**Pre-battery**: LCD_03 (8 checks) + LCD_04 (43 probes) + LCD_05 (35) + LCD_06 (49) green
**Verification**: `grep -c 'fireTelemetry' .claude/hooks/lib/check-plan-closure.mjs` ≥ 1; `cat ~/a delegation-era scratch file (removed — never tracked) | tail -3` shows rows after test fire

### Lot FW-B5 — Script Dead Code + Logic Fixes
**Category B** | **Findings**: P2-LOT11-09..10, P2-LOT12-02..03, P2-LOT12-09..10, P2-LOT13-09..18, P2-LOT13-21, P2-LOT13-23, P2-LOT15-01, P2-LOT15-05, P2-LOT16-01..06, P2-LOT16-08..09, P2-LOT18-01, P2-LOT18-03..04, P2-LOT18-05, P2-LOT18-07..08, P25-M01..03, P25-M09..11, P25-M12..14, P25-M15..18, P25-M20, P25-LOT03-04..06, P25-LOT05-01, P25-LOT05-06
**Files**: `scripts/` (identity-ownership, verify-no-stale-live-refs, ticket-doctrine-from-scope, prune-check, check-dead-exports, check-per-test-baseline, check-save-route-parity, check-save-honesty, check-step-labels, check-spec-sleeps, check-swallowed-failures, check-unfailable-assertions, plans-reindex, validate-plan-closure, xlsx-lint-rules, lib/git-staged.mjs new, lib/hook-utils.mjs), `src/index.ts`, `src/rotation.ts`, `tsconfig.json`, `.gitignore`, `.claude/hooks/lib/check-plan-closure.mjs`, `.claude/hooks/lib/check-md-first.mjs`, `relevant-injection.sh`, `.claude/agents/*.md`, `AGENT_SHARED_RULES.md`, `.claude/closure-config.json`, `.claude/rules/guardrail-policy.md`, `.claude/rules/specs.md`, `scripts/lib/forbidden-patterns.mjs`
**Change**: Fix override-approval ordering; centralize LR-043; BASH_SOURCE path; safeLoadTranscript merge; normPath extraction; agent block merges to AGENT_SHARED_RULES.md; announce-gap fix; .claude scan gap in prune-check; OWNER bypass fix; dead test DEFECT-5; parser gap in ticket-doctrine; walk-coverage fixes; tsconfig fix; rotation.ts dedup; .max(20); implicit-parsing guard; lock-path bypass + hook-utils.mjs with gate-label; cwd-root fix; ESM guard; shared walker helpers; delete ASYNC_METHOD_RE/sortPending()/isInFencedCodeBlock/dead-symbols; NUL sentinel; redundant-parse; spec.md + guardrail-policy.md coverage completion; stagedFiles() extract; walk-evidence liveness fix
**Pre-battery**: Full npm run check:scripts + LCD_03/04/05/06 green
**Verification**: `npm run check:tc-parity 2>&1 | tail -3` = 0 gaps; `grep -c 'UNREAD' scripts/validate-plan-closure.mjs` = 0

### Lot FW-B6 — Config/Agent Profile Fixes
**Category B** | **Findings**: P1-M01, P1-M04, P1-M06, P1-M08, P1-M17, P2-01..05, P2-08..12, P2-LOT04-13..14, P2-LOT04-17, P2-LOT04-18, P2-LOT04-19, P2-LOT04-22, P2-LOT05-12, P2-LOT17-01, P2-LOT17-03, P2-LOT17-05, P2-LOT25
**Files**: `.claude/guardrail-config.json`, (off-repo) ~/.copilot/agents/council-worker.agent.md, (off-repo) ~/.copilot/agents/chief.agent.md, (off-repo) ~/.copilot/agents/council-reviewer.agent.md, (off-repo) ~/.claude/delegation/scorecard.mjs, `pipeline/copilot-worker.sh`, (off-repo) ~/.claude/delegation/uplink-policy.json, `scripts/ship-client.ps1`, `scripts/xlsx-lint-rules.mjs`, `scripts/walk-coverage/tdw-probe.mjs` (worker utility, not a gate)
**Change**: Wire uplink_mode or remove dead knob; add SKIP-as-PASS lint; canonicalize stall dual-source; 8→9 duty in profiles; add EXTERNAL_CONTENT_CONSUMED; remove skill_route_* dead knobs; remove duplicate _stall_guard_comment key; fix VERIFY_OUTPUT in scorecard; add XLSX check to ship-client.ps1; stall_consult string→bool; delete orchestrate/research from WORK_TYPES; fix D9 path; compact report-history rotation; mark bash-parse_verdict superseded
**Pre-battery**: PINJ echo-check on canary dispatch; one real end-to-end council dispatch (ticket → worker → ledger row → report schema)
**Verification**: `node ~/.claude/delegation/scorecard.mjs --self-check 2>&1 | grep PASS` (off-repo); council worker dispatch returns report with EXTERNAL_CONTENT_CONSUMED field

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
5. **D lot .claude/skills/delegation-temp/SKILL.md** (P2-21): graduation conditions are NOT met. The skill retires at queue item 10 (PLAN_LAZY_CEO_DELEGATOR) subject to its OWNER-LAW-3 absorption gate; the full 12-item queue must be DONE and structural enforcement proven firing live before retirement (§Graduation, .claude/skills/delegation-temp/SKILL.md). Do NOT delete this skill in this wave.
6. **D lot PLAN_AUDIT_COPILOT.md** (P1-M18, 2816L): TRIM candidate; prune-check run required first; confirm on GO.
7. **Stale ship-plan references** (Phase 4 QUESTIONS_FOR_OWNER): 2 ship plans in plans/pending/ cite deleted verify-vendor-fresh.mjs — update or retire those plans.
8. **Orphaned untracked PNGs**: git-clean nod required to remove.
9. **docker-compose/render/jest vestigials** + **gitignored scratch dirs**: disposition before ship.
10. **9 residual staged pending plans**: confirm which are active vs stale before Phase 7 closure.

## Inherited doctrine-ledger item (PLAN_UNIQUE_CASE_COVERAGE_FLOOR Phase 4)

- **Rule id `3-3-ramp-discipline-never-straight-to-deny-for-s1`** (`.claude/rules/guardrail-policy.md` §3.3) — adjudicated **UNENFORCED: S1**. Nothing mechanically prevents an S1/S2 gate from landing straight at `deny`; `check-ramp-expiry.mjs` enforces ramp *deadlines* only, never the *initial landing mode*. Needs a check that a newly-added gate mode key starts at `announce`. Recorded by the doctrine ledger (`.claude/doctrine-ledger.json`), which fails until this line exists — a recipient nobody can grep is a phantom handoff (LR-040(b)).

---

### Execution Summary

Execution not yet performed. This plan is explicitly PARKED (see "Execution Prerequisite" — the full machine denominator re-hunt and reconciliation against the slop sweep's DELETE-list must complete first). No fix lots have been applied. The plan awaits completion of the TRI-PLAN reconciliation and Rutvik GO.

---

# EXECUTION ORDER + ONE-SYSTEM SCOPE (added 2026-08-05, Rutvik GO)

**Run order for the tri-plan unit**: this plan runs **2nd** — 1️⃣ `PLAN_REPO_SLOP_SWEEP` first (its § S-0a
regenerates the four-quadrant denominator), then 2️⃣ **this plan** (PREREQ-1's re-hunt consumes that
regenerated denominator — see F-0; it is unsatisfiable against the stale 2026-07-18 roster), then
3️⃣ `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT`. The TRI-PLAN MUTUAL GATE stands — the reconciliation artifact
is produced once, by the sweep, and consumed here.

**ONE SYSTEM (scoping law for every lot and DECIDE below)**: Claude and Copilot are halves of the same
framework. Every fix lot applies across the WHOLE system — the repository, `~/.claude/` (hooks,
delegation control plane, memory), and `~/.copilot/` (agents, config, state) — unless its text names a
narrower scope with a reason. A fix applied repo-side while the running machine copy stays stale (the C-1
labor-gate shape) is a scoping defect, not a done lot.

**Execution mechanics**: at execution start, batch every unfilled `DECIDE:` line through `/questionnaire`
(decision mode). `/regression-guard` fingerprints are taken before the first apply and diffed after the
last (see F-8). Evidence home: the audit artifacts cited below are preserved in-repo at
`plans/pending/_audit-evidence-0805/` — `C:\Users\RutvikKhorasiya\aud\` is scheduled for teardown and must never be
the only copy.

---

# AUDIT FINDINGS TO DISPOSITION (wired 2026-08-05)

**Where this came from**: a two-round council audit of everything the framework touched 2026-07-27 →
2026-08-05. Full report: `plans/pending/_audit-evidence-0805/AUDIT-REPORT-V2.md`. Ledger:
`plans/pending/_audit-evidence-0805/PROGRESS.md`. Re-runnable check:
`plans/pending/_audit-evidence-0805/reaudit2.mjs` (6/6 at wiring time; preserved in-repo before the
`C:\Users\RutvikKhorasiya\aud\` workspace teardown).

**The audit was READ-ONLY by instruction.** Nothing below was fixed. **This plan is where the fixing
happens.** Every block ends in a `DECIDE:` line; fill it, then execute it as a fix lot.

**State at wiring** (council-measured, 17 roster items): DONE-COMMITTED 2 · PARTIAL 5 · NOT-STARTED 6 ·
one item in-repo done / off-repo unverifiable → **about 20–25% done**. Largest remaining chunk: **FW-B5**
(script dead code + logic fixes, ~50 findings, roughly 40% addressed, spanning 20+ files).

---

## F-0 · This plan's own prerequisite is unsatisfiable against the current denominator

PREREQ-1 demands a cross-provider re-hunt over "the full 1,853 denominator". That roster
(`.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md`, generated 2026-07-18) was rebuilt
from scratch on 2026-08-05 and measured against what exists:

- **156,018 files exist** across the repository and the two off-repo roots.
- The roster holds **1,854 rows — 1.2%**, and **zero rows** covering `~/.claude` or `~/.copilot`.
- Of the 1,854, **1,773 are tagged `normal`**; only 81 carry a slop smell, and the action list came from
  the smelly ones.

The council lot judging that `normal` pile found a **12-file dead cluster** every atomic classifier
missed, because the taxonomy had no tag for "part of a system".

**Consequence for this plan**: PREREQ-1 cannot be satisfied by re-hunting the existing roster — a re-hunt
over a 1.2% denominator reproduces the original blind spot. This plan's own gate ("Only after 1 + 2 do the
Fix Lots below run") is therefore blocking, and the block is real rather than procedural.

> **DECIDE — F-0**: redefine PREREQ-1 to run over the regenerated four-quadrant denominator (see
> `PLAN_REPO_SLOP_SWEEP` § S-0), rather than the 2026-07-18 roster?
> `DECIDE: ____`

---

## F-1 · Three wirings are armed to break a fresh clone the moment they are committed

Each is present in the working tree, **absent at HEAD** (`c83b307e`), and points at a target that is
**untracked** — so committing the wiring without the target ships a broken clone:

| the wiring (uncommitted) | the target it calls | target tracked? |
|---|---|---|
| `scripts/ship-client.sh` → `verify-approved-scope` | `scripts/verify-approved-scope.mjs` | no |
| `.claude/settings.json` → client-surface gates (×2) | `.claude/hooks/client-surface-gate.sh` etc. | no |
| `.githooks/pre-commit` → `validate-delivery-manifest` | `scripts/validate-delivery-manifest.mjs` | no |

Consequences if committed as-is: `client:ship` for Encore refuses to run on a fresh clone; the two
registered client-surface gates **fail open silently** instead of enforcing; the pre-commit validator
calls a script that is not there.

This is **latent, not live** — verified with `git show HEAD:<file> | grep -c <wiring>` returning 0 for all
three. An earlier draft of the audit report called it a live break; that was the dispatcher's error, and
the correction is recorded.

> **DECIDE — F-1**: track the three target scripts (and any siblings they need), or revert the three
> wirings? One or the other must happen before these files are committed.
> `DECIDE: ____`

---

## F-2 · Two fixes were applied to one file and never reached their siblings

Mechanically derived by a council lot with a stated sibling rule, then **spot-verified by the dispatcher
against the live files** — both hold.

**F-2a · `maxBuffer` missing (silent pass on files over 1 MiB).** Commits `3de5937` + `29f75dc` added
`maxBuffer: 256 * 1024 * 1024` to `scripts/verify-no-forbidden.mjs`. Three siblings run the same
`execSync('git show …')` pattern without it — on a file over 1 MiB, Node throws ENOBUFS, the catch returns
an empty string, and **the check silently passes**:

- `scripts/check-tc-has-fieldinventory.mjs:266`
- `scripts/walk-coverage/fixtures/freeze-nm2271-inputs.mjs:65` (and `:90`)
- `scripts/validate-activity-log.mjs:463`

**F-2b · `git ls-files` without `-z`.** Commit `ea36866` switched enumeration to NUL-delimited so git
stops C-quoting non-ASCII paths. `scripts/verify-no-stale-live-refs.mjs:141` still splits on newlines — a
tracked path containing a non-ASCII character arrives escaped and fails the read at line 148. The lot also
flagged `scripts/check-recurrence-trial.mjs:52` as technically affected but deliberately did **not**
promote it, since it only takes a basename (missed match, not a crash).

> **DECIDE — F-2**: apply both fixes to all four confirmed siblings, and decide separately on the
> lower-severity `check-recurrence-trial.mjs` case?
> `DECIDE: ____`

---

## F-3 · A rule instructs you to run a command that exits 1

`.claude/rules/hooks-identity.md` orders `parse-verdict --self-test`. That command now fails — verified by
running it. The same shape exists in `check-todo-injection.mjs`. Anyone following the rule as written hits
an error and has no way to know the rule is stale rather than their environment being broken.

> **DECIDE — F-3**: repair the self-test, or update the rule to the command that actually works?
> `DECIDE: ____`

---

## F-4 · Two commit messages assert results with no artifact behind them

Out of 86 in-window commits, 51 were checkable and **39 were TRUE with specifics; zero were false.** Two
are OVERSTATED — both the same shape: a live-run result stated as fact with no artifact on disk to back it.

- `b6d617b` — "865 tests, 169 executions, zero failures"
- `76657aa` — "all seven produce identical output"

Nothing here is wrong in the code. The claim is simply unbacked, and a later reader will treat it as
verified.

> **DECIDE — F-4**: re-run both and attach artifacts, or amend the claims to what the evidence supports?
> `DECIDE: ____`

---

## F-5 · Two scripts are wired by tracked files but are themselves untracked

- `sweep.mjs` — `package.json:135–138` wires **four** npm commands at it; the file is untracked.
- `check-todo-injection.mjs` — its inline self-test was removed and now dispatches to an untracked
  replacement (`package.json:134`).

Same shape as F-1: the wiring ships, the target does not.

> **DECIDE — F-5**: track both scripts, or unwire the npm entries?  `DECIDE: ____`

---

## F-6 · PLAN_59 was pushed with two required checks red

Commit `b6d617b` states it directly: the restructure "had been pushed while two required checks were red,
because neither check was wired to anything." That commit is the repair. It is recorded here so the fix
wave can confirm the repair actually holds rather than trusting the message — see F-4, which is about the
same commit.

> **DECIDE — F-6**: verify the repair with a live run and attach the artifact?  `DECIDE: ____`

---

## F-7 · Two subplans were deliberately left open with nothing to close them

Commit `b6d617b` says it verbatim: *"Left open on purpose: 59A and 59D are not closed —"* because 59A's
regression evidence *"was never captured"* and 59D *"cites a field inventory whose cross-check was never
earned."*

The decision was deliberate and the reasons are on record — that part is fine. **The finding is one step
on**: a deliberate deferral with **no recipient plan, no follow-up commit, and no closure path**, eight
days later at audit time. Nothing owns them. Nothing will surface them again.

This is the shape LR-040(b) exists to prevent: a deferral needs a named recipient that actually exists, or
it evaporates.

> **DECIDE — F-7a**: capture 59A's missing regression evidence, or formally retire the claim it was
> supposed to support?
> `DECIDE: ____`
> **DECIDE — F-7b**: earn 59D's field-inventory cross-check, or drop the citation that depends on it?
> `DECIDE: ____`
> **DECIDE — F-7c**: whichever way both go — give them a recipient that exists, so a future reader can
> find them?
> `DECIDE: ____`

---

## F-8 · After the fixes land, hunt the fixes — one adversarial pass is not enough

House doctrine, proven twice in this audit alone: fixes create holes, and the half-applied-sibling
pattern (F-2) recurred **in real time during the audit** — commit `527159a22` applied the same `-z` fix
to a different file and missed `verify-no-stale-live-refs.mjs:141` again. The Efficacy Floor catches
regressions the batteries already know about; it cannot catch a new hole a fix just opened, and it cannot
catch a pattern-fix that reached one sibling and not the others.

**The lot**: after ALL fix lots apply, run a cross-provider adversarial re-hunt over every changed file —
BOTH halves of the system (repo `scripts/` + `.claude/hooks/` AND `~/.claude/hooks/`,
`~/.claude/delegation/`, `~/.copilot/agents/`) — with a mechanical sibling rule per fix: grep the fixed
defect's pattern across the whole system, list every instance, verify each one, before the wave closes.
`/regression-guard` fingerprints (exports / imports / signatures) taken before the first apply, diffed
after the last.

> **DECIDE — F-8**: adopt the post-apply adversarial re-hunt + mechanical sibling enumeration as this
> wave's closing lot?
> `DECIDE: ____`

---

## F-9 · The enforcement floor itself — two files nobody audits

With no server-side CI (the client removed GitHub Actions), the entire commit/push enforcement floor is
`.githooks/pre-commit` + `.githooks/pre-push` plus the `scripts/` checks they invoke. **Pre-push is the
leak guard** — the layer that stops framework IP shipping into a client deliverable (the 2026-04-30
195-file incident class). Today these two files appear in this plan family only as a verify command
(Lot B3) and one broken wiring (F-1). No lot audits them as a system: do they actually fire, what do
they block, are all their check-script calls alive, does `core.hooksPath` survive a fresh clone.

> **DECIDE — F-9**: audit the two hook files + every check they invoke as a dedicated lot — live-fire
> proven against a violating input per LR-069 (reading hook source is NOT proof), not source-reading?
> `DECIDE: ____`
