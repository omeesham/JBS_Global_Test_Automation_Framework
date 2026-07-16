# SUBPLAN_LCD_03_COMPACTION_SURVIVAL — Make CEO identity survive /compact

**Status**: DONE
**Executed**: 2026-07-16
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

   **Note**: `session-role.json` was removed from this design per `.claude/state/ua-worker/prosecute-correctness/result.md` OVERREACH finding (refute-gpt:17-18). The stale-re-fire machinery that depended on it was never proven to work at SessionStart. The nudge hook's own `session-bash-nudges.json` provides sufficient wording context without a separate role-state file.

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

---

## Execution Summary

**Delivered under the council regime (ONLY-COPILOT): opus-4.6 built, gpt-5.5 cross-reviewed, Claude dispatched/verified/installed.**

### Phase 1 — Primer identity block: DONE
- Identity block (verbatim per this plan's lines 40-47) injected into `delegation-primer.mjs` ON-mode + state-absent-fail-safe branches, in the exact plan order: `ASSISTANT MODE` line → `═══ YOU ARE THE CEO ═══` block (with `[AUTO-IDENTITY: CEO …]` token) → existing DELEGATION-FIRST rules + lessons splice.
- **Dispatcher design deviation (documented, deliberate)**: the plan predates the 2026-07-16 `/assistants` master switch — when `assistant: "off"` (explicit) the primer emits NO CEO identity and NO token; Claude-solo means solo. State-absent still fail-safes to CEO harness.
- Installed to `C:\Users\rutvi\.claude\hooks\delegation-primer.mjs` (backup: `C:\Users\rutvi\.claude\hooks\delegation-primer.mjs.bak-lcd03`). Owner authorization: Rutvik in-chat blanket GO 2026-07-16 ("Just go with everything that is ideal, best, long term") + LCD_02 apply precedent; install disclosed loudly in chat at apply time.
- Minor addition beyond plan text: `PRIMER_*` env-overridable config paths — required by the build ticket's own probe rule (probes must never touch real home state); defaults unchanged in real sessions.

### Phase 2 — Nudge CEO wording: DONE
- Count-1 WARN reason now starts `You are in CEO mode this session — delegate this. ` (prefix prepends on all warn counts — dispatcher-accepted assumption; escalation content preserved); count ≥3 escalation text + dispatch-reset behavior unchanged; assistant-off exits silently (re-asserted by probe).
- Installed to `C:\Users\rutvi\.claude\hooks\delegation-nudge.mjs` (backup: `C:\Users\rutvi\.claude\hooks\delegation-nudge.mjs.bak-lcd03`).

### Phase 3 — Verification: DONE (three independent layers)
1. **Builder probes (staging)**: 25/25 — P1-P7 new + P8 = full LCD_02 11-case regression battery; tee at `.claude/state/ua-worker/lcd03-build-0716-artifacts/probes.verify.txt`; `node --check` clean ×2.
2. **Cross-provider review (gpt-5.5, independent re-execution)**: re-ran the battery itself 25/25 + diff audit + char-level contract fidelity + probe-vacuity audit + LR-069 announce-tier check — verdict GREEN, 0 defects; `.claude/state/ua-worker/lcd03-review-0716-artifacts/verdict.md`.
3. **Live install battery (Claude, on the INSTALLED hooks)**: 8/8 — ON-mode ordering (plan items 4-5,7), real assistant-state OFF flip → no CEO block (restored in finally), idempotent double-fire = post-compact SessionStart re-fire simulation (plan item 6), nudge count-1 CEO wording + count-3 escalation (plan item 8), exempt-command silence.

### Verification Artifact (D23)
- `node C:\Users\rutvi\.claude\hooks\delegation-primer.mjs` with stdin `{"cwd":"C:/Users/rutvi/projects/encore_framework"}` → output contains `ASSISTANT MODE`, then `═══ YOU ARE THE CEO ═══`, then `[AUTO-IDENTITY: CEO`, then `DELEGATION-FIRST IS LIVE` in that index order.
- Grep-able audit token: `[AUTO-IDENTITY: CEO — structural, primer-asserted, survives compaction]` appears in every ON-mode session start from now on.

### Bounce record (honest ledger)
- Build attempt 1 (`lcd03-build-0716`, 120cr): died on final call — 3 probe payloads had a PowerShell double-escape cwd bug (worker self-diagnosed); built files unaffected. Recorded `failed` + dispatcher lesson (payload-authoring rule → ticket DOCTRINE).
- Bounce R2 (`lcd03-build-0716-r2`, 40cr, 136s): landed-vs-missing inventory → 25/25, incl. de-vacuizing P7. Recorded `bounced-then-green`.
- Review (`lcd03-review-0716`, 60cr): GREEN first pass. Recorded `green`.

### Rollback
`cp C:\Users\rutvi\.claude\hooks\delegation-primer.mjs.bak-lcd03 C:\Users\rutvi\.claude\hooks\delegation-primer.mjs` (same pattern for nudge) — git checkout does NOT apply to `~/.claude` files.
