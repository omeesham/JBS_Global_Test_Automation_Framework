#!/usr/bin/env bash
# client-surface-size-gate.sh — Stop-hook wrapper for the client surface size governor.
#
# Fires on:
#   Stop (no matcher — every Stop event)
#     — measures each listed directory in .claude/retention-policy.json once,
#       compares against growth budget using persisted session history, and
#       reports over-budget directories and unpoliced accumulators.
#       B3 REPORTS ONLY. It never deletes and never blocks.
#
# Mode: passed as argv[1] (`--validate`). Stop hooks have no capture phase.
#
# Fail-OPEN policy: any error → write reason to .claude/state/hook-failures.log,
# silent exit 0. A broken gate must never wedge the session.
# Stop hooks cannot veto session end (LR-060) — detective control only.
#
# Companion: lib/check-client-surface-size.mjs (Stop hook lib).
# Mode knob: .claude/guardrail-config.json → client_surface_size_mode
#   off      — gate disabled
#   announce — measure and report (default)
#   (no deny value — report-by-design per LR-060)
# Env override: CLIENT_SURFACE_SIZE_MODE
#
# Rule: PLAN_CLIENT_SURFACE_PURGE_AND_WRITE_FENCE Phase 4 Arm B3.

set -u

mode="${1:-}"
input=$(cat 2>/dev/null || true)

# Recursive-call guard (Stop hook may re-fire; bail when already active).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Empty stdin — silent allow.
if [ -z "$input" ]; then exit 0; fi

if [ -z "$mode" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) client-surface-size-gate.sh: missing mode argv[1]; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-client-surface-size.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) client-surface-size-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

# Pass mode + full stdin JSON to lib; lib emits stdout lines when findings exist.
result=$(printf '%s' "$input" | node "$lib_path" "$mode" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
