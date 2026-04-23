#!/usr/bin/env bash
# rubber-stamp-gate.sh — Stop hook: block end-of-turn when the assistant emits
# a rubber-stamp completion phrase ("nothing to fix", "all clean", etc.) in
# response to a user review/correctness query, without any artifact-reading
# tool call since the user's question.
#
# Structural enforcement of claim-vs-artifact cross-check. Catches the AUD-001
# / ALL-030 failure mode that /final-q Step 4.5 and /audit Step 2.5 only
# address procedurally. Hook wins where skills can't — fires on every turn.
#
# Mechanism (delegated to lib/check-rubberstamp.mjs):
#   1. Parse JSONL transcript.
#   2. If last assistant message contains a rubber-stamp phrase AND
#      3. last user message before it contains a review-query phrase AND
#      4. no assistant turn since that user query contains a Read/Grep/Glob/
#         Bash tool_use AND
#      5. the assistant text does NOT qualify the claim (mismatch / issue /
#         missing / etc.) — then BLOCK with a cross-check reminder.
#
# Design rules (same as final-q-gate.sh — keep simple):
#   - Skip if stop_hook_active=true (prevents infinite loop).
#   - Fail-open on any error (broken gate must never wedge the session).
#   - Block reason is actionable: tells agent to run the cross-check tool
#     calls and retry.
#
# To disable: remove the Stop entry from .claude/settings.json or rename this
# file.

set -u

input=$(cat 2>/dev/null || true)

# Prevent infinite loops.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

transcript_path=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

decision=$(node "$(dirname "${BASH_SOURCE[0]}")/lib/check-rubberstamp.mjs" "$transcript_path" 2>/dev/null || echo allow)

if [ "$decision" = "block" ]; then
  cat <<'JSON'
{"decision": "block", "reason": "Rubber-stamp detected: you responded to a user review/correctness question with a completion phrase (\"nothing to fix\", \"all clean\", \"everything is correct\", etc.) without running ANY artifact-reading tool call (Read/Grep/Glob/Bash) since the user's question. This is the AUD-001 / ALL-030 failure pattern — narrow compliance checks presented as a full review. Before ending this turn, run the actual cross-check: for every specific claim you made earlier in this session (file count, sort order, dependency chain, INDEX layout, exact path, line number), grep / read the artifact and compare. If claim != artifact, that is a finding. Revise your answer with the cross-check evidence visible, then stop. If there truly is nothing to verify (trivial conversational exchange), rephrase without a rubber-stamp claim."}
JSON
  exit 0
fi

exit 0
