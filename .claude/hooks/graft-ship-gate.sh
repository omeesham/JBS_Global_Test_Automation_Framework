#!/usr/bin/env bash
# graft-ship-gate.sh — PreToolUse hook (matcher: "Bash|mcp__Claude_in_Chrome__.*").
#
# Backstop for the Claude-Bash git-commit vector: blocks a `git commit` when a staged file has
# further unstaged worktree changes (the NM-2265 stale-index defect — a plain commit would ship
# the STALE staged copy, not the tested working tree). Prevention lives in the /graft skill's
# "index == tested worktree" completion invariant; this is defense-in-depth. NON-OVERRIDABLE by
# the agent by design (mirrors no-verify-gate.sh) — a deliberate partial-stage commit is done by
# the human in their own terminal (this only gates Claude's Bash tool).
#
# Mechanism mirrors no-verify-gate.sh: pipe full stdin JSON to the node checker, emit its stdout
# verbatim (allow/deny PreToolUse decision), exit 0 always. Fail-OPEN if the checker is missing —
# never wedge a session.

set -u

input=$(cat 2>/dev/null || true)

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"
lib_path="$lib_dir/check-graft-ship.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) graft-ship-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
