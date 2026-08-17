#!/usr/bin/env bash
# selfclean-sweep.sh — SessionStart hook (NOT REGISTERED — owner wires in settings.json).
#
# Sev=S2 — graduated by slop2 audit (16-lot, 2026-07-18): 500+ debris files accreted
# over 4 months with no automatic cleanup; gitignore hid them from git status.
#
# PURPOSE
#   Throttled launcher for the self-clean sweeper. On session start:
#   1. Check throttle (24h default) — exit immediately if fresh (<10ms).
#   2. If previous sweep left an unacknowledged report, emit one-liner context.
#   3. Spawn the sweeper detached (background, non-blocking).
#
# FAIL-OPEN
#   Every error path exits 0. A SessionStart hook that wedges or noises on every
#   session open would make the harness unusable. The sweep is informational.
#
# PERFORMANCE BUDGET
#   Must exit in <200ms when throttle is fresh (typical <10ms — one stat call).

set -u

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" || exit 0

STATE_DIR=".claude/state/selfclean"
THROTTLE_FILE="$STATE_DIR/last-sweep.json"
LATEST_REPORT="$STATE_DIR/sweep-latest.md"
CONFIG_FILE=".claude/selfclean-config.json"

# Ensure state dir exists
mkdir -p "$STATE_DIR" 2>/dev/null || exit 0

# Guard: config must exist
[ -f "$CONFIG_FILE" ] || exit 0

# Throttle check — pure bash, no node spawn (must be <200ms)
if [ -f "$THROTTLE_FILE" ]; then
  # Get file age in seconds using portable stat
  if command -v stat >/dev/null 2>&1; then
    file_epoch=$(stat -c %Y "$THROTTLE_FILE" 2>/dev/null || stat -f %m "$THROTTLE_FILE" 2>/dev/null || echo 0)
    now_epoch=$(date +%s 2>/dev/null || echo 0)
    if [ "$file_epoch" != "0" ] && [ "$now_epoch" != "0" ]; then
      age_seconds=$(( now_epoch - file_epoch ))
      # 86400 = 24 hours in seconds
      [ "$age_seconds" -lt 86400 ] && exit 0
    fi
  fi
fi

# Report leg: if previous sweep report exists and is unacknowledged, emit context
if [ -f "$LATEST_REPORT" ]; then
  summary=$(head -5 "$LATEST_REPORT" 2>/dev/null | grep -o 'quarantined [0-9]* items\|announced [0-9]* items' || echo "items found")
  node -e "
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: 'Self-clean: $summary — report .claude/state/selfclean/sweep-latest.md',
      },
    }));
  " 2>/dev/null || true
fi

# Spawn sweeper detached via Node's child_process.spawn({detached:true}).
# Bash `&`/`disown` does not truly detach node.exe on Windows — the shell
# waits for the child. --spawn-detached makes sweep.mjs re-spawn itself as a
# fully detached process and exit immediately, so this call returns at once
# on every platform.
node ".claude/hooks/lib/selfclean/sweep.mjs" --spawn-detached

exit 0
