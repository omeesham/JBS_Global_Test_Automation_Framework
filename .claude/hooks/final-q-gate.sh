#!/usr/bin/env bash
# final-q-gate.sh — Stop hook that blocks session-end if a completion claim was made
# without running /final-q first. Exits silently otherwise.
#
# Registered in .claude/settings.json under hooks.Stop.
# Design rules (keep simple — see .claude/skills/final-q/SKILL.md anti-over-engineering):
#   - Skip if stop_hook_active=true (prevent infinite loops).
#   - Skip if /final-q was invoked in the last ~200 lines of transcript.
#   - Block stop ONLY if completion phrases appear in the last ~80 transcript lines.
#   - Emit block-reason via JSON to stdout; the harness surfaces it to the model.
#
# To disable: remove the Stop entry from .claude/settings.json or rename this file.

set -u

# Read hook input JSON from stdin
input=$(cat 2>/dev/null || true)

# Skip if already in a stop-hook continuation (prevents infinite loop)
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Extract transcript_path with sed (portable, no python dep)
transcript_path=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

# If /final-q already invoked recently, audit is done — let the stop proceed.
if tail -n 300 "$transcript_path" 2>/dev/null | grep -qi 'final-q'; then
  exit 0
fi

# Scan last ~80 transcript lines for completion phrases.
if tail -n 80 "$transcript_path" 2>/dev/null | grep -qiE '(^|[^a-z])(all done|all tasks|fully (done|complete)|task complete|completed successfully|everything is done|wrapping up|session complete|finished the|all set|handoff time)([^a-z]|$)'; then
  # Block the stop. stdout JSON becomes a user-visible reminder that forces
  # the model to continue and invoke /final-q.
  cat <<'JSON'
{"decision": "block", "reason": "Completion phrase detected in recent messages. Before ending this turn, invoke /final-q to audit the original todo list (tag every item: done/partial/skipped/deferred/failed/ignored/screwed, with one-sentence notes for non-done items, plus budget check against 400k soft / 500k hard thresholds). Skip only if the session was trivial (1 obvious task, zero skips)."}
JSON
  exit 0
fi

# Default: let the stop proceed.
exit 0
