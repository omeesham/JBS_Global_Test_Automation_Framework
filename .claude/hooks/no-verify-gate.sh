#!/usr/bin/env bash
# no-verify-gate.sh — PreToolUse hook (matcher: "Bash|mcp__Claude_in_Chrome__.*").
#
# Hard-blocks git hook-bypass on Bash commands so the local pre-commit / pre-push
# gates (spec↔MD↔XLSX parity + xlsx-freshness) can never be skipped by the agent.
# Closes the 467cbeb1 root cause (see COUNCIL AUDIT). NON-OVERRIDABLE by design.
#
# Mechanism mirrors plan-closure-gate.sh: pipe full stdin JSON to the node checker,
# emit its stdout verbatim (the checker emits an allow/deny PreToolUse decision),
# exit 0 always. Fail-OPEN if the checker is missing — never wedge a session.

set -u

input=$(cat 2>/dev/null || true)

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"
lib_path="$lib_dir/check-no-verify.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) no-verify-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
