---
description: Plan closure discipline — Status DONE is machine-gated via C1-C5 validation checks
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

Five checks (C1–C5). C1 OVERRIDABLE per token-per-plan via file.
C2/C3/C4/C5 NOT OVERRIDABLE — remediate.

Supreme principle: An override cannot convert missing evidence
into evidence (feedback_override_cannot_convert_missing_to_evidence.md).

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
