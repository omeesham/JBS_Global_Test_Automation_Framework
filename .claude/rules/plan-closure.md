---
description: Plan closure discipline — Status DONE is machine-gated via C1-C6 validation checks
paths:
  - "plans/**/*.md"
  - ".claude/closure-overrides*.json"
  - ".claude/closure-overrides-authors.txt"
  - ".claude/closure-gate-landed-at.txt"
  - "plans/_closure_manifests/**"
---

# Plan Closure Discipline

## LR-055: Status: DONE is machine-gated — never flip without close-gate PASS

Status: DONE on any plan in plans/{pending,done}/*.md — markdown
form OR YAML frontmatter form — requires validate-plan-closure
PASS or matching .claude/closure-overrides.json entry.

Six checks (C1–C6). C1 OVERRIDABLE per token-per-plan via file.
C2/C3/C4/C5/C6 NOT OVERRIDABLE — remediate.

| Check | What it guards | Overridable |
|---|---|---|
| C1 | Forbidden incompleteness tokens (NOT-WALKED, "not captured", …) | YES (per token-per-plan) |
| C2 | LR-027 Execution Summary skeleton present | NO |
| C3 | Cited artifact paths exist on disk | NO |
| C4 | Phantom/circular handoff + **parent-cascade annotation** (LR-027 extension, pending-parent only) | NO |
| C5 | Strict-line vs deviation axis-match | NO |
| C6 | **Per-Identity Satisfaction Matrix delivery** (LR-048 v3) | NO |

C6 (PLAN_DONE_MEANS_DONE Phase 2.2 — closes the ghost-deliverable loophole):
every matrix row's "Concrete deliverable" cell must be exactly one of —
a repo-relative **file path that exists**, `(skipped: <reason ≥20 chars>)`,
or `(none)`. Multi-deliverable cells may list several paths separated by
`<br>` / newline; each line is validated independently and ALL must pass.
Vague prose ("spot-check log", "typecheck + lint + parity outputs",
"inline claims", "proof of work") is rejected. C6 is **conditional** — plans
with no `## Per-Identity Satisfaction` section skip it silently.

C6 rollout-state knob (`c6_mode = off | announce | deny`) lives in
`.claude/closure-config.json` — a SEPARATE, agent-writable file, deliberately
NOT `.claude/closure-overrides.json` (that is a lock-path the agent cannot
edit, and `c6_mode` is a rollout knob, not a per-token override — keeping them
in different files prevents laundering). `off` → C6 + the C4 parent-cascade
sub-check are not computed (legacy C1–C5 behavior). `announce` → computed +
reported but verdict-neutral (ramp warning). `deny` → folded into the verdict.
`validate-plan-closure.mjs --dry-run` measures C6 without enforcing (exit 0)
for back-audit. Permanent target state = `deny`.

Supreme principle: An override cannot convert missing evidence
into evidence (feedback_override_cannot_convert_missing_to_evidence.md).
C6 honors this — `(skipped: <reason>)` authorizes an HONEST explanation of why
no artifact exists; it cannot be used to claim a deliverable that was never made.

Trigger: every Edit/Write/NotebookEdit/Bash whose
projected post-state writes to a plan file OR to override/schema/
authors files. Enforced by .claude/hooks/plan-closure-gate.sh
(Edit + Bash matchers) + scripts/verify-no-forbidden.mjs
(pre-commit blob) + scripts/validate-plan-layout.mjs (fleet check).

Override mechanism (FILE-ONLY): user edits .claude/closure-overrides.json
adding a new entry; commits (commit author SHOULD be in
.claude/closure-overrides-authors.txt — best-effort attribution
per V2, not cryptographic proof); re-attempts. No chat handshake;
agent has no override request mechanism.

Bootstrap (V4): gate lands in 2 commits — commit-A seeds override
files (hook NOT yet wired), commit-B wires hook + validator + rule.
After commit-B, HEAD contains override file with this plan's
meta_plans[] entry, so plan body can be authorized.

Fail policy (V5): fail-CLOSED for plan-paths and lock-paths (any
validator exception while target is in-scope → DENY). Fail-OPEN
only for unrelated paths. No grace budget. Counter at
.claude/state/closure-fail-closed-counter-*.json for diagnostic.

Authorization surfaces (R5 + V-corrections):
- override file (Edit/Write lock + PowerShell-aware Bash hard-deny + best-effort author attribution + HEAD/staged-blob auth)
- schema file (lock + author attribution)
- authors file (lock + author attribution — best-effort, not crypto)
- landed-at file (lock + author attribution)
- marker exemption (closure_meta: true + meta_plans[] listing — double-keyed per R3)
- manifests (plan_sha256 + validator-version + validator_invocation_id cross-checked against closure-attempts log per V7 — audit evidence not hard proof)
- fail policy (fail-CLOSED for in-scope paths per V5; fail-OPEN only out-of-scope; diagnostic counter)

Optional hardening (NOT required by v4): GPG-signed commits to lock-path files
would convert author attribution from best-effort to cryptographic. Future work.

Graduated from: 2026-05-18 auditor verdict on
plans/done/PLAN_FIX_CLI_HALLUCINATION_AND_SSL_A_BLOCKER.md (v1
covered only the exact failure mode). v2 was rejected with 19
new defects. v3 was rejected with 14 v3-blockers. v4 covers the
broader loophole class including authorization-surface integrity
as a first-class concern and acknowledges crypto-proof limits.

C6 + C4 parent-cascade added 2026-05-28 by PLAN_DONE_MEANS_DONE
(plan-closure delivery-proof gate). Root cause: a WATCHDOG audit of
SUBPLAN_LEGAL_FCC found 8 ghost-deliverable holes where matrix cells
promised vague prose ("spot-check log") and C1–C5 passed because vague
prose is not a forbidden token. C6 makes every matrix cell prove itself
(file exists / honest skip / explicit none). Landed via a measured rollout
(Phase 0.5 back-audit → c6_mode ramp) to bound false-positive blast radius.
