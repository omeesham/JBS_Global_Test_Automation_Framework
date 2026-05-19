---
title: v6-E Hook Lib — execFileSync (no shell template) + path normalization + concurrency-locked attempts + full handleEditMode/handleBashMode JSON contract self-tests
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
Justification: max — fixes shell-injection surface (A3) + adds the BEHAVIOR self-test layer v5 lacked (B9 hook-half)
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_E_HOOK_LIB.md` in a fresh session AFTER v6-D closes GREEN.

## Scope hint (from parent matrix)

- `.claude/hooks/lib/check-plan-closure.mjs` — full rewrite:
  - `execFileSync(process.execPath, [VALIDATOR_PATH, '--plan', targetPath, ...])` instead of `execSync(\`node "${VALIDATOR_PATH}" --plan "${targetPath}" ...\`)` (A3 fix)
  - Path normalization on `targetPath` — `path.resolve()` + REPO_ROOT prefix check + reject `..` or symlink-mismatch via `fs.realpathSync` (C5 fix)
  - Concurrency-locked attempts.json via `proper-lockfile` (already in dependencies) (C3 fix)
  - Status detection requires frontmatter (no slice(0,800) fallback) — same as v6-B
  - Lock-path regex (V1 PowerShell + node-fs + sed + NV1 backslash compatibility)
  - READ_ONLY_PREFIX_RX allowlist
  - WRITE_OP_RX detection
  - Self-test expanded from 28 → 35+ assertions including:
    - `handleEditMode` synthetic invocation with crafted payloads, capture stdout, parse JSON, assert `permissionDecision`
    - `handleBashMode` synthetic invocation same shape
    - 7 cases: lock-path Edit (deny), non-plan Edit (allow), plan-path Edit Status DONE validator-FAIL (deny), validator-PASS (allow), validator-EXEMPT (allow per v6-B narrowed), Bash lock-path read-only (allow), Bash lock-path write (deny)

## Defects this chunk resolves (Preservation Matrix Layer 2)

- A3 (MEDIUM): execFileSync replaces shell-interpolated execSync
- B9 (MEDIUM, hook-half): handleEditMode/handleBashMode JSON contract self-tests added — v6-G handles verify-v6-*.sh BEHAVIOR section
- C3 (MEDIUM): Attempts log concurrency lock
- C5 (LOW): Path-traversal normalization

## Preservation Matrix Layer 1 rows this chunk owns

R2(partial), R4(partial), V1, V5(partial), NV1, M2(partial)

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise | Paired self-test |
|---|---|

## Acceptance

- [ ] Hook lib uses execFileSync; grep `execSync(\`` in hook lib returns 0 matches.
- [ ] Self-test ≥35 assertions including 7+ end-to-end JSON contract tests for handleEditMode + handleBashMode.
- [ ] Synthetic test: `tool_input.file_path: "plans/done/x\`whoami\`.md"` — pre-fix executes whoami; post-fix passes literal path.
- [ ] Synthetic test: symlink `plans/done/x.md → /etc/passwd` — Edit call rejected.
- [ ] Synthetic test: 5 concurrent hook fires on same plan same day — all 5 invocation_ids present in attempts file.
- [ ] External auditor pass returns GREEN before v6-F begins.
- [ ] Closure manifest written for this subplan.
