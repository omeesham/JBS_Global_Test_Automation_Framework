---
title: v6-G Rule + Skill + Ceremony — LR-NNN rule body + /execute Phase 3.5 + /audit integration + docs/SETUP.md + 2-commit bootstrap dogfood on PARENT
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
Justification: max — final chunk; closes the gate; dogfoods on parent which MUST pass C2-C5 per v6-B's narrowed exemption
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_G_RULE_SKILL_CEREMONY.md` in a fresh session AFTER v6-F closes GREEN.

## Scope hint (from parent matrix)

- `.claude/rules/plan-closure.md` — **REWRITE LR-055 in place** (do NOT increment to LR-056; v5's LR-055 body is the buggy version reverted in pre-v6-A revert per parent's Decision section; v6-G writes the corrected body from scratch; per M5 collision check, MAX(existing LR-*) shows LR-055 free after revert):
  - Authorization-surface integrity section (matrix from parent — §R5 first-class)
  - Best-effort attribution caveat (V2)
  - BEHAVIOR > SMOKE language (anti-NV3 stamps)
  - Promise-paired-test discipline mention
  - closure_meta C1-only narrowing language (B1 fix — exemption narrowed to C1, never C2-C5)
- `.claude/skills/execute/SKILL.md` Phase 3.5 — closure-ceremony invocation site for `--write-manifest` (sole invocation site per V6)
- `.claude/skills/audit/SKILL.md` — §REVIEW 2.7 extension with `CLOSURE_FORBIDDEN_C1` + YAML-evidence regex auto-RED on (b) hits; validator integration hook calls `validate-plan-closure --enforce` (READ-ONLY, no side effects per V6) — was in v5 Phase 5; preserved here
- `.claude/skills/final-q/SKILL.md` **Step 4.5** (reinstated 2026-05-18 per Layer 1 row FQ-4.5 — was silently absent from prior v6-G scope hint; v5 Phase 5 line 595 owned this):
  - Reads `validate-plan-closure --enforce` (READ-ONLY) for any plan touched in session
  - Reads `validate-plan-layout --check` (READ-ONLY) for fleet-level audit
  - Reads `.claude/state/closure-fail-closed-counter-*.json` for V5 diagnostic counter
  - Forces verdict to RED if validator returns FAIL on any session-touched plan
  - Floors verdict to YELLOW if hook-failures.log non-empty (silent hook bug per LR-050)
- `docs/SETUP.md` — append `git config --global --add safe.directory <abs-path>` step for auditors on non-owner accounts / Windows hosts (A6 fix)
- `.claude/closure-overrides.json` — **USER-SEED only (Commit-A); agent MAY NOT self-add to meta_plans per F2**. Seed content (8 entries):

  ```json
  {
    "$schema": "./closure-overrides.schema.json",
    "version": 1,
    "overrides": [],
    "meta_plans": [
      "PLAN_CLOSURE_GATE_V6_PARENT.md",
      "SUBPLAN_CLOSURE_GATE_V6_A_OVERRIDES_FOUNDATION.md",
      "SUBPLAN_CLOSURE_GATE_V6_B_VALIDATOR_C1_C2.md",
      "SUBPLAN_CLOSURE_GATE_V6_C_VALIDATOR_C3_C5.md",
      "SUBPLAN_CLOSURE_GATE_V6_D_MANIFEST_LAYOUT.md",
      "SUBPLAN_CLOSURE_GATE_V6_E_HOOK_LIB.md",
      "SUBPLAN_CLOSURE_GATE_V6_F_WRAPPER_PRECOMMIT_NPM.md",
      "SUBPLAN_CLOSURE_GATE_V6_G_RULE_SKILL_CEREMONY.md"
    ]
  }
  ```

  Note: pre-v6-A revert removes the v5 `meta_plans: ["PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md"]` content; v6-G re-seeds from scratch with the 8 entries above. User pastes this JSON verbatim into Commit-A; agent does not author it.

- `.claude/closure-gate-landed-at.txt` (NEW, written at the wire-commit timestamp)
- `scripts/test-fixtures/plan-closure/verify-v6-landing.sh` (replaces verify-v5-landing.sh) — BEHAVIOR section invokes each verify-*.sh integration test from v6-E + v6-F; NV3 comments clarify BEHAVIOR vs SMOKE. **MUST also run each Layer 4 anti-pattern grep query and assert expected match count (per parent's grep-verifiable Layer 4 enhancement 2026-05-18).**

### 2-commit bootstrap dogfood (V4)

**Commit-A** "USER-SEED": full seed of override + schema + authors files (user/manual; agent may NOT self-add to `meta_plans[]` per F2). Hook NOT yet wired.

**Commit-B** "WIRE": land the rule body + register hooks in `.claude/settings.json` + write `closure-gate-landed-at.txt`.

After Commit-B: subsequent attempts to flip parent's Status: DONE go through the active gate. Validator reads HEAD overrides → parent basename ∈ `meta_plans[]` → C1 exemption granted (per v6-B's narrowed exemption) → C2-C5 still run on parent body.

### Critical pre-ceremony step (parent MUST pass C2-C5)

v6-G author MUST first edit the parent plan body so it passes:
- C2: Execution Summary section with ≥10 content lines + cited file paths (the 7 subplan manifest paths)
- C3: all cited artifact paths resolve (incl. 7 subplan manifests written by v6-A through v6-F)
- C4: no phantom/circular handoffs (parent references each subplan via `Parent:` linkage, not handoff)
- C5: strict lines (3 disciplines + acceptance) not contradicted by deviations section

Only after parent passes C2-C5 dry-run can `--enforce --write-manifest` succeed.

### Closure ceremony

```bash
node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_CLOSURE_GATE_V6_PARENT.md --enforce --write-manifest
```

Manifest written at `plans/_closure_manifests/PLAN_CLOSURE_GATE_V6_PARENT.md.manifest.json`. Then:

```bash
git mv plans/pending/PLAN_CLOSURE_GATE_V6_PARENT.md plans/done/
git mv plans/pending/SUBPLAN_CLOSURE_GATE_V6_*.md plans/done/
git add plans/_closure_manifests/PLAN_CLOSURE_GATE_V6_PARENT.md.manifest.json
npm run plans:reindex
```

M4 atomicity: Status flip + manifest write + git mv in ONE commit.

## Defects this chunk resolves (Preservation Matrix Layer 2)

- A5 (LOW): Execution Summary corrected (v6 parent's own Execution Summary names actual chunk commits)
- A6 (LOW): docs/SETUP.md safe.directory remediation
- B9 (MEDIUM, verify-*.sh-half): verify-v6-*.sh BEHAVIOR section invokes integration tests — v6-E handles handleEditMode/handleBashMode-half

## Preservation Matrix Layer 1 rows this chunk owns

B3, M4, M5, R1, R5, F1, F2(partial), V2(partial), V4, V8, NV3, **FQ-4.5 (reinstated 2026-05-18 — `.claude/skills/final-q/SKILL.md` Step 4.5 was silently absent from prior v6 stubs)**

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise | Paired self-test |
|---|---|

## Acceptance

- [ ] LR-055 rule body at `.claude/rules/plan-closure.md` REWRITTEN in place (not LR-056 — v5's LR-055 was reverted in pre-v6-A revert; v6-G re-authors). All promised sections present including §R5 Authorization-Surface Integrity + B1 closure_meta C1-only narrowing.
- [ ] `/execute` SKILL.md Phase 3.5 references the sole `--write-manifest` invocation site.
- [ ] `/audit` SKILL.md §REVIEW 2.7 extension with CLOSURE_FORBIDDEN_C1 + YAML-evidence regex landed.
- [ ] `/final-q` SKILL.md Step 4.5 landed: reads validate-plan-closure --enforce + validate-plan-layout --check + closure-fail-closed-counter; forces RED on validator FAIL; YELLOW on hook-failures.log non-empty. (FQ-4.5 reinstated 2026-05-18.)
- [ ] `docs/SETUP.md` includes safe.directory remediation paragraph.
- [ ] `.claude/closure-overrides.json` USER-SEEDED at Commit-A with the 8-entry meta_plans JSON above (user pastes verbatim; agent does NOT self-author per F2).
- [ ] Parent plan body passes C2-C5 dry-run before `--write-manifest`.
- [ ] Manifest written at `plans/_closure_manifests/PLAN_CLOSURE_GATE_V6_PARENT.md.manifest.json` with valid schema (all v6-D fields).
- [ ] Parent + 7 subplans all moved to `plans/done/` after manifest.
- [ ] `verify-v6-landing.sh` BEHAVIOR section ALL GREEN (each `[OK]` invokes runtime, NOT string-presence). Includes Layer 4 anti-pattern grep queries from parent (each runs + asserts expected count).
- [ ] Preservation Matrix Layer 1 (48 primary + 5 supplemental = 53 rows) + Layer 2 (23 rows) fully ticked by chunks A-G Execution Summaries.
- [ ] External AI auditor (fresh session, NOT v6-G author) returned written GREEN verdict on closed parent + 7 closed subplans + manifest validity + Preservation Matrix completeness. Verdict file path cited in this Execution Summary. (Per parent's EXTERNAL AUDITOR ON CLOSED PARENT strict line — closes AUD-017 gap.)
