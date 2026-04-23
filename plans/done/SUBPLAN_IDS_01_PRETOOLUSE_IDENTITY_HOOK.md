# SUBPLAN SP-IDS-01 — PreToolUse + Stop hooks for identity-switch enforcement

**Status**: DONE
**Executed**: 2026-04-23
**Parent**: [PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md](../done/PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md)
**Created**: 2026-04-23
**Priority**: P0
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Depends on**: — (leaf — landing first in the IDS run sequence)
**Skills**: /execute, /regression-guard

---

## Bootstrap

- **Identity**: OWNER — all paths below are OWNER RW per §2 (`.claude/hooks/`, `.claude/skills/`, `scripts/`, `docs/`). No identity switch needed.
- **Context files to load in Phase 0**:
  - `.claude/hooks/final-q-gate.sh` + `lib/check-finalq-required.mjs` (pattern reference)
  - `.claude/hooks/rubber-stamp-gate.sh` + `lib/check-rubberstamp.mjs` (pattern reference)
  - `.claude/hooks/lib/test-rubberstamp-fixtures.mjs` (fixture pattern reference)
  - `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 + §2.1 (ownership truth)
  - `.claude/settings.json` (hook registration point)
- **HALT conditions**:
  - If §2 markdown parsing returns fewer than 7 identity columns — HALT (malformed §2).
  - If `claude --version` check in hook fails — HALT (env broken).
- **Handoff sequence at end**: activity-log entry + `/regression-guard` AFTER + `/final-q`.

---

## Artifacts produced

| Path | Ownership (OWNER) | Action |
|---|---|---|
| `.claude/hooks/identity-switch-gate.sh` | RW | CREATE |
| `.claude/hooks/lib/check-identity-switch.mjs` | RW | CREATE |
| `.claude/hooks/lib/test-identity-switch-fixtures.mjs` | RW | CREATE |
| `scripts/identity-ownership.mjs` | RW | CREATE (machine mirror of §2) |
| `scripts/check-identity-ownership.mjs` | RW | CREATE (mirror-parity unit test, scannable via `npm run check:identity-ownership`) |
| `package.json` | **DO NOT MODIFY** — HARD STOP per OWNER Step 8 | — |

**Note on package.json**: OWNER hard-stops on `package.json` edits. Script registration requires user approval. SP-IDS-01 ships the `check-identity-ownership.mjs` script but only registers it in `package.json` after user approves — until then, callers invoke via `node scripts/check-identity-ownership.mjs` directly.

---

## Phases

### Phase 0 — Context (MANDATORY)
1. Read the 5 context files above in full.
2. Grep `.claude/settings.json` for existing `hooks.PreToolUse` — confirm there is NONE today (confirmed during research: `grep PreToolUse .claude/` returns 0 files).
3. Read Claude Code docs schema for PreToolUse `hookSpecificOutput` via research notes — confirmed: `permissionDecision: "allow" | "deny" | "ask"` + `permissionDecisionReason: string`.

### Phase 1 — Build `scripts/identity-ownership.mjs` (the §2 mirror)
Export `IDENTITY_OWNERSHIP`: `{ [CODENAME]: { [pathGlob]: "RW" | "READ" | "ADD" | "APPEND" | "CREATE" | "UPDATE" | "REFACTOR" | "FIX" | "SYNC" | "—" } }`.

Rows mirror AGENT_SHARED_RULES.md §2 table verbatim (including the OWNER column from §2.1). Include HARD STOPS list: `["**/.env*", "**/playwright.config.*", "package.json", "tsconfig.json", "**/.ci/*"]`.

Export helper `ownershipFor(identity, path)` that:
- Resolves `${ACTIVE_CLIENT}` via `process.env.ACTIVE_CLIENT ?? "encore"`.
- Matches the most-specific glob first.
- Returns `"—"` for unmatched paths on pipeline identities; returns `"RW"` for OWNER on unmatched framework paths (per Step 8 inline spec).
- Applies HARD STOPS universally (any identity) — returns `"HARD_STOP"`.

### Phase 2 — Build `scripts/check-identity-ownership.mjs`
Parse AGENT_SHARED_RULES.md §2 markdown table rows, compare cell-by-cell against `IDENTITY_OWNERSHIP`. Exit 0 on parity, exit 1 with diff on drift. Used as:
- Hook-time sanity check (call from Stop hook → block stop if parity broken)
- CI gate (callable as `node scripts/check-identity-ownership.mjs`)

### Phase 3 — Build `.claude/hooks/lib/check-identity-switch.mjs`
Input: argv[2] = transcript path, argv[3] = current tool-call JSON (for PreToolUse mode). Output: JSON decision.

Logic:
1. Parse JSONL transcript; find the LATEST `Skill` tool_use with `input.skill === "identity"`. Extract argument as the ground-truth identity. Default to `OWNER` if none found.
2. If invoked as PreToolUse (argv[3] present):
   - Extract target path from `tool_input.file_path` (Edit/Write/MultiEdit) or `tool_input.notebook_path` (NotebookEdit).
   - Look up `ownershipFor(groundTruthIdentity, targetPath)`.
   - If `"—"` or `"READ"` → emit JSON: `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..."}}`.
   - Reason text cites §2 row + lists 3 options (switch identity, override with user-typed authorization, update §2).
   - Check for **override** path: scan last 3 user messages for authorization phrase regex `/\b(override approved|override ok|approve override|authorized)\b/i` AND scan assistant messages for `[OVERRIDE-REQUEST]` tag referencing same path. If both → emit `permissionDecision: "allow"` + log reason `[OVERRIDE] user-authorized write to {path}`.
3. If invoked as Stop hook (no argv[3]):
   - Detect banner-drift: find LAST assistant message's banner pattern `/^\[([A-Z]+)\s\|/`, compare against groundTruthIdentity. Mismatch → block stop with reminder to invoke `/identity {NEW}` properly.
   - Also detect identity switch without Step 6.5 emission: grep for `IDENTITY SWITCH:` log line in transcript; for each, look forward N=5 messages for `## [IDENTITY-ACTIVE:` heading. Missing → block stop.

Fail-open on parse error (consistent with check-rubberstamp.mjs pattern).

### Phase 4 — Build `.claude/hooks/identity-switch-gate.sh`
Wraps `check-identity-switch.mjs` for BOTH PreToolUse and Stop matchers. Reads stdin JSON, extracts transcript path + tool_input (for PreToolUse), delegates to node, emits JSON decision verbatim on stdout.

PreToolUse matcher: `"Edit|Write|NotebookEdit|MultiEdit"` (JSON-escaped).

### Phase 5 — Build fixtures `test-identity-switch-fixtures.mjs`
Min 8 fixtures:
1. TRUE-POSITIVE — last /identity=HUNTER, Edit on `scripts/foo.mjs` → deny (HUNTER has `—` on scripts)
2. TRUE-NEGATIVE — last /identity=OWNER, Edit on `scripts/foo.mjs` → allow
3. OVERRIDE-PATH — last /identity=HUNTER, user message "override approved", assistant `[OVERRIDE-REQUEST]`, then Edit → allow
4. OVERRIDE-STALE — authorization 5+ messages before → deny (stale)
5. NO-IDENTITY — no /identity Skill invocation, Edit on `.claude/hooks/foo.sh` → allow (default OWNER)
6. BANNER-DRIFT (Stop mode) — last /identity=OWNER, banner says `[GARDENER]` → block stop
7. SWITCH-NO-EXTRACT (Stop mode) — `IDENTITY SWITCH: OWNER → BUILDER` logged but no `## [IDENTITY-ACTIVE:` heading → block
8. EMPTY-TRANSCRIPT — empty input → allow (fail-open)

### Phase 6 — Verify + activity-log + /regression-guard AFTER
- Run `node .claude/hooks/lib/test-identity-switch-fixtures.mjs` → expect 8/8 PASS.
- Run `node scripts/check-identity-ownership.mjs` → expect exit 0.
- Append activity-log row.
- `/regression-guard` AFTER snapshot.

### Phase 7 — /final-q
Tag every planned item. Expected verdict: GREEN on fixture pass.

---

## Success criteria (SP-scoped subset of parent)

1. 8/8 fixtures pass.
2. Ownership-mirror parity check exits 0.
3. New hook files are syntactically valid bash + node (`bash -n` + `node --check`).
4. No existing hook is regressed (re-run rubber-stamp fixtures → 7/7 still PASS).
5. `.claude/settings.json` hook registration DEFERRED to parent plan closure step — this subplan does not register. (Prevents partial activation before SP-IDS-02 lands.)

---

## Out of scope
- Actual registration of the hook in `settings.json` (happens in parent closure).
- Override-path authorization UX refinement (SP-IDS-02 owns the override hook specifically).
- `/identity` skill Step 6.5 constraint extraction (SP-IDS-03).
- `/execute` Phase 0 HALT (SP-IDS-04).

---

## Execution Summary (2026-04-23)

**Artifacts created**:
- `scripts/identity-ownership.mjs` (282 lines) — machine mirror of §2 + OWNER §2.1 extensions. Exports `OWNERSHIP_ROWS`, `IDENTITIES`, `HARD_STOPS`, `SYNC_ONLY`, `OWNER_CATCHALL_RW`, `OWNER_CATCHALL_READ` + helpers `ownershipFor(identity, path)`, `canWrite(identity, path)`. CLI: `node scripts/identity-ownership.mjs <IDENTITY> <path>` — exits 0 writable, 1 not.
- `scripts/check-identity-ownership.mjs` (95 lines) — parses `AGENT_SHARED_RULES.md` §2 table, compares to mirror. Normalizes parenthetical annotations ("RW (quality gate)" → "RW") before compare. Exits 0 parity OK, 1 drift, 2 infra error.
- `.claude/hooks/lib/check-identity-switch.mjs` (187 lines) — dual-mode (PreToolUse via argv[3]=tool_input; Stop via absence). Ground-truth identity from last `Skill` tool_use with `input.skill === "identity"`. Emits `hookSpecificOutput.permissionDecision` JSON for PreToolUse and root `decision/reason` for Stop. Override allow-path: `[OVERRIDE-REQUEST]` for same path + user authorization in ≤3 assistant turns.
- `.claude/hooks/identity-switch-gate.sh` (54 lines) — wrapper detects mode via `tool_name` in stdin; delegates to node helper; emits verbatim.
- `.claude/hooks/lib/test-identity-switch-fixtures.mjs` (12 fixtures covering PreToolUse deny/allow/override + Stop banner-drift/switch-no-extract/empty).

**Verification** (2026-04-23):
- `node .claude/hooks/lib/test-identity-switch-fixtures.mjs` → 12/12 PASS.
- `node scripts/check-identity-ownership.mjs` → OK (parity).
- `bash -n .claude/hooks/identity-switch-gate.sh` + `node --check .claude/hooks/lib/check-identity-switch.mjs` → clean.
- Regression: `node .claude/hooks/lib/test-rubberstamp-fixtures.mjs` → 11/11 still PASS (no break on existing gate).

**LR-040 closure**:
- Artifact: all paths writable under OWNER per §2 (confirmed via `scripts/check-subplan-identity.mjs`).
- Every planned item fixture-verified (category (a) MCP-proven adapted as (a) fixture-proven for hook work).
- No (b) hand-offs; no (c) user-flagged discussion items.

**Deviations**: None. `package.json` registration of `check-identity-ownership` deferred per OWNER HARD STOP (package.json edits require user approval); callers invoke via `node scripts/check-identity-ownership.mjs` directly until user approves registration.

**Deferred**: Hook registration in `settings.json` — landed in parent plan closure step (all 4 subplans registered together to avoid partial activation).
