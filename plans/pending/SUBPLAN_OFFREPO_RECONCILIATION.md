**Status**: Pending  
**Priority**: HIGH  
**PermissionMode**: default  
**Model**: claude-opus-4-8  
**Thinking**: xhi  
**Created**: 2026-07-30  
**Owner**: OWNER  
**Parent**: PLAN_REPO_SLOP_SWEEP.md, PLAN_ULTRAAUDIT_FIX_WAVE.md, PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md  
**Source**: Off-repo descope of the tri-plan ultraaudit wave — 95 findings targeting `~/.claude/` and `~/.copilot/`, trees the repo closure gate cannot attest

---

# SUBPLAN_OFFREPO_RECONCILIATION — Off-Repo Findings Transfer (95 items)

## Context

The repo's closure machinery (C1–C6 in `.claude/rules/plan-closure.md`) validates only repo-resident
artifacts. 95 findings from the ultraaudit wave target `~/.claude/` and `~/.copilot/` — trees the gate
cannot see. Leaving them in their parent plans means self-asserted DONE for those items. This plan is the
honest split: a single owner-cadenced plan whose denominator is machine-regenerable, whose evidence lives
inside the repo, and whose deletions require explicit batch approval.

## Bootstrap

- **Identity**: OWNER (all 95 touch the owner's machine)
- **Skills**: `/questionnaire` (per-item approval gates)
- **Context files**: `_TRIPLAN_RECONCILIATION.md`, `.claude/rules/plan-closure.md` (LR-055),
  `.claude/rules/pipeline.md` (LR-048, LR-041), `.claude/state/ua-worker/chips/q123/out-merge-final/OFF-REPO-TRANSFER-MANIFEST.md`

---

## Phase 0 — Dependency Gate

- [ ] This plan is filed BEFORE any of the three parent plans (`PLAN_REPO_SLOP_SWEEP`,
  `PLAN_ULTRAAUDIT_FIX_WAVE`, `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT`) flip Status: DONE.
- [ ] The manifest file exists and its row count = 95 (regenerable via the command in § Regeneration).
- [ ] No browser tool required.

---

## Phase 1 — Security Fast Path (IMMEDIATE, does not wait for plan lifecycle)

**Principle**: a live security control that silently does not work is an incident, not a backlog row.

The following findings are SECURITY-CLASS and execute ahead of all other phases:

| ID | Target | Defect |
|---|---|---|
| P2-LOT06-24 | `~/.claude/hooks/check-isolation-perimeter.mjs:262` | Operator-precedence bug: `!detectLeakMarkers().length > 0` always false — leak scanning is disabled |
| P2-LOT06-29 | `~/.claude/hooks/check-delegation-envelope.mjs:336-342` | Tautological self-test (`||true`) — permanently green |
| P2-LOT06-30 | `~/.claude/hooks/check-isolation-perimeter.mjs:189` | `/.claude/` early-return disables leak scanning for `.claude/rules/**` |
| P3-01 | `~/.claude/hooks/labor-gate.mjs:1` (468L) | Never writes shared `gate-fires.log` — deny branches are dark |
| P3-02 | `~/.claude/hooks/delegation-nudge.mjs:1` + `delegation-primer.mjs:1` | Both soft-channel gates; primer confirmed DARK; merge with fireTelemetry |

**Cadence**: owner applies each fix directly after reviewing the repo-source patch (already landed for
P3-01/P3-02 per batch 5/4). Evidence = probe harness run against the *installed* copy (see § Attestation).

---

## Phase 2 — Code Fixes (owner-cadenced, per-item approval)

Three sub-batches by target tree, presented one at a time for owner GO/SKIP/DEFER:

### 2A — `~/.claude/hooks/` code fixes (LOT06 non-security, 25 items)

| ID | Action summary |
|---|---|
| P2-LOT06-01 | DELETE unused `const __dirname` in check-agent-parity.mjs:34 |
| P2-LOT06-02 | DELETE unused `const __dirname` in check-closure-debt.mjs:35 |
| P2-LOT06-03 | DELETE unused `const __dirname` in check-config-liveness.mjs:27 |
| P2-LOT06-04 | DELETE unused `const __dirname` in check-delegation-envelope.mjs:36 |
| P2-LOT06-05 | DELETE unused `const __dirname` in check-isolation-perimeter.mjs:34 |
| P2-LOT06-06 | DELETE unused `const __dirname` in check-weight-council.mjs:37 |
| P2-LOT06-07 | REMOVE `resolve` from import in check-agent-parity.mjs:32 |
| P2-LOT06-08 | REMOVE `resolve` from import in check-closure-debt.mjs:32 |
| P2-LOT06-09 | REMOVE `resolve` from import in check-config-liveness.mjs:23 |
| P2-LOT06-10 | REMOVE `resolve` from import in check-delegation-envelope.mjs:31 |
| P2-LOT06-11 | REMOVE `resolve` from import in check-isolation-perimeter.mjs:30 |
| P2-LOT06-12 | REMOVE `resolve` from import in check-weight-council.mjs:33 |
| P2-LOT06-13 | DELETE unused `const REPO_ROOT` in check-agent-parity.mjs:37 |
| P2-LOT06-14 | DELETE unused `const REPO_ROOT` in check-closure-debt.mjs:37 |
| P2-LOT06-15 | DELETE unused `const REPO_ROOT` in check-config-liveness.mjs:29 |
| P2-LOT06-16 | DELETE unused `const REPO_ROOT` in check-weight-council.mjs:39 |
| P2-LOT06-17 | MERGE emitAllow/emitDeny/failOpen/fireTelemetry to hook-utils.mjs (agent-parity) |
| P2-LOT06-18 | MERGE same 6 boilerplate functions to hook-utils.mjs (closure-debt) |
| P2-LOT06-19 | MERGE same 6 boilerplate functions to hook-utils.mjs (config-liveness) |
| P2-LOT06-20 | MERGE same 6 boilerplate functions to hook-utils.mjs (delegation-envelope) |
| P2-LOT06-21 | MERGE same 6 boilerplate functions to hook-utils.mjs (isolation-perimeter) |
| P2-LOT06-22 | MERGE same 6 boilerplate functions to hook-utils.mjs (weight-council) |
| P2-LOT06-23 | COMPACT catch-block style in check-config-liveness.mjs:88 |
| P2-LOT06-25 | REWRITE stale comment in check-agent-parity.mjs:57-58 |
| P2-LOT06-31 | ADD Out-File/quoted-path coverage to extractTargetPath in check-config-liveness.mjs:148 |

### 2B — `~/.claude/delegation/` content fixes (LOT02, LOT05, LOT09-02 to -10 — 36 items)

| ID | Action summary |
|---|---|
| P2-01 | Label repo copy as doc-only mirror or remove (guardrail-config vs home bounce) |
| P2-06 | Fix "8-duty cycle" text inside the 9-duty document (DUTY_STACK.md:83-84) |
| P2-13 | MERGE stall_guard keys into live config (bak-lcd04 prerequisite — NOTE: keys confirmed already present; retire pending GO) |
| P2-LOT02-01 | DELETE duplication in ASKING_DOCTRINE.md:30-33 |
| P2-LOT02-02 | COMPACT ASKING_DOCTRINE.md:34-37 to 1-line pointer |
| P2-LOT02-03 | DELETE duplication in session-continuity.md:10-12 |
| P2-LOT02-04 | REWRITE stale BLOCKED notice in session-continuity.md:100-108 |
| P2-LOT02-05 | COMPACT stale count in pruning-policy.md:5 |
| P2-LOT02-06 | COMPACT stale memory count in pruning-policy.md:11 |
| P2-LOT02-07 | COMPACT callout box in UPLINK_DOCTRINE.md:7 |
| P2-LOT02-08 | DELETE tangential detail in UPLINK_DOCTRINE.md:114-115 |
| P2-LOT02-09 | COMPACT prelude in gap-hunt-checklist.md:3-13 |
| P2-LOT02-10 | DELETE third question in interrogation-bank.md:48-50 |
| P2-LOT02-11 | COMPACT duplicate sentence in OUTCOMES-FORMAT.md:3-4 |
| P2-LOT02-12 | COMPACT preamble in weakness-map.md:3-5 |
| P2-LOT05-01 | REWRITE: add STATUS block per splice in PROTECTED-SPLICE-PROPOSALS-0712.md:1-6 |
| P2-LOT05-02 | REWRITE: mark Splice 2 APPLIED in PROTECTED-SPLICE-PROPOSALS-0712.md:76-340 |
| P2-LOT05-03 | REWRITE: Splices 3+4 stale anchors in PROTECTED-SPLICE-PROPOSALS-0712.md:323-580 |
| P2-LOT05-04 | REWRITE: add missing fields in ticket-template.md:1-76 |
| P2-LOT05-05 | COMPACT header in dispatcher-lessons.md:1-18 |
| P2-LOT05-06 | COMPACT to one-liner format in dispatcher-lessons.md:20-25 |
| P2-LOT05-07 | COMPACT canary cost floor in dispatcher-lessons.md:53 |
| P2-LOT05-08 | DELETE wrapper-clear-waiter.sh (zero runtime callers) |
| P2-LOT05-09 | COMPACT stale parenthetical in registry-block.sh:70 |
| P2-LOT05-10 | REWRITE: add Build Status block in assistant-fight-gate-DESIGN.md:1-4 |
| P2-LOT05-11 | REWRITE: resolve default mode conflict in assistant-fight-gate-DESIGN.md:23,63 |
| P2-LOT05-12 | REWRITE: 8-duty → 9 in worker-rules-extract.md:7 |
| P2-LOT09-02 | COMPACT: add rotation policy to grants-audit.log |
| P2-LOT09-03 | FLAG: consider 500-char truncation for labor-gate-audit.log |
| P2-LOT09-04 | FLAG: fix ts:unknown + inconsistent ticket_id in outcomes.jsonl |
| P2-LOT09-05 | FLAG: routing-changes.log is EMPTY; investigate dead writer |
| P2-LOT09-06 | FLAG: mixed JSONL+freetext in self_incidents.log |
| P2-LOT09-07 | FLAG: 4/11 recurring self-work violations in self_incidents.log |
| P2-LOT09-08 | FIX: backfill missing session_id in labor-gate-audit.log:13-14 |
| P2-LOT09-09 | FIX: 17 rows bounced-then-green with bounces:0 in outcomes.jsonl |
| P2-LOT09-10 | FIX: remove fixture/probe contamination in grants-audit.log |

### 2C — `~/.copilot/agents/` updates (11 items)

| ID | Action summary |
|---|---|
| P2-03 | Update 8→9 duties in council-worker.agent.md; add EXTERNAL_CONTENT_CONSUMED |
| P2-04 | Remove inline partial copies in chief.agent.md + worker-ext.md; point to DUTY_STACK.md |
| P2-05 | Remove inline skill-evidence-signatures copy in council-reviewer.agent.md |
| P2-08 | Add EXTERNAL_CONTENT_CONSUMED to chief schema; fix SI-1 |
| P2-09 | Add EXTERNAL_CONTENT_CONSUMED to reviewer completeness check |
| P2-11 | Reconcile registry file authority in council-reviewer.agent.md |
| P2-12 | Fix chief.agent.md claims "9 duties" but numbers 1-8 |
| P2-LOT06-26 | COMPACT Ticket Mode to pointer in council-planner.agent.md:23-36 |
| P2-LOT06-27 | EXTRACT Lessons+PINJ-VERIFY spec from council-verifier.agent.md to gate lib |
| P2-LOT06-28 | EXTRACT pseudo-code spec to check-doctrine-echo.mjs from verifier:52-60 |
| P2-LOT06-32 | DELETE/align sub-agent rule conflict (planner:3 vs verifier:never) |

### 2D — Other off-repo paths (4 items)

| ID | Action summary |
|---|---|
| P2-LOT09-01 | DELETE `~/.claude/delegation/private/gates.sha256.tmp-backup` (byte-identical to live) |
| P2-LOT10-07 | KEEP `~/.claude/delegation/assistant-state.json` (no action; tracked for denominator) |
| P2-LOT10-08 | KEEP `~/.claude/delegation/candidates.txt` (no action; tracked for denominator) |
| P2-LOT10-09 | FLAG `~/.claude/delegation/cli-version.txt` (no live reader; owner decides keep/delete) |

---

## Phase 3 — Backup Deletions (LAST — owner batch-approval required)

**These execute ONLY after ALL Phase 1 + Phase 2 items are dispositioned.** Owner reviews the full list
and approves as a single batch. No autonomous deletion. No archive-move. No staging ahead of approval.

| ID | Target | Pre-delete check |
|---|---|---|
| P2-14 | All `.bak` files in `~/.claude/delegation/` (content confirmed superseded) | sha256-before record |
| P2-LOT08-01 | `~/.claude/hooks/check-delegation-envelope.mjs.bak-cheatproof-20260715` | Verify 413L predates TP-1..5 |
| P2-LOT08-02 | `~/.claude/hooks/delegation-gate.mjs.bak-cheatproof-20260715` | Verify 239L predates v3 R-532 |
| P2-LOT08-03 | `~/.claude/hooks/delegation-gate.mjs.bak-lcd07` | DO NOT DELETE — 338L unique; archive with owner GO |
| P2-LOT08-04 | `~/.claude/hooks/delegation-nudge.mjs.bak-lcd03` | Verify 226L predates lcd04 |
| P2-LOT08-05 | `~/.claude/hooks/delegation-nudge.mjs.bak-lcd04` | Verify 231L; 5-line delta from lcd03 |
| P2-LOT08-06 | `~/.claude/hooks/delegation-primer.mjs.bak-lcd03` | Verify 118L predates D12 sentinel blocks |
| P2-LOT08-07 | `~/.claude/hooks/labor-gate.mjs.bak-cheatproof-20260715` | Verify 130L predates v3 bash-c unwrapping |
| P2-LOT10-01 | `~/.copilot/agents/chief.agent.md.bak-2026-07-14T09-38-29-747Z` | Verify before delete |
| P2-LOT10-02 | `~/.copilot/agents/chief.agent.md.bak-cheatproof-20260715` | Verify before delete |
| P2-LOT10-03 | `~/.copilot/agents/council-planner.agent.md.bak-cheatproof-20260715` | Quarantine pending archive |
| P2-LOT10-04 | `~/.copilot/agents/council-reviewer.agent.md.bak-cheatproof-20260715` | Quarantine pending archive |
| P2-LOT10-05 | `~/.copilot/agents/council-verifier.agent.md.bak-cheatproof-20260715` | Quarantine pending archive |
| P2-LOT10-06 | `~/.copilot/agents/council-worker.agent.md.bak-cheatproof-20260715` | Quarantine pending archive |

**Count**: 14 items (P2-14 is a batch covering multiple delegation `.bak` files; LOT08 = 7; LOT10 = 6).
All placed last per owner instruction.

---

## Phase 4 — Closure

- [ ] All 95 IDs dispositioned (GO/SKIP/DEFER per item, batch-GO for Phase 3 deletions).
- [ ] Attestation evidence committed to repo (see § Attestation Mechanism).
- [ ] Execution Summary written per LR-027.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | Off-repo installed hooks, delegation docs, agent configs, bak files | `.claude/state/ua-worker/chips/q123/out-splitplan/attestation-log.jsonl` | `node .claude/state/ua-worker/chips/q123/gate-probe/probe.mjs ~/.claude/hooks/labor-gate.mjs` exit 0 |
| HUNTER | (none) | (none) | — |
| GIVER | (none) | (none) | — |
| BUILDER | (none) | (none) | — |
| HEALER | (none) | (none) | — |
| WATCHDOG | (none) | (none) | — |
| GARDENER | (none) | (none) | — |

---

## ALL 95 ACCOUNTED

Each of the 95 IDs appears in exactly one phase; the phase counts sum to 95.

**Phase 1 — Security Fast Path: 5 IDs**
P2-LOT06-24, P2-LOT06-29, P2-LOT06-30, P3-01, P3-02

**Phase 2A — Hooks code fixes: 25 IDs**
P2-LOT06-01, P2-LOT06-02, P2-LOT06-03, P2-LOT06-04, P2-LOT06-05, P2-LOT06-06, P2-LOT06-07, P2-LOT06-08, P2-LOT06-09, P2-LOT06-10, P2-LOT06-11, P2-LOT06-12, P2-LOT06-13, P2-LOT06-14, P2-LOT06-15, P2-LOT06-16, P2-LOT06-17, P2-LOT06-18, P2-LOT06-19, P2-LOT06-20, P2-LOT06-21, P2-LOT06-22, P2-LOT06-23, P2-LOT06-25, P2-LOT06-31

**Phase 2B — Delegation content fixes: 36 IDs**
P2-01, P2-06, P2-13, P2-LOT02-01, P2-LOT02-02, P2-LOT02-03, P2-LOT02-04, P2-LOT02-05, P2-LOT02-06, P2-LOT02-07, P2-LOT02-08, P2-LOT02-09, P2-LOT02-10, P2-LOT02-11, P2-LOT02-12, P2-LOT05-01, P2-LOT05-02, P2-LOT05-03, P2-LOT05-04, P2-LOT05-05, P2-LOT05-06, P2-LOT05-07, P2-LOT05-08, P2-LOT05-09, P2-LOT05-10, P2-LOT05-11, P2-LOT05-12, P2-LOT09-02, P2-LOT09-03, P2-LOT09-04, P2-LOT09-05, P2-LOT09-06, P2-LOT09-07, P2-LOT09-08, P2-LOT09-09, P2-LOT09-10

**Phase 2C — Copilot agents updates: 11 IDs**
P2-03, P2-04, P2-05, P2-08, P2-09, P2-11, P2-12, P2-LOT06-26, P2-LOT06-27, P2-LOT06-28, P2-LOT06-32

**Phase 2D — Other off-repo paths: 4 IDs**
P2-LOT09-01, P2-LOT10-07, P2-LOT10-08, P2-LOT10-09

**Phase 3 — Backup deletions: 14 IDs**
P2-14, P2-LOT08-01, P2-LOT08-02, P2-LOT08-03, P2-LOT08-04, P2-LOT08-05, P2-LOT08-06, P2-LOT08-07, P2-LOT10-01, P2-LOT10-02, P2-LOT10-03, P2-LOT10-04, P2-LOT10-05, P2-LOT10-06

**Sum: 5 + 25 + 36 + 11 + 4 + 14 = 95.**

### Regeneration

The denominator is the manifest itself, which was machine-produced by the dispatcher from emitted rows
across JOIN260 + JOIN-A + JOIN-B reports. To regenerate:

```bash
# Count findings in the manifest (expected: 95 data rows starting with "| P")
grep -c '^| P' .claude/state/ua-worker/chips/q123/out-merge-final/OFF-REPO-TRANSFER-MANIFEST.md
```

The manifest is NOT a hand-copied list — it was computed from classification rows in the three source
reports. A future executor can re-derive it by running the same grep/join against `out-recon2/`,
`out-rh-E/`, and `_ULTRAAUDIT_FINDINGS.md` P2/P3 sections.

---

## FOUR CONDITIONS

### Condition 1 — All 95 transfer by ID, zero silently dropped

Every finding in `OFF-REPO-TRANSFER-MANIFEST.md` appears in exactly one phase of this plan (see
§ ALL 95 ACCOUNTED). The plan's denominator IS the manifest file — the same regenerable artifact, not a
hand-copied list. At closure, verify: `grep -c '^| P' <manifest>` must equal the count of IDs
dispositioned in the Execution Summary.

### Condition 2 — Filed in the same motion as the descope

This plan MUST be filed to `plans/pending/SUBPLAN_OFFREPO_RECONCILIATION.md` in the SAME commit (or at
minimum the same PR/push) that adds the descope annotations to the three parent plans. No parent may flip
Status: DONE until this plan exists in `plans/pending/`. The filing commit message explicitly states:
"Descope 95 off-repo findings to SUBPLAN_OFFREPO_RECONCILIATION per Fable Q2."

### Condition 3 — Parent closure text names and links the split

Each of the three parent plans receives the following annotation in its body (at the appropriate section —
typically near the off-repo findings or open-items list):

> **PLAN_REPO_SLOP_SWEEP.md**:
> ```
> ### Off-Repo Descope (2026-07-30, Fable Q2)
> 95 findings targeting `~/.claude/` and `~/.copilot/` transferred to
> [SUBPLAN_OFFREPO_RECONCILIATION.md](../pending/SUBPLAN_OFFREPO_RECONCILIATION.md) —
> verification domain split per Fable ruling (repo closure gate cannot attest off-repo state).
> Manifest: `.claude/state/ua-worker/chips/q123/out-merge-final/OFF-REPO-TRANSFER-MANIFEST.md`.
> ```

> **PLAN_ULTRAAUDIT_FIX_WAVE.md**:
> ```
> ### Off-Repo Descope (2026-07-30, Fable Q2)
> 95 findings targeting `~/.claude/` and `~/.copilot/` transferred to
> [SUBPLAN_OFFREPO_RECONCILIATION.md](../pending/SUBPLAN_OFFREPO_RECONCILIATION.md) —
> verification domain split per Fable ruling (repo closure gate cannot attest off-repo state).
> Manifest: `.claude/state/ua-worker/chips/q123/out-merge-final/OFF-REPO-TRANSFER-MANIFEST.md`.
> ```

> **PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md**:
> ```
> ### Off-Repo Descope (2026-07-30, Fable Q2)
> 95 findings targeting `~/.claude/` and `~/.copilot/` transferred to
> [SUBPLAN_OFFREPO_RECONCILIATION.md](../pending/SUBPLAN_OFFREPO_RECONCILIATION.md) —
> verification domain split per Fable ruling (repo closure gate cannot attest off-repo state).
> Manifest: `.claude/state/ua-worker/chips/q123/out-merge-final/OFF-REPO-TRANSFER-MANIFEST.md`.
> ```

### Condition 4 — Owner-cadence (no rubber-stamping, no stall)

Design against both failure modes:

1. **Anti-rubber-stamp**: items are presented in small batches (Phase 1 = 5 security items; Phase 2A–D =
   sub-batches of 10–25). Each batch requires explicit owner GO before the next is applied. The owner
   reviews the diff for each item *on their machine* before it lands.

2. **Anti-stall**: the plan is structured so each phase is independently completable. If the owner stalls
   on Phase 2B, Phase 2A items that already have GO can close. Progress is recorded per-item in the
   attestation log (see § Attestation). A 14-day inactivity trigger surfaces a reminder. Items with
   owner DEFER are honestly marked, not silently dropped.

---

## PARENT CLOSURE TEXT

(See Condition 3 above for the exact wording. Each parent receives an identical block differing only in
the parent plan filename in the heading context. The text is designed to be grep-verifiable by the C4
parent-cascade sub-check: the child filename `SUBPLAN_OFFREPO_RECONCILIATION.md` appears with a `DONE`
token within 7 lines when this plan eventually closes.)

---

## ATTESTATION MECHANISM

### The problem

The repo's closure gate (C3) checks that cited artifact paths exist on disk — but only INSIDE the repo.
A change to `~/.claude/hooks/labor-gate.mjs` leaves no repo-visible trace. Self-assertion ("I edited the
file") is exactly the false-green class this plan exists to prevent.

### The mechanism — checked-in probe harnesses driven against installed files

**Reference case**: `.claude/state/ua-worker/chips/q123/gate-probe/probe.mjs` — a Node script that feeds
crafted payloads to `~/.claude/hooks/labor-gate.mjs` and asserts expected verdicts. It produces a
machine-readable pass/fail count. The *repo* owns the probe; the *installed file* is the subject under
test. A passing probe against the installed copy is evidence that the fix actually landed.

**Generalized protocol** (applies to all 95 items):

1. **For executable targets** (hooks `.mjs` files): a probe harness lives in the repo at
   `.claude/state/ua-worker/chips/q123/probes/<finding-id>/probe.mjs`. It exercises the specific behavior
   the finding addresses. Running it against the installed copy produces a deterministic pass/fail.

2. **For content targets** (markdown/JSON/log files in `~/.claude/delegation/` or `~/.copilot/agents/`):
   a sha256 snapshot is taken BEFORE and AFTER the edit. Both hashes are recorded in a repo-committed
   attestation log at `.claude/state/ua-worker/chips/q123/out-splitplan/attestation-log.jsonl`:
   ```json
   {"id":"P2-LOT02-01","target":"~/.claude/delegation/ASKING_DOCTRINE.md","sha256_before":"abc...","sha256_after":"def...","timestamp":"2026-08-01T10:00:00Z","verdict":"applied"}
   ```
   The AFTER hash is independently reproducible: `Get-FileHash <path> -Algorithm SHA256`.

3. **For deletions** (Phase 3 `.bak` files): sha256 of the file BEFORE deletion is recorded. Post-
   deletion, `Test-Path <target>` returns False. Both are recorded in the attestation log.

4. **Closure gate integration**: at plan closure, the validator checks:
   - `attestation-log.jsonl` exists and has exactly N entries where N = count of GO-dispositioned items.
   - For executable probes: re-run yields exit 0.
   - For content changes: `sha256_after` matches current `Get-FileHash` of the target.
   - For deletions: `Test-Path` returns False.

### Weakest link (named honestly)

**The sha256 snapshot for content targets is self-reported by the executor.** Nothing prevents recording
a hash without actually making the change (write the log entry, skip the edit). The only defense is:

- The probe harnesses for executables are INDEPENDENTLY re-runnable by a verifier.
- For content targets, the verifier can re-hash and compare — but they must do so IMMEDIATELY after the
  executor claims completion (before any subsequent edit overwrites the expected state).

**A determined executor can defeat the content attestation by editing the file to match the log.** This
is the fundamental limit of any off-repo attestation that doesn't involve a third-party witness or
cryptographic timestamping. The mechanism is "at least as strong as the gate-probe reference case"
(ticket requirement) but not stronger. I trust it for the probe-harness class (executables) but
acknowledge it is honor-system for the content-edit class.

---

## DELETION SEQUENCING

All ~20 `.bak` items (P2-14 batch + P2-LOT08-01 through -07 + P2-LOT10-01 through -06) are placed in
**Phase 3**, which executes ONLY AFTER all Phase 1 + Phase 2 items are dispositioned. Phase 3 requires:

1. Owner reviews the full deletion list in one batch.
2. Owner issues a single explicit GO (or itemized SKIP for individual files like P2-LOT08-03 which
   carries a DO-NOT-DELETE ruling with unique content).
3. No file is deleted until that batch GO is received.
4. No archive-move is performed without explicit owner instruction.
5. No staging of deletions ahead of the batch approval point.

This satisfies the owner's instruction: "keep real deletes for the very end of the whole effort, approved
together."

---

## SECURITY FAST PATH

Phase 1 items (5 findings) are SECURITY-CLASS: they describe live controls that silently do not work.
Per Fable's carve-out, these do NOT wait for plan lifecycle — they execute immediately upon plan filing,
ahead of all other phases. The repo-source patches for P3-01 and P3-02 are already landed (batch 4/5 per
`_TRIPLAN_RECONCILIATION.md`); what remains is installing the fixed copies to `~/.claude/hooks/`.

For P2-LOT06-24, -29, -30: the repo-source fixes are authored as part of this plan's Phase 1 execution,
reviewed by the owner, and installed in the same session. Evidence = probe harness pass against installed
copy.

---

## STRUCTURE COMPLIANCE

| LR-048 section | Present | Notes |
|---|---|---|
| Title + Frontmatter | ✅ | Status/Priority/Created/Identity/Parent/Depends/Model/Thinking/PermissionMode |
| Context | ✅ | § Context |
| Bootstrap | ✅ | § Bootstrap |
| Phase 0 (dependency gate) | ✅ | § Phase 0 |
| Phase 0.5b (baseline walk) | ⚠ Omitted | Not applicable: Identity=OWNER, no WATCHDOG/find-bugs/audit/TC-correction scope |
| Phase 1+ (work) | ✅ | Phases 1–4 |
| Per-Identity Satisfaction | ✅ | Matrix with explicit (none) for non-OWNER identities |
| Acceptance criteria | ✅ | Phase 4 closure checklist |
| Handoff | ⚠ Omitted | Single-owner plan; no handoff needed (owner IS the executor) |

**LR-041 compliance**: Model=claude-opus-4-6, Thinking=xhi, PermissionMode=plan. Opus `xhi` is the
default tier for most Opus work. `plan` mode correct because output is a plan (not code).

---

## OBJECTION

The content-target attestation (sha256 before/after for markdown and JSON files) is honor-system. A
determined executor can forge the log by computing the hash of the edited file and writing it to the
attestation log without the edit having been the SPECIFIC edit the finding called for. The file will hash
correctly, but the *semantic correctness* of the change (e.g., "did you actually COMPACT this to 3 lines,
or did you just add a newline to change the hash?") is not machine-verifiable from a hash alone.

For the ~60 content-edit items, the mechanism proves "the file changed" but not "the file changed in the
way the finding specified." Only a human reviewer reading the diff can verify that. This is weaker than
the probe-harness mechanism (which asserts behavioral correctness), but I cannot design a machine-
checkable semantic test for every prose-edit finding without authoring 60 bespoke validators — which
would cost more than the edits themselves.

**If this weakness is unacceptable**, the alternative is: every content edit is reviewed by the owner in
a side-by-side diff before the attestation-log entry is written. That makes the owner the witness,
which is honest but slow. I recommend this alternative for the plan as filed — it aligns with the
owner-cadence (Condition 4) anyway.

---

## ASSUMPTIONS-MADE

1. The three parent plans are `PLAN_REPO_SLOP_SWEEP.md`, `PLAN_ULTRAAUDIT_FIX_WAVE.md`, and
   `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md` — as stated in `_TRIPLAN_RECONCILIATION.md` line 4.
2. P2-14 ("all other .bak files in lot07 scope") covers multiple individual files but is counted as 1
   finding-ID per the manifest. Its constituent files are enumerated in Phase 3.
3. The `attestation-log.jsonl` path is acceptable inside the existing `out-splitplan/` state directory.
4. The gate-probe pattern (`probe.mjs` + `cases.json`) is the owner's approved reference for executable
   attestation — this is inferred from its use in `_TRIPLAN_RECONCILIATION.md` and the dispatcher's
   verified live-fire test.
5. "Filed in the same motion" (Condition 2) means same git commit or same push, not necessarily same
   filesystem write instant.
6. The v1 phase *tables* were authoritative over the v1 *tally text* — i.e., P2-LOT09-01 belongs in
   Phase 2D (where its table row sits) not Phase 2B (where the tally text incorrectly claimed it via
   range shorthand). This is the natural reading: the table is the specification, the tally is the summary.
