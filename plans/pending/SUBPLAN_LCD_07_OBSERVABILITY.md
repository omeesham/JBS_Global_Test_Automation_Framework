# SUBPLAN_LCD_07_OBSERVABILITY — Full Encore audit trail + ledger enrichment

**Status**: Pending
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_04_STALL_HANDLING.md
**Blocks**: none
**Runs-after**: LCD_04
**Collides-with**: SUBPLAN_UPLINK_WAVE2 (ledger), PLAN_MEGA_AUDIT_COPILOT_ERA (reads ledger)
**Model**: claude-opus-4-6
**PermissionMode**: default (PROTECTED files need owner go + SELF_GRANT)
**RiskAcknowledged**: HIGH — ledger schema change must be backward-compatible; activity-log format must match existing parsers

---

## Objective

OWNER HARD REQUIREMENT: every agent action on Encore work must be fully trackable. Close confirmed arena holes: AH-14 (ledger lacks timestamp/cost/provenance), AH-15 (unlocked append + collision-prone IDs), AH-02 (ledger directly writable), T-03 (token costs untracked), T-10 (assistant-layer dispatch indistinguishable). Build: enriched ledger schema, nested sub-agent trace, activity-log parity with solo-Claude, and machine-checkable delegation ratio.

---

## Preconditions

- `copilot-worker.sh:540-549` still contains the current ledger-append logic
- `ledger.jsonl` schema: run_id, mode, model, agent, work_type, effort, exit, ok, secs, exit_reason, stall_warns, attempt, ask_open
- LCD_04 landed (stall-bounce adds fields this plan references)
- Existing `scripts/validate-activity-log.mjs` parses solo-Claude's activity-log format

---

## Step-by-Step

### Phase 1 — Ledger schema enrichment (PROTECTED — copilot-worker.sh)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. `copilot-worker.sh` is in-repo (`.claude/skills/ultra-agents/copilot-worker.sh`) — git checkout IS valid for rollback.

1. Add fields to the ledger row written at `copilot-worker.sh:540-549`:
   ```json
   {
     "run_id": "<UUID-v4>",          // FIX: replace PID-filesize with UUID
     "ts": "<ISO-8601 timestamp>",   // NEW: wall-clock start time
     "ts_end": "<ISO-8601>",         // NEW: wall-clock end time
     "tokens_in": <number>,          // NEW: input tokens (from model response metadata)
     "tokens_out": <number>,         // NEW: output tokens
     "cost_usd": <number>,           // NEW: estimated cost (model×tokens rate)
     "dispatcher": "CEO|chief|chain",// NEW: who initiated this dispatch
     "session_id": "<string>",       // NEW: Claude session that initiated
     "ticket_id": "<string>",        // NEW: ticket filename/ID
     "parent_run_id": "<string>",    // NEW: if this is a bounce/retry, references original
     "depth": <0|1|2>,               // NEW: 0=top-level, 1=chief-dispatched, 2=nested
     "effective_cap": <number>,      // NEW: MAX_WORKERS at time of dispatch
     "sub_agents": [],               // NEW: array of {name, model, secs, ok} for nested helpers
     // ... existing fields preserved
     "mode": "...", "model": "...", "agent": "...", "work_type": "...",
     "effort": "...", "exit": "...", "ok": true, "secs": 0,
     "exit_reason": "...", "stall_warns": 0, "attempt": 1, "ask_open": 0
   }
   ```

2. Replace run_id generation (`copilot-worker.sh:133-135`): use `uuidgen` or `node -e "console.log(crypto.randomUUID())"` instead of `run-$$-<filesize>` to eliminate collision (AH-15, T-06).

### Phase 2 — Ledger integrity (PROTECTED — delegation-gate.mjs)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. `delegation-gate.mjs` is in `~/.claude/hooks/` — file-copy backup required before modification, `git checkout` does NOT work.

3. Close AH-02: Add `ledger.jsonl` path to the PROTECTED list in `delegation-gate.mjs:59-68`. Only the wrapper (`copilot-worker.sh`) should append. Claude direct-writes require SELF_GRANT.

4. Close AH-15 (file-lock): Add `flock` (or PowerShell equivalent) around ledger append in `copilot-worker.sh`:
   ```bash
   flock "$LEDGER.lock" -c "echo '$JSON_ROW' >> '$LEDGER'"
   ```

### Phase 3 — Nested sub-agent trace

5. Workers that spawn sub-agents via the `task` tool already get completion results. On worker exit, the wrapper collects sub-agent info from the worker's stdout/report and populates the `sub_agents` array in the ledger row. Extended schema (R4 — owner hard requirement: track EVERYTHING any agent does, TOP-LEVEL AND NESTED):
   ```json
   "sub_agents": [
     {
       "name": "explore-selectors",
       "model": "claude-haiku-4-5",
       "ts": "<ISO-8601 wall-clock start — wrapper records around task-tool call>",
       "secs": 12,
       "tokens_in": "<number, or null — see surfacing note>",
       "tokens_out": "<number, or null — see surfacing note>",
       "cost_usd": "<number, or null — see surfacing note>",
       "files": ["<file paths from worker DIFF_SUMMARY — see surfacing note>"],
       "work_type": "explore",
       "ok": true
     }
   ]
   ```

   **Field surfacing constraints** (owner MUST know which fields are unreachable and WHY):
   - `ts`: ✅ SURFACEABLE — wrapper records wall-clock timestamp before/after calling the `task` tool.
   - `secs`: ✅ SURFACEABLE — wrapper computes duration from ts/ts_end.
   - `ok`: ✅ SURFACEABLE — task tool returns success/failure.
   - `tokens_in` / `tokens_out` / `cost_usd`: ⚠️ **NOT directly surfaceable from the `task` tool API at nested depth.** The `task` tool returns only the sub-agent's final text output, not structured usage metadata. MITIGATION: workers MUST include tokens/cost in their Parity Report VERIFY_OUTPUT section; the wrapper parses them from the report text using regex. If absent from the report, these fields are `null` with a `_tokens_note: "worker did not self-report"` entry. Tracking gap acknowledged per prosecute-correctness P0 finding.
   - `files`: ⚠️ **Not directly surfaceable.** Workers MUST list changed files in DIFF_SUMMARY; wrapper parses this section. If absent, `files: null` with `_files_note: "worker did not report"`.
   - `work_type`: ✅ SURFACEABLE — wrapper reads from the ticket's WORK_TYPE field before dispatch.

   This gives parent→child chain without a separate ledger row per ephemeral helper.

### Phase 4 — Activity-log parity

6. After each worker completes, the wrapper writes an activity-log entry matching solo-Claude's format:
   ```
   [<ISO-timestamp>] <dispatcher>/<model>/<work-type> — <ticket-id>: <one-line summary>
   Files: <list of files touched>
   Cost: <tokens_in>/<tokens_out> (~$<cost_usd>)
   ```
   Destination: the same activity-log file that solo-Claude writes to (path from `validate-activity-log.mjs`). This ensures the reporting pipeline processes worker actions identically.

### Phase 5 — Machine-checkable delegation ratio

7. Add to the Receipt template (`worker-ext.md:126-142`):
   ```
   ## Delegation Metrics (machine-generated, do not edit)
   - Dispatches this session: <count from ledger where session_id matches>
   - Self-work events logged: <count from self_incidents.log where session_id matches>
   - Nudges fired: <count from session-bash-nudges.json where session_id matches>
   - Delegation ratio: <dispatches / (dispatches + self_work_logged + nudges_fired)>
   - Target: ≥ 0.95
   ```
   **Denominator note**: ratio = `dispatches / (dispatches + self_work_logged + nudges_fired)` — both logged self-work AND nudge-hook fire count are included so unlogged inline reads cannot report clean.

8. The `/final-q` skill reads these metrics. If ratio < 0.95 AND self_work > 0: flag in the final-q output as a CEO discipline gap.

### Phase 6 — Verification

9. Dispatch a test worker → confirm new ledger row contains: UUID run_id, ts, dispatcher, session_id, ticket_id fields
10. Attempt direct ledger write without SELF_GRANT → confirm denied by gate
11. Dispatch with concurrent workers → confirm no corruption (flock working)
12. Check activity-log entry appears after worker completes
13. Verify `validate-activity-log.mjs` parses the new entry format without error

---

## Verification Artifact

- New-format ledger row (pretty-printed JSON showing all fields)
- Gate denial log for unauthorized direct ledger write
- Activity-log entry showing worker action in solo-Claude format
- `/final-q` output showing delegation metrics section

---

## Rollback

- Revert `copilot-worker.sh` ledger-write changes via `git checkout -- .claude/skills/ultra-agents/copilot-worker.sh` (in-repo, git checkout valid; old schema rows still valid — additive fields ignored by old parsers)
- Restore `~/.claude/hooks/delegation-gate.mjs` from backup to remove `ledger.jsonl` from PROTECTED list: `cp ~/.claude/hooks/delegation-gate.mjs.bak ~/.claude/hooks/delegation-gate.mjs` — **`git checkout` does NOT work** for `~/.claude/` files; backup must be taken before modification: `cp ~/.claude/hooks/delegation-gate.mjs ~/.claude/hooks/delegation-gate.mjs.bak`
- Activity-log entries are append-only (harmless to leave)
- Remove delegation-metrics section from Receipt template (`worker-ext.md` is in-repo: `git checkout -- .claude/skills/ultra-agents/worker-ext.md`)
