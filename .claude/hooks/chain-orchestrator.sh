#!/usr/bin/env bash
# chain-orchestrator.sh — Stop hook that advances chain after /final-q verdict.
# Emits no JSON decision (doesn't block stop); side-effects only (state + spawn).
# Note: the companion final-q-gate.sh (which previously blocked stops lacking a
# /final-q invocation) was removed 2026-04-23 — /execute Phase 4 skill-mandate
# is now the only enforcement, and this hook pauses with verdict-NONE when the
# emission is missing.
#
# Design refs (see PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md):
#   D1  — spawn via `nohup claude -p ... &`
#   D5  — verdict parsed from transcript (no IPC)
#   D7  — model/effort/permissionMode read from chain.json.queue[i]
#   D8  — branch drift guard
#   D10 — STOP marker panic kill
#   D17 — effort CLI values (low|medium|high|xhigh|max); xhigh needs CLI v2.1.111+
#   D21 — batch counter + daily/weekly caps
#   D22 — mkdir-based locking (flock unavailable)
#   D23 — verdict regex anchored on LAST "## /final-q audit" heading
#   D24 — counters increment at SPAWN time, not completion time
#   D26 — bypassPermissions requires RiskAcknowledged=true (enforced at /chain build,
#         re-verified here via queue entry schema)
#   D29 — env inheritance: nohup passes parent env (ENCORE_*, PATH, etc.)
#
# Idempotency (SP-CCE-05 P5.1, 2026-04-27):
#   `node parse-verdict.mjs --prep-spawn` writes a per-spawn marker file at
#   `.claude/state/chain-sessions/.spawn.<idx>.<file>.marker`. If the marker
#   already exists when this hook fires (Stop event re-fired), the budget
#   counters are NOT re-incremented and `nohup claude -p ...` is NOT re-spawned.
#   Default mode = enforce. Soft-rollout mode (`CHAIN_IDEMPOTENCY_MODE=soft`)
#   logs would-have-skipped events to chain-sessions/idempotency-soft-log.txt
#   while still incrementing — used to observe one chain cycle before flipping
#   to enforce. V3 retry test in SUBPLAN_CCE_05 acceptance criteria validates
#   single-increment under simulated double-fire.
#
# Idempotency (V3.1, 2026-04-27 — post-advance double-fire):
#   The P5.1 marker protects same-slot re-fires (idx-after-advance hasn't been
#   reached yet). It does NOT protect post-advance re-fires: Stop event A fires
#   with idx=0, --record-outcome 0 GREEN advances state, currentIndex=1, B is
#   spawned; Stop event A fires AGAIN (transcript-flush race / undetached child)
#   so this hook reads idx=1 and would call --record-outcome 1 GREEN B.md against
#   a freshly-spawned "running" slot — corrupting B by marking it completed/GREEN
#   before it ran. V3.1 closes this: chain-orchestrator now passes the transcript
#   path as a 5th arg, --record-outcome SHA-256-hashes it, and rejects the call
#   with "duplicate" if the hash matches any sibling slot's endedAtTranscriptHash.
#   This hook handles "duplicate" as a silent exit (mirroring the "duplicate"
#   case from --prep-spawn).
#
# Migration (SP-CCE-05 P5.5, 2026-04-27):
#   Verdict-recording (case statement, lines 67-83 of pre-refactor) and budget-
#   incrementing (5× cs_inc + cs_set, lines 137-143 of pre-refactor) now run as
#   single atomic Node calls via `node parse-verdict.mjs --record-outcome` and
#   `node parse-verdict.mjs --prep-spawn`. Eliminates 9 lock-acquire/release
#   round-trips per Stop event, removes manually-escaped JSON construction in
#   shell (the `cs_history_append "{\"subplan\":\"$current_file\",...}"` line was
#   the canonical fragile-shell-quoting case), and consolidates the
#   double-counting bug fix (P5.1) with the lock-fragility fix (P5.5) on one
#   surface.
#
# Fail-mode (SP-CCE-05 P5.3, 2026-04-27): FAIL-CLOSED on lock acquisition error
#   and on any Node helper non-zero exit. The orchestrator's job is to advance
#   the chain — silently double-spawning or double-counting under concurrency
#   would corrupt state and exhaust the daily/weekly cap. Failure modes:
#     - chain.json missing                  → exit 0 silently (no chain)
#     - status != running                   → exit 0 silently (chain not active)
#     - transcript_path missing/unreadable  → pause_chain "transcript-not-found"; exit 0
#     - parse-verdict.mjs crash             → pause_chain "verdict-parse-error"; exit 0
#     - --record-outcome non-zero exit      → pause_chain "record-outcome-failed"; exit 0
#     - --prep-spawn non-zero exit          → pause_chain "prep-spawn-failed"; exit 0
#     - --prep-spawn returns "duplicate"    → exit 0 silently (idempotency hit; no spawn)
#     - branch drift                        → pause_chain "branch-drift"; exit 0
#     - cap reached                         → pause_chain "{kind}-cap-reached"; exit 0
#   Always exit 0 from the hook itself (Stop hooks must not block stop). The
#   chain enters paused state on every fault path, which surfaces via the
#   chain-pause-notice SessionStart hook on the next interactive open.
#
# CLI-version clamp: if local `claude --version` < 2.1.111, authoring-tag `xhi`
# (authoring-scale "extra-high") is clamped to CLI `--effort high` via
# map_effort_for_cli. Upgrade with `claude update` to unlock Opus 4.7 xhigh.
#
# Test hook: set CHAIN_SPAWN_CMD to override the `claude -p` invocation. E.g.:
#   CHAIN_SPAWN_CMD="echo MOCK-SPAWN" bash chain-orchestrator.sh < input.json
# The spawn line becomes:  $CHAIN_SPAWN_CMD /execute SUBPLAN.md  --model ... > log 2>&1

set -u

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" || exit 0

# shellcheck disable=SC1091
source "$REPO_ROOT/.claude/hooks/lib/chain-guards.sh"

PARSE_VERDICT_MJS="$REPO_ROOT/.claude/hooks/lib/parse-verdict.mjs"

input=$(cat 2>/dev/null || true)

# 1. Skip if recursive
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# 2. No-op if no active chain
cs_exists || exit 0
status=$(cs_get .status 2>/dev/null || echo '')
[ "$status" = "running" ] || exit 0

# 3. Extract transcript path from the Stop event.
transcript=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

# 3.5 Identify the subplan this chain is currently waiting on.
idx=$(cs_get .currentIndex)
current_file=$(cs_get ".queue.$idx.file" 2>/dev/null || echo 'unknown')

# 3.6 RC-2 session-ownership guard (2026-07-07). The Stop hook fires on EVERY
# session's turn-end — the interactive launcher, a manual interrupt (Stop button /
# Ctrl-C), or an unrelated subplan's headless run — not just the headless
# `/execute <current_file>` session it means to grade. Only that session's
# transcript opens with the user prompt "/execute <current_file>". Any other
# stopping session → silent exit (no verdict recorded, no pause, no spawn).
# Without this guard, an interactive interrupt stamps verdict-NONE onto the
# running subplan and poisons the chain — observed 2026-07-06: NM2305 was paused
# 22s after spawn (a pending interrupt on the interactive launcher) while its own
# headless session was still alive. See parse-verdict.mjs transcriptOwnsSubplan()
# + LR-042 §C.  Fail-safe: missing/unreadable transcript or any error → not-owned
# → silent exit (never poison; a genuine headless transcript is present+readable).
if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
  exit 0
fi
owns=$(node "$PARSE_VERDICT_MJS" --owns-subplan "$transcript" "$current_file" 2>/dev/null || echo 'no')
[ "$owns" = "yes" ] || exit 0

# 4. Parse verdict (confirmed: this Stop is the genuine headless run of current_file).
verdict=$(parse_verdict "$transcript")
if [ -z "$verdict" ]; then
  pause_chain "verdict-parse-error"
  exit 0
fi

# 5. (idx + current_file resolved at step 3.5, above the ownership guard.)

# 6. Record outcome atomically (P5.5 — replaces case statement + 4 cs_set + cs_history_append)
# Pass transcript path as 5th arg so --record-outcome can SHA-256-hash it for V3.1
# post-advance double-fire detection (cross-slot transcript-hash match → "duplicate").
outcome=$(node "$PARSE_VERDICT_MJS" --record-outcome "$CHAIN_STATE_FILE" "$idx" "$verdict" "$current_file" "$transcript" 2>/dev/null || echo '')
if [ -z "$outcome" ]; then
  pause_chain "record-outcome-failed: idx=$idx verdict=$verdict"
  exit 0
fi
# Parse multi-line outcome: first line = action, optional second line = "assumptions-list:<...>"
# (Phase 5.5, PLAN_UPLINK_PROTOCOL P5.5: a GREEN v3 audit with a non-empty Assumptions list
# emits "advance\nassumptions-list:<verbatim_list>" so the orchestrator can log it.)
outcome_action=$(printf '%s' "$outcome" | head -n 1)
outcome_assumptions=$(printf '%s' "$outcome" | sed -n 's/^assumptions-list://p' | head -n 1)
if [ "$outcome_action" = "duplicate" ]; then
  # V3.1 (2026-04-27): Stop event re-fired AFTER currentIndex advanced. The transcript
  # hash matches a sibling slot's endedAtTranscriptHash, so this is the same Stop event
  # we already processed. Refuse to re-record (would corrupt the freshly-spawned next
  # subplan as completed/GREEN before it actually runs) and refuse to advance/spawn
  # again (the prep-spawn marker would also catch it, but defense in depth). Silent exit.
  exit 0
fi
if [ "$outcome_action" = "assumptions-line-missing" ]; then
  # Phase 5.5: GREEN verdict but v3 audit block lacks the mandatory **Assumptions**: line.
  # record-outcome already set state.status=paused with the distinct reason; write the notice
  # with that same verbatim reason so Rutvik sees WHY it paused (not the generic verdict-NONE).
  write_pause_notice "assumptions-line-missing: $current_file"
  exit 0
fi
if [ "$outcome_action" = "pause" ]; then
  # record-outcome already set state.status=paused for non-GREEN; just write the notice.
  write_pause_notice "verdict-$verdict: $current_file"
  exit 0
fi
# outcome_action == "advance" → GREEN, continue to spawn next.

# Phase 5.5: If a non-empty assumptions list rode this GREEN, log it for Rutvik.
# Chain advances normally — no stall. The list is appended to ASSUMPTIONS_LOG.md
# (discoverable via /chain status) and an uplink-ledger row for the audit trail.
if [ -n "$outcome_assumptions" ]; then
  _assumptions_log="$CHAIN_STATE_DIR/chain-sessions/ASSUMPTIONS_LOG.md"
  {
    if [ ! -f "$_assumptions_log" ]; then
      printf '# Assumptions Log\n\nCaptures non-empty assumptions that rode a GREEN verdict.\n\n'
    fi
    printf '## %s — %s\n\n%s\n\n' "$current_file" "$(date -Iseconds)" "$outcome_assumptions"
  } >> "$_assumptions_log"
  _uplink_ledger="$HOME/.claude/delegation/uplink-ledger.jsonl"
  mkdir -p "$(dirname "$_uplink_ledger")"
  _run_id=$(cs_get .branch 2>/dev/null || echo 'unknown')
  printf '{"ts":"%s","run_id":"%s","class":"green-assumption","subplan":"%s","assumptions":"%s"}\n' \
    "$(date -Iseconds)" \
    "$_run_id" \
    "$current_file" \
    "$(printf '%s' "$outcome_assumptions" | sed 's/\\/\\\\/g; s/"/\\"/g')" \
    >> "$_uplink_ledger"
fi

# 7. Guard cascade — fail fast; pause with specific reason
check_stop_marker || { rm -f "$CHAIN_STATE_DIR/chain.STOP"; cs_set .status '"aborted"'; write_pause_notice "STOP-marker (aborted)"; exit 0; }
check_branch      || { pause_chain "branch-drift"; exit 0; }

# Advance index
new_index=$((idx + 1))
queue_len=$(cs_get '.queue' | node -e "const a=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(a.length);")
if [ "$new_index" -ge "$queue_len" ]; then
  cs_set .status '"done"'
  {
    echo "# Chain COMPLETE — $(date -Iseconds)"
    echo ""
    echo "All $queue_len subplans finished."
    echo ""
    echo "## Summary"
    echo "- status: done"
    echo "- executedThisBatch: $(cs_get .budget.executedThisBatch)"
    echo "- executedToday:     $(cs_get .budget.executedToday)"
    echo "- executedThisWeek:  $(cs_get .budget.executedThisWeek)"
  } > "$CHAIN_STATE_DIR/chain-sessions/COMPLETE_NOTICE.md"
  exit 0
fi

# Caps checked BEFORE spawn (D24 — counts at spawn time)
check_cap batch  || { pause_chain "batch-cap-reached"; exit 0; }
check_cap daily  || { pause_chain "daily-cap-reached"; exit 0; }
check_cap weekly || { pause_chain "weekly-budget-reached"; exit 0; }

cs_set .currentIndex "$new_index"

# 8. Resolve spawn params for next subplan
next_file=$(cs_get ".queue.$new_index.file")
next_model=$(cs_get ".queue.$new_index.model")
next_effort_auth=$(cs_get ".queue.$new_index.effort")
next_perm=$(cs_get ".queue.$new_index.permissionMode")

# Clamp effort to CLI-supported value
next_effort_cli=$(map_effort_for_cli "$next_effort_auth")

# D26 — bypassPermissions requires RiskAcknowledged
if [ "$next_perm" = "bypassPermissions" ]; then
  risk_ack=$(cs_get ".queue.$new_index.riskAcknowledged" 2>/dev/null || echo 'false')
  if [ "$risk_ack" != "true" ]; then
    pause_chain "bypassPermissions requires RiskAcknowledged=true in subplan frontmatter ($next_file)"
    exit 0
  fi
fi

mkdir -p "$CHAIN_STATE_DIR/chain-sessions"
next_log="$CHAIN_STATE_DIR/chain-sessions/${next_file}.log"
next_pidfile="$CHAIN_STATE_DIR/chain-sessions/${next_file}.pid"

# 9. Idempotent prep-spawn (P5.1+P5.5 — replaces 3× cs_inc + 2× cs_set + adds marker)
# Mode default = enforce; CHAIN_IDEMPOTENCY_MODE=soft for one-cycle observation rollout.
prep_out=$(node "$PARSE_VERDICT_MJS" --prep-spawn "$CHAIN_STATE_FILE" "$new_index" "$next_file" 2>/dev/null || echo '')
case "$prep_out" in
  "duplicate")
    # Marker already existed (Stop hook fired twice for same advance event).
    # In enforce mode, refuse to re-spawn or re-increment. Silent exit.
    exit 0
    ;;
  "first"|"soft-skip")
    : # Proceed to spawn.
    ;;
  *)
    pause_chain "prep-spawn-failed: idx=$new_index file=$next_file out='$prep_out'"
    exit 0
    ;;
esac

# 10. Spawn — default is `nohup claude -p ...`; overridable via CHAIN_SPAWN_CMD for tests.
SPAWN_CMD="${CHAIN_SPAWN_CMD:-nohup claude -p}"

# RC-1 (2026-07-07): On Git-Bash/MSYS (this repo's shell on Windows), a bare
# "/execute …" argument passed to the native claude(node).exe is rewritten by
# POSIX-path conversion into "C:/Program Files/Git/execute …" — the slash-command
# never reaches the headless session, which then does no plan work and exits
# verdict-NONE. This bit the very first real chain run (2026-07-06): the manual
# launch AND this auto-advance spawn both mangled. MSYS2_ARG_CONV_EXCL='*'
# disables the conversion for THIS spawn only (harmless no-op env var on
# Linux/macOS). Verified: without it argv[0] becomes the Git-install path; with
# it "/execute SUBPLAN_X.md" --model … passes through byte-for-byte. See LR-042 §C.
# shellcheck disable=SC2086
MSYS2_ARG_CONV_EXCL='*' $SPAWN_CMD "/execute $next_file" \
  --model "$next_model" \
  --effort "$next_effort_cli" \
  --permission-mode "$next_perm" \
  > "$next_log" 2>&1 &
child_pid=$!
echo "$child_pid" > "$next_pidfile"
cs_set ".queue.$new_index.pid" "$child_pid"

exit 0
