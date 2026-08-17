---
title: v6-A Foundation — Override File + Schema + validate-overrides (with loadSchema actually wired + schema-hash integrity)
Parent: PLAN_CLOSURE_GATE_V6_PARENT.md
Status: PENDING-DRAFT-v6
Priority: P0-EMERGENCY
Created: 2026-05-18
Identity: OWNER
Model: claude-opus-4-8
Thinking: max
PermissionMode: auto
RiskAcknowledged: true
BrowserTool: none
Justification: max — first chunk in v6 dependency chain; establishes override authority + schema contract that all later chunks consume
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_A_OVERRIDES_FOUNDATION.md` in a fresh session.

## Scope hint (from parent matrix)

- `.claude/closure-overrides.schema.json` (full JSON Schema, `additionalProperties: false` at root + every nested object)
- `.claude/closure-overrides.json` (initial seed — empty `overrides: []` + `meta_plans: [PLAN_CLOSURE_GATE_V6_PARENT.md, ...subplan basenames]`)
- `.claude/closure-overrides-authors.txt` (best-effort attribution allowlist; V2 caveat documented)
- a schema hash file (path does not resolve — file was never committed) (NEW — known-good SHA-256 of the schema file; verified at validator load time)
- `scripts/validate-overrides.mjs` (loadSchema() actually called against schema; schema-hash integrity check; staged-blob mode `git show :path` for pre-commit; self-tests prove schema rejects wildcards / missing expiry / < 40-char reason / `closure_circular_ok` / unknown keys / tampered-schema)

## Defects this chunk resolves (Preservation Matrix Layer 2)

- B8: `validate-overrides.mjs` defines `loadSchema()` but never calls it → fix by wiring loadSchema + schema-hash known-good check
- C7: Schema file integrity never enforced → fix via schema-hash known-good txt file

## Preservation Matrix Layer 1 rows this chunk owns

B2, B15(partial), NB2, R3(partial), V2(partial), V3(partial), F2(partial)

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise (MUST/REQUIRED/ENFORCED/FAIL/DENY) | Paired self-test |
|---|---|
| (author fills this in during /planning) | (author fills this in during /planning) |

## Acceptance

- [ ] All 5 files created with correct schema shape.
- [ ] `validate-overrides.mjs --self-test` exits 0 with ≥13 assertions including schema-hash tamper detection.
- [ ] `node scripts/validate-overrides.mjs --staged` works (staged blob authority).
- [ ] All MUST/REQUIRED/ENFORCED/FAIL/DENY in this subplan body have paired tests.
- [ ] External auditor pass returns GREEN before v6-B begins.
- [ ] Closure manifest written for this subplan.
