# SUBPLAN_LCD_04_STALL_HANDLING — Upgrade stall guard to warn+bounce

**Status**: DONE
**Executed**: 2026-07-16
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

---

## Execution Summary

**Council-built (opus-4.6 R1 + Claude-side Opus escalation seat after 2 copilot cap-deaths), gpt-5.5 cross-reviewed (GREEN, independent 43/43 battery re-run, zero defects), installed by dispatcher after Rutvik in-chat GO 2026-07-16 ("go lcd04"), then proven on a REAL stalled dispatch.**

### Phase 1 — Config: DONE
3 keys (`stall_guard_action: "warn+bounce"`, `stall_guard_bounce_delay_s: 60`, `stall_guard_max_bounces: 2`) landed at BOTH declaration points: `.claude/guardrail-config.json` (this plan's Phase-1 location, with LR-069 comment) and `C:\Users\rutvi\.claude\delegation\config.json` (the wrapper's actual runtime read — build assumption (c), dispatcher-accepted; backup config.json.bak-lcd04). Home write via SELF_GRANT ceremony (Rutvik GO on record; grants audit-logged).

### Phase 2 — Wrapper bounce: DONE
`copilot-worker.sh` installed byte-identical to the reviewed staging build (`diff-of-diffs` empty; backup `copilot-worker.sh.bak-pre-lcd04` in `.claude/state/ua-worker/lcd04-build-0716-artifacts/`). Delta: env-overridable config reads with numeric validation + once-per-episode bounce (cumulative cap across episodes) + `STALL-EXHAUST` ledger/stderr on cap + NO kill path (reviewer lane-3 grep clean; plan line 70 honored).

### Phase 3 — Nudge anti-rescue: DONE
`delegation-nudge.mjs` installed (backup .bak-lcd04): fresh (<10min) stall-queue file appends "A worker just stalled — a bounce ticket is queued. Self-rescue = routing incident. Dispatch the bounce instead." to the WARN reason. Live-verified on the installed hook: CEO prefix + anti-rescue sentence both PASS (isolated counter/telemetry paths).

### Phase 4 — Fallback: DONE (staged-proven)
Max-bounces P4 probe: 3rd stall episode produces no 3rd bounce file + STALL-EXHAUST emitted (probes.verify.txt, 43/43 incl. P8=25/25 LCD_03 regression; reviewer independently re-ran 43/43).

### Phase 5 — Verification: DONE with a REAL stall (LR-059)
Run `lcd04-stallprobe-0716` (gpt-5.5, deliberate `sleep 400` silence): ledger row `stall_warns:1, secs:467, exit_reason:success`; stderr shows `STALL-WARN at elapsed=301s` then `STALL-BOUNCE READY: <real stall-queue path> queued. Dispatch it or wait for original — DO NOT RESCUE INLINE.` (bounce filename: lcd04-stallprobe-0716-bounce.md); bounce file contains the original ticket + `## STALL-CONTEXT` ("stalled at 360s... attempt 2... escalate +1 tier per worker-ext.md:73-85") — evidence copy at `.claude/state/ua-worker/lcd04-stallprobe-0716-artifacts/bounce-file-evidence.md`; worker was NOT killed (completed its 400s sleep, wrote `done.txt`). Plan Phase-5 items 6/7/8 all live-proven; item 9 (warn fallback) staged-proven (P5).

### Verification Artifact (D23)
`ls C:\Users\rutvi\.claude\delegation\stall-queue\` after any future 360s+ silent run → `<run-id>-bounce.md` containing `## STALL-CONTEXT`; ledger row gains `stall_warns≥1` while the worker still completes.

### Bounce record (honest ledger)
Build R1 (120cr): cap-death #7 — code landed, battery missing. R2 (60cr): cap-death #8, zero output (context-read burn). Escalated to Claude-side Opus subagent per the 2-consecutive-failures precedent ([UA-SPAWN-JUSTIFIED] token logged) — delivered 43/43. Review green first pass. Stall probe green first pass. Lessons recorded: multi-target builds 150+, per-target sizing.
