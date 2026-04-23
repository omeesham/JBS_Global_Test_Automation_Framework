# SUBPLAN SP-IDS-04 — `/execute` SKILL.md Phase 0 subplan-identity vs §2 cross-check HALT

**Status**: DONE
**Executed**: 2026-04-23
**Parent**: [PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md](../done/PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md)
**Created**: 2026-04-23
**Priority**: P0
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**Depends on**: SP-IDS-01 (uses `scripts/identity-ownership.mjs`)
**Skills**: /execute

---

## Bootstrap

- **Identity**: OWNER. No switch.
- **Context files**: `.claude/skills/execute/SKILL.md` (Phase 0), `scripts/identity-ownership.mjs` (from SP-IDS-01), any existing subplan file as an example of frontmatter format (e.g., `SUBPLAN_IDS_01_*.md` itself).
- **HALT conditions**: if SP-IDS-01's ownership mirror not landed — HALT.

---

## Intent

Make the `/execute` Phase 0 step explicitly HALT before TodoWrite when the subplan's declared `Identity:` field cannot write every path listed under `Artifacts produced` (per §2). Close the ALL-077 gap: the SP-AAE-01 incident was caught *voluntarily*; this makes it structural.

---

## Artifacts produced

| Path | Ownership | Action |
|---|---|---|
| `.claude/skills/execute/SKILL.md` | RW | UPDATE |
| `scripts/check-subplan-identity.mjs` | RW | CREATE |

---

## Phases

### Phase 0 — Context
1. Read `/execute/SKILL.md` Phase 0 + Phase 0.5 in full.
2. Read SP-IDS-01's ownership mirror export signature.
3. Read an existing subplan frontmatter format (e.g., this file — Identity / Model / Thinking / etc).

### Phase 1 — Build `scripts/check-subplan-identity.mjs`
Input: argv[2] = subplan file path. Output: JSON `{ok: boolean, identity: string, violations: Array<{path, §2cell}>, options: string[]}` + exit 0 on ok, exit 1 on violation.

Logic:
1. Read subplan file; parse frontmatter for `Identity:` + front-matter table `Artifacts produced` OR `## Artifacts produced` section (grep for markdown table rows with `| path | ... |`).
2. For each artifact path, call `ownershipFor(identity, path)` from SP-IDS-01's mirror.
3. If ANY cell is `"—"`, `"READ"`, or `"HARD_STOP"` and the action column says CREATE/UPDATE/RW → violation.
4. Build `options[]`: (a) reassign identity, (b) update §2, (c) plan clean mid-session identity switch.

### Phase 2 — Update `/execute/SKILL.md` Phase 0
Insert **Phase 0.1 — Subplan identity ↔ §2 cross-check (ALL-077 structural gate)** between current Phase 0 (Context loading) and Phase 0.5 (TodoWrite).

Content:
- If `/execute` is invoked with a plan file path (ad-hoc `/execute "do X"` skips this phase):
  - Run `node scripts/check-subplan-identity.mjs {plan_path}`.
  - Exit 1 → HALT before TodoWrite. Emit the violation list + 3 options. Do NOT silently auto-switch. Do NOT build TodoWrite until user resolves via (a), (b), or (c).
  - Exit 0 → proceed to Phase 0.5.
- Add note: the PreToolUse hook (SP-IDS-01) remains as second-line defense — even if Phase 0.1 is bypassed or the subplan lacks a parseable identity declaration, individual writes still hit the §2 check.

### Phase 3 — Smoke test
Create temporary `plans/pending/_SMOKE_IDENTITY_MISMATCH.md` with:
```
**Identity**: HUNTER
## Artifacts produced
| Path | Action |
|---|---|
| scripts/foo.mjs | CREATE |
```
Run `node scripts/check-subplan-identity.mjs plans/pending/_SMOKE_IDENTITY_MISMATCH.md` → expect exit 1 with violation naming `scripts/foo.mjs` + HUNTER's §2 cell (`—`).

Delete the smoke fixture after verification.

### Phase 4 — Verify + activity-log + /regression-guard AFTER + /final-q

---

## Success criteria

1. `scripts/check-subplan-identity.mjs` exits 0 on this subplan file itself (OWNER + OWNER-RW paths — clean).
2. Smoke test (HUNTER + scripts/foo.mjs) exits 1 with clear violation output.
3. `/execute` SKILL.md has new Phase 0.1 between Phase 0 and Phase 0.5, with greppable section heading.
4. No existing Phase is removed — purely additive.

---

## Out of scope
- Hook implementation (SP-IDS-01 + SP-IDS-02).
- `/identity` skill Step 6.5 (SP-IDS-03).
- Retrofitting the cross-check into `/chain` queue-build (already covered: `/chain` spawns `/execute` which inherits Phase 0.1).

---

## Execution Summary (2026-04-23)

**Artifacts created / updated**:
- `scripts/check-subplan-identity.mjs` (115 lines) — parses subplan frontmatter for `Identity:` + first markdown table under `## Artifacts produced`/`## Key Files`/`## Artifacts`/`## Deliverables`. Calls `ownershipFor(identity, path)` per row. Skips HARD_STOP paths (expected intentional non-writes). Emits JSON report. Exits 0 ok/skipped, 1 violation, 2 infra error.
- `.claude/skills/execute/SKILL.md` Phase 0 → Phase 0.1 → Phase 0.5 chain: new **Phase 0.1** section inserted between Context Loading and TodoWrite. Documents: run command, exit-code interpretation, 3 ALL-077 options, HALT rationale per Q4=a.

**Verification** (2026-04-23):
- Self-check on all 4 SP-IDS subplans: `node scripts/check-subplan-identity.mjs plans/pending/SUBPLAN_IDS_0{1,2,3,4}_*.md` → all `{"ok":true}` (6, 3, 1, 2 paths respectively).
- Smoke test: `plans/pending/_SMOKE_IDENTITY_MISMATCH.md` (HUNTER + scripts/foo.mjs + .claude/hooks/bar.sh) → exit 1 with 2 violations + 3 options. Smoke fixture deleted after verification.
- `/execute` SKILL.md grep: `Phase 0.1` section heading confirmed between Phase 0 Checkpoint and Phase 0.5.

**LR-040 closure**: both artifacts (a) fixture-proven via smoke + self-check. No (b) or (c).

**Deviations**: None.
