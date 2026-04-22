#!/usr/bin/env bash
# chain-orchestrator.sh — Stop hook that advances chain after /final-q verdict.
# Runs AFTER final-q-gate.sh (which guarantees /final-q was invoked before stop).
# Emits no JSON decision (doesn't block stop); side-effects only (state + spawn).
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

input=$(cat 2>/dev/null || true)

# 1. Skip if recursive
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# 2. No-op if no active chain
cs_exists || exit 0
status=$(cs_get .status 2>/dev/null || echo '')
[ "$status" = "running" ] || exit 0

# 3. Extract transcript path
transcript=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
  pause_chain "transcript-not-found"
  exit 0
fi

# 4. Parse verdict
verdict=$(parse_verdict "$transcript")

# 5. Identify current subplan
idx=$(cs_get .currentIndex)
current_file=$(cs_get ".queue.$idx.file" 2>/dev/null || echo 'unknown')
now=$(date -Iseconds)

# 6. Record outcome for current subplan
case "$verdict" in
  GREEN)
    cs_set ".queue.$idx.status" '"completed"'
    cs_set ".queue.$idx.verdict" '"GREEN"'
    cs_set ".queue.$idx.endedAt" "\"$now\""
    cs_history_append "{\"subplan\":\"$current_file\",\"verdict\":\"GREEN\",\"endedAt\":\"$now\"}"
    ;;
  YELLOW|RED|NONE)
    cs_set ".queue.$idx.status" '"failed"'
    cs_set ".queue.$idx.verdict" "\"$verdict\""
    cs_set ".queue.$idx.endedAt" "\"$now\""
    cs_history_append "{\"subplan\":\"$current_file\",\"verdict\":\"$verdict\",\"endedAt\":\"$now\"}"
    pause_chain "verdict-$verdict: $current_file"
    exit 0
    ;;
esac

# 7. Guard cascade — fail fast; pause with specific reason
check_stop_marker || { rm -f "$CHAIN_STATE_DIR/chain.STOP"; cs_set .status '"aborted"'; write_pause_notice "STOP-marker (aborted)"; exit 0; }
check_branch      || { pause_chain "branch-drift"; exit 0; }

# Advance index
new_index=$((idx + 1))
queue_len=$(cs_get '.queue' | node -e "const a=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(a.length);")
if [ "$new_index" -ge "$queue_len" ]; then
  cs_set .status '"done"'
  {
    echo "# Chain COMPLETE — $now"
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

# D24 — increment counters at SPAWN
cs_inc .budget.executedToday
cs_inc .budget.executedThisWeek
cs_inc .budget.executedThisBatch

cs_set ".queue.$new_index.status" '"running"'
cs_set ".queue.$new_index.startedAt" "\"$(date -Iseconds)\""

# 9. Spawn — default is `nohup claude -p ...`; overridable via CHAIN_SPAWN_CMD for tests.
SPAWN_CMD="${CHAIN_SPAWN_CMD:-nohup claude -p}"

# shellcheck disable=SC2086
$SPAWN_CMD "/execute $next_file" \
  --model "$next_model" \
  --effort "$next_effort_cli" \
  --permission-mode "$next_perm" \
  > "$next_log" 2>&1 &
child_pid=$!
echo "$child_pid" > "$next_pidfile"
cs_set ".queue.$new_index.pid" "$child_pid"

exit 0
