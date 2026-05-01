#!/usr/bin/env bash
# todo-injection-gate.sh — dual-mode hook for TodoWrite context-injection enforcement (SP02B).
#
# Fires on:
#   PostToolUse (matcher: "TodoWrite")
#     — captures TodoWrite state to .claude/state/todo-state-${session_id}.json
#       (atomic write). Records {count, tagged_count, untagged_indices,
#        tags_per_item} from the todo array's content+activeForm strings.
#   PreToolUse (matcher: "Edit|Write|NotebookEdit|MultiEdit")
#     — denies the mutating tool call when the session is currently inside
#       /execute AND the captured todo state is missing/empty/untagged.
#
# /execute detection (option D, no agent-side marker):
#   The .mjs lib parses transcript_path (Anthropic hook contract delivers this
#   in stdin JSON) for a `Skill` tool_use with input.skill === "execute" in the
#   last N assistant turns, with no subsequent `Skill` tool_use of "final-q".
#   Pure transcript-driven; no env var, no marker file written by the agent.
#
# Mode detection: passed as argv[1] from settings.json (`--capture` for
# PostToolUse, `--validate` for PreToolUse).
#
# Fail-OPEN policy: any error → write reason to .claude/state/hook-failures.log,
# allow the operation. A broken gate must never wedge the session.
#
# Companion hooks: identity-switch-gate.sh (LR-043), chain-orchestrator.sh.
# Removed predecessors: final-q-gate.sh, rubber-stamp-gate.sh,
# override-discipline-gate.sh — see LR-042 strand A + LR-043 §B.

set -u

mode="${1:-}"
input=$(cat 2>/dev/null || true)

# Recursive-call guard (defensive — TodoWrite -> PostToolUse hook -> any tool).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

if [ -z "$mode" ]; then
  # Misconfiguration — fail-open + log.
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) todo-injection-gate.sh: missing mode argv[1]; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"
lib_path="$lib_dir/check-todo-injection.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) todo-injection-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

# Pass mode + full stdin JSON to lib; lib emits stdout verbatim as hook response.
result=$(printf '%s' "$input" | node "$lib_path" "$mode" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
