# SUBPLAN SP-IDS-03 — `/identity` SKILL.md Step 6.5 constraint extraction artifact

**Status**: DONE
**Executed**: 2026-04-23
**Parent**: [PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md](../done/PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md)
**Created**: 2026-04-23
**Priority**: P0
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**Depends on**: — (independent of other SP-IDS; can land before or after)
**Skills**: /execute

---

## Bootstrap

- **Identity**: OWNER (.claude/skills/ is RW).
- **Context files**: `.claude/skills/identity/SKILL.md` (full) + `feedback_identity_switch_protocol.md`.
- **HALT conditions**: if current `/identity` SKILL.md cannot be parsed (malformed markdown) — HALT.
- **Handoff**: activity-log + /regression-guard AFTER + /final-q.

---

## Intent

Update `/identity` SKILL.md so every identity activation — first load OR switch — emits a **visible, fixed-format constraint extract** in chat. The Stop hook from SP-IDS-01 can parse it; the agent cannot skip it because the skill prescribes emission as a mandatory step.

---

## Artifacts produced

| Path | Ownership | Action |
|---|---|---|
| `.claude/skills/identity/SKILL.md` | RW | UPDATE |

---

## Phases

### Phase 0 — Context
1. Read full current SKILL.md (262 lines including Step 8 inline OWNER def).
2. Note current Steps: 1 (selection), 1.5 (auto-detect), 1.6 (task-level), 2 (loading), 3 (gates), 4 (compat matrix), 5 (banner), 6 (switch), 7 (override), 8 (OWNER inline).

### Phase 1 — Author new Step 6.5
Insert **Step 6.5 — Constraint Extraction (MANDATORY)** between current Step 6 (switch) and Step 7 (override).

Content mandate: after reading the agent file in Step 2 item 1 (or using Step 8 inline for OWNER), the agent MUST emit this fixed block before any tool call under the new identity:

````markdown
## [IDENTITY-ACTIVE: {CODENAME}] Constraint Extract

**Hard stops** ({N} items):
- {item 1}
- {item 2}
- ...

**File ownership** (§2 column for {CODENAME}):
- RW: {paths}
- READ: {paths}
- APPEND: {paths}
- SYNC ONLY: {paths}

**Tools permitted**: {comma-separated from frontmatter OR "all except ..." for OWNER}

**Self-audit items** ({N}):
1. {item 1}
2. {item 2}
...
````

Rules:
- Heading exactly `## [IDENTITY-ACTIVE: {CODENAME}] Constraint Extract` — Stop hook parses this verbatim.
- Emission required on: (a) first load, (b) every switch, (c) re-invocation of `/identity` with same codename (re-assert).
- Emission NOT required for Step 1.5 auto-detect when the active identity is already the target (no actual switch).
- Block must appear as the **first** assistant text output after `/identity` invocation, BEFORE any tool call.

### Phase 2 — Update Step 2 "Identity Loading Protocol"
Add item 6 to the MANDATORY list: "6. Emit the Step 6.5 Constraint Extract block (if this was a switch or first-load — not needed for Step 1.5 same-identity auto-detect)."

### Phase 3 — Update Step 6 "Identity Switching"
Insert after current item 4 ("Load new identity per Step 2"):
- Item 5: "Emit Step 6.5 Constraint Extract for the NEW identity — required before any tool call under the new identity."

### Phase 4 — Update Step 5 "Identity Banner"
Keep format `[CODENAME | prefix-list] >`. Add a parenthetical: "**Ground truth is the last `/identity` Skill invocation, not the banner text.** PreToolUse hook (`identity-switch-gate.sh`, SP-IDS-01) denies writes where banner text drifts from skill state."

### Phase 5 — Update Step 7 "Override Mechanism"
Clarify per ALL-077 + SP-IDS-02:
- Override requires **user-typed authorization** in chat: "override approved" / "override ok" / "approve override" / "authorized".
- Agent must emit `[OVERRIDE-REQUEST] {identity} writing to {path} — reason: {reason}` BEFORE the write.
- After write: emit `[OVERRIDE] {identity} wrote to {path} — reason: {reason} — authorized by: {user phrase matched}`.
- **Second override in same session**: must include `[OVERRIDE-EXPLICIT-APPROVAL-BATCH]` tag from user (typed once, applies to batch) OR switch identity instead.
- **Hard reminder**: override is one-shot break-glass, NOT a workflow. If a task consistently needs override, the subplan identity or §2 ownership is wrong — fix those (ALL-077 path (a) or (b)).

### Phase 6 — Update Step 8 "OWNER Identity Definition"
OWNER's Step 6.5 constraint extract uses the inline definition (no agent file to read). Add to Step 8: "When activating OWNER, the Step 6.5 Constraint Extract block is built from this Step 8 inline spec — same format."

### Phase 7 — Verify + /regression-guard AFTER + activity-log + /final-q
- Grep the updated SKILL.md for the exact headings: `## [IDENTITY-ACTIVE:`, `Step 6.5`, updated Step 7. Confirm present.
- Sanity: line count ≤ 350 (was 262; added ~70 lines).

---

## Success criteria

1. Step 6.5 exists with the exact fixed heading + 5 sections (Hard stops / File ownership / Tools / Self-audit).
2. Step 2 item 6 added.
3. Step 6 item 5 added.
4. Step 5 banner gets ground-truth disclaimer.
5. Step 7 covers request-authorize-log handshake + batch approval.
6. Step 8 references Step 6.5 for OWNER.
7. No existing steps removed — purely additive.

---

## Out of scope
- Hook implementation (SP-IDS-01 + SP-IDS-02).
- /execute Phase 0 cross-check (SP-IDS-04).
- .github/agents/*.agent.md edits — those are SYNC ONLY; the Step 6.5 mandate inside individual agent files is inherited automatically by reading them in Step 2.

---

## Execution Summary (2026-04-23)

**Artifacts updated**:
- `.claude/skills/identity/SKILL.md`:
  - Step 2 item 6 added: emit Step 6.5 Constraint Extract block on activation.
  - Step 5 banner: added "Ground truth is the last `/identity` Skill invocation, not the banner text" + hook reference.
  - Step 6 item 5 added: emit Constraint Extract for NEW identity, hook-backed.
  - **Step 6.5 added** (new section): mandatory `## [IDENTITY-ACTIVE: {CODENAME}] Constraint Extract` block with 5 sections (Hard stops / File ownership / Tools / Self-audit) + emission rules.
  - Step 7 rewritten: request-authorize-log handshake replaces informal "user says override". Covers `[OVERRIDE-REQUEST]`, typed authorization phrases, `[OVERRIDE]` log line with required fields, `[OVERRIDE-EXPLICIT-APPROVAL-BATCH]` for multiple, non-overridable HARD_STOP paths, audit-trail references.
  - Step 8 OWNER: added paragraph on building Step 6.5 Constraint Extract from Step 8 inline.

**Verification** (2026-04-23):
- Grep confirmed `## [IDENTITY-ACTIVE:`, `Step 6.5`, `## Step 7: Override Mechanism (request-authorize-log handshake` all present in updated SKILL.md.
- Line count: 313 (was 289, +24 lines — under 350 ceiling).
- No pre-existing step removed.

**LR-040 closure**: single artifact (SKILL.md) verified via grep. Additive-only edit.

**Integration**: hooks from SP-IDS-01 parse the `## [IDENTITY-ACTIVE:` heading verbatim; Step 7 handshake semantics are enforced by SP-IDS-02 fixtures.
