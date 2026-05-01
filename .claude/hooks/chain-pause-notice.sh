#!/usr/bin/env bash
# chain-pause-notice.sh — SessionStart hook.
# On every interactive `claude` open, prints PAUSE_NOTICE.md when chain is paused.
# Silent when no chain or status != paused. See PLAN_CHAIN_PER_SESSION_ORCHESTRATION D28.
#
# Fail-mode: FAIL-OPEN. Every error path exits 0 (silently). A SessionStart hook
# that wedges or noises on every shell open would make the harness unusable —
# the chain pause-notice is informational, not gating. Failure modes covered:
#   - missing chain.json                    → exit 0 (not a chain user)
#   - chain-state.mjs read error            → exit 0 (status unknown, stay quiet)
#   - missing PAUSE_NOTICE.md               → exit 0 (paused but no notice yet)
#   - node helper crash on context-emit     → exit 0 (no SessionStart payload)
# To debug: run `bash .claude/hooks/chain-pause-notice.sh </dev/null` and check
# stderr for the node block.

set -u

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" || exit 0

STATE_FILE=".claude/state/chain.json"
NOTICE=".claude/state/chain-sessions/PAUSE_NOTICE.md"

[ -f "$STATE_FILE" ] || exit 0

status=$(node .claude/hooks/lib/chain-state.mjs get "$STATE_FILE" .status 2>/dev/null || echo '')
[ "$status" = "paused" ] || exit 0
[ -f "$NOTICE" ] || exit 0

reason=$(node .claude/hooks/lib/chain-state.mjs get "$STATE_FILE" .pauseReason 2>/dev/null || echo '?')

# Build the additionalContext + emit SessionStart hook JSON via node.
# Pass inputs as env vars to avoid stdin collisions.
export CHAIN_PAUSE_REASON="$reason"
export CHAIN_NOTICE_FILE="$NOTICE"
node -e '
  const fs = require("node:fs");
  const reason = process.env.CHAIN_PAUSE_REASON || "?";
  const notice = fs.readFileSync(process.env.CHAIN_NOTICE_FILE, "utf8");
  const context = [
    "⚠️  CHAIN PAUSED — " + reason,
    "",
    notice,
    "",
    "Act: /chain status   /chain resume   /chain skip   /chain stop",
  ].join("\n");
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context,
    },
  }));
'

exit 0
