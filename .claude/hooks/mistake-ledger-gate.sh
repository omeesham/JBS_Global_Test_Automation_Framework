#!/usr/bin/env bash
# mistake-ledger-gate.sh — Stop-hook wrapper for the missing-attestation detector.
#
# Fires on:
#   Stop (no matcher — every Stop event)
#     — when a mutating session ends with no mistake attestation
#       ("Mistakes this session:" or "none — 6 triggers checked") in the
#       transcript, warns and persists to .claude/state/ so /final-q and
#       /audit can floor the verdict. Closes the "voluntary self-reporting"
#       gap: skill prose alone is Tier-3 (weakest layer); this backstop makes
#       silence VISIBLE even when /final-q is skipped.
#
# Mode: passed as argv[1] (`--validate`). Stop hooks have no capture phase.
#
# Fail-OPEN policy: any error → write reason to .claude/state/hook-failures.log,
# silent exit 0. A broken gate must never wedge the session. Stop hooks cannot
# veto session end — this is a detective + forcing-function, not a hard block.
#
# Companion: lib/check-mistake-ledger.mjs (Stop hook lib). State file read by
# /final-q Step 4.7 + /audit. Rule body: LR-069 §3.2 in
# .claude/rules/guardrail-policy.md.

set -u

mode="${1:-}"
input=$(cat 2>/dev/null || true)

# Recursive-call guard (Stop hook may re-fire; bail when already active).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Empty stdin (harness passes no payload on routine Stop) — silent allow, no node spawn.
if [ -z "$input" ]; then exit 0; fi

if [ -z "$mode" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) mistake-ledger-gate.sh: missing mode argv[1]; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-mistake-ledger.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) mistake-ledger-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

# Pass mode + full stdin JSON to lib; lib emits stdout verbatim (warning text)
# when a missing attestation is detected, silent otherwise.
result=$(printf '%s' "$input" | node "$lib_path" "$mode" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
