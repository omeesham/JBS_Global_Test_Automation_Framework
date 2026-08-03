#!/usr/bin/env bash
# execution-completion-gate.sh — Stop-hook wrapper for the silent-checkpoint detector.
#
# Fires on:
#   Stop (no matcher — every Stop event)
#     — when the session is inside an active /execute of a plan file and that plan
#       declares a dated FCC `_internal` artifact that is missing on disk, with no
#       `## Deferral Authorization` block, it warns (and persists to
#       .claude/state/execution-completion-warnings-${sid}.json). Closes the
#       closure-gates-only-fire-on-Status:DONE hole (LR-060 / the 2026-06-18
#       Pricing silent-checkpoint mistake).
#
# Mode detection: passed as argv[1] from settings.json (`--validate`). Stop hooks
# have no capture phase.
#
# Fail-OPEN policy: any error → write reason to .claude/state/hook-failures.log,
# silent exit 0. A broken gate must never wedge the session. Stop hooks cannot
# veto session end — this is a detective + forcing-function, not a hard block.
#
# Companion: lib/check-execution-completion.mjs (Stop hook lib). State file read by
# /final-q + /audit, which floor the verdict when warnings are present.

set -u

mode="${1:-}"
input=$(cat 2>/dev/null || true)

# Recursive-call guard (Stop hook may re-fire; bail when already active).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Empty stdin (harness passes no payload on routine Stop) — silent allow, no node spawn.
if [ -z "$input" ]; then exit 0; fi

_fail() { mkdir -p .claude/state 2>/dev/null || true; printf '%s\n' "$(date -u +%FT%TZ) execution-completion-gate.sh: $1; allowing." >> .claude/state/hook-failures.log 2>/dev/null || true; }

if [ -z "$mode" ]; then _fail "missing mode argv[1]"; exit 0; fi

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-execution-completion.mjs"
if [ ! -f "$lib_path" ]; then _fail "lib missing at $lib_path"; exit 0; fi

# Pass mode + full stdin JSON to lib; lib emits stdout verbatim (warning text)
# when a mandated artifact is missing, silent otherwise.
result=$(printf '%s' "$input" | node "$lib_path" "$mode" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
