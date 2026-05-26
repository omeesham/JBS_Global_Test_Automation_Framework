#!/usr/bin/env bash
# plan-closure-gate.sh — PreToolUse hook for plan-closure enforcement.
#
# Fires on:
#   PreToolUse (matcher: "Edit|Write|NotebookEdit")
#     --edit-mode: lock-path check + plan-path closure validation.
#   PreToolUse (matcher: "Bash|mcp__Claude_in_Chrome__.*")
#     --bash-mode: lock-path hard-deny on Bash commands mentioning lock paths.
#
# Fail-CLOSED for plan-paths and lock-paths (V5).
# Fail-OPEN for unrelated paths only.

set -u

mode="${1:-}"
input=$(cat 2>/dev/null || true)

if [ -z "$mode" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) plan-closure-gate.sh: missing mode argv[1]; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"
lib_path="$lib_dir/check-plan-closure.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) plan-closure-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

result=$(printf '%s' "$input" | node "$lib_path" "$mode" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
