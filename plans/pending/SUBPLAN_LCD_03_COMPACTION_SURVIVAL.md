# SUBPLAN_LCD_03_COMPACTION_SURVIVAL — Make CEO identity survive /compact

**Status**: Pending
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_02_ENFORCEMENT_HOLES.md
**Blocks**: none
**Runs-after**: LCD_02
**Collides-with**: LCD_02 (primer changes)
**Model**: claude-opus-4-6
**PermissionMode**: default (PROTECTED files need owner go + SELF_GRANT)
**RiskAcknowledged**: MEDIUM — primer changes affect every session start

---

## Objective

Post-compaction, Claude loses CEO identity because `delegation-primer.mjs:82-95` injects rule text (instructions) but NOT identity (role assignment). The base model's doer-training fills the vacuum. Fix: make the primer inject a structural identity assertion BEFORE rule text, persist role state for the nudge hook to reference, and add an `[AUTO-IDENTITY]` grep-able token for audit.

---

## Preconditions

- `delegation-primer.mjs:82-95` still contains the current `msg` construction starting with "DELEGATION-FIRST IS LIVE"
- LCD_02 landed (nudge hook `delegation-nudge.mjs` exists and writes `session-bash-nudges.json`)
- Primer still fires at SessionStart per `delegation-primer.mjs:3-6`

---

## Step-by-Step

### Phase 1 — Primer identity assertion (PROTECTED — delegation-primer.mjs)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. Required backup before modifying: `cp ~/.claude/hooks/delegation-primer.mjs ~/.claude/hooks/delegation-primer.mjs.bak`

1. In `delegation-primer.mjs`, modify lines 82-95 to prepend an identity block BEFORE the existing rule text:
   ```javascript
   const identityBlock = [
     "═══ YOU ARE THE CEO ═══",
     "[AUTO-IDENTITY: CEO — structural, primer-asserted, survives compaction]",
     "Identity: OWNER (CEO/Guarantor). Decompose → ticket → dispatch → read verdict → report.",
     "You do NOT: write code, run verifications, do RCA, deep-read repos, draft specs.",
     "If your next action is Bash/grep for anything beyond ticket-prep: STOP and ticket it.",
     ""
   ].join("\n");
   
   const msg = identityBlock + "\n" + existingRuleText;
   ```

   **Platform constraint acknowledgment**: SessionStart cannot invoke `/identity` — that requires an interactive command. This identity-text injection is therefore the MAXIMUM FEASIBLE structural fix within the current platform. It is NOT the only enforcement layer: the nudge-hook counter (`session-bash-nudges.json`, wired by LCD_02) provides a structural backstop — it fires on delegable Bash regardless of identity text state. The two layers complement each other: identity-text reduces base-model drift at session start; nudge-hook catches inline legwork drift mid-session.

2. Preserve the existing assistant-mode announce line positioning (lines 44-52 emit FIRST). The identity block goes AFTER the assistant-mode line but BEFORE delegation rules. Order:
   - `ASSISTANT MODE: ON/OFF` (line 51, unchanged)
   - `═══ YOU ARE THE CEO ═══` (new identity block)
   - Existing delegation-first rules (lines 82-95 content)

### Phase 2 — Session-wording context for nudge hook

**⛔ GATE**: This describes nudge-hook behavior already introduced by LCD_02. No additional protected-file change required for this phase — the nudge hook reads `session-bash-nudges.json` (written by `delegation-nudge.mjs` itself on first fire this session).

3. The nudge hook (`delegation-nudge.mjs`, created by LCD_02) already increments `session-bash-nudges.json` per session. Add CEO-specific wording to the nudge text when the hook is in a known-gated session:
   - At count 1: nudge text says "You are in CEO mode this session — delegate this."
   - At count ≥3: escalated nudge referencing `self_incidents.log + Receipt` audit.
   - Counter RESETS on dispatch detection (existing behavior from LCD_02).

   **Note**: `session-role.json` was removed from this design per `prosecute-correctness/result.md` OVERREACH finding (refute-gpt:17-18). The stale-re-fire machinery that depended on it was never proven to work at SessionStart. The nudge hook's own `session-bash-nudges.json` provides sufficient wording context without a separate role-state file.

### Phase 3 — Verification

4. Simulate session start → confirm primer output begins with `═══ YOU ARE THE CEO ═══`
5. Confirm identity block appears AFTER assistant-mode announce line and BEFORE delegation rules
6. Simulate /compact → confirm primer re-fires at next SessionStart and re-asserts identity
7. Verify existing behavior unchanged: delegation rules still appear after identity block
8. Simulate delegable Bash command → confirm nudge hook fires with "CEO mode" wording

---

## Verification Artifact

- Primer output showing identity block + assistant announce + rules in correct order
- Grep confirming `[AUTO-IDENTITY: CEO]` appears in session transcript
- Nudge hook fires with "CEO mode" wording on first delegable Bash command

---

## Rollback

- Restore delegation-primer.mjs from backup: `cp ~/.claude/hooks/delegation-primer.mjs.bak ~/.claude/hooks/delegation-primer.mjs` — **`git checkout` does NOT work** for `~/.claude/` files; the backup copy is the only valid rollback mechanism
