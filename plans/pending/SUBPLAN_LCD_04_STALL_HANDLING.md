# SUBPLAN_LCD_04_STALL_HANDLING — Upgrade stall guard to warn+bounce

**Status**: Pending
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_02_ENFORCEMENT_HOLES.md
**Blocks**: SUBPLAN_LCD_07
**Runs-after**: LCD_02
**Collides-with**: none
**Model**: claude-opus-4-6
**PermissionMode**: default (PROTECTED files need owner go + SELF_GRANT)
**RiskAcknowledged**: MEDIUM — stall-bounce creates duplicate dispatches if original worker recovers

---

## Objective

The stall guard is WARN-only (`worker-ext.md:116`, `copilot-worker.sh:492-496`): it logs STALL-WARN at 300s but never kills or re-dispatches, creating rescue temptation. Upgrade to `warn+bounce`: pre-write a bounce ticket so Claude's path of least resistance is "dispatch the bounce" (one command), not "do it myself" (many commands). Preserve the existing escalation ladder (`worker-ext.md:73-85`) and work-type timeouts (up to 1800s).

---

## Preconditions

- `copilot-worker.sh:492-496` still contains the stall-warn logic with `_stall_episode` flag
- `guardrail-config.json` still contains `stall_guard_*` keys
- Work-type timeout table still exists in wrapper (600-1800s per type)
- LCD_02 landed (nudge hook can reference stall state in its anti-rescue message)

---

## Step-by-Step

### Phase 1 — Configuration (PROTECTED — guardrail-config.json)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. `.claude/guardrail-config.json` is in-repo — `git checkout` IS valid for rollback.

1. Add to `.claude/guardrail-config.json`:
   ```json
   "stall_guard_action": "warn+bounce",
   "stall_guard_bounce_delay_s": 60,
   "stall_guard_max_bounces": 2
   ```
   Meaning: 300s → STALL-WARN (existing). 360s (300+60) → pre-write bounce ticket. Max 2 bounces before fallback.

### Phase 2 — Bounce ticket pre-writing (PROTECTED — copilot-worker.sh)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. `copilot-worker.sh` is in-repo (`.claude/skills/ultra-agents/copilot-worker.sh`) — `git checkout` IS valid for rollback.

2. In `copilot-worker.sh`, after the STALL-WARN log (line ~496), add bounce logic:
   ```bash
   if [[ "$_stall_episode" == "1" && "$STALL_ACTION" == "warn+bounce" ]]; then
     _bounce_delay=$(( STALL_WARN_THRESHOLD + STALL_BOUNCE_DELAY ))
     if [[ $(( SECONDS - _last_output_time )) -ge $_bounce_delay ]]; then
       # Pre-write bounce ticket (copy original + stall context)
       _bounce_file="$HOME/.claude/delegation/stall-queue/${RUN_ID}-bounce.md"
       cp "$TICKET_FILE" "$_bounce_file"
       cat >> "$_bounce_file" <<'STALL'
   ## STALL-CONTEXT
   Prior dispatch stalled at ${_bounce_delay}s. This is attempt N+1.
   If the same stall occurs, escalate +1 tier per worker-ext.md:73-85.
   STALL
       # Surface to Claude
       echo "STALL-BOUNCE READY: $_bounce_file queued. Dispatch it or wait for original — DO NOT RESCUE INLINE." >&2
     fi
   fi
   ```

3. DO NOT KILL the stalled worker. It might be thinking (work-type timeout handles hard death at 600-1800s). The bounce runs IN PARALLEL — first to finish wins; the other's output is discarded at verdict time.

### Phase 3 — Anti-rescue integration with nudge hook

4. In `delegation-nudge.mjs` (created by LCD_02): when the nudge fires AND a `stall-queue/*.md` file exists with age <10min, include in the nudge text: "A worker just stalled — a bounce ticket is queued. Self-rescue = routing incident. Dispatch the bounce instead."

### Phase 4 — Fallback after max bounces

5. After 2 bounces (both stalled): log a `STALL-EXHAUST` event to ledger. The existing escalation ladder (`worker-ext.md:73-85`) takes over: failure classification → ticket repair → tier escalation → cross-family review. Only AFTER the full ladder exhausts does AUTO_SELF activate with forced `self_incidents.log` entry.

### Phase 5 — Verification

6. Simulate stall: dispatch a worker that produces no output for 360s → confirm bounce ticket appears in `~/.claude/delegation/stall-queue/`
7. Confirm original worker is NOT killed (still running)
8. Confirm nudge hook mentions the bounce when Claude attempts inline Bash during stall
9. Test `stall_guard_action: "warn"` fallback → confirm old behavior (WARN-only, no bounce)

---

## Verification Artifact

- Bounce ticket file content showing original ticket + STALL-CONTEXT appendix
- Stderr output showing "STALL-BOUNCE READY" message
- Ledger row showing STALL-WARN + timing

---

## Rollback

- Set `stall_guard_action: "warn"` in guardrail-config.json (reverts to current behavior)
- Delete `~/.claude/delegation/stall-queue/` directory
- Revert copilot-worker.sh bounce logic (`git checkout -- copilot-worker.sh`)
