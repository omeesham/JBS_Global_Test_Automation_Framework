#!/usr/bin/env bash
# dispatch-visibility-gate.sh — S0 PreToolUse gate: blocks invisible worker dispatch.
# LR-069 Sev S0: deny on landing, no ramp, no knob, no off-switch.
# Graduating incident: 2026-08-14 — a CEO session dispatched workers with shell `&`
# detachment inside foreground Bash calls; no task tracking, no notification.
# Wired to both Bash and PowerShell PreToolUse matchers (see WIRING-FOR-OWNER).

set -u

input=$(cat 2>/dev/null || true)

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"
lib_path="$lib_dir/check-dispatch-visibility.mjs"

# C1 — fail CLOSED when lib is missing; never silently allow
if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) dispatch-visibility-gate.sh: lib missing at $lib_path; fail-closed (C1)." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"S0 visibility gate: lib missing — fail-closed (C1)"}}'
  exit 0
fi

# C1 — capture node exit code (do NOT suppress with || true)
result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log)
node_exit=$?

# C1 — fail CLOSED when node exits non-zero (crash, unparseable lib, etc.)
if [ "$node_exit" -ne 0 ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) dispatch-visibility-gate.sh: node exited $node_exit; fail-closed (C1)." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"S0 visibility gate: node exited non-zero — fail-closed (C1)"}}'
  exit 0
fi

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
