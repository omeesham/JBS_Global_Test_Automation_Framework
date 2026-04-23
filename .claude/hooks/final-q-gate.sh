#!/usr/bin/env bash
# final-q-gate.sh — Stop hook: block session-end when work was done but /final-q
# was not invoked. Structural enforcement for LR-042.
#
# Mechanism (replaces the old phrase-regex heuristic — which missed "SP-XXX
# complete.", "done.", "✅", and every other natural wrap-up phrasing):
#
#   Parse the JSONL transcript. Count file-modifying tool_use entries (Edit,
#   Write, NotebookEdit, MultiEdit). Detect /final-q invocation via Skill
#   tool_use OR "/final-q" in user text OR "## /final-q audit" heading in
#   assistant text OR TodoWrite activeForm mentioning final-q.
#
#   If mutations > 0 AND /final-q not seen → BLOCK stop with a reminder.
#   Otherwise → allow stop.
#
# Pure-chat sessions (no Edit/Write) are never blocked. Real-work sessions
# always require /final-q. No escape via prose phrasing.
#
# Design rules (keep simple — see .claude/skills/final-q/SKILL.md
# anti-over-engineering):
#   - Skip if stop_hook_active=true (prevent infinite loops).
#   - Delegate the mechanism to node (lib/check-finalq-required.mjs).
#   - Emit block-reason via JSON on stdout; the harness surfaces it to the model.
#
# To disable: remove the Stop entry from .claude/settings.json or rename this
# file. Chain orchestration will still pause on verdict-NONE — LR-042 relies on
# both layers (this gate + /execute Phase 4 mandate).

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

# Delegate mechanism to node helper.
decision=$(node "$(dirname "${BASH_SOURCE[0]}")/lib/check-finalq-required.mjs" "$transcript_path" 2>/dev/null || echo allow)

if [ "$decision" = "block" ]; then
  cat <<'JSON'
{"decision": "block", "reason": "File-modifying tool_use detected in this session (Edit/Write/NotebookEdit/MultiEdit) but /final-q was never invoked. Before ending this turn, invoke /final-q to audit the original todo list — tag every item (done/partial/skipped/deferred/failed/ignored), end with a heading '## /final-q audit' followed within ~3000 chars by a line '**Verdict**: GREEN|YELLOW|RED'. LR-042 / chain-orchestrator requires this block to advance the chain. Do NOT replace with a prose summary. Trivial 1-task sessions may still invoke /final-q and use its short-path, but the call itself is non-skippable."}
JSON
  exit 0
fi

# Default: let the stop proceed.
exit 0
