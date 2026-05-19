---
title: v6-F Wrapper Fail-CLOSED + Pre-Commit Wired + verify-no-forbidden NB3 + Public NPM Cleanup
Parent: PLAN_CLOSURE_GATE_V6_PARENT.md
Status: PENDING-DRAFT-v6
Priority: P0-EMERGENCY
Created: 2026-05-18
Identity: OWNER
Model: claude-opus-4-7
Thinking: max
PermissionMode: auto
RiskAcknowledged: true
BrowserTool: none
Justification: max — fixes 2 CRITICAL (A2 wrapper fail-open + A4 pre-commit unwired) + B10
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_F_WRAPPER_PRECOMMIT_NPM.md` in a fresh session AFTER v6-E closes GREEN.

## Scope hint (from parent matrix)

- `.claude/hooks/plan-closure-gate.sh` — full rewrite. Wrapper is universally fail-CLOSED. Three failure paths each emit a deny JSON to stdout with reason captured to `.claude/state/hook-failures.log`:
  - Missing mode (argv[1] empty) → deny
  - Missing lib file at lib_path → deny
  - Node validator threw / non-zero exit → deny with stderr captured
- `.claude/settings.json` PreToolUse registration for Edit|Write|NotebookEdit|MultiEdit and Bash matchers (V4 pattern)
- `.githooks/pre-commit` — append BEFORE final `exit 0`:
  - `validate-overrides.mjs --staged` when `.claude/closure-overrides.json` is staged
  - `validate-plan-closure.mjs --staged --enforce` when any `plans/{pending,done}/*.md` is staged
  - `validate-plan-layout.mjs --check` always (read-only)
- `scripts/verify-no-forbidden.mjs` — NB3 fix: closure-gate-aware pending-skip instead of blanket
- `package.json` scripts — full disposition of v5's 9 closure-related npm scripts (was under-specified in prior v6-F scope; enumerated 2026-05-18 to prevent silent drops):

  | v5 npm script | v6-F disposition |
  |---|---|
  | `plans:validate-closure` (single-plan `--plan <file> --enforce`) | KEEP (used by /final-q + /audit + retro; READ-ONLY per V6) |
  | `plans:validate-closure:write-manifest` (`--enforce --write-manifest --plan`) | **REMOVE** (B10 fix — flag stays on validator binary, only invoked by /execute Phase 3.5 directly) |
  | `plans:validate-closure:retro` (`--all --report-only` → writes `.claude/state/closure-audits/_closure_audit_<YYYY-MM-DD>.md`) | KEEP (v5 Phase 7 retroactive scan — Layer 1 row P7-RETRO; was silently absent from prior v6 stubs; reinstated) |
  | `plans:validate-closure:changed` (`--changed --enforce`) | KEEP (used by `pipeline:validate`) |
  | `plans:validate-closure:revalidate-all` (`--all --enforce --rewrite-manifests`) | KEEP (Layer 1 row M1 — v5 Phase 11 migration tool; user-invoked) |
  | `plans:validate-layout` (`--check` READ-ONLY) | KEEP (used by `pipeline:validate`) |
  | `plans:validate-layout:enforce-all` (`--enforce-all` manual) | KEEP (per v5 B5 — manual full-fleet enforcement) |
  | `plans:validate-overrides` (`--staged` for pre-commit; `--all` for manual) | KEEP (V3 staged-blob authority) |
  | `pipeline:validate` (extended chain) | KEEP — must include `npm run plans:validate-overrides && npm run plans:validate-closure:changed && npm run plans:validate-layout` per v5 Phase 6 line 424 |

- `scripts/test-fixtures/plan-closure/verify-wrapper-fail-closed.sh` (NEW) — invokes wrapper with no argv / missing lib / node throw and asserts deny JSON on stdout for each path
- `scripts/test-fixtures/plan-closure/verify-pre-commit-invokes-validators.sh` (NEW) — stages a plan + an override change; asserts all 3 validators invoked
- `scripts/test-fixtures/plan-closure/verify-retro-tool.sh` (NEW) — invokes `npm run plans:validate-closure:retro`, asserts `_closure_audit_<DATE>.md` file written under `.claude/state/closure-audits/` AND exit 0 (always exit 0 per v5 Phase 7 contract)

## Defects this chunk resolves (Preservation Matrix Layer 2)

- A2 (CRITICAL): Wrapper fail-CLOSED on all 3 failure paths
- A4 (CRITICAL): Pre-commit hook wires 3 closure validators
- B10 (MEDIUM): `plans:validate-closure:write-manifest` removed from public npm scripts

## Preservation Matrix Layer 1 rows this chunk owns

NB3, R2(partial), R4(partial), V3(partial), V5(partial), **P7-RETRO (reinstated 2026-05-18 — v5 Phase 7 retro tool — kept as `plans:validate-closure:retro` npm script + verify-retro-tool.sh integration test)**

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise | Paired self-test |
|---|---|

## Acceptance

- [ ] Wrapper emits deny JSON on all 3 failure paths — proven by `verify-wrapper-fail-closed.sh`.
- [ ] Pre-commit invokes all 3 closure validators — proven by `verify-pre-commit-invokes-validators.sh`.
- [ ] `grep -q "plans:validate-closure:write-manifest" package.json` returns 1 (no match).
- [ ] All 8 KEEP-disposition npm scripts present in `package.json` and runnable (`npm run <name>` exits 0 or with documented validator FAIL exit code).
- [ ] `plans:validate-closure:retro` writes `.claude/state/closure-audits/_closure_audit_<DATE>.md` and always exits 0 — proven by `verify-retro-tool.sh`.
- [ ] `pipeline:validate` chain includes `plans:validate-overrides && plans:validate-closure:changed && plans:validate-layout` (grep the package.json line).
- [ ] External auditor pass returns GREEN before v6-G begins.
- [ ] Closure manifest written for this subplan.
